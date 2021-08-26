//SPDX-License-Identifier: Unlicense
// Soon to be GPL-3.0-or-later
pragma solidity ^0.8.0;

import 'hardhat/console.sol';
import '@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract TokenFactory is ERC1155Supply, Ownable {
  constructor(string memory tokenUri) ERC1155(tokenUri) {
    // It's STRONGLY recommended that you deploy
    // this contract with a multisig account to
    // minimize the risk of losing control of this contract
  }

  function setUri(string memory newUri) public onlyOwner {
    _setURI(newUri);
  }

  function mint(
    address account,
    uint256 id,
    uint256 amount,
    bytes memory data
  ) public onlyOwner {
    _mint(account, id, amount, data);
  }

  function mintBatch(
    address to,
    uint256[] memory ids,
    uint256[] memory amounts,
    bytes memory data
  ) public onlyOwner {
    _mintBatch(to, ids, amounts, data);
  }

  function burn(
    address account,
    uint256 id,
    uint256 amount
  ) public onlyOwner {
    _burn(account, id, amount);
  }

  function burnBatch(
    address account,
    uint256[] memory ids,
    uint256[] memory amounts
  ) public onlyOwner {
    _burnBatch(account, ids, amounts);
  }
}
