//SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol';

contract SupporterToken is ERC1155Supply, Ownable {
  mapping(uint256 => bool) internal hasExternalToken;
  mapping(uint256 => address) internal externalTokenAddress;
  // TODO: Make this value change on transfer
  mapping(address => uint256) internal _aggregateBalance;

  constructor(string memory tokenUri) ERC1155(tokenUri) {
    // It's STRONGLY recommended that you deploy
    // this contract with a multisig account to
    // minimize the risk of losing control of this contract
  }

  function _mint(
    address account,
    uint256 id,
    uint256 amount,
    bytes memory data
  ) internal override {
    super._mint(account, id, amount, data);
    _aggregateBalance[account] += amount;
  }

  function _mintBatch(
    address to,
    uint256[] memory ids,
    uint256[] memory amounts,
    bytes memory data
  ) internal override {
    super._mintBatch(to, ids, amounts, data);
    for (uint256 i = 0; i < amounts.length; i++) {
      uint256 amount = amounts[i];
      _aggregateBalance[to] += amount;
    }
  }

  function _burn(
    address account,
    uint256 id,
    uint256 amount
  ) internal override {
    super._burn(account, id, amount);
    _aggregateBalance[account] -= amount;
  }

  function _burnBatch(
    address account,
    uint256[] memory ids,
    uint256[] memory amounts
  ) internal override {
    super._burnBatch(account, ids, amounts);
    for (uint256 i = 0; i < amounts.length; i++) {
      uint256 amount = amounts[i];
      _aggregateBalance[account] -= amount;
    }
  }

  function setUri(string memory newUri) public onlyOwner {
    _setURI(newUri);
    emit URI(newUri, 0);
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

  function safeTransferFrom(
    address from,
    address to,
    uint256 id,
    uint256 amount,
    bytes memory data
  ) public override {
    super.safeTransferFrom(from, to, id, amount, data);
    _aggregateBalance[from] -= amount;
    _aggregateBalance[to] += amount;
  }

  function safeBatchTransferFrom(
    address from,
    address to,
    uint256[] memory ids,
    uint256[] memory amounts,
    bytes memory data
  ) public override {
    super.safeBatchTransferFrom(from, to, ids, amounts, data);
    for (uint256 i = 0; i < amounts.length; i++) {
      uint256 amount = amounts[i];
      _aggregateBalance[from] -= amount;
      _aggregateBalance[to] += amount;
    }
  }

  function isSupporter(address account) public view returns (bool) {
    return _aggregateBalance[account] > 0;
  }

  function aggregateBalanceOf(address account) public view returns (uint256) {
    return _aggregateBalance[account];
  }
}
