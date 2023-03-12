import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import * as uniqid from 'uniqid';
import { db } from "src/dbconnection";
import { ScannableWallet, scannableWallet_collection } from "src/dto";
import { getDateTime } from "src/utils/misc";

@Injectable()
export class AdminService {


  async adminAddScannableWallet(scannableWallet: ScannableWallet, data: any): Promise<any> {

    console.log(data);

    let walletCode = scannableWallet.walletName;
    walletCode = walletCode.replace(/ /g, "_");
    walletCode = walletCode.toLowerCase();

    scannableWallet.walletId = uniqid();
    scannableWallet.walletCode = walletCode;

    const { date, timestamp } = await getDateTime();
    
    scannableWallet.date = date;
    scannableWallet.timestamp = timestamp;

    scannableWallet.addedBy = data.email;

    await db.collection(scannableWallet_collection).insertOne(scannableWallet);

    return {
      status: true,
      walletId: scannableWallet.walletId,
      walletCode,
      message: 'Success'
    };
  }

  async adminEditScannableWallet(data: any): Promise<any> {

    const { email, walletId, update_data }: { email: string; walletId: string; update_data: any }  = data

    const wallet = await db.collection(scannableWallet_collection).findOne({walletId}) as ScannableWallet;

    if(wallet.addedBy !== email) throw new UnauthorizedException('The User does not have access to execute the function!');

    delete update_data.addedBy;
    delete update_data.date;
    delete update_data.timestamp;
    delete update_data.walletId;
    delete update_data.walletCode;

    if(update_data.walletName) {
      const new_walletCode = update_data.walletName.replace(/ /g, "_").toLowerCase();
      update_data.walletCode = new_walletCode;
    }

    await db.collection(scannableWallet_collection).updateOne({walletId}, {
      $set: { ...update_data }
    })

    return {
      status: true,
      message: 'Success'
    }
  }

  async adminDeleteScannableWallet (data: any): Promise<any> {
    const { email, walletId }: { email: string; walletId: string } = data;

    const wallet = await db.collection(scannableWallet_collection).findOne({walletId}) as ScannableWallet;

    if(!wallet) throw new NotFoundException('The Wallet given is not Found!');

    if(wallet.addedBy !== email) throw new UnauthorizedException('The User does not have access!');

    await db.collection(scannableWallet_collection).deleteOne({walletId});

    return {
      status: true,
      message: 'Deleted!'
    }
  }

  async getScannableWallets (data: any): Promise<any> {

    const wallets = await db.collection(scannableWallet_collection).find({...data}).sort({_id: -1}).toArray() as ScannableWallet[];

    return {
      status: true,
      count: wallets.length,
      wallets
    }

  }

}