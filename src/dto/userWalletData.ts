import { IsEmail, IsNotEmpty, IsOptional } from "class-validator";
import { ObjectId } from "mongodb"

export const userWalletData_collection = "ws_user_wallets_data"

export const user_def_app_code = "TaxChains"

export interface UserWalletData {
  _id?: ObjectId;
  userWallet_Id: string;
  email: string;
  walletId: string;
  ident: string;
  apiKey: string;
  apiSecret: string;
  date: string;
  timestamp: number;
}

export class userSetWalletData_DTO {
  userWallet_Id: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  walletId: string;

  @IsNotEmpty()
  apiKey: string;

  @IsOptional()
  apiSecret: string;
}