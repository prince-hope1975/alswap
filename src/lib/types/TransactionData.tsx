export interface TransactionData {
  reference: string;
  trans: string;
  status: string;
  message: string;
  transaction: string;
  trxref: string;
  redirecturl: string;
}
export interface TransactionResponse {
  data: TransactionData;
}
