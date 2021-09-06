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
  })

  describe('- mint()', () => {
    it('correctly tracks aggregate balance during mint', async () => {
      await supporterToken.mint(receiverAccount.address, 1, 50, [])
      await supporterToken.mint(receiverAccount.address, 2, 50, [])
      const deployerBalance = await supporterToken.aggregateBalanceOf(
        deployerAccount.address
      )
      const receiverBalance = await supporterToken.aggregateBalanceOf(
        receiverAccount.address
      )
      expect(deployerBalance).to.equal(
        0,
        'Deployer address should have a 0 aggregate balance after mint'
      )
      expect(receiverBalance).to.equal(
        100,
        'Receiver address should have a 100 aggregate balance after mint'
      )
    })
  })

  describe('- mintBatch', () => {
    it('correctly tracks aggregate balance during mintBatch', async () => {
      await supporterToken.mintBatch(
        receiverAccount.address,
        [0, 3, 7],
        [10, 20, 40],
        []
      )
      const receiverBalance = await supporterToken.aggregateBalanceOf(
        receiverAccount.address
      )
      expect(receiverBalance).to.equal(
        70,
        'Receiver address should have a 70 aggregate balance after mintBatch'
      )
    })
  })

  describe('- burn()', () => {
    it('correctly tracks aggregate balance during burn', async () => {
      await supporterToken.mint(deployerAccount.address, 0, 5, [])
      const deployerBalancePreBurn = await supporterToken.aggregateBalanceOf(
        deployerAccount.address
      )
      expect(deployerBalancePreBurn).to.equal(
        5,
        'Address should have a 5 aggregate balance before burn'
      )
      await supporterToken.burn(deployerAccount.address, 0, 2)
      const deployerBalancePostBurn = await supporterToken.aggregateBalanceOf(
        deployerAccount.address
      )
      expect(deployerBalancePostBurn).to.equal(
        3,
        'Address should have a 3 aggregate balance after burn'
      )
    })
  })

  describe('- safeTransferFrom', () => {
    it('correctly tracks aggregate balance during mint safeTransferFrom', async () => {
      await supporterToken.mint(deployerAccount.address, 0, 5, [])
      const deployerBalancePreSend = await supporterToken.aggregateBalanceOf(
        deployerAccount.address
      )
      expect(deployerBalancePreSend).to.equal(
        5,
        'Deployer address should have an aggregate balance of 5 before safeTransferFrom'
      )
      await supporterToken.safeTransferFrom(
        deployerAccount.address,
        receiverAccount.address,
        0,
        2,
        []
      )
      const deployerBalancePostSend = await supporterToken.aggregateBalanceOf(
        deployerAccount.address
      )
      expect(deployerBalancePostSend).to.equal(
        3,
        'Deployer address should have an aggregate balance of 3 after safeTransferFrom'
      )
      const receiverBalancePostSend = await supporterToken.aggregateBalanceOf(
        receiverAccount.address
      )
      expect(receiverBalancePostSend).to.equal(
        2,
        'Receiver address should have an aggregate balance of 2 after safeTransferFrom'
      )
    })
  })

  describe('- safeBatchTransferFrom', () => {
    it('correctly tracks aggregate balance during safeBatchTransferFrom', async () => {
      await supporterToken.mintBatch(
        deployerAccount.address,
        [0, 3],
        [1234, 1000],
        []
      )
      const deployerBalance0PreSend = await supporterToken.aggregateBalanceOf(
        deployerAccount.address
      )
      expect(deployerBalance0PreSend).to.equal(
        2234,
        'Deployer address should have an aggregate balance of 2234 before safeBatchTransferFrom'
      )
      await supporterToken.safeBatchTransferFrom(
        deployerAccount.address,
        receiverAccount.address,
        [0, 3],
        [1111, 777],
        []
      )
      const deployerBalance0PostSend = await supporterToken.aggregateBalanceOf(
        deployerAccount.address
      )
      expect(deployerBalance0PostSend).to.equal(
        346,
        'Deployer address should have an aggregate balance of 123 for ID 0 after safeBatchTransferFrom'
      )
      const receiverBalance0PostSend = await supporterToken.aggregateBalanceOf(
        receiverAccount.address
      )
      expect(receiverBalance0PostSend).to.equal(
        1888,
        'Receiver address should have an aggregate balance of 1111 for ID 0 after safeBatchTransferFrom'
      )
    })
  })
})
