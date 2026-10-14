// Visual extension: watches every wallet request the app makes and draws it as You -> Wallet -> Contract.
// The app's own files are untouched; delete `import './extension'` in src/index.js to turn it off.
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Interface } from 'ethers';
import artifact from '../abi/Storage.json';
import { demoWallet } from './demoWallet';
import './extension.css';

const storage = new Interface(artifact.abi);
const isDemo = !window.ethereum;
const listeners = new Set();
const short = (s) => (/^0x[0-9a-f]{40,}$/i.test(String(s)) ? `${s.slice(0, 8)}…${s.slice(-6)}` : String(s));
const call = (data) => {
  const tx = storage.parseTransaction({ data });
  return `${tx.name}(${tx.args.join(', ')})`;
};

// One wallet request, before (no result yet) or after it answers -> a log line and a position on the path.
function describe(method, params, result) {
  const done = result !== undefined;
  if (method === 'eth_accounts' || method === 'eth_requestAccounts')
    return done ? { stage: 2, icon: '👛', text: short(result[0]) } : { stage: 1, icon: '🔌', text: 'connecting wallet' };
  if (method === 'eth_sendTransaction')
    return done ? { stage: 3, icon: '📤', text: `sent ${short(result)}` } : { stage: 2, icon: '✍️', text: `sign ${call(params[0].data)}` };
  if (method === 'eth_getTransactionReceipt' && result)
    return { stage: 4, icon: '⛏️', text: `mined in block ${parseInt(result.blockNumber, 16)}` };
  if (method === 'eth_call') {
    if (!done) return { stage: 3, icon: '📖', text: call(params[0].data) };
    const name = storage.parseTransaction({ data: params[0].data }).name;
    return { stage: 4, icon: '✅', text: short(storage.decodeFunctionResult(name, result)[0]) };
  }
  return null;
}

const emit = (method, params, result) => {
  try {
    const entry = describe(method, params, result);
    if (entry) listeners.forEach((listen) => listen(entry));
  } catch {} // a request we can't decode is simply not drawn
};

// Wrap the wallet (or the demo chain when there is none) so the app's own calls pass through emit().
const wallet = window.ethereum || demoWallet;
const tapped = new Proxy(wallet, {
  get(target, prop) {
    if (prop !== 'request') return typeof target[prop] === 'function' ? target[prop].bind(target) : target[prop];
    return async ({ method, params = [] }) => {
      emit(method, params);
      try {
        const result = await target.request({ method, params });
        emit(method, params, result);
        return result;
      } catch (error) {
        listeners.forEach((listen) => listen({ stage: 0, icon: '⚠️', text: error.message }));
        throw error;
      }
    };
  },
});
Object.defineProperty(window, 'ethereum', { value: tapped, configurable: true, writable: true });

function Panel() {
  const [stage, setStage] = useState(0);
  const [log, setLog] = useState([]);
  useEffect(() => {
    const listen = (entry) => {
      setStage(entry.stage);
      setLog((lines) => (lines.slice(-2).some((l) => l.text === entry.text) ? lines : [...lines.slice(-6), entry])); // ethers asks for accounts twice per call
    };
    listeners.add(listen);
    return () => listeners.delete(listen);
  }, []);
  const node = (icon, label, n) => <div className={`vx-node ${stage >= n ? 'on' : ''}`}><span>{icon}</span>{label}</div>;
  const edge = (n) => <div className={`vx-edge ${stage === n ? 'active' : stage > n ? 'done' : ''}`} />;
  return (
    <aside className="vx-panel">
      {isDemo && <p className="vx-demo">Demo mode: no wallet found, calls go to a simulated chain</p>}
      <div className="vx-path">
        {node('🧑', 'You', 1)}{edge(1)}{node('🦊', isDemo ? 'Demo wallet' : 'MetaMask', 2)}{edge(3)}{node('📦', 'Storage.sol', 4)}
      </div>
      <ol className="vx-log">
        {log.length === 0 && <li className="vx-empty">Click a button to watch the call travel to the contract.</li>}
        {log.map((entry, i) => <li key={i}>{entry.icon} {entry.text}</li>)}
      </ol>
    </aside>
  );
}

createRoot(document.body.appendChild(document.createElement('div'))).render(<Panel />);
