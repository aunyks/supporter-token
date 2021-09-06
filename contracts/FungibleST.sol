//SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol';
import '@openzeppelin/contracts/token/ERC777/ERC777.sol';

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC777/IERC777.sol';
import './SupporterToken.sol';

contract FungibleST is IERC1155Receiver, ERC777 {
  uint256 internal supporterTokenId;
  address payable internal supporterTokenAddress;

  constructor(
    string memory name,
    string memory symbol,
    address _supporterTokenAddress,
    uint256 _supporterTokenId,
    address[] memory defaultOperators
  ) ERC777(name, symbol, defaultOperators) {
    supporterTokenId = _supporterTokenId;
    supporterTokenAddress = payable(_supporterTokenAddress);
  }

  fallback() external payable {
    payable(SupporterToken(supporterTokenAddress).owner()).transfer(msg.value);
  }

  function burn(uint256 amount, bytes memory data) public override {}

  function supportsInterface(bytes4 interfaceId)
    public
    pure
    override
    returns (bool)
  {
    return
      interfaceId == type(IERC1155Receiver).interfaceId ||
      interfaceId == type(IERC777).interfaceId ||
      interfaceId == type(IERC20).interfaceId;
  }

  function unwrapTokens(uint256 amount) public {
    _burn(msg.sender, amount, '', '');
    SupporterToken(supporterTokenAddress).safeTransferFrom(
      address(this),
      msg.sender,
      supporterTokenId,
      amount,
      ''
    );
  }

  function onERC1155Received(
    address operator,
    address from,
    uint256 id,
    uint256 value,
    bytes memory data
  ) public override returns (bytes4) {
    require(id == supporterTokenId, 'FungibleST: Token ID not supported');
    _mint(from, value, '', '');
    return
      bytes4(
        keccak256('onERC1155Received(address,address,uint256,uint256,bytes)')
      );
  }

  function onERC1155BatchReceived(
    address operator,
    address from,
    uint256[] memory ids,
    uint256[] memory values,
    bytes memory data
  ) public override returns (bytes4) {
    return bytes4(keccak256('No'));
  }
}
