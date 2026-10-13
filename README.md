# dapp-app

A small React starter for calling a smart contract from the browser. Click a button, MetaMask asks to connect, and the app reads from or writes to the contract. It is meant as a hackathon kickstarter: clone it, point it at your contract, and spend your time on the UI.

## Quick start

You need Node.js, the MetaMask browser extension, and a deployed `Storage` contract on the network MetaMask is using.

```bash
git clone https://github.com/laulauraluo/dapp-app.git
cd dapp-app/dapp-app-fe/react-dapp
npm install
cp .env.example .env   # put your contract address in .env
npm start              # opens http://localhost:3000
```

Click **Retrieve Value**. MetaMask asks to connect, then the stored number appears on the page.

## What's inside

| Path | What it does |
|---|---|
| `dapp-app-fe/react-dapp/src/contract.js` | Connects to MetaMask (ethers v6 `BrowserProvider`) and wraps each contract call |
| `dapp-app-fe/react-dapp/src/App.js` | Three buttons wired to those calls |
| `dapp-app-fe/react-dapp/src/abi/Storage.json` | Hardhat artifact for `Storage`: ABI and bytecode |
| `dapp-app-fe/react-dapp/.env.example` | The one setting you need: `REACT_APP_CONTRACT_ADDRESS` |

The `Storage` contract interface, from the ABI:

| Function | Kind | Used by |
|---|---|---|
| `store(uint256)` | write | **Store Value** (stores 42) |
| `retrieve() returns (uint256)` | read | **Retrieve Value** |
| `retrieveUser() returns (address)` | read | **Retrieve User** |
| `register()` | payable write | not wired to a button |

## Deploy the contract

`src/abi/Storage.json` contains the compiled bytecode, so you can deploy it with any tool that accepts an ABI plus bytecode (for example ethers' `ContractFactory` or a Hardhat script). Copy the deployed address into `.env` and restart `npm start`.

## Make it yours

1. Replace `src/abi/Storage.json` with your own contract's artifact (Hardhat writes it to `artifacts/contracts/<Name>.sol/<Name>.json`).
2. Set `REACT_APP_CONTRACT_ADDRESS` to your contract.
3. For each contract function, add a small wrapper in `src/contract.js` and a button in `src/App.js`.

Good first change: **Retrieve User** saves the address into the `user` state but the page does not show it yet.

## Notes

- `npm run build` compiles (two unused-variable lint warnings). The three contract calls were checked against a mocked wallet, not a live chain.
- Create React App is no longer maintained. For a new project, the same `contract.js` works in a Vite app.
