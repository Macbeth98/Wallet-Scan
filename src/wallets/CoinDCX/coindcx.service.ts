import { Injectable } from "@nestjs/common";
import axios from "axios";
import { wallet_db } from "src/dbconnection";

import { ExchangeServiceDTO, UserWalletData } from "src/dto";
import { createHMACSHA256 } from "src/utils/cipher";

@Injectable()
export class CoinDCXService implements ExchangeServiceDTO {

  async getCoinDCXAPIData (url: string, method: any, body: any, apiKey: string, apiSecret: string): Promise<any> {

    const timestamp = Date.now();

    body.timestamp = timestamp;

    const payload = Buffer.from(JSON.stringify(body)).toString();

    const signature = (await createHMACSHA256(apiSecret, payload)).hash;

    const axiosData = await axios({
      url,
      baseURL: "https://api.coindcx.com",
      method,
      headers: {
        'X-AUTH-APIKEY': apiKey,
        'X-AUTH-SIGNATURE': signature
      },
      data: body
    });

    return axiosData.data;
  }

  // API KEY = df3ceef49522f6dbb50ea8b3cc5d80e0499a1fe3637db39a
  // API Secret = f671d5e15537d516ab999531ce8c8518e4799b9b7f2786f5bd3cb2dd2351590a

  async getExchangeInfoRequest(walletId: string): Promise<any> {
    return ''
  }

  async getCurrentBalancesList(userWallet: UserWalletData): Promise<any> {

    const balances = await this.getCoinDCXAPIData(
      "/exchange/v1/users/balances",
      "post",
      {},
      userWallet.apiKey,
      userWallet.apiSecret
    );

    return {
      status: true,
      balances
    }
  }

  async getAccountAllOrders(userWallet: UserWalletData, symbol: string): Promise<any> {

    const body = {
      market: symbol
    }

    const orders = await this.getCoinDCXAPIData(
      "/exchange/v1/orders/active_orders",
      "post",
      body,
      userWallet.apiKey,
      userWallet.apiSecret
    );

    return orders;
  }

  async getAccountTradeHistory(userWallet: UserWalletData, symbol: string): Promise<any> {

    const trades = await this.getCoinDCXAPIData(
      "/exchange/v1/orders/trade_history",
      "post",
      {},
      userWallet.apiKey,
      userWallet.apiSecret
    )

    return trades
  }

  async getDepositHistory(userWallet: UserWalletData, coin?: string): Promise<any> {

    const deposits = await this.getCoinDCXAPIData(
      "/api/v1/wallets/deposits",
      "get",
      {},
      userWallet.apiKey,
      userWallet.apiSecret
    )

    return deposits;
  }

  async getWithdrawHistory(userWallet: UserWalletData, coin?: string): Promise<any> {
    return ''
  }

  async recordUserDepositWithdrawHistory(userWallet: UserWalletData): Promise<any> {
    return ''
  }

  async recordUserTradeHistory(userWallet: UserWalletData): Promise<any> {

    const { email, userWallet_Id, walletId, apiKey, apiSecret } = userWallet;

    let lastTrade: any = await wallet_db.collection("ws_trade_history").find({email, userWallet_Id, walletId}).sort({timestamp: -1}).limit(1).toArray();
    lastTrade = lastTrade[0];

    let trade_id = null
    
    if(lastTrade) trade_id = lastTrade.trade_id;

    const body: any = {};

    if(trade_id) {
      body.from_id = trade_id;
    }

    const trades = await this.getCoinDCXAPIData(
      "/exchange/v1/orders/trade_history",
      "post",
      body,
      apiKey,
      apiSecret
    );

    const allTrades = [];

    for (const trade of trades) {
      
    }

    return ''
  }

}