// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {IRouterClient} from "@chainlink/contracts/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {OwnerIsCreator} from "@chainlink/contracts/src/v0.8/shared/access/OwnerIsCreator.sol";
import {Client} from "@chainlink/contracts/src/v0.8/ccip/libraries/Client.sol";
import {CCIPReceiver} from "@chainlink/contracts/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {IERC20} from "@chainlink/contracts/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@chainlink/contracts/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";
import "./LootManager.sol";

/**
 * @title CrossChainLootManager
 * @dev Manages cross-chain loot transfers using Chainlink CCIP
 * Allows players to transfer loot items between different blockchain networks
 */
contract CrossChainLootManager is CCIPReceiver, OwnerIsCreator {
    using SafeERC20 for IERC20;

    // Custom errors
    error NotEnoughBalance(uint256 currentBalance, uint256 calculatedFees);
    error NothingToWithdraw();
    error FailedToWithdrawEth(address owner, address target, uint256 value);
    error DestinationChainNotAllowed(uint64 destinationChainSelector);
    error SourceChainNotAllowed(uint64 sourceChainSelector);
    error SenderNotAllowed(address sender);
    error InvalidLootData();

    // Events
    event CrossChainLootSent(
        bytes32 indexed messageId,
        uint64 indexed destinationChainSelector,
        address indexed receiver,
        uint256 lootId,
        address feeToken,
        uint256 fees
    );

    event CrossChainLootReceived(
        bytes32 indexed messageId,
        uint64 indexed sourceChainSelector,
        address indexed sender,
        address recipient,
        uint256 lootId
    );

    // Structs
    struct LootTransfer {
        address recipient;
        uint256 lootId;
        string lootName;
        string lootType;
        uint256 rarity;
        uint256 power;
        string[] attributes;
    }

    // State variables
    mapping(uint64 => bool) public allowlistedDestinationChains;
    mapping(uint64 => bool) public allowlistedSourceChains;
    mapping(address => bool) public allowlistedSenders;
    
    IERC20 private s_linkToken;
    LootManager public lootManager;

    // Chain selectors for major networks (testnet values)
    uint64 public constant ETHEREUM_SEPOLIA_CHAIN_SELECTOR = 16015286601757825753;
    uint64 public constant POLYGON_MUMBAI_CHAIN_SELECTOR = 12532609583862916517;
    uint64 public constant ARBITRUM_GOERLI_CHAIN_SELECTOR = 6101244977088475029;

    modifier onlyAllowlistedDestinationChain(uint64 _destinationChainSelector) {
        if (!allowlistedDestinationChains[_destinationChainSelector])
            revert DestinationChainNotAllowed(_destinationChainSelector);
        _;
    }

    modifier onlyAllowlistedSourceChain(uint64 _sourceChainSelector) {
        if (!allowlistedSourceChains[_sourceChainSelector])
            revert SourceChainNotAllowed(_sourceChainSelector);
        _;
    }

    modifier onlyAllowlistedSenders(address _sender) {
        if (!allowlistedSenders[_sender]) revert SenderNotAllowed(_sender);
        _;
    }

    constructor(address _router, address _link, address _lootManager) CCIPReceiver(_router) {
        s_linkToken = IERC20(_link);
        lootManager = LootManager(_lootManager);
        
        // Initialize allowlisted chains
        allowlistedDestinationChains[ETHEREUM_SEPOLIA_CHAIN_SELECTOR] = true;
        allowlistedDestinationChains[POLYGON_MUMBAI_CHAIN_SELECTOR] = true;
        allowlistedDestinationChains[ARBITRUM_GOERLI_CHAIN_SELECTOR] = true;
        
        allowlistedSourceChains[ETHEREUM_SEPOLIA_CHAIN_SELECTOR] = true;
        allowlistedSourceChains[POLYGON_MUMBAI_CHAIN_SELECTOR] = true;
        allowlistedSourceChains[ARBITRUM_GOERLI_CHAIN_SELECTOR] = true;
    }

    /**
     * @dev Send loot to another chain
     * @param _destinationChainSelector The destination chain selector
     * @param _receiver The receiver address on the destination chain
     * @param _lootId The ID of the loot to transfer
     */
    function sendLootCrossChain(
        uint64 _destinationChainSelector,
        address _receiver,
        uint256 _lootId
    )
        external
        onlyAllowlistedDestinationChain(_destinationChainSelector)
        returns (bytes32 messageId)
    {
        // Verify loot ownership
        require(lootManager.ownerOf(_lootId) == msg.sender, "Not loot owner");
        
        // Get loot data
        LootManager.LootItem memory loot = lootManager.getLoot(_lootId);
        
        // Burn loot on source chain
        lootManager.burnLoot(_lootId);
        
        // Prepare CCIP message
        LootTransfer memory lootTransfer = LootTransfer({
            recipient: _receiver,
            lootId: _lootId,
            lootName: loot.name,
            lootType: loot.lootType,
            rarity: loot.rarity,
            power: loot.power,
            attributes: loot.attributes
        });

        // Create CCIP message
        Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
            _receiver,
            abi.encode(lootTransfer),
            address(s_linkToken)
        );

        // Initialize a router client instance to interact with cross-chain router
        IRouterClient router = IRouterClient(this.getRouter());

        // Get the fee required to send the CCIP message
        uint256 fees = router.getFee(_destinationChainSelector, evm2AnyMessage);

        if (fees > s_linkToken.balanceOf(address(this)))
            revert NotEnoughBalance(s_linkToken.balanceOf(address(this)), fees);

        // approve the Router to transfer LINK tokens on contract's behalf
        s_linkToken.approve(address(router), fees);

        // Send the message through the router and store the returned message ID
        messageId = router.ccipSend(_destinationChainSelector, evm2AnyMessage);

        // Emit an event with message details
        emit CrossChainLootSent(
            messageId,
            _destinationChainSelector,
            _receiver,
            _lootId,
            address(s_linkToken),
            fees
        );

        return messageId;
    }

    /**
     * @dev Handle received CCIP messages
     */
    function _ccipReceive(
        Client.Any2EVMMessage memory any2EvmMessage
    )
        internal
        override
        onlyAllowlistedSourceChain(any2EvmMessage.sourceChainSelector)
        onlyAllowlistedSenders(abi.decode(any2EvmMessage.sender, (address)))
    {
        // Decode the loot transfer data
        LootTransfer memory lootTransfer = abi.decode(any2EvmMessage.data, (LootTransfer));
        
        // Validate loot data
        if (bytes(lootTransfer.lootName).length == 0) revert InvalidLootData();
        
        // Mint loot on destination chain
        lootManager.mintLoot(
            lootTransfer.recipient,
            lootTransfer.lootName,
            lootTransfer.lootType,
            lootTransfer.rarity,
            lootTransfer.power,
            lootTransfer.attributes
        );

        emit CrossChainLootReceived(
            any2EvmMessage.messageId,
            any2EvmMessage.sourceChainSelector,
            abi.decode(any2EvmMessage.sender, (address)),
            lootTransfer.recipient,
            lootTransfer.lootId
        );
    }

    /**
     * @dev Construct a CCIP message
     */
    function _buildCCIPMessage(
        address _receiver,
        bytes memory _data,
        address _feeTokenAddress
    ) private pure returns (Client.EVM2AnyMessage memory) {
        return
            Client.EVM2AnyMessage({
                receiver: abi.encode(_receiver),
                data: _data,
                tokenAmounts: new Client.EVMTokenAmount[](0),
                extraArgs: Client._argsToBytes(
                    Client.EVMExtraArgsV1({gasLimit: 400_000})
                ),
                feeToken: _feeTokenAddress
            });
    }

    /**
     * @dev Updates the allowlist status of a destination chain
     */
    function allowlistDestinationChain(
        uint64 _destinationChainSelector,
        bool allowed
    ) external onlyOwner {
        allowlistedDestinationChains[_destinationChainSelector] = allowed;
    }

    /**
     * @dev Updates the allowlist status of a source chain
     */
    function allowlistSourceChain(
        uint64 _sourceChainSelector,
        bool allowed
    ) external onlyOwner {
        allowlistedSourceChains[_sourceChainSelector] = allowed;
    }

    /**
     * @dev Updates the allowlist status of a sender for a given source chain
     */
    function allowlistSender(address _sender, bool allowed) external onlyOwner {
        allowlistedSenders[_sender] = allowed;
    }

    /**
     * @dev Allows the owner to withdraw the entire balance of LINK tokens
     */
    function withdrawToken(address _beneficiary, address _token) public onlyOwner {
        uint256 amount = IERC20(_token).balanceOf(address(this));

        if (amount == 0) revert NothingToWithdraw();

        IERC20(_token).safeTransfer(_beneficiary, amount);
    }

    /**
     * @dev Allows the owner to withdraw the entire balance of Ether
     */
    function withdraw(address _beneficiary) public onlyOwner {
        uint256 amount = address(this).balance;

        if (amount == 0) revert NothingToWithdraw();

        (bool sent, ) = _beneficiary.call{value: amount}("");
        if (!sent) revert FailedToWithdrawEth(msg.sender, _beneficiary, amount);
    }

    /**
     * @dev Get fee for cross-chain transfer
     */
    function getFee(
        uint64 _destinationChainSelector,
        address _receiver,
        bytes memory _data
    ) external view returns (uint256 fee) {
        Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
            _receiver,
            _data,
            address(s_linkToken)
        );

        IRouterClient router = IRouterClient(this.getRouter());
        fee = router.getFee(_destinationChainSelector, evm2AnyMessage);
    }

    receive() external payable {}
}
