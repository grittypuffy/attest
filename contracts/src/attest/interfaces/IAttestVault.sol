// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAttestVault {
    error Unauthorized();
    error InsufficientBalance();
    error TransferFailed();

    event FundsDeposited(address indexed depositor, uint256 amount);
    event FundsReleased(address indexed recipient, uint256 amount);

    function release(address recipient, uint256 amount) external;
    function getToken() external view returns (address);
}
