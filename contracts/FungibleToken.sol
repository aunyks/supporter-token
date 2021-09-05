//SPDX-License-Identifier: GPL-3.0-or-later
import '@openzeppelin/contracts/token/ERC777/ERC777.sol';
import '@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol';
import '@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol';

contract FungibleToken is ERC777, IERC1155Receiver {
  address internal factoryContract;
  uint256 internal factoryIdNumber;

  constructor(
    string memory name,
    string memory symbol,
    address[] memory defaultOperators,
    uint256 _erc1166Id
  ) ERC777(name, symbol, defaultOperators) {
    factoryContract = msg.sender;
    factoryIdNumber = _erc1166Id;
  }

  modifier onlyFactory() {
    require(msg.sender == factoryContract);
    _;
  }

  // Ultimately, the factory contract knows the total supply cuz not all
  // 1155 tokens will be converted to this fungible version
  function totalSupply() public view override returns (uint256) {
    return ERC1155Supply(factoryContract).totalSupply(factoryIdNumber);
  }

  // Can only operate in whole tokens
  function granularity() public view override returns (uint256) {
    return 10**decimals();
  }

  function burn(
    address from,
    uint256 amount,
    bytes memory data,
    bytes memory operatorData
  ) public onlyFactory {
    _burn(from, amount, data, operatorData);
  }

  function mint(
    address account,
    uint256 amount,
    bytes memory userData,
    bytes memory operatorData
  ) public onlyFactory {
    _mint(account, amount, userData, operatorData);
  }

  function onERC1155Received(
    address operator,
    address from,
    uint256 id,
    uint256 value,
    bytes calldata data
  ) public override onlyFactory returns (bytes4) {
    require(id == factoryIdNumber);
    _mint(from, value, '', '');
    return
      bytes4(
        keccak256('onERC1155Received(address,address,uint256,uint256,bytes)')
      );
  }
}
