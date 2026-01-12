// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../attest/AttestManager.sol";
import "../attest/AttestVault.sol";
import "./MockERC20.sol";

contract AttestFlowTest is Test {
    AttestManager manager;
    AttestVault vault;
    MockERC20 token;

    address gov = address(1);
    address agency = address(2);
    address publicViewer = address(3);

    function setUp() public {
        vm.startPrank(gov);
        
        token = new MockERC20();
        vault = new AttestVault(address(token), gov); // Temp owner
        manager = new AttestManager(address(vault), gov);
        
        // Transfer Vault ownership to Manager
        vault.transferOwnership(address(manager));
        
        // Fund the Vault (Gov deposits for future projects)
        token.mint(address(vault), 100000 ether);
        
        vm.stopPrank();

        vm.label(gov, "Government");
        vm.label(agency, "Agency");
        vm.label(address(manager), "Manager");
        vm.label(address(vault), "Vault");
    }

    function testFullProjectLifecycle() public {
        // 1. Government Creates Project
        vm.startPrank(gov);
        uint256 projId = manager.createProject("School Construction", "Building a new primary school", 5000 ether);
        
        // 2. Government Registers Agency
        manager.registerAgency(agency, "Top Builders Inc.");
        vm.stopPrank();

        // 3. Agency Submits Proposal (STANDARD BID)
        vm.startPrank(agency);
        
        AttestManager.PhaseInput[] memory phases = new AttestManager.PhaseInput[](2);
        phases[0] = AttestManager.PhaseInput("Foundation", 1000 ether);
        phases[1] = AttestManager.PhaseInput("Structure", 2000 ether);

        uint256 propId = manager.submitProposal(projId, "ipfs://proposal-data", phases);
        vm.stopPrank();

        // 4. Government Approves Proposal
        vm.prank(gov);
        manager.approveProposal(propId);

        // Check status: InProgress
        (,,,,, AttestManager.ProposalStatus status,) = manager.proposals(propId);
        assertEq(uint(status), uint(AttestManager.ProposalStatus.InProgress));

        // 5. Agency Submits Proof for Phase 1
        vm.prank(agency);
        manager.submitProof(propId, "ipfs://foundation-photos");

        // 6. Government Verifies & Releases Phase 1
        uint256 preBal = token.balanceOf(agency);
        vm.prank(gov);
        manager.verifyAndReleasePhase(propId);
        
        // Verify Funds Released
        assertEq(token.balanceOf(agency), preBal + 1000 ether);

        // 7. Agency Submits Proof for Phase 2
        vm.prank(agency);
        manager.submitProof(propId, "ipfs://structure-photos");

        // 8. Government Verifies & Releases Phase 2
        vm.prank(gov);
        manager.verifyAndReleasePhase(propId);

        // Verify Funds Released
        assertEq(token.balanceOf(agency), preBal + 3000 ether); // 1000 + 2000

        // 9. Verify Proposal Completion
        (,,,,, status,) = manager.proposals(propId);
        assertEq(uint(status), uint(AttestManager.ProposalStatus.Completed));

        // 10. Government Completes Project
        vm.prank(gov);
        manager.completeProject(projId);
        
        (,,,, AttestManager.ProjectStatus pStatus) = manager.projects(projId);
        assertEq(uint(pStatus), uint(AttestManager.ProjectStatus.Completed));
    }

    function testRevertUnauthorizedAgency() public {
        vm.prank(gov);
        manager.createProject("Road", "Fix road", 100 ether);

        vm.startPrank(publicViewer); // Not an agency
        AttestManager.PhaseInput[] memory phases = new AttestManager.PhaseInput[](1);
        phases[0] = AttestManager.PhaseInput("P1", 10);
        
        vm.expectRevert(AttestManager.Unauthorized.selector);
        manager.submitProposal(1, "meta", phases);
        vm.stopPrank();
    }

    function testRevertSequentialOrder() public {
         // Setup
        vm.startPrank(gov);
        manager.createProject("A", "B", 100);
        manager.registerAgency(agency, "A");
        vm.stopPrank();

        vm.startPrank(agency);
        AttestManager.PhaseInput[] memory phases = new AttestManager.PhaseInput[](2);
        phases[0] = AttestManager.PhaseInput("1", 10);
        phases[1] = AttestManager.PhaseInput("2", 10);
        
        uint256 pid = manager.submitProposal(1, "meta", phases);
        vm.stopPrank();

        vm.prank(gov);
        manager.approveProposal(pid);

        // Try to skip phase proof submission (Gov tries to approve phase without proof)
        vm.prank(gov);
        vm.expectRevert(AttestManager.InvalidState.selector);
        manager.verifyAndReleasePhase(pid);
    }
}
