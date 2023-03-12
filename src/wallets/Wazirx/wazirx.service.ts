import { Injectable } from "@nestjs/common";
import axios from "axios";
import { db, wallet_db } from "src/dbconnection";

import { ExchangeServiceDTO, ScannableWallet, scannableWallet_collection, UserWalletData, ws_exchange_wallets_info } from "src/dto";
import { createHMACSHA256 } from "src/utils/cipher";
import { getDateTime } from "src/utils/misc";
import { getCMCPrices } from "src/utils/prices";


interface WazirxSymbol {
  symbol: string;
  status: string;
  baseAsset: string;
  quoteAsset: string;
  walletId?: string;
  lastTimestamp?: number;
}

interface wazirxOrder {
  id: number;
  symbol: string;
  type: string;
  side: string;
  status: string;
  price: number;
  origQty: number;
  executedQty: number;
  createdTime: number;
  updatedTime: number;
}

@Injectable()
export class WazirxService implements ExchangeServiceDTO {

  can_callApi = true;
  retryAfterTime = 0;

  async changeWazirxCallApiState () {
    this.can_callApi = true;
    return ;
  }

  async getWazirxApiData (url: string, method: any, params: any, body: any, apiKey: string, secret: string): Promise<any> {

    let message = "";

    let giv_obj = params;

    if(!giv_obj) giv_obj = body;

    if(!giv_obj) throw new Error('Params are not given!');

    for (const prop in giv_obj) {
      message = message + `${prop}=${giv_obj[prop]}&`
    }

    message = message.slice(0, message.length - 1);

    if(!this.can_callApi) {
      return {
        status: false,
        message: 'Cannot Invoke The Wazirx Apis',
        can_callApi: this.can_callApi,
        retryAfterTime: this.retryAfterTime
      }
    }

    const axiosData = await axios({
      url,
      baseURL: "https://api.wazirx.com",
      method: method,
      headers: {
        "X-API-KEY": apiKey,
        "content-type": "application/x-www-form-urlencoded"
      },
      params: {
        ...params,
        signature: (await createHMACSHA256(secret, message)).hash
      }
    });

    const apiRespStatus = axiosData.status

    if(apiRespStatus === 429) {
      this.can_callApi = false;
      console.log('broke the request limit of WAZIRX........!');
      let retrySeconds = axiosData.headers["Retry-After"] as any;
      retrySeconds = Number(retrySeconds);

      console.log("Retry after... seconds...", retrySeconds);

      setTimeout(this.changeWazirxCallApiState, (retrySeconds + 5) * 1000);

      this.retryAfterTime = Date.now() + (retrySeconds + 5) * 1000;
    }

    return axiosData.data;
  }
  
  async updateWazirxExchangeInfoData (walletId: string, fetchFromDB?: boolean): Promise<WazirxSymbol[]> {

    const walletData = await db.collection(scannableWallet_collection).findOne({walletId}) as ScannableWallet;

    let exchangeInfo_lastUpdated = walletData.exchangeInfo_lastUpdated;

    if(!exchangeInfo_lastUpdated) exchangeInfo_lastUpdated = 0;

    const diff = Date.now() - exchangeInfo_lastUpdated;

    let symbols: WazirxSymbol[] = [];

    const timestamp = Date.now();

    if(diff >= 24 * 60 * 60 * 1000) {
      console.log('Fetching from the exchange...!');
      let info = await axios.get("https://api.wazirx.com/sapi/v1/exchangeInfo") as any;
      info = info.data;

      if(!info.symbols) throw new Error('Error getting Wazirx Exchange Info!');

      symbols = info.symbols;

      for (const symbol of symbols) {
        symbol.symbol = symbol.symbol.toUpperCase();
        symbol.status = symbol.status.toUpperCase();
        symbol.baseAsset = symbol.baseAsset.toUpperCase();
        symbol.quoteAsset = symbol.quoteAsset.toUpperCase();
        symbol.walletId = walletId;
        symbol.lastTimestamp = timestamp;
      }

      await db.collection(ws_exchange_wallets_info).deleteMany({walletId});

      await wallet_db.collection(ws_exchange_wallets_info).insertMany(symbols);

      await db.collection(scannableWallet_collection).updateOne({walletId}, {
        $set: { exchangeInfo_lastUpdated: timestamp }
      })
      
    } else {
      if(fetchFromDB) {
        console.log('Fetching from Database....');
        symbols = await wallet_db.collection(ws_exchange_wallets_info).find({walletId, status: "TRADING"}).project({
          symbol: 1, status: 1, baseAsset: 1, quoteAsset: 1, walletId: 1, lastTimestamp: 1
        }).toArray() as any[];
      }
    }

    return symbols;

  }

