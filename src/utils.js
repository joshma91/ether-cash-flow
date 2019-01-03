import web3 from "./getWeb3";
import BigNumber from "bignumber.js";
import flat from "array.prototype.flat";

export const getBlockData = async (start, end) => {
  console.log(start);
  console.log(end);
  const blockNums = Array.from(
    { length: end + 1 - start },
    (_, i) => start + i
  );

  const blocks = await getBlocks(blockNums, web3);
  const transactions = await getTransactions(blocks, web3);
  const totalWeiTransferred = getTotalWeiTransferred(transactions);

  const receiverTotals = await getTotals("to", transactions);
  const senderTotals = await getTotals("from", transactions);

  const addressesIsContract = await getAddressesIsContract(transactions, web3);
  const pctContract = getPctContract(transactions, addressesIsContract);
  const numUncles = getNumUncles(blocks);
  const numReceivers = getNumAddresses(receiverTotals);
  const numSenders = getNumAddresses(senderTotals);

  const numContracts = getNumContracts(transactions);
  const numEvents = await getNumEvents(transactions, web3);

  console.log("blocks", blocks);
  console.log("transactions", transactions);
  console.log("total transferred", totalWeiTransferred);
  console.log("receiver totals", receiverTotals);
  console.log("is Contract", addressesIsContract);
  console.log("percent contract", pctContract);
  console.log("numUncles", numUncles);

  return {
    totalWeiTransferred,
    receiverTotals,
    senderTotals,
    addressesIsContract,
    pctContract
  };
};

export const formatNumber = numStr => {
  return parseFloat(numStr).toFixed(5);
};

export const getTransactions = async (blocks, web3) => {
  const transactions = blocks.map(block => block.transactions);
  return flat(transactions);
};

export const getTotalWeiTransferred = transactions => {
  return transactions
    .reduce((acc, tx) => {
      const currBN = new BigNumber(tx.value);
      return acc.plus(currBN);
    }, new BigNumber(0))
    .toString();
};

export const getTotals = async (type, transactions) => {
  return transactions.reduce((acc, tx) => {
    const address = tx[type];
    const prevTotal = acc[address] ? acc[address] : null;
    const newTotal = prevTotal
      ? new BigNumber(prevTotal).plus(new BigNumber(tx.value))
      : new BigNumber(tx.value);

    const newObj = { ...acc, [address]: newTotal.toString() };
    return newObj;
  }, {});
};

export const getBlocks = async (blockNums, web3) => {
  const blocksPromises = blockNums.map(blockNum =>
    web3.eth.getBlock(blockNum, true)
  );
  return Promise.all(blocksPromises);
};

export const getAddressesIsContract = async (transactions, web3) => {
  const uniqueAddresses = getUniqueAddresses(transactions);
  const addressCodes = await getAddressCodes(uniqueAddresses, web3);

  // contracts will return their bytecode, accounts will return 0x or 0x0
  const isContractArray = addressCodes.map(code =>
    code === "0x" || code === "0x0" ? false : true
  );

  // zip uniqueAddresses with isContractArray
  const addressesIsContract = uniqueAddresses.reduce((acc, addr, i) => {
    return { ...acc, [addr]: isContractArray[i] };
  }, {});

  return addressesIsContract;
};

const getUniqueAddresses = transactions => {
  const uniqueAddressesObj = transactions.reduce((acc, tx) => {
    // omit null addresses from contract creation transactions
    return Object.assign(
      acc,
      tx.from ? { [tx.from]: null } : null,
      tx.to ? { [tx.to]: null } : null
    );
  }, {});
  return Object.keys(uniqueAddressesObj);
};

const getAddressCodes = async (addresses = [], web3) => {
  const addressCodePromises = addresses
    .filter(addr => addr !== "null")
    .map(addr => web3.eth.getCode(addr));

  return await Promise.all(addressCodePromises);
};

export const getPctContract = (transactions, addressesIsContract) => {
  const numContractTxs = transactions
    .map(tx =>
      addressesIsContract[tx.from] || addressesIsContract[tx.to] ? 1 : 0
    )
    .reduce((acc, curr) => acc + curr, 0);

  return (numContractTxs / transactions.length) * 100;
};

export const getNumUncles = blocks => {
  return blocks.reduce((acc, curr) => acc + curr.uncles.length, 0);
};

export const getNumAddresses = addressTotals => {
  const addressArray = Object.keys(addressTotals).filter(addr => addr !== "null")
  return addressArray.length;
};

export const getNumContracts = transactions => {
  return transactions
    .map(tx => (tx.to === null ? 1 : 0))
    .reduce((acc, curr) => acc + curr, 0);
};

export const getNumEvents = async (transactions, web3) => {
  const txReceiptPromises = transactions.map(tx =>
    web3.eth.getTransactionReceipt(tx.hash)
  );

  const txReceipts = await Promise.all(txReceiptPromises);
  const numEvents = txReceipts.reduce(
    (acc, receipt) => acc + receipt.logs.length,
    0
  );
  return numEvents;
};
