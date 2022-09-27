import React, { useState } from "react"
import { ethers } from "ethers"

import { abiFundMe, contractAddressFundMe } from "./constants/constants"

import "./App.css"

function App() {
  const [connectedState, setConnectedState] = useState("Connet Wallet")

  const connect = async () => {
    if (window.ethereum) {
      await window.ethereum.request({ method: "eth_requestAccounts" })
      setConnectedState(
        `${window.ethereum.selectedAddress.slice(0, 5)}` +
          "..." +
          `${window.ethereum.selectedAddress.slice(-4)}`
      )
    } else {
      console.log("I don't see a metamask")
      setConnectedState("Please install Metamask")
    }
  }
  const fund = async (ethAmount) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(
      contractAddressFundMe,
      abiFundMe,
      signer
    )
    try {
      const txResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      })
      await listenerForTxMine(txResponse, provider)
      console.log("Done")
    } catch (error) {
      console.log(error)
    }
  }

  function listenerForTxMine(txResponse, provider) {
    console.log(`Mining ${txResponse.hash}..`)
    return new Promise((resolve, reject) => {
      provider.once(txResponse.hash, (txReceipt) => {
        console.log(`Completed with ${txReceipt.confirmations} confirmations`)
        resolve()
      })
    })

    // return Promise()
  }

  return (
    <>
      <div className="App">Web Fund Me</div>
      <button onClick={connect}>{connectedState}</button>
      <button onClick={fund}>Fund to Balance</button>
    </>
  )
}

export default App
