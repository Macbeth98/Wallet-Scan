import { Injectable } from "@nestjs/common";
import * as bitbnsApi from "bitbns";

import { ExchangeServiceDTO, UserWalletData } from "src/dto";

@Injectable()
export class BitbnsService implements ExchangeServiceDTO {

  // apiKey: 8F8E525452E29EEFCFD0EBE72D4A6DF0
  // apiSecret: D2B7178B083A2847D1568A6A8EBC6E69

  async getBitbnsInstance (apiKey: string, apiSecret: string): Promise<any> {
    const bitbns = new bitbnsApi({
      apiKey,
      apiSecretKey: apiSecret
    });

    return bitbns
  }

  async getExchangeInfoRequest(walletId: string): Promise<any> {
    return ''
  }

  async getCurrentBalancesList(userWallet: UserWalletData): Promise<any> {

    const bitbns = await this.getBitbnsInstance(userWallet.apiKey, userWallet.apiSecret);

    return new Promise(async (resolve)=>{
      try {

        bitbns.currentCoinBalance("EVERYTHING", function (err, data) {
          return resolve(data);
        })

      } catch (e){
        return resolve({
          status: false,
          message: e.message,
          error_data: e
        });
      }
    })
  }

  async getAccountAllOrders(userWallet: UserWalletData, symbol: string): Promise<any> {

    const bitbns = await this.getBitbnsInstance(userWallet.apiKey, userWallet.apiSecret);

    return new Promise(async (resolve)=>{
      try {

        bitbns.listOpenOrders(symbol, function (err, data) {
          return resolve(data);
        })

      } catch (e){
        return resolve({
          status: false,
          message: e.message,
          error_data: e
        });
      }
    })
  }

  async callBackResp (bitbns, symbol): Promise<any> {

    return new Promise(async (resolve)=>{
      try {

        bitbns.listExecutedOrders(symbol, null, null, function (err, data) {
          return resolve(data);
        })

      } catch (e){
        return resolve({
          status: false,
          message: e.message,
          error_data: e
        });
      }
    })
  }

  async getAccountTradeHistory(userWallet: UserWalletData, symbol: string): Promise<any> {

    const bitbns = await this.getBitbnsInstance(userWallet.apiKey, userWallet.apiSecret);

    return new Promise(async (resolve)=>{
      try {

        bitbns.listExecutedOrders(symbol, null, null, function (err, data) {
          return resolve(data);
        })

      } catch (e){
        return resolve({
          status: false,
          message: e.message,
          error_data: e
        });
      }
    })

  }

  async getDepositHistory(userWallet: UserWalletData, coin?: string): Promise<any> {

    const bitbns = await this.getBitbnsInstance(userWallet.apiKey, userWallet.apiSecret);

    return new Promise(async (resolve)=>{
      try {

        if(coin) {
          bitbns.depositHistory(coin, 0, function (err, data) {
            return resolve(data);
          })
        } else {
          bitbns.depositHistoryAll(0, function (err, data) {
            return resolve(data);
          })
        }

      } catch (e){
        return resolve({
          status: false,
          message: e.message,
          error_data: e
        });
      }
    });
  }

  async getWithdrawHistory(userWallet: UserWalletData, coin?: string): Promise<any> {

    const bitbns = await this.getBitbnsInstance(userWallet.apiKey, userWallet.apiSecret);

    return new Promise(async (resolve)=>{
      try {

        if(coin) {
          bitbns.withdrawHistory(coin, 0, function (err, data) {
            return resolve(data);
          })
        } else {
          bitbns.withdrawHistoryAll(0, function (err, data) {
            return resolve(data);
          })
        }

      } catch (e){
        return resolve({
          status: false,
          message: e.message,
          error_data: e
        });
      }
    });
  }

  async recordUserDepositWithdrawHistory(userWallet: UserWalletData): Promise<any> {
    return ''
  }

  async recordUserTradeHistory(userWallet: UserWalletData): Promise<any> {
    return '';
  }

}