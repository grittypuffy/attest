# Attest

Attest is a public procurement transparency system that helps in making informed decisions for government ministries to combat corruption and ensure efficient processing and utilization of funds. This is achieved by using transparent and accountable recording of public funding information on Blockchain.

# Table of contents

# Why?

- **Lack of transparency** in funding mechanisms and strategy for government tenders and contracts, which results in misutilization of allocated funds (due to corruption)
- **Lack of credit-based funding** for agency proposals, which results in misaligned funding strategy due to lack of information on credibility
- **Funds are released despite inaction** which causes unexpected delays in contract management and overusage of allocated funds

# Solution

- Blockchain-based system for tracking funding information in immutable manner
- Credit-based analysis and AI summarization for effective decision making on project strategy for governments.
- Funds are released by escrow only upon submission of verification of completion information by agencies, to ensure the project is smoothly running without inaction

# Working

Attest is primarily responsible for coordination of project and funding between government and associated agencies using blockchain.

The platform can be used by 3 users: Government ministries, agencies and (unauthorized) users or commoners.

## Government ministries

### Agency registration

Government ministries (with the role "Government") is capable of registering agencies with whom collaborations are establishing by providing the agency's:
- Full name
- Email
- Password
- Wallet address: The cryptocurrency address (Ethereum) that's linked to agency

This is done once the government has authenticated to the application using their Metamask wallet.

This allows the created agency to access the platform via dashboard for submission of proposals and coordinating for funds.

### Project creation

The government can create a project for which any agency can submit proposals for working under contracts.

Project creation involves provision of a project title and a detailed description.

### Proposal Approval

The ministry has the ability to approve proposals submitted by multiple agencies based on the proposal's clarity. Acceptance of one proposal invalidates other proposals.

### Proof verification

The government ministry can verify the proofs submitted by the agencies for an independent phase, post which the funds will be released via escrow using smart contracts to initiate transfer of funds.

### Credit analysis

The government ministry can access the credit of the agency based on the following parameters:
- Number of proposals accepted
- Quality of proposal phase execution
- Number of phases executed on time

This will be normalized and stored in off-chain MongoDB database for aiding analytical workflows. The data is updated upon function calls to corresponding mutations in the handers, with future implementation to use cron jobs to ensure less starvation and efficiency.

## Agencies

An agency is responsible for the following operations in the platform:

### Create proposals

An agency can create proposals to multiple projects

## Users

# Tech stack

The project uses the following technologies:

## Frontend

- Next.js for the frontend framework
- Material UI for the UI framework to ensure consistency and accessibility
- EditorJS for rich text input processing
- `viem` and `wagmi` for interaction with smart contract wallet and operations

## Backend

- Bun for JavaScript runtime and package management
- ElysiaJS for backend application server and data validation
- HuggingFace.js for AI inference using Meta LLaMa 3.1
- MongoDB for off-chain data storage, used for analytics and authentication

## Smart Contracts

- Foundry for smart contract development
- Anvil for local testnet deployment using Docker Compose
- Inco for smart contract development with confidentiality

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