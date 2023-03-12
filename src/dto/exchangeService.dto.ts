import { UserWalletData } from "./userWalletData";

export interface ExchangeServiceDTO {
  getExchangeInfoRequest (walletId: string): Promise<any>;
  getCurrentBalancesList (userWallet: UserWalletData): Promise<any>;
  getAccountTradeHistory (userWallet: UserWalletData, symbol: string, queryData?: any): Promise<any>;
  getAccountAllOrders (userWallet: UserWalletData, symbol: string): Promise<any>;
  getDepositHistory (userWallet: UserWalletData, coin?: string): Promise<any>;
  getWithdrawHistory (userWallet: UserWalletData, coin?: string): Promise<any>;
  recordUserDepositWithdrawHistory (userWallet: UserWalletData): Promise<any>;
  recordUserTradeHistory (userWallet: UserWalletData): Promise<any>;
}