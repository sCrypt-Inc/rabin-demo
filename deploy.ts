import { RabinDemo } from './src/contracts/rabinDemo'
import { bsv, TestWallet, DefaultProvider } from 'scrypt-ts'
import axios from 'axios'
import * as dotenv from 'dotenv'
import { RabinPubKey, RabinVerifierWOC } from 'scrypt-ts-lib'

// Load the .env file
dotenv.config()

// Read the private key from the .env file.
// The default private key inside the .env file is meant to be used for the Bitcoin testnet.
// See https://scrypt.io/docs/bitcoin-basics/bsv/#private-keys
const privateKey = bsv.PrivateKey.fromWIF(process.env.PRIVATE_KEY || '')

// Prepare signer.
// See https://scrypt.io/docs/how-to-deploy-and-call-a-contract/#prepare-a-signer-and-provider
const signer = new TestWallet(
    privateKey,
    new DefaultProvider({
        network: bsv.Networks.testnet,
    })
)

async function getPubKey() {
    const witnessServer = 'https://witnessonchain.com/v1'
    const response = await axios
        .get(`${witnessServer}/info`)
        .then((response) => response.data)
    return RabinVerifierWOC.parsePubKey(response)
}

async function main() {
    await RabinDemo.compile()

    const pubKey = await getPubKey()
    const instance = new RabinDemo(pubKey)

    // Connect to a signer.
    await instance.connect(signer)

    // Contract deployment.
    const amount = 1
    const deployTx = await instance.deploy(amount)
    console.log(`RabinDemo contract deployed: ${deployTx.id}`)
}

main()
