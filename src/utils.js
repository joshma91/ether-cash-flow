import web3 from "./web3";
import BigNumber from "bignumber.js";

export const getBlockData = async (start, end) => {
  console.log(start);
  console.log(end);
  const blockNums = Array.from(
    { length: end + 1 - start },
    (_, i) => start + i
  );

  const blocks = await getBlocks(blockNums);
  const transactions = blocks.map(block => block.transactions).flat();
  const totalWeiTransferred = transactions
    .reduce((acc, tx) => {
      const currBN = new BigNumber(tx.value);
      return acc.plus(currBN);
    }, new BigNumber(0))
    .toString();

  const receiverTotals = await getTotals("to", transactions);
  const senderTotals = await getTotals("from", transactions);

  const addressesIsContract = await getAddressesIsContract(transactions);

  console.log("wei transferred", totalWeiTransferred);
  console.log("receivers", receiverTotals);
  console.log("senders", senderTotals);
  console.log("contract addresses", addressesIsContract);
  
  return {
    totalWeiTransferred,
    receiverTotals,
    senderTotals,
    addressesIsContract    
  }

};

const getTotals = async (type, transactions) => {
  return transactions.reduce((acc, tx) => {
    const address = tx[type];
    const prevTotal = acc[address] ? acc[address].total : null;
    const newTotal = prevTotal
      ? new BigNumber(prevTotal).plus(new BigNumber(tx.value))
      : new BigNumber(tx.value);

    const newObj = { ...acc, [address]: newTotal.toString() };
    return newObj;
  }, {});
};

const getBlocks = async blockNums => {
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
