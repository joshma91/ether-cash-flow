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

  const receiverAddrs = getTotalsAndIfContract("to", transactions);
  const senderAddrs = getTotalsAndIfContract("from", transactions);

  console.log("transactions", transactions);
  console.log("wei transferred", totalWeiTransferred);
  console.log("receivers", receiverAddrs);
  console.log("senders", senderAddrs);
};

const getTotalsAndIfContract = async (type, transactions) => {
  const addressTotals = transactions.reduce((acc, tx) => {
    const address = tx[type];
    const prevTotal = acc[address] ? acc[address].total : null;
    const newTotal = prevTotal
      ? new BigNumber(prevTotal).plus(new BigNumber(tx.value))
      : new BigNumber(tx.value);

    const newObj = { ...acc, [address]: { total: newTotal.toString() } };
    return newObj;
  }, {});
  console.log(addressTotals)

  // the above code will produce an object having unique address keys
  // an array of these addresses is used to determine whether it's a contract or not
  const uniqueAddresses = Object.keys(addressTotals);

  const codePromises = uniqueAddresses
    .filter(addr => addr !== "null")
    .map(addr => web3.eth.getCode(addr));

  const addressCodes = await Promise.all(codePromises)
  console.log(addressCodes)
  const addressTotalsIsContract = uniqueAddresses;
};

const getBlocks = async blockNums => {
  const blocksPromises = blockNums.map(blockNum =>
    web3.eth.getBlock(blockNum, true)
  );
  return Promise.all(blocksPromises);
};
