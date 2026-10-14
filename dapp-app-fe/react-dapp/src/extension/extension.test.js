import { screen, waitFor } from '@testing-library/react';

test('draws each step of the app\'s own contract calls on the demo chain', async () => {
  process.env.REACT_APP_CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  require('./index'); // jsdom has no wallet, so this installs the demo chain and mounts the panel
  const { storeValue, retrieveValue } = require('../contract'); // the app's unmodified code

  await storeValue(42);
  expect(await retrieveValue()).toBe('42');
  await waitFor(() => expect(screen.getByText(/mined in block 2/)).toBeInTheDocument());
  await waitFor(() => expect(screen.getByText(/✅ 42/)).toBeInTheDocument());
}, 25000); // the demo chain pauses between steps on purpose
