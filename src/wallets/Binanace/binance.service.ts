/* eslint-disable @typescript-eslint/ban-types */
import { Injectable } from "@nestjs/common";
import BinanceClient, { Binance, DepositStatus_LT, WithdrawStatus_LT, SymbolFilter, OrderType_LT, TradingType_LT } from "binance-api-node";
import { db, wallet_db } from "src/dbconnection";
import { ExchangeServiceDTO, ScannableWallet, scannableWallet_collection, UserWalletData, ws_exchange_wallets_info } from "src/dto";
import { getDateTime } from "src/utils/misc";
import { getCMCPrices } from "src/utils/prices";


interface DepositHistoryResponse {
  insertTime: number
  amount: string
  coin: string
  network: string
  address: string
  txId: string
  status: DepositStatus_LT
  addressTag?: string
  transferType?: number
  confirmTimes?: string
  unlockConfirm?: number;
  walletType?: number;
}

interface WithdrawHistoryResponse {
  id: string
  amount: string
  transactionFee: string
  address: string
  coin: string
  txId: string
  applyTime: number
  status: WithdrawStatus_LT
  network: string
  transferType?: number
  withdrawOrderId?: string
  confirmNo?: number
  walletType?: number
  txKey?: string,
  info?: string
}

enum WithdrawStatus {
  EMAIL_SENT = 0 as number,
  CANCELLED = 1 as number,
  AWAITING_APPROVAL = 2 as number,
  REJECTED = 3 as number,
  PROCESSING = 4 as number,
  FAILURE = 5 as number,
  COMPLETED = 6 as number,
}

interface Symbol {
  baseAsset: string
  baseAssetPrecision: number
  baseCommissionPrecision: number
  filters: SymbolFilter[]
  icebergAllowed: boolean
  isMarginTradingAllowed: boolean
  isSpotTradingAllowed: boolean
  ocoAllowed: boolean
  orderTypes: OrderType_LT[]
  permissions: TradingType_LT[]
  quoteAsset: string
  quoteAssetPrecision: number
  quoteCommissionPrecision: number
  quoteOrderQtyMarketAllowed: boolean
  quotePrecision: number
  status: string
  symbol: string
  walletId?: string
  lastTimestamp?: number
}

@Injectable()
export class BinanceService implements ExchangeServiceDTO {

  async getBinanceClient (apiKey: string, apiSecret: string, raw?: boolean): Promise<Binance> {

    if(raw) {
      return BinanceClient();
    }

    const binance: Binance = BinanceClient({
      apiKey: apiKey,
      apiSecret: apiSecret
    });

    return binance;
  }

