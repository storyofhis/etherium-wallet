# 🐵 BAYC Holder ETH Balance API
This Node.js application allows you to query the total ETH balance of all wallets that have ever held a Bored Ape Yacht Club (BAYC) NFT, at any given point in time using a provided epoch timestamp.
📌 Project Overview
    
    1. Blockchain: Ethereum
    2. NFT Project: Bored Ape Yacht Club (BAYC)
    3. Contract Address: 0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d
    4. Functionality: Given an epoch timestamp, the program fetches the closest block before that time and returns the ETH balances of all addresses that held a BAYC NFT within the last 5000 blocks up to that timestamp.
🧠 Features

    1. Uses the Ethereum JSON-RPC API via ethers.js.
    2. Fetches and processes historical logs (Transfer events) to identify holders.
    3. Retrieves ETH balances of each holder address at a specific block.
    4. Returns total ETH balances with holder details in JSON format.
🛠️ Setup
Prerequisites

    - Node.js (v16 or higher recommended)
    - Ethereum RPC Provider (e.g. Alchemy, Infura)
## Clone Repository
```
git clone https://github.com/yourusername/bayc-eth-balance-api.git
cd bayc-eth-balance-api
```

## Install Dependencies
```
npm install
```

## Configure Environment Variables
Create a `.env` file in the root directory and add your Ethereum RPC URL:
```
ETHEREUM_RPC_URL=https://eth-mainnet.alchemyapi.io/v2/YOUR_API_KEY
```

## 🚀 Running the API
```
node index.js
```

example Request :
```
GET http://localhost:8080/eth-balance?timestamp=1716873600
```
example Response : 
```
{
  "requestedTimestamp": 1716873600,
  "actualBlockTimestamp": 1716873595,
  "blockNumber": 19558384,
  "totalHolders": 134,
  "balances": [
    {
      "address": "0x1234...abcd",
      "balance": "2.1345"
    },
    {
      "address": "0xabcd...5678",
      "balance": "0.5031"
    }
  ]
}
```

📖 Notes

    - The app uses a binary search algorithm to find the Ethereum block closest to the provided timestamp.
    - Due to provider limitations, logs are fetched in chunks of 500 blocks.
    - Only addresses involved in BAYC Transfer events within the last 5000 blocks up to the selected timestamp are considered.
