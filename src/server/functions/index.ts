// Authorization: Bearer sk_test_r3m3mb3r2pu70nasm1l3
import {Paystack} from 'paystack-sdk';

const paystack = new Paystack(process?.env?.PAYSTACK_SECRET_KEY!);

function TransferToUser(user:string) {
    paystack.recipient.fetch(user)
}
function getBankList() {
    
}
function getBankInfo() {
    
}

