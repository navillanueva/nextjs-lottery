// First we are going to see the hard way
// then the easy way

import { useMoralis } from "react-moralis"
import { useEffect } from "react" // core hook diractly from react + one of the most popular hooks

export default function ManualHeader() {
    // this is a hook we can use to change our frontend code as state varibles update
    const { enableWeb3, deactivateWeb3, account, isWeb3Enabled, Moralis, isWeb3EnableLoading } =
        useMoralis()

    // every time we refresh the page we have to hit the connect button again
    // now we are going to create something that checks if we are already connected before the page loads
    // alway look at docs to see function syntax, what it takes as parameters and what it returns
    // this function will re-render any time something new happens
    useEffect(() => {
        if (isWeb3Enabled) return // if we are already connected we dont need to do anything
        if (typeof window !== "undefined") {
            // and if we connected recently we can fetch that connection
            if (window.localStorage.getItem("connected")) {
                enableWeb3()
            }
        }
    }, [isWeb3Enabled])

    // create another use effect hook to manage what happens when we have disconnected

    useEffect(() => {
        Moralis.onAccountChanged((account) => {
            console.log(`Account changed to ${account}`)
            if (account == null) {
                // if the account is null we can assume they disconnected
                window.localStorage.removeItem("connected")
                deactivateWeb3()
                console.log("Null account found")
            }
        })
    })

    return (
        <div>
            {account ? (
                <div>Connected to {account}</div>
            ) : (
                <button
                    onClick={async () => {
                        await enableWeb3()
                        // we are saving in our website storage to be able to use this value in our useEffect hook
                        window.localStorage.setItem("connected", "inject")
                    }}
                    disabled={isWeb3EnableLoading} // button will appear disabled as we are connecting to our metamask
                >
                    Connect
                </button>
            )}
        </div>
    )
}
