# Attest

Attest is a public procurement transparency system that helps in making informed decisions for governments to combat corruption and ensure efficient processing and utilization of funds. This is achieved by using transparent and accountable recording of public funding information on Blockchain.

# Table of contents

# Why?

- **Lack of transparency** in funding mechanisms and strategy for government tenders and contracts, which results in misutilization of allocated funds (due to corruption)
- **Lack of credit-based funding** for agency proposals, which results in misaligned funding strategy
- 

# Working

Attest is primarily responsible for coordination of project and funding between government and associated agencies using blockchain.

The platform can be used by 3 users: Government, agencies and (unauthorized) users or commoners.

## Government

Government is capable of registering agencies with whom collaborations are establishing by providing the agency's:
- Full name
- Email
- Password
- Wallet address: The cryptocurrency address (Ethereum) that's linked to agency

This is done once the government has authenticated to the application using their Metamask wallet.

This allows the created agency to access the platform via dashboard for submission of proposals and coordinating for funds.

## Agencies



## Users

# Screenshots

# Tech stack

The project uses the following technologies:

## Frontend

- Next.js for the frontend framework
- Material UI for the UI framework to ensure consistency and accessibility


## Backend

# Development

The project is structured as a monorepository with the following directories:
- `server`, the backend written using Elysia, responsible for authentication, off-chain operations, AI and metrics processing
- `web`, the frontend written using Next.js, which uses Metamask
- `contracts`, written using Foundry and deployed on Shardeum testnet and supported for Inco

The following smart contracts are deployed on Shardeum:
1. Attest Manager: Handle projects, approvals, and verify proofs. Link: https://explorer-mezame.shardeum.org/address/0x5AB6e8648e435CCc0fa6FD34e6BDcAe337dde357

2. Attest Vault: Holds the budget and releases it only when told by the Manager.Link: https://explorer-mezame.shardeum.org/address/0xDA786ABB42FBAcc4bE9c7186546CE1dD7EA0866D

3. Transfer Contract: The smart contract used for transfering funds from one account to other. Link: https://explorer-mezame.shardeum.org/address/0xF874Ce8Dd5eA3D5462FFb428DDb848143C4bD261

For more information on getting started with contributing to the project, check out our [CONTRIBUTING](./CONTRIBUTING.md) guide.

# License

Attest is licensed under the MIT license for permissive usage. For more information, check out [LICENSE] file.