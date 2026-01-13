// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../attest/ConfidentialAttestManager.sol";
import "../attest/ConfidentialAttestVault.sol";

contract DeployConfidentialAttest is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Confidential Vault
        // Initial owner is deployer, will transfer to manager later
        ConfidentialAttestVault vault = new ConfidentialAttestVault(deployerAddress);
        console.log("Confidential Vault deployed at:", address(vault));

        // 2. Deploy Confidential Manager
        // Government is set to deployer for simplicity
        ConfidentialAttestManager manager = new ConfidentialAttestManager(address(vault), deployerAddress);
        console.log("Confidential Manager deployed at:", address(manager));

        // 3. Transfer Vault ownership to Manager
        vault.transferOwnership(address(manager));
        console.log("Vault ownership transferred to Manager");

        vm.stopBroadcast();
    }
}
