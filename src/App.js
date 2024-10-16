import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

const contractAddress = '0x390Fab8E846cB541011F81afAaC07d58f05890f6'; // Replace with your deployed contract address
const zkEVMCardonaChainId = '2440'; // Chain ID for Polygon zkEVM Cardona testnet

const contractABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      }
    ],
    "name": "LandForSale",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "location",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "area",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      }
    ],
    "name": "LandRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      }
    ],
    "name": "LandSold",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "buyLand",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "getLand",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "location",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "area",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "price",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isForSale",
            "type": "bool"
          }
        ],
        "internalType": "struct LandRegistry.Land",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "landCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "lands",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "location",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "area",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isForSale",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_price",
        "type": "uint256"
      }
    ],
    "name": "putLandForSale",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_location",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_area",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_price",
        "type": "uint256"
      }
    ],
    "name": "registerLand",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

function App() {
  const [ethereum, setEthereum] = useState(null);
  const [account, setAccount] = useState(null);
  const [lands, setLands] = useState([ { id: 1, location: "Chennai", area: 500, price: ethers.utils.parseEther("1"), isForSale: true, imageUrl: "https://ensia.com/wp-content/uploads/2023/02/Land-sector-notable-main-image-e1676653229778-920x511.jpg" },
    { id: 2, location: "Coimbatore", area: 600, price: ethers.utils.parseEther("0.5"), isForSale: true, imageUrl: "https://assets-news.housing.com/news/wp-content/uploads/2020/07/09210345/Investing-in-land-The-pros-and-cons-FB-1200x700-compressed.jpg" },]);

  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== 'undefined') {
        setEthereum(window.ethereum);

        try {
          // Request account access
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          
          // Check if the user is connected to the correct network
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          if (chainId !== zkEVMCardonaChainId) {
            try {
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: zkEVMCardonaChainId }],
              });
            } catch (switchError) {
              // This error code indicates that the chain has not been added to MetaMask.
              if (switchError.code === 4902) {
                try {
                  await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                      chainId: zkEVMCardonaChainId,
                      chainName: 'Polygon zkEVM Cardona',
                      nativeCurrency: {
                        name: 'ETH',
                        symbol: 'ETH',
                        decimals: 18
                      },
                      rpcUrls: ['https://rpc.cardona.zkevm-rpc.com'],
                      blockExplorerUrls: ['https://explorer.cardona.zkevm-rpc.com']
                    }],
                  });
                } catch (addError) {
                  console.error('Failed to add the Polygon zkEVM Cardona network', addError);
                }
              }
              console.error('Failed to switch to the Polygon zkEVM Cardona network', switchError);
            }
          }

          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          setAccount(accounts[0]);

          // Load existing lands
          await loadLands();
        } catch (error) {
          console.error("Failed to load ethereum or accounts. Check console for details.");
          console.error(error);
        }
      } else {
        console.log("Please install MetaMask!");
      }
    };

    init();
  });

  const loadLands = async () => {
    const landCount = await callContractMethod('landCount', []);
    const landsArray = [];
    for (let i = 1; i <= landCount; i++) {
      const land = await callContractMethod('getLand', [i]);
      landsArray.push(land);
    }
    setLands(landsArray);
  };

  const callContractMethod = async (methodName, params) => {
    const data = ethereum.request({
      method: 'eth_call',
      params: [{
        to: contractAddress,
        data: ethereum.request.eth.abi.encodeFunctionCall(
          contractABI.find(method => method.name === methodName),
          params
        ),
      }, 'latest'],
    });
    return ethereum.request.eth.abi.decodeParameters(
      contractABI.find(method => method.name === methodName).outputs,
      data
    );
  };

  const registerLand = async (event) => {
    event.preventDefault();
    const location = event.target.location.value;
    const area = event.target.area.value;
    const price = ethers.utils.parseEther(event.target.price.value);  // Converts ETH to Wei
  
    try {
      await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: contractAddress,
          data: new ethers.utils.Interface(contractABI).encodeFunctionData('registerLand', [location, area, price])
        }],
      });
      console.log('Land registered successfully');
      await loadLands();
    } catch (error) {
      console.error('Error registering land:', error);
    }
  };   //updated

  const buyLand = async (id, price) => {
    try {
      await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: contractAddress,
          value: ethers.utils.hexValue(price), // Converts price to hex
          data: new ethers.utils.Interface(contractABI).encodeFunctionData('buyLand', [id]),
        }],
      });
      console.log('Land bought successfully');
      await loadLands();
    } catch (error) {
      console.error('Error buying land:', error);
    }
  };   //updated

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Land Registry on Polygon zkEVM Cardona</h1>
        <p>Connected Account: <strong>{account}</strong></p>
      </header>

      <section className="register-land">
        <h2>Register Land</h2>
        <form onSubmit={registerLand}>
          <input type="text" name="location" placeholder="Location" required />
          <input type="number" name="area" placeholder="Area (in sq. meters)" required />
          <input type="number" name="price" placeholder="Price (in ETH)" step="0.01" required />
          <button type="submit">Register Land</button>
        </form>
      </section>

      <section className="available-lands">
        <h2>Available Lands</h2>
        <ul>
        {lands.map((land) => (
  <li key={land.id} className={`land-item ${land.isForSale ? 'for-sale' : ''}`}>
    <div className="land-info">
      <img src={land.imageUrl} alt={land.location} className="land-image" /> {/* Add image URL for each land */}
      <strong>ID:</strong> {land.id}, 
      <strong> Location:</strong> {land.location}, 
      <strong> Area:</strong> {land.area} sq. meters, 
      <strong> Price:</strong> {ethereum ? ethers.utils.formatEther(land.price) : ''} ETH
    </div>
    {land.isForSale && (
      <button className="buy-button" onClick={() => buyLand(land.id, land.price)}>Buy Land</button>
    )}
  </li>
))}
        </ul>
      </section>
    </div>
  );
}

export default App;