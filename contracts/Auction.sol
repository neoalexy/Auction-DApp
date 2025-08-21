// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract Auction {
    address payable public beneficiary;
    uint256 public auctionEndTime;
    string private secret;

    address public highestBidder;
    uint256 public highestBid;

    mapping(address => uint256) pendingReturns;
    bool ended;

    event HighestBidIncreased(address bidder, uint256 amount);
    event AuctionEnded(address winner, uint256 amount);

    constructor(uint256 biddingTime, address payable beneficiartAddress, string memory _secret) {
        beneficiary = beneficiartAddress;
        auctionEndTime = block.timestamp + biddingTime;
        secret = _secret;
    }

    function bid() public payable {
        require(block.timestamp <= auctionEndTime, "Auction already ended.");
        require(msg.value > highestBid, "There already is a higher bid.");

        if (highestBid != 0) {
            pendingReturns[highestBidder] += highestBid;
        }

        highestBidder = msg.sender;
        highestBid = msg.value;
        emit HighestBidIncreased(msg.sender, msg.value);
    }

    function withdraw() public returns (bool) {
        uint256 amount = pendingReturns[msg.sender];
        if (amount > 0) {
            pendingReturns[msg.sender] = 0;
            if (!payable(msg.sender).send(amount)) {
                pendingReturns[msg.sender] = amount;
                return false;
            }
        }
        return true;
    }

    function auctionEnd() public {
        require(block.timestamp >= auctionEndTime, "Auction not yet ended.");
        require(!ended, "auctionEnd has already been called.");

        ended = true;
        emit AuctionEnded(highestBidder, highestBid);

        beneficiary.transfer(highestBid);
    }

    function getSecretMsg() public view returns (string memory) {
        return secret;
    }
}

