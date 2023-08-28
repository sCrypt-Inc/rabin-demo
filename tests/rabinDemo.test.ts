import { expect, use } from 'chai'
import { toByteString } from 'scrypt-ts'
import { RabinDemo } from '../src/contracts/rabinDemo'
import { getDefaultSigner } from './utils/txHelper'
import chaiAsPromised from 'chai-as-promised'
import axios from 'axios'
import { RabinVerifierWOC } from 'scrypt-ts-lib'
use(chaiAsPromised)

const witnessServer = 'https://witnessonchain.com/v1'

describe('Test SmartContract `RabinDemo`', () => {
    let instance: RabinDemo

    before(async () => {
        // GET https://witnessonchain.com/v1/info
        const response = await axios
            .get(`${witnessServer}/info`)
            .then((response) => response.data)
        // then parse Oracle's Rabin public key from the response
        const pubKey = RabinVerifierWOC.parsePubKey(response)

        await RabinDemo.compile()
        // new contract instance
        instance = new RabinDemo(pubKey)
        await instance.connect(getDefaultSigner())
    })

    it('should pass the public method unit test successfully.', async () => {
        // GET https://witnessonchain.com/v1/rates/bsv_usdc
        const response = await axios
            .get(`${witnessServer}/rates/bsv_usdc`)
            .then((response) => response.data)
        // then parse Oracle's signed message and signature from the response
        const msg = toByteString(response.digest)
        const sig = RabinVerifierWOC.parseSig(response)

        // deploy the contract
        const deployTx = await instance.deploy()
        console.log('RabinDemo contract deployed: ', deployTx.id)

        // call the contract
        const { tx, atInputIndex } = await instance.methods.unlock(msg, sig)

        // verify contract call result
        const result = tx.verifyScript(atInputIndex)
        expect(result.success, result.error).to.eq(true)
    })
})
