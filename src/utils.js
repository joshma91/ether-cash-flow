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

  const transactions = await getTransactions(blockNums);
  const totalWeiTransferred = getTotalWeiTransferred(transactions);

  const receiverTotals = await getTotals("to", transactions);
  const senderTotals = await getTotals("from", transactions);

  const addressesIsContract = await getAddressesIsContract(transactions);

  return {
    totalWeiTransferred,
    receiverTotals,
    senderTotals,
    addressesIsContract
  };
};

export const formatNumber = numStr => {
  return parseFloat(numStr).toFixed(5);
};

export const getTransactions = async (blockNums, web3 = web3) => {
  const blocks = await getBlocks(blockNums, web3);
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

const getBlocks = async (blockNums, web3 = web3) => {
  const blocksPromises = blockNums.map(blockNum =>
    web3.eth.getBlock(blockNum, true)
  );
  return Promise.all(blocksPromises);
};

const getAddressesIsContract = async transactions => {
  const uniqueAddresses = getUniqueAddresses(transactions);
  const addressCodes = await getAddressCodes(uniqueAddresses);

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

const getAddressCodes = async addresses => {
  const addressCodePromises = addresses
    .filter(addr => addr !== "null")
    .map(addr => web3.eth.getCode(addr));

  return await Promise.all(addressCodePromises);
};
