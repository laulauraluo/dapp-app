import React, { useState } from 'react';
import { storeValue, retrieveValue, retrieveUser } from './contract'; // Ensure this path matches where you put your contract interaction code
import './App.css';

function App() {
  const [user, setUser] = useState('');
  const [storedValue, setStoredValue] = useState(null);
  const [userAddress, setUserAddress] = useState(null);

  const handleRetrieveUser = async () => {
    try {
      const retrievedUser = await retrieveUser();
      setUser(retrievedUser);
    } catch (error) {
      console.error('Error retrieving user:', error);
    }
  };

  const handleStoreValue = async (num) => {
    await storeValue(num);
  };

  const handleRetrieveValue = async () => {
    const value = await retrieveValue();
    setStoredValue(value);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Hello this is a sample app demo for Storage</h1>
        <button onClick={() => handleStoreValue(42)}>Store Value</button>
        <button onClick={handleRetrieveValue}>Retrieve Value</button>
        <button onClick={handleRetrieveUser}>Retrieve User</button>
        {storedValue && <p>Stored Value: {storedValue}</p>}
        {userAddress && <p>User Address: {userAddress}</p>}
      </header>
    </div>
  );
}

export default App;
