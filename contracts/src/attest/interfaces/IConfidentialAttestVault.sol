// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { euint256 } from "@inco/lightning/src/Types.sol";

interface IConfidentialAttestVault {
    function release(address recipient, euint256 amount) external;
}
