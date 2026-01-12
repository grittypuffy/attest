// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../attest/AttestManager.sol";
import "../attest/AttestVault.sol";
import "../test/MockERC20.sol"; // Use the same mock for simplicity

contract DeployAttest is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy a Mock Payment Token (for testing purposes)
        // In production, you would use an existing USDC/INR address
        MockERC20 token = new MockERC20();
        console.log("Mock Token deployed at:", address(token));

        // 2. Deploy Vault
        // Pass the token address and the deployer (temp owner)
        AttestVault vault = new AttestVault(address(token), deployerAddress);
        console.log("Vault deployed at:", address(vault));

        // 3. Deploy Manager
        AttestManager manager = new AttestManager(address(vault), deployerAddress);
        console.log("Manager deployed at:", address(manager));

        // 4. Transfer Vault ownership to Manager
        // This is CRITICAL. The Manager must own the Vault to release funds.
        vault.transferOwnership(address(manager));
        console.log("Vault ownership transferred to Manager");

        vm.stopBroadcast();
    }
}
