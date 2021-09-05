const { expect } = require('chai')
const { ethers } = require('hardhat')

const DEFAULT_METADATA_URI = 'https://example.com/api/item/{id}.json'
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

describe('SupporterToken - Overriden Behaviors', () => {
  context('# Basic contract operations', () => {
    it('deploys when given one string as a constructor argument', async () => {
      const SupporterToken = await ethers.getContractFactory('SupporterToken')
      await expect(SupporterToken.deploy(DEFAULT_METADATA_URI)).not.to.be.reverted
    })

    it('fails to deploy when there are no constructor arguments', async () => {
      const SupporterToken = await ethers.getContractFactory('SupporterToken')
      await expect(SupporterToken.deploy()).to.be.reverted
    })
  })

  context('# ERC-1155 operations', () => {
    let supporterToken = null
    let deployerAccount = null
    let receiverAccount = null

    beforeEach(async () => {
      ;[deployerAccount, receiverAccount] = await ethers.getSigners()
      const SupporterToken = await ethers.getContractFactory(
        'SupporterToken',
        deployerAccount
      )
      supporterToken = await SupporterToken.deploy(DEFAULT_METADATA_URI)
      await supporterToken.deployed()
    })

    describe('- mint()', () => {
      it('does not revert when minting with non-zero destination address and non-zero amount', async () => {
        await expect(supporterToken.mint(deployerAccount.address, 0, 5, [])).not
          .to.be.reverted
        const deployerBalance = await supporterToken.balanceOf(
          deployerAccount.address,
          0
        )
        expect(deployerBalance).to.equal(5, 'Address should have a 5 balance')
      })

      it('mints the correct amount of tokens to the correct address', async () => {
        const mintTxion = await supporterToken
          // Make sure we're deploying from the right account
          .connect(deployerAccount)
          // and mint tokens to another account
          .mint(receiverAccount.address, 2, 100, [])
        const deployerBalance = await supporterToken.balanceOf(
          deployerAccount.address,
          2
        )
        const receiverBalance = await supporterToken.balanceOf(
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
          supporterToken
            // Make sure we're deploying from the right account
            .connect(deployerAccount)
            // and mint tokens to another account
            .mint(receiverAccount.address, 2, 100, [])
        )
          .to.emit(supporterToken, 'TransferSingle')
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
          supporterToken.mint(ZERO_ADDRESS, 0, 5, [])
        ).to.be.revertedWith('ERC1155: mint to the zero address')
      })
    })

    describe('- mintBatch', () => {
      it('does not revert when minting a batch with non-zero destination address and non-zero amount', async () => {
        await expect(
          supporterToken.mintBatch(
            deployerAccount.address,
            [0, 1, 3],
            [5, 11, 17],
            []
          )
        ).not.to.be.reverted
      })

      it('batch mints the correct amount of tokens to the correct address', async () => {
        const mintTxion = await supporterToken
          // Make sure we're deploying from the right account
          .connect(deployerAccount)
          // and mint tokens to another account
          .mintBatch(receiverAccount.address, [0, 3, 7], [10, 20, 40], [])
        const deployerBalanceId0 = await supporterToken.balanceOf(
          deployerAccount.address,
          0
        )
        const deployerBalanceId3 = await supporterToken.balanceOf(
          deployerAccount.address,
          3
        )
        const deployerBalanceId7 = await supporterToken.balanceOf(
          deployerAccount.address,
          7
        )
        const receiverBalanceId0 = await supporterToken.balanceOf(
          receiverAccount.address,
          0
        )
        const receiverBalanceId3 = await supporterToken.balanceOf(
          receiverAccount.address,
          3
        )
        const receiverBalanceId7 = await supporterToken.balanceOf(
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
          supporterToken
            // Make sure we're deploying from the right account
            .connect(deployerAccount)
            // and mint tokens to another account
            .mintBatch(receiverAccount.address, [0, 3, 7], [10, 20, 40], [])
        )
          .to.emit(supporterToken, 'TransferBatch')
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
          supporterToken.mintBatch(ZERO_ADDRESS, [0, 1, 3], [5, 11, 17], [])
        ).to.be.revertedWith('ERC1155: mint to the zero address')
      })

      it("reverts when the number of IDs and number of amounts aren't equal", async () => {
        await expect(
          supporterToken.mintBatch(deployerAccount.address, [0, 1, 3], [8], [])
        ).to.be.reverted
      })
    })

    describe('- burn()', () => {
      it('does not revert when the owner burns', async () => {
        await supporterToken.mint(deployerAccount.address, 0, 5, [])
        const deployerBalancePreBurn = await supporterToken.balanceOf(
          deployerAccount.address,
          0
        )
        expect(deployerBalancePreBurn).to.equal(
          5,
          'Address should have a 5 balance'
        )
        await supporterToken.burn(deployerAccount.address, 0, 2)
        const deployerBalancePostBurn = await supporterToken.balanceOf(
          deployerAccount.address,
          0
        )
        expect(deployerBalancePostBurn).to.equal(
          3,
          'Address should have a 3 balance'
        )
      })

      it('emits a TransferSingle event with correct arguments', async () => {
        await supporterToken.mint(deployerAccount.address, 2, 100, [])
        await expect(supporterToken.burn(deployerAccount.address, 2, 100))
          .to.emit(supporterToken, 'TransferSingle')
          .withArgs(
            deployerAccount.address,
            deployerAccount.address,
            ZERO_ADDRESS,
            2,
            100
          )
      })

      it('reverts when non-owner attempts to burn tokens', async () => {
        await supporterToken.mint(deployerAccount.address, 0, 5, [])
        await supporterToken.safeTransferFrom(
          deployerAccount.address,
          receiverAccount.address,
          0,
          5,
          []
        )
        const receiverBalancePreBurn = await supporterToken.balanceOf(
          receiverAccount.address,
          0
        )
        expect(receiverBalancePreBurn).to.equal(
          5,
          'Address should have a 5 balance'
        )
        await expect(
          supporterToken
            .connect(receiverAccount)
            .burn(receiverAccount.address, 0, 2)
        ).to.be.revertedWith('Ownable: caller is not the owner')
      })
    })

    describe('- safeTransferFrom', () => {
      it('successfully transfers the intended amount and id', async () => {
        await supporterToken.mint(deployerAccount.address, 0, 5, [])
        const deployerBalancePreSend = await supporterToken.balanceOf(
          deployerAccount.address,
          0
        )
        expect(deployerBalancePreSend).to.equal(
          5,
          'Deployer address should have a balance of 5 before safeTransferFrom'
        )
        await supporterToken.safeTransferFrom(
          deployerAccount.address,
          receiverAccount.address,
          0,
          2,
          []
        )
        const deployerBalancePostSend = await supporterToken.balanceOf(
          deployerAccount.address,
          0
        )
        expect(deployerBalancePostSend).to.equal(
          3,
          'Deployer address should have a balance of 3 after safeTransferFrom'
        )
        const receiverBalancePostSend = await supporterToken.balanceOf(
          receiverAccount.address,
          0
        )
        expect(receiverBalancePostSend).to.equal(
          2,
          'Receiver address should have a balance of 2 after safeTransferFrom'
        )
      })

      it('fails when the sender has insufficient balance', async () => {
        await supporterToken.mint(deployerAccount.address, 1, 50, [])

        await expect(supporterToken.safeTransferFrom(deployerAccount.address, receiverAccount.address, 1, 51, []))
          .to.be.revertedWith('ERC1155: insufficient balance for transfer')
      })

      it('emits a TransferSingle event with correct arguments', async () => {
        await supporterToken.mint(deployerAccount.address, 1, 50, [])
        await expect(supporterToken.safeTransferFrom(deployerAccount.address, receiverAccount.address, 1, 25, []))
          .to.emit(supporterToken, 'TransferSingle')
          .withArgs(
            deployerAccount.address,

            deployerAccount.address,
            receiverAccount.address,
            1,
            25
          )
      })
    })

    describe('- safeBatchTransferFrom', () => {
      it('successfully transfers the intended amounts and ids', async () => {
        await supporterToken.mintBatch(deployerAccount.address, [0, 3], [1234, 1000], [])
        const deployerBalance0PreSend = await supporterToken.balanceOf(
          deployerAccount.address,
          0
        )
        expect(deployerBalance0PreSend).to.equal(
          1234,
          'Deployer address should have a balance of 1234 for ID 0 before safeBatchTransferFrom'
        )
        const deployerBalance3PreSend = await supporterToken.balanceOf(
          deployerAccount.address,
          3
        )
        expect(deployerBalance3PreSend).to.equal(
          1000,
          'Deployer address should have a balance of 1000 for ID 3 before safeBatchTransferFrom'
        )
        await supporterToken.safeBatchTransferFrom(
          deployerAccount.address,
          receiverAccount.address,
          [0, 3],
          [1111, 777],
          []
        )
        const deployerBalance0PostSend = await supporterToken.balanceOf(
          deployerAccount.address,
          0
        )
        expect(deployerBalance0PostSend).to.equal(
          123,
          'Deployer address should have a balance of 123 for ID 0 after safeBatchTransferFrom'
        )
        const receiverBalance0PostSend = await supporterToken.balanceOf(
          receiverAccount.address,
          0
        )
        expect(receiverBalance0PostSend).to.equal(
          1111,
          'Receiver address should have a balance of 1111 for ID 0 after safeBatchTransferFrom'
        )
        const deployerBalance3PostSend = await supporterToken.balanceOf(
          deployerAccount.address,
          3
        )
        expect(deployerBalance3PostSend).to.equal(
          223,
          'Deployer address should have a balance of 223 for ID 3 after safeBatchTransferFrom'
        )
        const receiverBalance3PostSend = await supporterToken.balanceOf(
          receiverAccount.address,
          3
        )
        expect(receiverBalance3PostSend).to.equal(
          777,
          'Receiver address should have a balance of 777 for ID 3 after safeBatchTransferFrom'
        )
      })

      it('fails when the sender has insufficient balance', async () => {
        await supporterToken.mintBatch(deployerAccount.address, [0, 7], [124, 100], [])

        await expect(supporterToken.safeBatchTransferFrom(deployerAccount.address, receiverAccount.address, [0, 7], [125, 0], []))
          .to.be.revertedWith('ERC1155: insufficient balance for transfer')
      })

      it('emits a TransferBatch event with correct arguments', async () => {
        await supporterToken.mintBatch(deployerAccount.address, [0, 7], [124, 100], [])

        await expect(supporterToken.safeBatchTransferFrom(deployerAccount.address, receiverAccount.address, [0, 7], [124, 2], []))
          .to.emit(supporterToken, 'TransferBatch')
          .withArgs(
            deployerAccount.address,
            deployerAccount.address,
            receiverAccount.address,
            [0, 7],
            [124, 2]
          )
      })
    })

    describe('- setUri', () => {
      it('correctly changes the URI', async () => {
        const newUriString = 'https://aunyks.com/api/item/{id}.json'
        const startUri = await supporterToken.uri(0)
        await expect(startUri).to.equal(startUri)
        await supporterToken.setUri(newUriString)
        const newUri = await supporterToken.uri(0)
        await expect(newUri).to.equal(newUriString)
      })

      it('emits a URI event', async () => {
        const newUriString = 'https://aunyks.com/api/item/{id}.json'
        const startUri = await supporterToken.uri(0)
        await expect(startUri).to.equal(startUri)
        await expect(supporterToken.setUri(newUriString))
          .to.emit(supporterToken, 'URI')
          .withArgs(newUriString, 0)
      })
    })
  })

  context('# Ownable operations', () => {
    let supporterToken = null
    let deployerAccount = null
    let receiverAccount = null

    beforeEach(async () => {
      ;[deployerAccount, receiverAccount] = await ethers.getSigners()
      const SupporterToken = await ethers.getContractFactory(
        'SupporterToken',
        deployerAccount
      )
      supporterToken = await SupporterToken.deploy(DEFAULT_METADATA_URI)
      await supporterToken.deployed()
    })

    it('correctly transfers ownership', async () => {
      await supporterToken.transferOwnership(receiverAccount.address)
      const newOwner = await supporterToken.owner()
      await expect(newOwner).to.equal(receiverAccount.address)
      await expect(newOwner).not.to.equal(deployerAccount.address)
    })

    it('correctly renounces ownership', async () => {
      await supporterToken.renounceOwnership()
      const newOwner = await supporterToken.owner()
      await expect(newOwner).to.equal(ZERO_ADDRESS)
      await expect(newOwner).not.to.equal(receiverAccount.address)
    })
  })
})
