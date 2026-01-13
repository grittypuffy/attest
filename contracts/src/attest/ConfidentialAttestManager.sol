// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { inco, e } from "@inco/lightning/src/Lib.sol";
import { euint256, ebool } from "@inco/lightning/src/Types.sol";
import "./interfaces/IConfidentialAttestVault.sol";

contract ConfidentialAttestManager is AccessControl, ReentrancyGuard {
    
    // --- Roles ---
    bytes32 public constant AGENCY_ROLE = keccak256("AGENCY_ROLE");
    // DEFAULT_ADMIN_ROLE is the Government

    // --- Enums ---
    enum ProjectStatus { Active, Completed, Cancelled }
    enum ProposalStatus { Submitted, Approved, Rejected, InProgress, Completed }
    enum PhaseStatus { Pending, ProofSubmitted, Approved }

    // --- Structs ---

    struct Project {
        uint256 id;
        string name;
        string description;
        uint256 totalEstimatedBudget; // Keeping public for simplicity, could be encrypted
        ProjectStatus status;
    }

    struct Agency {
        address wallet;
        string metadataURI;
        bool isRegistered;
    }

    struct Phase {
        uint256 id;
        string description;
        euint256 allocatedAmount; // Confidential
        string[] proofLinks;
        PhaseStatus status;
    }

    struct Proposal {
        uint256 id;
        uint256 projectId;
        address agency;
        string metadataURI;
        euint256 totalFunds; // Confidential
        ProposalStatus status;
        uint256 currentPhaseIndex;
    }

    // --- State ---
    
    IConfidentialAttestVault public immutable vault;

    uint256 public nextProjectId = 1;
    uint256 public nextProposalId = 1;

    mapping(uint256 => Project) public projects;
    mapping(address => Agency) public agencies;
    mapping(uint256 => Proposal) public proposals;
    // proposalId => list of Phases
    mapping(uint256 => Phase[]) public proposalPhases; 

    // --- Events ---

    event ProjectCreated(uint256 indexed projectId, string name, uint256 budget);
    event AgencyRegistered(address indexed agencyAddress, string metadata);
    event ProposalSubmitted(uint256 indexed proposalId, uint256 indexed projectId, address indexed agency);
    event ProposalApproved(uint256 indexed proposalId);
    event PhaseProofSubmitted(uint256 indexed proposalId, uint256 indexed phaseIndex, string proofLink);
    event PhaseApproved(uint256 indexed proposalId, uint256 indexed phaseIndex); // Amount is hidden
    event ProjectCompleted(uint256 indexed projectId);
    event ProposalCompleted(uint256 indexed proposalId);

    // --- Errors ---

    error Unauthorized();
    error InvalidState();
    error NotRegistered();
    error NotFound();
    error InvalidInput();
    error BudgetMismatch();

    // --- Modifiers ---

    modifier onlyGovernment() {
        if (!hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) revert Unauthorized();
        _;
    }

    modifier onlyAgency() {
        if (!hasRole(AGENCY_ROLE, msg.sender)) revert Unauthorized();
        _;
    }

    constructor(address _vault, address _government) {
        vault = IConfidentialAttestVault(_vault);
        governmentAddress = _government;
        _grantRole(DEFAULT_ADMIN_ROLE, _government);
    }

    // --- Government Actions ---

    function createProject(string calldata _name, string calldata _description, uint256 _budget) external onlyGovernment returns (uint256) {
        uint256 id = nextProjectId++;
        projects[id] = Project({
            id: id,
            name: _name,
            description: _description,
            totalEstimatedBudget: _budget,
            status: ProjectStatus.Active
        });
        emit ProjectCreated(id, _name, _budget);
        return id;
    }

    function registerAgency(address _agencyAddress, string calldata _metadata) external onlyGovernment {
        agencies[_agencyAddress] = Agency({
            wallet: _agencyAddress,
            metadataURI: _metadata,
            isRegistered: true
        });
        _grantRole(AGENCY_ROLE, _agencyAddress);
        emit AgencyRegistered(_agencyAddress, _metadata);
    }

    function approveProposal(uint256 _proposalId) external onlyGovernment {
        Proposal storage p = proposals[_proposalId];
        if (p.id == 0) revert NotFound();
        if (p.status != ProposalStatus.Submitted) revert InvalidState();

        p.status = ProposalStatus.InProgress;
        
        emit ProposalApproved(_proposalId);
    }

    function verifyAndReleasePhase(uint256 _proposalId) external onlyGovernment nonReentrant {
        Proposal storage p = proposals[_proposalId];
        if (p.status != ProposalStatus.InProgress) revert InvalidState();

        uint256 pIdx = p.currentPhaseIndex;
        Phase[] storage phases = proposalPhases[_proposalId];
        
        if (pIdx >= phases.length) revert InvalidState();
        
        Phase storage currentPhase = phases[pIdx];

        // Strict: Must have proof submitted
        if (currentPhase.status != PhaseStatus.ProofSubmitted) revert InvalidState();

        // Approve Phase
        currentPhase.status = PhaseStatus.Approved;
        
        // Release Funds (Confidential)
        // Note: The vault must handle confidential transfer or unwrapping
        vault.release(p.agency, currentPhase.allocatedAmount);

        emit PhaseApproved(_proposalId, pIdx);

        // Advance
        p.currentPhaseIndex++;

        // Check for Proposal Completion
        if (p.currentPhaseIndex >= phases.length) {
            p.status = ProposalStatus.Completed;
            emit ProposalCompleted(_proposalId);
        }
    }

    function completeProject(uint256 _projectId) external onlyGovernment {
        if (projects[_projectId].id == 0) revert NotFound();
        projects[_projectId].status = ProjectStatus.Completed;
        emit ProjectCompleted(_projectId);
    }

    // --- Agency Actions ---

    struct PhaseInput {
        string description;
        bytes encryptedAmount; // Encrypted Input (ciphertext)
    }

    function submitProposal(
        uint256 _projectId, 
        string calldata _metadataURI,
        bytes calldata _encryptedTotalFunds, // Encrypted Input
        PhaseInput[] calldata _phases
    ) external onlyAgency returns (uint256) {
        if (projects[_projectId].id == 0) revert NotFound();
        if (projects[_projectId].status != ProjectStatus.Active) revert InvalidState();
        if (!agencies[msg.sender].isRegistered) revert NotRegistered();
        if (_phases.length == 0) revert InvalidInput();

        uint256 pid = nextProposalId++;
        Proposal storage p = proposals[pid];
        p.id = pid;
        p.projectId = _projectId;
        p.agency = msg.sender;
        p.metadataURI = _metadataURI;
        p.status = ProposalStatus.Submitted;

        // Process Encrypted Total Funds
        // Only msg.sender (Agency) and Government should see it.
        euint256 eTotal = inco.newEuint256(_encryptedTotalFunds, msg.sender);
        p.totalFunds = eTotal;
        
        allowGovernment(eTotal);

        uint256 total = 0; // We can't sum encrypted easily to check equality with totalFunds without FHE ops
        // But we are storing the phases.

        for (uint256 i = 0; i < _phases.length; i++) {
            euint256 ePhaseAmount = inco.newEuint256(_phases[i].encryptedAmount, msg.sender);
            
            // Allow government
            allowGovernment(ePhaseAmount);

            string[] memory emptyProofs; 
            proposalPhases[pid].push(Phase({
                id: i,
                description: _phases[i].description,
                allocatedAmount: ePhaseAmount,
                proofLinks: emptyProofs,
                status: PhaseStatus.Pending
            }));
        }

        emit ProposalSubmitted(pid, _projectId, msg.sender);
        return pid;
    }

    function submitProof(uint256 _proposalId, string calldata _proofLink) external onlyAgency {
        Proposal storage p = proposals[_proposalId];
        // Only owner agency
        if (p.agency != msg.sender) revert Unauthorized();
        // Must be in progress
        if (p.status != ProposalStatus.InProgress) revert InvalidState();
        
        uint256 pIdx = p.currentPhaseIndex;
        Phase[] storage phases = proposalPhases[_proposalId];
        
        if (pIdx >= phases.length) revert InvalidState();
        
        Phase storage currentPhase = phases[pIdx];
        
        // Phase must be Pending or ProofSubmitted
        if (currentPhase.status == PhaseStatus.Approved) revert InvalidState();

        currentPhase.proofLinks.push(_proofLink);
        currentPhase.status = PhaseStatus.ProofSubmitted;

        emit PhaseProofSubmitted(_proposalId, pIdx, _proofLink);
    }

    // --- Helper ---
    // We need to store the government address to grant access.
    address public governmentAddress;
    
    // Override constructor to set governmentAddress
    // Wait, I can't override the constructor in the same file easily without rewriting.
    // I'll just add it to the state and set it in constructor.

    function allowGovernment(euint256 handle) internal {
        if (governmentAddress != address(0)) {
            inco.allow(euint256.unwrap(handle), governmentAddress);
        }
    }
}
