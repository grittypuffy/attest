# Getting started

Ensure you have the following dependencies installed on your system:
1. Bun: Runtime for running server and web application
2. Docker Compose: For running the Inco network locally using Anvil
3. Git: For version control management

Clone the Git repo from GitHub to get started with the project:

```sh
git clone https://github.com/grittypuffy/attest
cd attest
```

## Project Components

The project components which will need set up for running the application are documented below

# Smart contract

- Install dependencies:
    ```sh
    cd contracts
    bun install
    ```

- For testing the flow of the smart contracts, use the following command
    ```sh
    forge test --match-contract ConfidentialAttestFlowTest -vvvv
    ```
# Frontend

- Install dependencies:
    ```sh
    cd web
    bun install
    ```

- Run the application after copying .env.sample to .env and filling needed values as documented:
    ```sh
    bun run dev #Application available at http://localhost:3000
    ```

# Backend

- Install dependencies:
    ```sh
    cd server
    bun install
    ```

- Run the application after copying .env.sample to .env and filling needed values as documented:
    ```sh
    bun run dev #Application available at http://localhost:8000
    # OpenAPI documentation at http://localhost:8000/openapi
    ```