  async getWazirxExchangeInfoData (walletId: string) : Promise<WazirxSymbol[]> {

    let symbols: WazirxSymbol[] = await wallet_db.collection(ws_exchange_wallets_info).find({walletId: walletId, status: "TRADING"}).project({
      symbol: 1, status: 1,  baseAsset: 1, quoteAsset: 1, walletId: 1, lastTimestamp: 1 
    }).toArray() as any[];

    if(symbols.length === 0) {
      symbols = await this.updateWazirxExchangeInfoData(walletId);
    } else {
      this.updateWazirxExchangeInfoData(walletId, false);
    }

    return symbols;
  }

  async getExchangeInfoRequest(walletId: string): Promise<any> {

    const symbols = await this.getWazirxExchangeInfoData(walletId);

    return symbols;
  }

  async getCurrentBalancesList(userWallet: UserWalletData): Promise<any> {

    const timestamp = Date.now();

    // const getSignature = await createHMACSHA256(userWallet.apiSecret, `timestamp=${timestamp}`);

    // const signature = getSignature.hash;

    // let accountData: any = await axios({
    //   url: "/sapi/v1/account",
    //   baseURL: "https://api.wazirx.com",
    //   method: "get",
    //   headers: {
    //     "X-API-KEY": userWallet.apiKey,
    //     "content-type": "application/x-www-form-urlencoded"
    //   },
    //   params: {
    //     timestamp,
    //     signature
    //   }
    // });

    const accountData = await this.getWazirxApiData(
      "/sapi/v1/funds",
      "get",
      {
        timestamp
      },
      null,
      userWallet.apiKey,
      userWallet.apiSecret
    )

    return {
      accountData
    }
  }

  async getAccountTradeHistory(userWallet: UserWalletData, symbol: string): Promise<any> {

    symbol = symbol.toLowerCase();

    const timestamp = Date.now();

    const trades = await this.getWazirxApiData(
      "/sapi/v1/myTrades",
      "get",
      {
        timestamp,
        symbol
      },
      null,
      userWallet.apiKey,
      userWallet.apiSecret
    )

    return trades
  }

  async getAccountAllOrders(userWallet: UserWalletData, symbol: string): Promise<any> {

    symbol = symbol.toLowerCase();

    const timestamp = Date.now();

    const orders = await this.getWazirxApiData(
      "/uapi/v1/allOrders",
      "get",
      {
        timestamp,
        symbol,
        limit: 1000,
        startTime: 0
      },
      null,
      userWallet.apiKey,
      userWallet.apiSecret
    )

    return orders
  }

  async getDepositHistory(userWallet: UserWalletData, coin?: string): Promise<any> {

    const timestamp = Date.now();

    const fundData = await this.getWazirxApiData(
      "/sapi/v1/funds",
      "get",
      {
        timestamp
      },
      null,
      userWallet.apiKey,
      userWallet.apiSecret
    )

    return fundData
  }

  async getWithdrawHistory(userWallet: UserWalletData, coin?: string): Promise<any> {
    return ''
  }

  async recordUserDepositWithdrawHistory(userWallet: UserWalletData): Promise<any> {
    return ''
  }

