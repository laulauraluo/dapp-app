import { Interface } from 'ethers';
import contractArtifact from '../abi/Storage.json';

// A tiny in-memory chain that answers the wallet calls ethers makes, so the app can be tried without MetaMask.
export const DEMO_CONTRACT = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const ACCOUNT = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
const storage = new Interface(contractArtifact.abi);
const state = { value: 0n, block: 1, txs: {} };
const hex = (n) => '0x' + n.toString(16);
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const demoWallet = {
  async request({ method, params = [] }) {
    await pause(350); // slow enough to watch each step
    switch (method) {
      case 'eth_requestAccounts':
      case 'eth_accounts':
        return [ACCOUNT];
      case 'eth_chainId':
        return '0x7a69'; // 31337, the usual local dev chain id
      case 'eth_blockNumber':
        return hex(state.block);
      case 'eth_estimateGas':
        return '0x7530';
      case 'eth_call': {
        const call = storage.parseTransaction({ data: params[0].data });
        const result = call.name === 'retrieve' ? [state.value] : [ACCOUNT];
        return storage.encodeFunctionResult(call.name, result);
      }
      case 'eth_sendTransaction': {
        const call = storage.parseTransaction({ data: params[0].data });
        if (call.name === 'store') state.value = call.args[0];
        state.block += 1;
        const hash = '0x' + state.block.toString(16).padStart(64, 'a');
        state.txs[hash] = { block: state.block, data: params[0].data };
        await pause(900); // pretend to wait for a block
        return hash;
      }
      case 'eth_getTransactionByHash': {
        const tx = state.txs[params[0]];
        return { hash: params[0], from: ACCOUNT, to: DEMO_CONTRACT, input: tx.data, nonce: '0x0', gas: '0x7530',
          gasPrice: '0x1', value: '0x0', blockNumber: hex(tx.block), blockHash: '0x' + 'b'.repeat(64),
          transactionIndex: '0x0', chainId: '0x7a69', type: '0x0', v: '0x0', r: '0x1', s: '0x1' };
      }
      case 'eth_getTransactionReceipt': {
        const tx = state.txs[params[0]];
        return { transactionHash: params[0], blockNumber: hex(tx.block), blockHash: '0x' + 'b'.repeat(64),
          transactionIndex: '0x0', status: '0x1', gasUsed: '0x7530', cumulativeGasUsed: '0x7530', logs: [],
          logsBloom: '0x' + '0'.repeat(512), from: ACCOUNT, to: DEMO_CONTRACT, contractAddress: null,
          effectiveGasPrice: '0x1', type: '0x0' };
      }
      default:
        throw new Error(`demo wallet does not support ${method}`);
    }
  },
};
