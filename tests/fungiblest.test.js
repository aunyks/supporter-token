const { expect } = require('chai')
const { ethers } = require('hardhat')

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

describe('Fungible Supporter Token', () => {
  let fungibleSt = null
  let supporterToken = null
  let deployerAccount = null
  let receiverAccount = null

  beforeEach(async () => {
    ;[deployerAccount, receiverAccount] = await ethers.getSigners()
    const SupporterToken = await ethers.getContractFactory(
      'SupporterToken',
      deployerAccount
    )
    supporterToken = await SupporterToken.deploy('')
    await supporterToken.deployed()
    const FungibleST = await ethers.getContractFactory(
      'FungibleST',
      deployerAccount
    )
    fungibleSt = await FungibleST.deploy(
      'Fungible Standard Token',
      'FST',
      supporterToken.address,
      3,
      []
    )
    await fungibleSt.deployed()
  })

  describe('- onERC1155BatchReceived()', () => {
    it('mints fungible tokens on 1155 receive', async () => {
      await supporterToken.mint(deployerAccount.address, 3, 50, [])
      await supporterToken.safeTransferFrom(
        deployerAccount.address,
        fungibleSt.address,
        3,
        25,
        []
      )
      const deployerFungibleBalance = await fungibleSt.balanceOf(
        deployerAccount.address
      )
      const deployerNonFungibleBalance = await supporterToken.balanceOf(
        deployerAccount.address,
        3
      )
      expect(deployerFungibleBalance).to.equal(
        25 * (await fungibleSt.decimals()),
        'Deployer address should have a 0 aggregate balance after mint'
      )
      expect(deployerNonFungibleBalance).to.equal(
        25,
        'Receiver address should have a 100 aggregate balance after mint'
      )
    })

    it('rejects receiving 1155 tokens with an incorrect token ID', async () => {
      await supporterToken.mint(deployerAccount.address, 1, 50, [])
      await expect(supporterToken.safeTransferFrom(
        deployerAccount.address,
        fungibleSt.address,
        1,
        25,
        []
      )).to.be.revertedWith('FungibleST: Token ID not supported')
    })
  })

  describe('- unwrapTokens()', () => {
    it('burns fungible tokens on call to unwrap', async () => {
      await supporterToken.mint(deployerAccount.address, 3, 50, [])
      await supporterToken.safeTransferFrom(
        deployerAccount.address,
        fungibleSt.address,
        3,
        25,
        []
      )
      await fungibleSt.unwrapTokens(24)
      const deployerFungibleBalance = await fungibleSt.balanceOf(
        deployerAccount.address
      )
      const deployerNonFungibleBalance = await supporterToken.balanceOf(
        deployerAccount.address,
        3
      )
      expect(deployerFungibleBalance).to.equal(
        1 * (await fungibleSt.decimals()),
        'Deployer address should have a 0 aggregate balance after mint'
      )
      expect(deployerNonFungibleBalance).to.equal(
        49,
        'Receiver address should have a 100 aggregate balance after mint'
      )
    })
  })
})
