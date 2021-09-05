const { expect } = require('chai')
const { ethers } = require('hardhat')

const DEFAULT_METADATA_URI = 'https://example.com/api/item/{id}.json'
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

describe('TokenFactory - Fungible Token', () => {
  let tokenFactory = null
  let deployerAccount = null
  let receiverAccount = null

  beforeEach(async () => {
    ;[deployerAccount, receiverAccount] = await ethers.getSigners()
    const TokenFactory = await ethers.getContractFactory(
      'TokenFactory',
      deployerAccount
    )
    tokenFactory = await TokenFactory.deploy(DEFAULT_METADATA_URI)
    await tokenFactory.deployed()
  })

  context('# 1155 to 777', () => {
    it('successfully converts a 1155 token with supply of 1 to 777', async () => {
      await tokenFactory.mint(deployerAccount.address, 0, 1, [])

    })
  })

})
