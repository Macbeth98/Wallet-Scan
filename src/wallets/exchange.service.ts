import { Injectable } from "@nestjs/common";
import { ExchangeServiceDTO } from "src/dto";
import { BinanceService } from "./Binanace/binance.service";
import { BitbnsService } from "./Bitbns/bitbns.servics";
import { CoinDCXService } from "./CoinDCX/coindcx.service";
import { WazirxService } from "./Wazirx/wazirx.service";

@Injectable()
export class ExchangeService {

  constructor(
    private binanceService: BinanceService,
    private wazirxService: WazirxService,
    private coindcxService: CoinDCXService,
    private bitbnsService: BitbnsService,
    ) {}

  async getExchangeService (walletId: string): Promise<ExchangeServiceDTO> {

    let exchange = null;

    switch (walletId) {
      case "6fo6w0l0xz3be4":
        exchange = this.binanceService;
        break;
      
      case "6fo63sl1al5fgr":
        exchange = this.wazirxService;
        break;
      
      case "6fo3ikl1dgbwzw":
        exchange = this.coindcxService
        break;

      case "6fo3pgl1kh32yp":
        exchange = this.bitbnsService;
        break;
        
      default:
        break;
    }

    if(exchange === null) throw new Error('Exchange/Wallet Service not Found!');

    return exchange;
  }

}