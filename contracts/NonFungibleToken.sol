//SPDX-License-Identifier: GPL-3.0-or-later

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import '@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol';

contract NonFungibleToken is ERC721Enumerable {
  constructor() {}

  function onERC1155Received(
    address operator,
    address from,
    uint256 id,
    uint256 value,
    bytes calldata data
  ) external returns (bytes4) {
    return
      bytes4(
        keccak256('onERC1155Received(address,address,uint256,uint256,bytes)')
      );
  }

  function onERC1155BatchReceived(
    address operator,
    address from,
    uint256[] calldata ids,
    uint256[] calldata values,
    bytes calldata data
  ) external returns (bytes4) {
    return
      bytes4(
        keccak256(
          'onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)'
        )
      );
  }
}
