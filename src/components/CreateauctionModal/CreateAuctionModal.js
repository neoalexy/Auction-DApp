import { useState } from "react";
import AuctionFactory from '../../contracts/AuctionFactory.json'
import './CreateAuctionModal.css'
const CreateAuctionModal = ({onClose, web3, account, auctionFactoryAddress}) => {

    const [auctionData, setAuctionData]= useState({
        biddingTime: '',
        beneficiaryAddress: '',
        secret: ''
    });

    const handleChange = (e) => {
        setAuctionData({...auctionData, [e.target.name]: e.target.value})
    }

    const handleSumbit = async () => {
        if (typeof window.ethereum === "undefined" || !window.ethereum.isMetaMask){
            console.log("MetaMask is not installed or not connected");
            return;
        }
        if(!web3 || !account){
            alert("Web3 instance or account is not available");
            return;
        }

        try{
            const auctionFactory = new web3.eth.Contract(AuctionFactory.abi, auctionFactoryAddress);

            const transactionParameters ={
                to: auctionFactoryAddress,
                from: account,
                data: auctionFactory.methods.createAuction(
                    auctionData.biddingTime,
                    auctionData.beneficiaryAddress,
                    auctionData.secret
                ).encodeABI()
            };

            const txHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [transactionParameters]
            });
            console.log("Transaction hash: ", txHash);
            onClose();
        } catch(error){
            console.error("Error sending transaction: ", error);
        }
    }

    return( 
        <div className="create-auction-modal"> 
            <div className="modal-content">
                <input className="modal-input" name="biddingTime" type="number" placeholder="BiddingTime" onChange={handleChange}/>
                <input className="modal-input" name="beneficiaryAddress"  placeholder="BeneficiaryAddress" onChange={handleChange}/>
                <input className="modal-input" name="secret" placeholder="Secret Message" onChange={handleChange}/>
                <button className="modal_button" onClick={handleSumbit}>Create Auction</button>
                <button className="cancel_button" onClick={onClose}>Cancel</button>

            </div>
        </div>
    );

}

export default CreateAuctionModal;