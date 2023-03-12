import { IsNotEmpty, IsOptional } from "class-validator";
import { ObjectId } from "mongodb";

export const scannableWallet_collection = "ws_scannable_wallets_data"; 

export class ScannableWallet {
  _id?: ObjectId;

  walletId: string;

  walletCode: string;

  @IsNotEmpty()
  walletName: string;

  @IsNotEmpty()
  walletIcon: string;

  @IsNotEmpty()
  walletLogo: string;

  @IsNotEmpty()
  walletWebsite: string;

  @IsNotEmpty()
  apiDocLink: string;

  addedBy: string;

  date: string;
  timestamp: number;

  @IsOptional()
  other_data?: any;

  @IsOptional()
  integrationintsructions?: any

  exchangeInfo_lastUpdated?: number
}
