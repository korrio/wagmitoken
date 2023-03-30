import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useConnect,
  useContract,
  useContractRead,
  useContractWrite,
  useNetwork,
  useSigner, //<<<<<<<
  useWaitForTransaction,
} from "wagmi";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import tokenContract from "../contracts/contract.json";

import Image from 'next/image';

export default function Home() {
  const CONTRACT_ADDRESS = "0x3dd1289157f2f298dde5ae42adc703532aa78478";
  const [supplyData, setSupplyData] = useState(0);

  const { address } = useAccount();
  const { chains } = useNetwork();
  const { data: signerData } = useSigner();

  /* Not working on this build
  const contractConfig = {
    addressOrName: CONTRACT_ADDRESS,
    contractInterface: tokenContract.abi,
  };
  */

  //Mint Function
  const {
    data: mintData,
    write: mintToken,
    isLoading: isMintLoading,
    isSuccess: isMintStarted,
    error: mintError,
  } = useContractWrite({
    addressOrName: CONTRACT_ADDRESS,
    contractInterface: tokenContract.abi,
    functionName: "mint",
  });

  const mintFreeTokens = async () => {
    await mintToken({
      args: [
        "0x58bb47a89A329305cbD63960C3F544cfA4584db9",
        ethers.utils.parseEther("2"),
      ],
    });
  };

  // Check TX for mint function
  const { isSuccess: txSuccess, error: txError } = useWaitForTransaction({
    confirmations: 1,
    hash: mintData?.hash,
  });

  // Total tokens
  const { data: totalSupplyData } = useContractRead({
    addressOrName: CONTRACT_ADDRESS,
    contractInterface: tokenContract.abi,
    functionName: "totalSupply",
    watch: true,
  });

  //Using useContract only (instead of useContractWrite)
  const buyTokens = useContract({
    addressOrName: CONTRACT_ADDRESS,
    contractInterface: tokenContract.abi,
    signerOrProvider: signerData,
  });

  const buySomeTokens = async () => {
    await buyTokens.buy("1", { value: ethers.utils.parseEther(".01") });
  };

  const addJUTCtoken = async () => {
    if (!window.ethereum) {
        return false;
    }

     const tokenAddress = CONTRACT_ADDRESS;
    const tokenSymbol = 'JUTC';
    const tokenDecimals = 18;
    // const tokenImage = 'http://placekitten.com/200/300';
    
    try {
      // wasAdded is a boolean. Like any RPC method, an error may be thrown.
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', // Initially only supports ERC20, but eventually more!
          options: {
            address: tokenAddress, // The address that the token is at.
            symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
            decimals: tokenDecimals, // The number of decimals in the token
            // image: tokenImage, // A string url of the token logo
          },
        },
      });
    
      if (wasAdded) {
        console.log('Thanks for your interest!');
      } else {
        console.log('Your loss!');
      }
    } catch (error) {
      console.log(error);
    }
  }

  //Faucet function
  const {
    data: faucetData,
    write: faucetToken,
    isLoading: isFaucetLoading,
    isSuccess: isFaucetStarted,
    error: faucetError,
  } = useContractWrite({
    addressOrName: CONTRACT_ADDRESS,
    contractInterface: tokenContract.abi,
    functionName: "faucet",
  });

  // claim faucet
  const claimFaucet = async () => {
    await faucetToken();
  };


  useEffect(() => {
    if (totalSupplyData) {
      let temp = totalSupplyData / 10 ** 18;
      setSupplyData(temp);
    }
  }, [totalSupplyData]);




  /*
  useEffect(() => {
    console.log("mintData:", mintData);
    console.log("isMintLoading:", isMintLoading);
    console.log("isMintStarted", isMintStarted);
    console.log("mintError:", mintError);
    console.log("___________");
  }, [mintData, isMintLoading, isMintStarted]);
  */

  /*
  useEffect(() => {
    console.log("address:", address);
    console.log("network", chains);
    console.log("___________");
  }, [address, chains]);

  */

  return (
    <div className="container flex flex-col justify-center mx-auto items-center mt-10">
       <div className="flex mb-6">
      <Image
         width='60'
         height='60'
        src={`/JUTC.svg`}
        alt={`JUTC Token`}
        className={`img-responsive`}
      />
       </div>
      <div className="flex mb-6">
        
        <ConnectButton showBalance={false} />
      </div>
      <h3 className="text-5xl font-bold ">{"JUTC token drop"}</h3>
      <h2 className='mb-10'><a href="https://testnet.bnbchain.org/faucet-smart" target="_blank">GET BNB testnet first! <img className="link" width="16" src="/link.svg" /></a></h2>
      <div className="flex flex-col mb-4">
        <button
          onClick={addJUTCtoken}
          className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-12 py-2 sm:w-auto"
        >
          Add JUTC (testnet) to Metamask
        </button>
        {/* No success tag */}
      </div>

      <div className="flex flex-col mb-8">
        <button
          onClick={mintFreeTokens}
          className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-12 py-2 sm:w-auto"
          disabled={isMintLoading}
        >
          Mint Tokens
        </button>
        {txSuccess && <p>Success</p>}
      </div>

      <div className="flex flex-col mb-8">
        <button
          onClick={buySomeTokens}
          className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-12 py-2 sm:w-auto"
        >
          Buy Tokens
        </button>
        {/* No success tag */}
      </div>

      <div className="flex flex-col mb-4">
        <button
          onClick={claimFaucet}
          className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-12 py-2 sm:w-auto"
        >
          Claim Faucet
        </button>
        {/* No success tag */}
      </div>

      <div className="text-center">
        <h3 className="text-lg ">Total minted</h3>

        <h3 className="text-lg">{supplyData}</h3>
      </div>
    </div>
  );
}
