const express = require('express');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();
const port = 8080;

const provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
const CONTRACT_ADDRESS = "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d"; // BAYC
const TRANSFER_TOPIC = ethers.utils.id("Transfer(address,address,uint256)");

// Helper: find the closest block for a given timestamp
async function findClosestBlock(targetTimestamp) {
  let low = 0;
  let high = await provider.getBlockNumber();

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const block = await provider.getBlock(mid);

    if (!block) {
      high = mid - 1;
      continue;
    }

    if (block.timestamp === targetTimestamp) {
      return block;
    }

    if (block.timestamp < targetTimestamp) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return await provider.getBlock(high); // closest block before timestamp
}

// Helper: fetch logs in chunks of max 500 blocks (Alchemy limit)
async function getLogsInChunks(address, fromBlock, toBlock, topics) {
  const logs = [];
  const chunkSize = 500;

  for (let start = fromBlock; start <= toBlock; start += chunkSize) {
    const end = Math.min(start + chunkSize - 1, toBlock);
    const chunkLogs = await provider.getLogs({
      address,
      fromBlock: start,
      toBlock: end,
      topics,
    });
    logs.push(...chunkLogs);
  }

  return logs;
}

app.get('/eth-balance', async (req, res) => {
  const { timestamp } = req.query;

  if (!timestamp) {
    return res.status(400).json({ error: 'Missing timestamp query parameter.' });
  }

  try {
    const targetTimestamp = parseInt(timestamp, 10);
    const block = await findClosestBlock(targetTimestamp);

    if (!block) {
      return res.status(404).json({ error: 'Block not found for given timestamp.' });
    }

    const blockNumber = block.number;
    const fromBlock = Math.max(0, blockNumber - 5000); // keep your 5000 blocks range
    const toBlock = blockNumber;

    // Fetch logs in chunks of 500 blocks max
    const logs = await getLogsInChunks(CONTRACT_ADDRESS, fromBlock, toBlock, [TRANSFER_TOPIC]);

    const holderAddresses = new Set();

    logs.forEach(log => {
      const from = `0x${log.topics[1].slice(26)}`;
      const to = `0x${log.topics[2].slice(26)}`;

      if (from !== ethers.constants.AddressZero) holderAddresses.add(from);
      if (to !== ethers.constants.AddressZero) holderAddresses.add(to);
    });

    const balanceResults = [];
    for (const address of holderAddresses) {
      const balance = await provider.getBalance(address, blockNumber);
      balanceResults.push({
        address,
        balance: ethers.utils.formatEther(balance),
      });
    }

    res.json({
      requestedTimestamp: targetTimestamp,
      actualBlockTimestamp: block.timestamp,
      blockNumber,
      totalHolders: balanceResults.length,
      balances: balanceResults,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`ETH API listening at http://localhost:${port}`);
});
