import { useEffect, useState } from "react";
import AuctionDetailsModal from "../AuctionsDetailsModal/AuctionsDetailsModal";
import AuctionFactory from "../../contracts/AuctionFactory.json";
import './AuctionList.css';

const AuctionList = ({ web3, account, auctionFactoryAddress }) => {
    const [auctions, setAuctions] = useState([]);
    const [selectedAuction, setSelectedAuction] = useState(null);

    const openDetailsModal = (auction) => {
        setSelectedAuction(auction);
    };

    useEffect(() => {
        if (web3 && auctionFactoryAddress) {
            loadAuctions();
        }
    }, [web3]);

    const loadAuctions = async () => {
        try {
            const auctionFactory = new web3.eth.Contract(
                AuctionFactory.abi,
                auctionFactoryAddress
            );
            const auctionsFromContract = await auctionFactory.methods.getAllAuctions().call();
            console.log("Loaded auctions: ", auctionsFromContract);
            setAuctions(auctionsFromContract);
        } catch (error) {
            console.log("Error while loading auction list: ", error);
        }
    };

    return (
        <div className="auction-list">
            <h1 className="auction-list-title">Auction DApp</h1>
            {auctions.map((auction, index) => (
                <div
                    key={index}
                    className="auction-item"
                    onClick={() => openDetailsModal(auction)}
                >
                    Auction {index + 1}
                </div>
            ))}
            {selectedAuction && (
                <AuctionDetailsModal
                    web3={web3}
                    account={account}
                    auction={selectedAuction}
                    onClose={() => setSelectedAuction(null)}
                />
            )}
        </div>
    );
};

export default AuctionList;
