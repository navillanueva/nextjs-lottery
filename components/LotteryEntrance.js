// have a function to enter the lottery

import { useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../constants"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

export default function LotteryEntrance() {
    // first we have to get the info
    // 1. first we create a deploy-front-end script to get the abi and contract address
    // 2. function name and params we know
    // 3. Get the chainId
    const { chainId: chaindIdHex, isWeb3Enabled } = useMoralis() // gives us the hex version of the chainId
    const chainId = parseInt(chaindIdHex)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

    // if we declare entrance fee like this it doesnt display in the UI becuase the values changes with a hook
    // let entranceFee = ""
    // so we need to declare it like a hook variable:
    const [entranceFee, setEntranceFee] = useState("0") // declare to 0
    //      state        function to update it

    // we need one of these to save each variable from our co
    const [numPlayers, setNumPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")

    const dispatch = useNotification()

    // accessing our lottery contract
    const {
        runContractFunction: enterRaffle,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,
    })

    // getting the entrance fee
    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    })

    // each of this parts of code are used to access the contract
    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    // try to read the raffle entrance fee
    // we creat an async function because getEntranceFee is an async function
    // we can call async methods from a hook but we can create an async function inside of it
    async function updateUI() {
        const entranceFeeFromCall = (await getEntranceFee()).toString()
        const numPlayersFromCall = (await getNumberOfPlayers()).toString()
        const recentWinnerFromCall = (await getRecentWinner()).toString()
        setEntranceFee(entranceFeeFromCall)
        setNumPlayers(numPlayersFromCall)
        setRecentWinner(recentWinnerFromCall)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    // find out what each web3uikit elemebts needs in the following link:ç
    // https://web3ui.github.io/web3uikit/?path=/story/5-popup-notification--hook-demo
    const handleNewNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Tx Notification",
            position: "topR",
            icon: "bell",
        })
    }

    const handleSucces = async function (tx) {
        await tx.wait(1)
        handleNewNotification(tx)
        updateUI()
    }

    return (
        <div className="p-5">
            Hi from lottery entrance
            {raffleAddress ? (
                <div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={async () =>
                            await enterRaffle({
                                onSuccess: handleSucces,
                                onError: (error) => console.log(error),
                                // always add on onError to know what is happening
                            })
                        }
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            <div>Enter Raffle</div>
                        )}
                    </button>
                    <div></div>
                    <div>Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH </div>
                    <div>Number of Players: {numPlayers}</div>
                    <div>Recent Winner: {recentWinner}</div>
                </div>
            ) : (
                <div>No Raffle address detected</div>
            )}
        </div>
    )
}
