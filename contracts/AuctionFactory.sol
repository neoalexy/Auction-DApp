// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Auction.sol"; 

contract AuctionFactory {
    Auction[] public auctions;

    function createAuction(uint256 biddingTime, address payable beneficiartAddress, string memory secret) public {
        Auction newAuction = new Auction(biddingTime, beneficiartAddress, secret);
        auctions.push(newAuction);
    }

    function getAllAuctions() public view returns (Auction[] memory) {
        return auctions;
    }

    function auctions(uint256 index) public view returns (Auction) {
        return auctions[index];
    }
}
