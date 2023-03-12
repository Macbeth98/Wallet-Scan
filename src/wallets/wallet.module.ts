import { Module } from "@nestjs/common";
import { BinanceService } from "./Binanace/binance.service";
import { BitbnsService } from "./Bitbns/bitbns.servics";
import { CoinDCXService } from "./CoinDCX/coindcx.service";
import { ExchangeService } from "./exchange.service";
import { WalletController } from "./wallet.controller";
import { WalletService } from "./wallet.service";
import { WazirxService } from "./Wazirx/wazirx.service";

@Module({
  controllers: [WalletController],
  providers: [WalletService, ExchangeService, 
    BinanceService, 
    WazirxService,
    CoinDCXService,
    BitbnsService
  ]
})
export class WalletModule {}