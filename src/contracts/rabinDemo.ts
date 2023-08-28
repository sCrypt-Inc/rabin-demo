import { assert, ByteString, method, prop, SmartContract } from 'scrypt-ts'
import { RabinPubKey, RabinSig, RabinVerifierWOC } from 'scrypt-ts-lib'

export class RabinDemo extends SmartContract {
    @prop()
    pubKey: RabinPubKey

    constructor(pubKey: RabinPubKey) {
        super(...arguments)
        this.pubKey = pubKey
    }

    @method()
    public unlock(msg: ByteString, sig: RabinSig) {
        assert(
            RabinVerifierWOC.verifySig(msg, sig, this.pubKey),
            'rabin signature verified failed'
        )
    }
}
