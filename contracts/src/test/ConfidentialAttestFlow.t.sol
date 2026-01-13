// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../attest/ConfidentialAttestManager.sol";
import "../attest/ConfidentialAttestVault.sol";
import { euint256 } from "@inco/lightning/src/Types.sol";

contract ConfidentialAttestFlowTest is Test {
    ConfidentialAttestManager manager;
    ConfidentialAttestVault vault;
    
    address gov = address(1);
    address agency = address(2);
    address incoAddr = 0x168FDc3Ae19A5d5b03614578C58974FF30FCBe92;

    function setUp() public {
        vm.startPrank(gov);
        
        vault = new ConfidentialAttestVault(gov); // Temp owner
        manager = new ConfidentialAttestManager(address(vault), gov);
        
        // Transfer Vault ownership to Manager
        vault.transferOwnership(address(manager));
        
        vm.stopPrank();

        vm.label(gov, "Government");
        vm.label(agency, "Agency");
        vm.label(address(manager), "Manager");
        vm.label(address(vault), "Vault");
        vm.label(incoAddr, "IncoLightning");
    }

    function testConfidentialProposal() public {
        // 1. Government Creates Project
        vm.startPrank(gov);
        uint256 projId = manager.createProject("Secret Project", "Top Secret", 5000 ether);
        manager.registerAgency(agency, "Secret Agent");
        vm.stopPrank();

        // 2. Agency Submits Proposal (Confidential)
        vm.startPrank(agency);
        
        ConfidentialAttestManager.PhaseInput[] memory phases = new ConfidentialAttestManager.PhaseInput[](1);
        
        // Mock Inco calls
        // We need to match the signature of newEuint256(bytes,address)
        bytes memory encryptedAmount = hex"123456";
        bytes memory encryptedPhaseAmount = hex"7890";
        
        phases[0] = ConfidentialAttestManager.PhaseInput("Phase 1", encryptedPhaseAmount);

        // Mock return for totalFunds
        // newEuint256 returns euint256 (bytes32)
        bytes32 totalHandle = bytes32(uint256(1));
        vm.mockCall(
            incoAddr, 
            abi.encodeWithSignature("newEuint256(bytes,address)", encryptedAmount, agency),
            abi.encode(totalHandle)
        );

        // Mock return for phaseAmount
        bytes32 phaseHandle = bytes32(uint256(2));
        vm.mockCall(
            incoAddr, 
            abi.encodeWithSignature("newEuint256(bytes,address)", encryptedPhaseAmount, agency),
            abi.encode(phaseHandle)
        );

        // Mock allow calls
        // allow(bytes32,address)
        vm.mockCall(
            incoAddr,
            abi.encodeWithSignature("allow(bytes32,address)", totalHandle, gov),
            ""
        );
        vm.mockCall(
            incoAddr,
            abi.encodeWithSignature("allow(bytes32,address)", phaseHandle, gov),
            ""
        );

        uint256 propId = manager.submitProposal(projId, "ipfs://secret", encryptedAmount, phases);
        vm.stopPrank();

        // 3. Government Approves
        vm.prank(gov);
        manager.approveProposal(propId);

        // 4. Verify Phase & Release
        vm.prank(agency);
        manager.submitProof(propId, "ipfs://proof");

        vm.prank(gov);
        // This will emit FundsReleasedConfidential from Vault
        vm.expectEmit(true, true, true, true);
        emit ConfidentialAttestVault.FundsReleasedConfidential(agency, euint256.wrap(phaseHandle));
        manager.verifyAndReleasePhase(propId);
    }
}
