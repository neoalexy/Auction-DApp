import { use, useEffect, useState } from "react";
import Auction from '../../contracts/Auction.json';
import BN from 'bn.js';
import './AuctionsDetailsModal.css';
const AuctionDetailsModal = ({auction,onClose,web3,account}) => {


    const [bidAmount, setBidAmount] = useState('');
    const[highestBid, setHighestBid] = useState(null);
    const[highestBidder, setHighestBidder] = useState(null);
    const[timeLeft, setTimeLeft] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadAuctionDetails();
    
        const auctionDataInterval = setInterval(loadAuctionDetails, 5000);
    
        const countDownInterval = setInterval(() => {
            if (web3 && auction) {
                const auctionContract = new web3.eth.Contract(Auction.abi, auction);
                auctionContract.methods.auctionEndTime().call()
                    .then(auctionEndTime => {
                        setTimeLeft(calculateTimeLeft(auctionEndTime));
                    });
            }
        }, 1000);
    
        return () => {
            clearInterval(auctionDataInterval);
            clearInterval(countDownInterval);
        };
    }, [web3, auction]);
    
    const calculateTimeLeft = (endTime) => {
        const currentTime = Math.floor(Date.now() / 1000);
        const timeLeftInSeconds = Number(endTime) - currentTime;
    
        if (timeLeftInSeconds > 0) {
            const hours = Math.floor(timeLeftInSeconds / 3600);
            const minutes = Math.floor((timeLeftInSeconds % 3600) / 60);
            const seconds = timeLeftInSeconds % 60;
    
            return `${hours}h ${minutes}m ${seconds}s`;
        } else {
            return "Auction ended";
        }
    };
    

    const loadAuctionDetails = async () => {
        if(!web3 || !auction || !auction){
            alert("Web3 instance,contract address or account is not available");
            return;
        }
        const auctionContract = new web3.eth.Contract(Auction.abi,auction);
        const HighestBid = await auctionContract.methods.highestBid().call();
        const HighestBidder = await auctionContract.methods.highestBidder().call();
        const auctionEndTime = await auctionContract.methods.auctionEndTime().call();

        setHighestBid(HighestBid);
        setHighestBidder(HighestBidder);
        setTimeLeft(calculateTimeLeft(auctionEndTime));
    }


    const placeBid = async () => {
        if (!web3 || !auction || !account) {
            alert("Please connect your wallet");
            return;
        }
    
        const bidValue = parseFloat(bidAmount);
        if (isNaN(bidValue)) {
            alert("Please enter a valid number");
            return;
        }
    
        if (bidValue <= 0) {
            alert("Bid amount must be positive");
            return;
        }
    
        try {
            setLoading(true);
            const auctionContract = new web3.eth.Contract(Auction.abi, auction);
            const bidAmountWei = web3.utils.toWei(bidAmount.toString(), 'ether');
            const bidAmountHex = web3.utils.numberToHex(bidAmountWei);
    
            if (highestBid) {
                const currentBid = web3.utils.toBN(highestBid);
                const newBid = web3.utils.toBN(bidAmountWei);
                const minIncrement = web3.utils.toBN(web3.utils.toWei('0.01', 'ether'));
                
                if (newBid.lte(currentBid.add(minIncrement))) {
                    const minBidEth = web3.utils.fromWei(
                        currentBid.add(minIncrement).toString(), 
                        'ether'
                    );
                    alert(`Your bid must be at least ${minBidEth} ETH`);
                    setLoading(false);
                    return;
                }
            }
    
            
            const txParams = {
                to: auction,
                from: account,
                value: bidAmountHex, 
                data: auctionContract.methods.bid().encodeABI(),
                gas: '500000'
            };
    
            
            const txHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [txParams]
            });
    
            console.log("Transaction hash:", txHash);
            alert("Bid placed successfully!");
            setBidAmount('');
        } catch (error) {
            console.error("Error placing bid:", error);
            alert(`Failed to place bid: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };
    


    const endAuction  = async () => {
        if(!web3 || !auction || !auction){
            alert("Web3 instance,contract address or account is not available");
            return;
        }

        try{
            const auctionContract = new web3.eth.Contract(Auction.abi,auction);
            const transactionParameters ={
                to: auction,
                from: account,
                data:auctionContract.methods.auctionEnd().encodeABI()
            };
            const txHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [transactionParameters]
            });
            console.log("Auction ended succesfully. Transaction Hash: ", txHash);

        } catch(error){
            console.error("Error ending auction", error);
        }
    }

    const withdraw = async () => {
        if(!web3 || !auction || !auction){
            alert("Web3 instance,contract address or account is not available");
            return;
        }

        try{
            const auctionContract = new web3.eth.Contract(Auction.abi,auction);
            const transactionParameters ={
                to: auction,
                from: account,
                data:auctionContract.methods.withdraw().encodeABI()
            };
            const txHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [transactionParameters]
            });
            console.log("Withdrawal succesful. Transaction Hash: ", txHash);

        } catch(error){
            console.error("Error during withdrawal", error);
        }
    }

    const getSecretMessage = async () => {
        if(!web3 || !auction || !auction){
            alert("Web3 instance,contract address or account is not available");
            return;
        }

        try{
            const auctionContract = new web3.eth.Contract(Auction.abi,auction);
            const currentHighestBidder = await auctionContract.methods.highestBidder().call();

            if(account.toLowerCase() !== currentHighestBidder.toLowerCase()){
                alert("Only the auction winner can access the secret message");
                return;
            }
            const secret = await auctionContract.methods.getSecretMessage().call({ from:account });
            alert(`Secret Message: ${secret}`);

        } catch(error){
            console.error("Error fetching secret message", error);
            alert("Failed to fetch the secret message. See console for details.");
        }
    }

    return( 
        <div className="auction-details-modal"> 
            <h2 className="modal-title">Auction Details</h2>
            <p className="auction-info">Auction Contract Address {auction}</p>
            <p className="auction-info">Time left: {timeLeft}</p>
            <p className="auction-info">Highest Bid: {highestBid ? web3.utils.fromWei(highestBid, 'ether'): '0'} ETH</p>
            <p className="auction-info">Highest Bidder: {highestBidder}</p>

            {timeLeft !== "Auction ended" && (
                <div className="bid-section">
                    <input type="number" className="bid-input" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)}placeholder="Your Bid"></input>
                    <button className="bid-button" onClick={placeBid}>Place Bid</button>
                </div>
            )}

            <button className="action-button" onClick={endAuction}>End Auction</button>
            <button className="action-button" onClick={withdraw}>Withdraw</button>
            {timeLeft === "Auction ended" &&(
                <button className="action-button" onClick={getSecretMessage}>Get Secret Message</button>
            )}
            <button className="close-button" onClick={onClose}>Close</button>
        </div>
    );

}

export default AuctionDetailsModal;