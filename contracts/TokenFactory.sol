//SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import 'hardhat/console.sol';
import '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

import './NonFungibleToken.sol';
import './FungibleToken.sol';

contract TokenFactory is ERC1155, Ownable {
  mapping(uint256 => bool) internal hasExternalToken;
  mapping(uint256 => address) internal externalTokenAddress;
  mapping(uint256 => uint256) private _totalSupply;

  constructor(string memory tokenUri) ERC1155(tokenUri) {
    // It's STRONGLY recommended that you deploy
    // this contract with a multisig account to
    // minimize the risk of losing control of this contract
  }

  function totalSupply(uint256 id) public view returns (uint256) {
    return _totalSupply[id];
  }

  function exists(uint256 id) public view returns (bool) {
    return ERC1155Supply.totalSupply(id) > 0;
  }

  function _mint(
    address account,
    uint256 id,
    uint256 amount,
    bytes memory data
  ) internal override {
    super._mint(account, id, amount, data);
    _totalSupply[id] += amount;
  }

  function _mintBatch(
    address to,
    uint256[] memory ids,
    uint256[] memory amounts,
    bytes memory data
  ) internal override {
    super._mintBatch(to, ids, amounts, data);
    for (uint256 i = 0; i < ids.length; ++i) {
      _totalSupply[ids[i]] += amounts[i];
    }
  }

  function _burn(
    address account,
    uint256 id,
    uint256 amount
  ) internal override {
    super._burn(account, id, amount);
    _totalSupply[id] -= amount;
  }

  function _burnBatch(
    address account,
    uint256[] memory ids,
    uint256[] memory amounts
  ) internal override {
    super._burnBatch(account, ids, amounts);
    for (uint256 i = 0; i < ids.length; ++i) {
      _totalSupply[ids[i]] -= amounts[i];
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
    require(totalSupply(id) > 0 && !hasExternalToken[id], '');
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

  function wrapToken(
    uint256 id,
    string memory name,
    string memory symbol,
    uint256 amount
  ) public returns (address) {
    require(
      totalSupply(id) > 0,
      "TokenFactory: This token doesn't have have any supply"
    );
    require(
      balanceOf(msg.sender, id) > 0,
      'TokenFactory: Must own a token to wrap it'
    );
    require(
      !hasExternalToken[id],
      'TokenFactory: This token is already wrapped'
    );
    if (totalSupply(id) != 1) {
      // Make fungible token
      FungibleToken ft = new FungibleToken(name, symbol, '', id);
      externalTokenAddress[id] = ft;
      // Burn 1155 tokens
      burn(msg.sender, id, amount);
      _totalSupply[id] += amount;
      // Mint fungible tokens, may need to raise (^) amount to ft.granularity()
      ft.mint(msg.sender, amount, '', '');
      return ft;
    } else {
      NonFungibleToken nft = new NonFungibleToken(name, symbol, id);
      externalTokenAddress[id] = nft;
      // Burn 1155 token
      burn(msg.sender, id, 1);
      _totalSupply[id] += 1;
      // Mint nft
      nft.safeMint(msg.sender, 0);
      return nft;
    }
    hasExternalToken[id] = true;
  }

  function unwrapToken(
    uint256 id,
    string memory name,
    string memory symbol,
    uint256 amount
  ) public {
    require(
      totalSupply(id) > 0,
      "TokenFactory: This token doesn't have have any supply"
    );
    require(
      balanceOf(msg.sender, id) > 0,
      'TokenFactory: Must own a token to wrap it'
    );
    require(hasExternalToken[id], "TokenFactory: This token isn't yet wrapped");
    if (totalSupply(id) != 1) {
      // Make fungible token
      FungibleToken ft = new FungibleToken(name, symbol, [], id);
      // Burn 1155 tokens
      burn(msg.sender, id, amount);
      _totalSupply[id] += amount;
      // Mint fungible tokens, may need to raise (^) amount to ft.granularity()
      ft.mint(msg.sender, amount, '', '');
      return ft;
    } else {
      NonFungibleToken nft = new NonFungibleToken(name, symbol, id);
      // Burn 1155 token
      burn(msg.sender, id, 1);
      _totalSupply[id] += 1;
      // Mint nft
      nft.safeMint(msg.sender, 0);
      return nft;
    }
    hasExternalToken[id] = true;
  }
}
