import web3 from "./web3";
import BigNumber from "bignumber.js";

export const getBlockData = async (start, end) => {
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

  const receiverTotals = getTotals("to", transactions);
  const senderTotals = getTotals("from", transactions);

  console.log("transactions", transactions);
  console.log("wei transferred", totalWeiTransferred);
  console.log("receivers", receiverTotals);
  console.log("senders", senderTotals);
};

const getTotals = (type, transactions) => {
  return transactions.reduce((acc, tx) => {
    const address = tx[type];
    const prevTotal = acc[address];
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
