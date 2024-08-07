import { Web3Provider } from '@ethersproject/providers'; // For MetaMask
import { Contract } from 'ethers'; // For interacting with contracts
import contractArtifact from './abi/Storage.json'; // Ensure this path is correct

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS; // Ensure this is set correctly in your .env file

export async function getContract() {
  const provider = new Web3Provider(window.ethereum);
  await provider.send('eth_requestAccounts', []); // Request user accounts
  const contract = new Contract(contractAddress, contractArtifact.abi, provider.getSigner());
  return contract;
}

export async function retrieveUser() {
  const contract = await getContract();
  const user = await contract.retrieveUser();
  return user;
}


export async function storeValue(num) {
    try {
      const contract = await getContract();
      const tx = await contract.store(num);
      await tx.wait();
      console.log('Value stored successfully');
    } catch (error) {
      console.error('Error storing value:', error);
    }
  }

  export async function retrieveValue() {
    try {
      const contract = await getContract();
      const value = await contract.retrieve();
      console.log('Stored value:', value.toString());
      return value.toString();
    } catch (error) {
      console.error('Error retrieving value:', error);
    }
  }

