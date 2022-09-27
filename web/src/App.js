import React, { useState } from "react"
import { ethers } from "ethers"

import { abiFundMe, contractAddressFundMe } from "./constants/constants"

import "./App.css"

function App() {
  const [connectedState, setConnectedState] = useState("Connet Wallet")
  const [ethAmount, setEthAmount] = useState("")
  const [balanceAmount, setBalance] = useState()
  const [showBalance, setShowBalance] = useState(false)

  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const contract = new ethers.Contract(contractAddressFundMe, abiFundMe, signer)

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

  const fund = async () => {
    if (typeof window.ethereum != "undefined") {
      try {
        const txResponse = await contract.fund({
          value: ethers.utils.parseEther(ethAmount),
        })
        await listenerForTxMine(txResponse, provider)
        console.log("Done")
        setShowBalance(false)
      } catch (error) {
        console.log(error)
      }
    }
  }

  const balance = async () => {
    if (typeof window.ethereum != "undefined") {
      const txResponse = await provider.getBalance(contractAddressFundMe)
      setBalance(ethers.utils.formatEther(txResponse.toString()))
      setShowBalance(true)
    }
  }

  const withdraw = async () => {
    if (typeof window.ethereum != "undefined") {
      try {
        const txResponse = await contract.withdraw()
        console.log("Withdrawing the balance...")
        await listenerForTxMine(txResponse, provider)
        console.log("Done")
        setShowBalance(false)
      } catch (error) {
        console.log(error)
      }
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
  }

  const handleSubmit = (event) => {
    event.preventDefault()
  }

  const handleChange = (event) => {
    setEthAmount(event.target.value)
  }

  return (
    <>
      <div className="App">Web Fund Me</div>
      <button onClick={connect}>{connectedState}</button>
      <form onSubmit={handleSubmit}>
        <lable for="ethInput">ETH Amount</lable>
        <input
          type="number"
          name="ethInput"
          step="any"
          placeholder="0.1"
          value={ethAmount}
          onChange={handleChange}
        ></input>
        <button onClick={fund}>Fund to Balance</button>
      </form>
      <button onClick={balance}>Get Balance</button>
      <button onClick={withdraw}>Withdraw Balance</button>
      {showBalance && <p>The balance is {balanceAmount}</p>}
    </>
  )
}

export default App
