import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import * as uniqid from "uniqid";

import { db } from "src/dbconnection";
import { mainUserBase_collection, ScannableWallet, scannableWallet_collection, subVaults_collection, UserWalletData, userWalletData_collection, user_def_app_code } from "src/dto";
import { getDateTime } from "src/utils/misc";
import { encryptFunction } from "src/utils/cipher";
import { ExchangeService } from "./exchange.service";

@Injectable()
export class WalletService {

  constructor (private exchangeService: ExchangeService) {}

  async userSetWalletData(email: string, walletId: string, apiKey: string, apiSecret: string): Promise<any> {

    const user = await db.collection(subVaults_collection).findOne({email, app_code: user_def_app_code});
    if(!user) throw new NotFoundException('user not Found!');

    const scannableWallet = await db.collection(scannableWallet_collection).findOne({walletId}) as ScannableWallet;
    if(!scannableWallet) throw new NotFoundException('Scannable Wallet is not Found!');

    let walletData = await db.collection(userWalletData_collection).findOne({email, walletId}) as UserWalletData;

    if(!walletData) {

      const { date, timestamp } = await getDateTime();

      const userWallet_Id: string = uniqid();

      const ident: string = uniqid();

      const encrypt = await encryptFunction(apiSecret, ident);

      if(!encrypt.status) throw new Error('There is an Error Occurred while encrypting the data!');

      apiSecret = encrypt.cipher;

      walletData = {
        userWallet_Id,
        email,
        walletId,
        ident,
        apiKey,
        apiSecret,
        date,
        timestamp
      }

      await db.collection(userWalletData_collection).insertOne(walletData);

      this.recordUserExchangeData(walletData);

      return {
        status: true,
        message: "Success, Wallet Added!",
        userWallet_Id
      }
    }

    const encrypt = await encryptFunction(apiSecret, walletData.ident);
    
    if(!encrypt.status) throw new Error('There is an Error Occurred While encrypting the data!');

    apiSecret = encrypt.cipher;

    await db.collection(userWalletData_collection).updateOne({userWallet_Id: walletData.userWallet_Id}, {
      $set: {
        apiKey,
        apiSecret
      }
    });

    return {
      status: true,
      message: "Success, Access Data Updated!",
      userWallet_Id: walletData.userWallet_Id
    }
  }
  
  async getUserWalletsData (email: string, walletId: string, userWallet_Id: string): Promise<any> {

    const query: any = {};

    if(email) query.email = email;
    if(walletId) query.walletId = walletId;
    if(userWallet_Id) query.userWallet_Id = userWallet_Id;

    const userWallets = await db.collection(userWalletData_collection).find({...query}).sort({_id: -1}).toArray() as UserWalletData[];

    return {
      status: true,
      count: userWallets.length,
      userWallets
    }
  }

  async deleteUserWalletData (email: string, userWallet_Id: string): Promise<any> {

    const userWallet = await db.collection(userWalletData_collection).findOne({userWallet_Id});
    if(!userWallet) throw new NotFoundException('The given wallet is not Found!');

    if(userWallet.email !== email) throw new UnauthorizedException('Access Denied! The user does not have access!');

    await db.collection(userWalletData_collection).deleteOne({userWallet_Id});

    return {
      status: true,
      message: "Success, Deleted the Wallet!"
    }
  }

  async getExchangeWalletInfo (walletId: string): Promise<any> {
    const exchange = await this.exchangeService.getExchangeService(walletId);

    return exchange.getExchangeInfoRequest(walletId);
  }

  async getExchangeWalletBalances (userWallet: UserWalletData): Promise<any> {

    const exchange = await this.exchangeService.getExchangeService(userWallet.walletId);

    return exchange.getCurrentBalancesList(userWallet);
  }

  async getExchangeTradeHistory (userWallet: UserWalletData, symbol: string, query: any): Promise<any> {

    const exchange = await this.exchangeService.getExchangeService(userWallet.walletId);

    return exchange.getAccountTradeHistory(userWallet, symbol, query);
  }

  async getExchangeOrders (userWallet: UserWalletData, symbol: string): Promise<any> {

    const exchange = await this.exchangeService.getExchangeService(userWallet.walletId);

    return exchange.getAccountAllOrders(userWallet, symbol);
  }

  async getDepositHistory (userWallet: UserWalletData, coin?: string): Promise<any> {

    const exchange = await this.exchangeService.getExchangeService(userWallet.walletId);

    return exchange.getDepositHistory(userWallet, coin);
  }

  async getWithdrawHistory (userWallet: UserWalletData, coin?: string): Promise<any> {

    const exchange = await this.exchangeService.getExchangeService(userWallet.walletId);

    return exchange.getWithdrawHistory(userWallet, coin);
  }

  async recordUserExchangeData (userWallet: UserWalletData): Promise<any> {

    const exchange = await this.exchangeService.getExchangeService(userWallet.walletId);    

    // return exchange.recordUserDepositWithdrawHistory(userWallet);
    return exchange.recordUserTradeHistory(userWallet);
  }

}