// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IAttestVault.sol";

contract AttestVault is IAttestVault, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable fundingToken;

    constructor(address _fundingToken, address _manager) Ownable(_manager) {
        require(_fundingToken != address(0), "Invalid token address");
        fundingToken = IERC20(_fundingToken);
    }

    /// @notice Releases funds to a recipient. Only callable by the Manager (Owner).
    function release(address recipient, uint256 amount) external onlyOwner {
        if (amount == 0) return;
        uint256 balance = fundingToken.balanceOf(address(this));
        if (balance < amount) revert InsufficientBalance();
        
        fundingToken.safeTransfer(recipient, amount);
        emit FundsReleased(recipient, amount);
    }

    function getToken() external view returns (address) {
        return address(fundingToken);
    }
}