  async recordUserTradeHistory(userWallet: UserWalletData): Promise<any> {

    const { email, walletId, userWallet_Id } = userWallet;

    const symbols = await this.getWazirxExchangeInfoData(userWallet.walletId);

    let lastTxn = await wallet_db.collection("ws_trade_history").find({walletId, userWallet_Id, email}).sort({timestamp: -1}).limit(1).toArray() as any;
    lastTxn = lastTxn[0];

    let lastTimestamp = 0;

    if(lastTxn) {
      lastTimestamp = lastTxn.timestamp;
    }

    let i = 0;

    while(i < symbols.length) {

      const symbolData = symbols[i];

      const symbol = symbolData.symbol.toLowerCase();

      const { baseAsset, quoteAsset } = symbolData;

      const timestamp = Date.now();

      const orders: wazirxOrder[] = await this.getWazirxApiData(
        "/uapi/v1/allOrders",
        "get",
        {
          timestamp,
          symbol,
          limit: 1000,
          startTime: lastTimestamp
        },
        null,
        userWallet.apiKey,
        userWallet.apiSecret
      )

      const orders_count = orders.length;

      const coinRates = await getCMCPrices();

      const allTrades = [];

      for (const order of orders) {

        const { id, side, status, createdTime, updatedTime } = order;

        const price = Number(order.price);
        const origQty = Number(order.origQty);
        const executedQty = Number(order.executedQty);

        if(status === "cancel") continue;

        if(status !== "done") {
          console.log("the status is not Done.... Status is Wazirx Order...", status);
        }

        let debit_coin: string, debit_amount: number;
        let credit_coin: string, credit_amount: number;

        let debit_timestamp: number, credit_timestamp: number;

        if (side === "buy") {
          credit_coin = baseAsset;
          credit_amount = executedQty;

          debit_coin = quoteAsset;
          debit_amount = price * executedQty;

          debit_timestamp = createdTime;
          credit_timestamp = updatedTime;
        } else {
          credit_coin = quoteAsset;
          credit_amount = price * executedQty;

          debit_coin = baseAsset;
          debit_amount = executedQty;

          credit_timestamp = createdTime;
          debit_timestamp = updatedTime
        }

        const dateTime = await getDateTime();

        let date = new Date(debit_timestamp).toLocaleString("en-US");


        const gxTxnDebit = {
          txnType: "trade",
          deposit: false,
          withdraw: true,
          identifier: id,
          email,
          walletId,
          userWallet_Id,
          coin: debit_coin,
          network: debit_coin,
          amount: Number(debit_amount),
          amount_usd: coinRates[debit_coin] * Number(debit_amount),
          txn_fee: 0,
          txn_fee_asset: debit_coin,
          txn_fee_usd: 0,
          address: "",
          txid: id,
          orderId: id,
          date,
          timestamp: new Date(debit_timestamp).getTime(),
          dateAdded: dateTime.date,
          timestampAdded: dateTime.timestamp,
          status: "Processed",
          exchange_txnStatus: status,
          exchange_specific_data: {
            price,
            origQty,
            executedQty,
            side,
            symbol,
            baseAsset,
            quoteAsset
          },
          txn_metadata: {
            trade: true
          }
        }

        date = new Date(credit_timestamp).toLocaleString("en-US");

        const gxTxnCredit = {
          txnType: "trade",
          deposit: true,
          withdraw: false,
          identifier: id,
          email,
          walletId,
          userWallet_Id,
          coin: credit_coin,
          network: credit_coin,
          amount: Number(credit_amount),
          amount_usd: coinRates[credit_coin] * Number(credit_amount),
          txn_fee: 0,
          txn_fee_asset: debit_coin,
          txn_fee_usd: 0,
          address: "",
          txid: id,
          orderId: id,
          date,
          timestamp: new Date(credit_timestamp).getTime(),
          dateAdded: dateTime.date,
          timestampAdded: dateTime.timestamp,
          status: "Processed",
          exchange_txnStatus: "Completed",
          exchange_specific_data: {
            price,
            origQty,
            executedQty,
            side,
            symbol,
            baseAsset,
            quoteAsset
          },
          txn_metadata: {
            trade: true
          }
        }

        allTrades.push(gxTxnDebit);
        allTrades.push(gxTxnCredit);

      }

      console.log("Completed All Trades...for Symbol..", symbol);

      if(allTrades.length > 0) {
        await wallet_db.collection("ws_trade_history").insertMany(allTrades);
      }

      i++;

    }

    console.log("completed for All Symbols...!");

    return {
      status: true,
      message: "Success",
      walletId: userWallet.walletId
    }
  }

}