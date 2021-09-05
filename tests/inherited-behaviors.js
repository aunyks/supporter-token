const { expect } = require('chai')
const { ethers } = require('hardhat')

const DEFAULT_METADATA_URI = 'https://example.com/api/item/{id}.json'
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

describe('TokenFactory - Inherited Behaviors', () => {
  context('# Basic contract operations', () => {
    it('deploys when given one string as a constructor argument', async () => {
      const TokenFactory = await ethers.getContractFactory('TokenFactory')
      await expect(TokenFactory.deploy(DEFAULT_METADATA_URI)).not.to.be.reverted
    })

    it('fails to deploy when there are no constructor arguments', async () => {
      const TokenFactory = await ethers.getContractFactory('TokenFactory')
      await expect(TokenFactory.deploy()).to.be.reverted
    })
  })

  context('# ERC-1155 operations', () => {
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

    describe('- mint()', () => {
      it('does not revert when minting with non-zero destination address and non-zero amount', async () => {
        await expect(tokenFactory.mint(deployerAccount.address, 0, 5, [])).not
          .to.be.reverted
        const deployerBalance = await tokenFactory.balanceOf(
          deployerAccount.address,
          0
        )
        expect(deployerBalance).to.equal(5, 'Address should have a 5 balance')
      })

      it('mints the correct amount of tokens to the correct address', async () => {
        const mintTxion = await tokenFactory
          // Make sure we're deploying from the right account
          .connect(deployerAccount)
          // and mint tokens to another account
          .mint(receiverAccount.address, 2, 100, [])
        const deployerBalance = await tokenFactory.balanceOf(
          deployerAccount.address,
          2
        )
        const receiverBalance = await tokenFactory.balanceOf(
          receiverAccount.address,
          2
        )
        expect(deployerBalance).to.equal(
          0,
          'Deployer address should have a 0 balance'
        )
        expect(receiverBalance).to.equal(
          100,
          'Receiver address should have a 100 balance'
        )
      })

      it('emits a TransferSingle event with correct arguments', async () => {
        await expect(
          tokenFactory
            // Make sure we're deploying from the right account
            .connect(deployerAccount)
            // and mint tokens to another account
            .mint(receiverAccount.address, 2, 100, [])
        )
          .to.emit(tokenFactory, 'TransferSingle')
          .withArgs(
            deployerAccount.address,
            ZERO_ADDRESS,
            receiverAccount.address,
            2,
            100
          )
      })

      it('reverts with a zero destination address', async () => {
        await expect(
          tokenFactory.mint(ZERO_ADDRESS, 0, 5, [])
        ).to.be.revertedWith('ERC1155: mint to the zero address')
      })
    })

    describe('- mintBatch', () => {
      it('does not revert when minting a batch with non-zero destination address and non-zero amount', async () => {
        await expect(
          tokenFactory.mintBatch(
            deployerAccount.address,
            [0, 1, 3],
            [5, 11, 17],
            []
          )
        ).not.to.be.reverted
      })

      it('batch mints the correct amount of tokens to the correct address', async () => {
        const mintTxion = await tokenFactory
          // Make sure we're deploying from the right account
          .connect(deployerAccount)
          // and mint tokens to another account
          .mintBatch(receiverAccount.address, [0, 3, 7], [10, 20, 40], [])
        const deployerBalanceId0 = await tokenFactory.balanceOf(
          deployerAccount.address,
          0
        )
        const deployerBalanceId3 = await tokenFactory.balanceOf(
          deployerAccount.address,
          3
        )
        const deployerBalanceId7 = await tokenFactory.balanceOf(
          deployerAccount.address,
          7
        )
        const receiverBalanceId0 = await tokenFactory.balanceOf(
          receiverAccount.address,
          0
        )
        const receiverBalanceId3 = await tokenFactory.balanceOf(
          receiverAccount.address,
          3
        )
        const receiverBalanceId7 = await tokenFactory.balanceOf(
          receiverAccount.address,
          7
        )
        expect(deployerBalanceId0).to.equal(
          0,
          'Deployer address should have a 0 balance for token with ID 0'
        )
        expect(deployerBalanceId3).to.equal(
          0,
          'Deployer address should have a 0 balance for token with ID 3'
        )
        expect(deployerBalanceId7).to.equal(
          0,
          'Deployer address should have a 0 balance for token with ID 7'
        )
        expect(receiverBalanceId0).to.equal(
          10,
          'Receiver address should have a 10 balance for token with ID 0'
        )
        expect(receiverBalanceId3).to.equal(
          20,
          'Receiver address should have a 20 balance for token with ID 3'
        )
        expect(receiverBalanceId7).to.equal(
          40,
          'Receiver address should have a 40 balance for token with ID 7'
        )
      })

      it('emits a TransferBatch event with correct arguments', async () => {
        await expect(
          tokenFactory
            // Make sure we're deploying from the right account
            .connect(deployerAccount)
            // and mint tokens to another account
            .mintBatch(receiverAccount.address, [0, 3, 7], [10, 20, 40], [])
        )
          .to.emit(tokenFactory, 'TransferBatch')
          .withArgs(
            deployerAccount.address,
            ZERO_ADDRESS,
            receiverAccount.address,
            [0, 3, 7],
            [10, 20, 40]
          )
      })

      it('reverts with a zero destination address', async () => {
        await expect(
          tokenFactory.mintBatch(ZERO_ADDRESS, [0, 1, 3], [5, 11, 17], [])
        ).to.be.revertedWith('ERC1155: mint to the zero address')
      })

      it("reverts when the number of IDs and number of amounts aren't equal", async () => {
        await expect(
          tokenFactory.mintBatch(deployerAccount.address, [0, 1, 3], [8], [])
        ).to.be.reverted
      })
    })

    describe('- burn()', () => {
      it('does not revert when the owner burns', async () => {
        await tokenFactory.mint(deployerAccount.address, 0, 5, [])
        const deployerBalancePreBurn = await tokenFactory.balanceOf(
          deployerAccount.address,
          0
        )
        expect(deployerBalancePreBurn).to.equal(
          5,
          'Address should have a 5 balance'
        )
        await tokenFactory.burn(deployerAccount.address, 0, 2)
        const deployerBalancePostBurn = await tokenFactory.balanceOf(
          deployerAccount.address,
          0
        )
        expect(deployerBalancePostBurn).to.equal(
          3,
          'Address should have a 3 balance'
        )
      })

      it('emits a TransferSingle event with correct arguments', async () => {
        await tokenFactory.mint(deployerAccount.address, 2, 100, [])
        await expect(tokenFactory.burn(deployerAccount.address, 2, 100))
          .to.emit(tokenFactory, 'TransferSingle')
          .withArgs(
            deployerAccount.address,
            deployerAccount.address,
            ZERO_ADDRESS,
            2,
            100
          )
      })

      it('reverts when non-owner attempts to burn tokens', async () => {
        await tokenFactory.mint(deployerAccount.address, 0, 5, [])
        await tokenFactory.safeTransferFrom(
          deployerAccount.address,
          receiverAccount.address,
          0,
          5,
          []
        )
        const receiverBalancePreBurn = await tokenFactory.balanceOf(
          receiverAccount.address,
          0
        )
        expect(receiverBalancePreBurn).to.equal(
          5,
          'Address should have a 5 balance'
        )
        await expect(
          tokenFactory
            .connect(receiverAccount)
            .burn(receiverAccount.address, 0, 2)
        ).to.be.revertedWith('Ownable: caller is not the owner')
      })
    })

    describe('- setUri', () => {
      it('correctly changes the URI', async () => {
        const newUriString = 'https://aunyks.com/api/item/{id}.json'
        const startUri = await tokenFactory.uri(0)
        await expect(startUri).to.equal(startUri)
        await tokenFactory.setUri(newUriString)
        const newUri = await tokenFactory.uri(0)
        await expect(newUri).to.equal(newUriString)
      })

      it('emits a URI event', async () => {
        const newUriString = 'https://aunyks.com/api/item/{id}.json'
        const startUri = await tokenFactory.uri(0)
        await expect(startUri).to.equal(startUri)
        await expect(tokenFactory.setUri(newUriString))
          .to.emit(tokenFactory, 'URI')
          .withArgs(newUriString, 0)
      })
    })
  })

  context('# Ownable operations', () => {
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

    it('correctly transfers ownership', async () => {
      await tokenFactory.transferOwnership(receiverAccount.address)
      const newOwner = await tokenFactory.owner()
      await expect(newOwner).to.equal(receiverAccount.address)
      await expect(newOwner).not.to.equal(deployerAccount.address)
    })

    it('correctly renounces ownership', async () => {
      await tokenFactory.renounceOwnership()
      const newOwner = await tokenFactory.owner()
      await expect(newOwner).to.equal(ZERO_ADDRESS)
      await expect(newOwner).not.to.equal(receiverAccount.address)
    })
  })
})