  async updateBinanceExchangeInfo (binance: Binance, walletId: string, fetchFromDB?: boolean): Promise<Symbol[]> {
    const walletData = await db.collection(scannableWallet_collection).findOne({walletId}) as ScannableWallet;

    let exchangeInfo_lastUpdated = walletData.exchangeInfo_lastUpdated;

    if(!exchangeInfo_lastUpdated) exchangeInfo_lastUpdated = 0;

    const diff = Date.now() - exchangeInfo_lastUpdated;

    let symbols: Symbol[]

    const timestamp = Date.now();

    if(diff >= 24 * 60 * 60 * 1000) {
      console.log('Fetching from the exchange...!');
      const info = await binance.exchangeInfo();
      symbols = info.symbols;

      for (const symbol of symbols) {
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

  // eslint-disable-next-line @typescript-eslint/ban-types
  async getBinanceExchangeInfo (binance: Binance, walletId: string) : Promise<Symbol[]> {

    let symbols: Symbol[] = await wallet_db.collection(ws_exchange_wallets_info).find({walletId, status: "TRADING"}).project({
      symbol: 1, status: 1, baseAsset: 1, quoteAsset: 1, walletId: 1, lastTimestamp: 1
    }).toArray() as any[];

    if(symbols.length === 0) {
      symbols = await this.updateBinanceExchangeInfo(binance, walletId, true);
    } else {
      this.updateBinanceExchangeInfo(binance, walletId, false);
    }

    // const info = await binance.exchangeInfo();

    // const symbols = info.symbols;


    return symbols;
  }

  async getExchangeInfoRequest (walletId: string): Promise<any> {

    const binance = await this.getBinanceClient(null, null, true);

    const symbols = await this.getBinanceExchangeInfo(binance, walletId);

    return {status: true, count: symbols.length, symbols};
  }

  async getCurrentBalancesList (userWallet: UserWalletData): Promise<any> {

    const binance = await this.getBinanceClient(userWallet.apiKey, userWallet.apiSecret);

    const balances = await binance.accountInfo();

    return {
      status: true,
      balances
    };
  }

  async getAccountTradeHistory (userWallet: UserWalletData, symbol: string, query: {limit?: number; fromId?: number}): Promise<any> {

    // "orderId": 1125563634,
    // "orderListId": -1,
    // "clientOrderId": "web_a11eb0552f8541f5ad9cf5c9622b15a3",

    const binance = await this.getBinanceClient(userWallet.apiKey, userWallet.apiSecret);

    const trades = await binance.myTrades({
      symbol,
      ...(query.limit? {limit: query.limit}: {}),
      ...(query.fromId? {fromId: query.fromId}: {}),
    });

    return {
      status: true,
      count: trades.length,
      trades
    };
  }

  async getAccountAllOrders (userWallet: UserWalletData, symbol: string): Promise<any> {

    const binance = await this.getBinanceClient(userWallet.apiKey, userWallet.apiSecret);

    const orders = await binance.allOrders({symbol});

    return {
      status: true,
      orders
    };
  }

  async getDepositHistory (userWallet: UserWalletData, coin?: string): Promise<any> {

    const binance = await this.getBinanceClient(userWallet.apiKey, userWallet.apiSecret);

    const deposits: DepositHistoryResponse[] = coin? await binance.depositHistory({coin: coin}) as any[]: await binance.depositHistory(null) as any[];

    return {
      status: true,
      count: deposits.length,
      deposits
    }

  }

  async getWithdrawHistory (userWallet: UserWalletData, coin?: string): Promise<any> {

    const binance = await this.getBinanceClient(userWallet.apiKey, userWallet.apiSecret);

    const withdrawHistory: WithdrawHistoryResponse[] = coin? await binance.withdrawHistory({coin: coin}) as any[]: await binance.withdrawHistory(null) as any[];

    return {
      status: true,
      count: withdrawHistory.length,
      withdrawHistory: withdrawHistory
    };
  }

  async recordUserDepositWithdrawHistory(userWallet: UserWalletData) {

    const binance = await this.getBinanceClient(userWallet.apiKey, userWallet.apiSecret);

    const { email, walletId, userWallet_Id } = userWallet

    let getLastTxn: any = await wallet_db.collection("ws_deposit_withdraw_history").find({userWallet_Id, email, walletId}).sort({timestamp: -1}).limit(1).toArray();
    getLastTxn = getLastTxn[0];

    let startTime = null;

    if(getLastTxn) {
      startTime = getLastTxn.timestamp + 1;
    }

    console.log("start Time...", startTime);

    const deposits: DepositHistoryResponse[] = await binance.depositHistory({coin: null, startTime: startTime}) as any[];

    const withdraws: WithdrawHistoryResponse[] = await binance.withdrawHistory({coin: null, startTime: startTime}) as any[];

    const coinRates = await getCMCPrices();

    const allTxns = [];

    for (const txn of deposits) {

      const date = new Date(txn.insertTime).toLocaleString("en-US");

      const dateTime = await getDateTime();

      const gxTxn = {
        txnType: "deposit",
        deposit: true,
        withdraw: false,
        email,
        walletId,
        userWallet_Id,
        coin: txn.coin,
        network: txn.network,
        amount: Number(txn.amount),
        amount_usd: coinRates[txn.coin] * Number(txn.amount),
        address: txn.address,
        txid: txn.txId,
        date,
        timestamp: txn.insertTime,
        dateAdded: dateTime.date,
        timestampAdded: dateTime.timestamp,
        status: txn.status? "Processed": "pending",
        exchange_txnStatus: txn.status,
        confirmations: txn.confirmTimes,
        external_txn: true,
        exchange_specific_data: {
          addressTag: txn.addressTag,
          transferType: txn.transferType,
          unlockConfirm: txn.unlockConfirm,
          walletType: txn.walletType
        }
      }

      allTxns.push(gxTxn);

    }

    for (const txn of withdraws) {

      const date = new Date(txn.applyTime).toLocaleString("en-US");

      const dateTime = await getDateTime();

      const gxTxn = {
        txnType: "withdraw",
        deposit: false,
        withdraw: true,
        email,
        walletId,
        userWallet_Id,
        coin: txn.coin,
        network: txn.network,
        amount: Number(txn.amount),
        amount_usd: coinRates[txn.coin] * Number(txn.amount),
        txn_fee: Number(txn.transactionFee),
        address: txn.address,
        txid: txn.txId,
        date,
        timestamp: new Date(txn.applyTime).getTime(),
        dateAdded: dateTime.date,
        timestampAdded: dateTime.timestamp,
        status: WithdrawStatus[`${txn.status}`],
        exchange_txnStatus: txn.status,
        confirmations: txn.confirmNo,
        withdraw_id: txn.id,
        external_txn: true,
        exchange_specific_data: {
          transferType: txn.transferType,
          info: txn.info,
          walletType: txn.walletType,
          txKey: txn.txKey
        }
      }

      allTxns.push(gxTxn)

    }

    if(allTxns.length === 0) {
      return {
        status: true,
        message: 'No new transactions found!'
      }
    }

    allTxns.sort((a, b)=>{
      return a.timestamp - b.timestamp
    })

    await wallet_db.collection("ws_deposit_withdraw_history").insertMany(allTxns);

    return {
      status: true,
      message: 'Success'
    }
  }

  async recordUserTradeHistory(userWallet: UserWalletData) {

    const binance = await this.getBinanceClient(userWallet.apiKey, userWallet.apiSecret);

     const symbols = await this.getBinanceExchangeInfo(binance, userWallet.walletId);

     const { email, walletId, userWallet_Id } = userWallet;

    let getLastTxn: any = await wallet_db.collection("ws_trade_history").find({userWallet_Id, email, walletId}).sort({timestamp: -1}).limit(1).toArray();
    getLastTxn = getLastTxn[0];

    let fromId = null;

    if(getLastTxn) {
      fromId = getLastTxn.identifier;
    }

     for (const symbolD of symbols) {

      // if(symbolD.symbol === "BTCUSDT") continue;

      try {

        const { symbol, baseAsset, quoteAsset } = symbolD;

        const trades = await binance.myTrades({
          symbol,
          ...(fromId? {fromId: fromId}: {}) 
        });

        if(fromId) {
          trades.shift();
        }

        const coinRates = await getCMCPrices();

        const allTrades = [];

        for (const trade of trades) {

          const { commissionAsset, commission, isBuyer, isMaker, quoteQty, qty, price, orderId, time } = trade;

          const date = new Date(time).toLocaleString("en-US");

          const dateTime = await getDateTime();

          let debit_coin = baseAsset;
          let debit_amount = qty;
          let credit_coin, credit_amount

          if(isBuyer) {
            credit_coin = baseAsset;
            credit_amount = qty;

            debit_amount = quoteQty;
            debit_coin = quoteAsset;
          } else {
            credit_coin = quoteAsset;
            credit_amount = quoteQty;

            debit_amount = qty;
            debit_coin = baseAsset;
          }

          const gxTxnDebit = {
            txnType: "trade",
            deposit: false,
            withdraw: true,
            identifier: trade.id,
            email,
            walletId,
            userWallet_Id,
            coin: debit_coin,
            network: debit_coin,
            amount: Number(debit_amount),
            amount_usd: coinRates[debit_coin] * Number(debit_amount),
            txn_fee: Number(commission),
            txn_fee_asset: commissionAsset,
            txn_fee_usd: Number(commission) * coinRates[commissionAsset],
            address: "",
            txid: trade.id,
            orderId,
            date,
            timestamp: new Date(time).getTime(),
            dateAdded: dateTime.date,
            timestampAdded: dateTime.timestamp,
            status: "Processed",
            exchange_txnStatus: "Completed",
            exchange_specific_data: {
              price,
              isBuyer,
              isMaker,
              symbol,
              baseAsset,
              quoteAsset
            },
            txn_metadata: {
              trade: true
            }
          }

          const gxTxnCredit = {
            txnType: "trade",
            deposit: true,
            withdraw: false,
            identifier: trade.id,
            email,
            walletId,
            userWallet_Id,
            coin: credit_coin,
            network: credit_coin,
            amount: Number(credit_amount),
            amount_usd: coinRates[credit_coin] * Number(credit_amount),
            txn_fee: Number(commission),
            txn_fee_asset: commissionAsset,
            txn_fee_usd: Number(commission) * coinRates[commissionAsset],
            address: "",
            txid: trade.id,
            orderId,
            date,
            timestamp: new Date(time).getTime(),
            dateAdded: dateTime.date,
            timestampAdded: dateTime.timestamp,
            status: "Processed",
            exchange_txnStatus: "Completed",
            exchange_specific_data: {
              price,
              isBuyer,
              isMaker,
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

      } catch (e){
        console.log(e);
        continue ;
      }

     }

     console.log("Completed All Symbols...!")

    return {
      status: true,
      message: "Success",
      walletId: userWallet.walletId
    }
  }

}