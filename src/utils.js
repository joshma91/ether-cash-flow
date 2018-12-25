import web3 from "./web3"

export const getBlockData = async (start, end) => {
  const blockNums = Array.from({ length: (end + 1 - start)}, (_, i) => start + (i));

  const blocks = await getBlocks(blockNums)
  console.log(blocks)
}

const getBlocks = async (blockNums) => {
  const blocksPromises = blockNums.map(blockNum => web3.eth.getBlock(blockNum, true));
  return Promise.all(blocksPromises);
}
