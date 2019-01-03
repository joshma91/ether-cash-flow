pragma solidity ^0.5.2;

contract SimpleStorage {

  event DataSet(uint newData);
  uint storedData = 0;

  function set(uint x) public {
    storedData = x;
    emit DataSet(x);
  }

  function get() public view returns (uint) {
    return storedData;
  }
}