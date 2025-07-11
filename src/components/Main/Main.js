import { useEffect, useState } from "react";
import CreateAuctionModal from "../CreateauctionModal/CreateAuctionModal";
import Web3 from "web3";
import AuctionList from "../AuctionList/AuctionList";
import './Main.css';

const auctionFactoryAddress = "0x99091B1522c2e7644D7591630C714373795e3fb2";
const sepoliaRPCurl = "https://sepolia.infura.io/v3/552f751770e746f199eb029443d2854e";

const Main = () => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState(null);

    const connectWallet = async () => {
        try {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setAccount(accounts[0]);
                console.log("Connected to Ethereum account:", accounts[0]);

                window.ethereum.on('accountsChanged', (newAccounts) => {
                    setAccount(newAccounts[0]);
                    console.log("Switched to account:", newAccounts[0]);
                });
            } else {
                console.log("MetaMask is not installed");
            }
        } catch (error) {
            console.log("Error connecting to MetaMask:", error);
        }
    };

    useEffect(() => {
        const web3Instance = new Web3(sepoliaRPCurl);
        setWeb3(web3Instance);
        console.log("Web3 instance set up:", web3Instance); 
        connectWallet();
    }, []);

    return (
        <div className="main-container">
            {!account && (
                <button className="connect-wallet-button" onClick={connectWallet}>
                    Connect with MetaMask
                </button>
            )}

            {}
            {web3 && (
                <AuctionList
                    className="auction-list"
                    web3={web3}
                    account={account}
                    auctionFactoryAddress={auctionFactoryAddress}
                />
            )}

            <button
                className="create-auction-button"
                onClick={() => setShowCreateModal(true)}
            >
                Create Auction
            </button>

            {showCreateModal && (
                <CreateAuctionModal
                    className="create-auction-modal"
                    web3={web3}
                    account={account}
                    onClose={() => setShowCreateModal(false)}
                    auctionFactoryAddress={auctionFactoryAddress}
                />
            )}
        </div>
    );
};

export default Main;
