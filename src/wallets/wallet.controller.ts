import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { UserWallet } from "src/decorators/userWallet.decorator";
import { userSetWalletData_DTO, UserWalletData } from "src/dto";
import { UserAuthGuard } from "src/Guards/auth.guard";
import { BinanceService } from "./Binanace/binance.service";
import { WalletService } from "./wallet.service";

@Controller('user/wallet')
export class WalletController {
  constructor(private walletService: WalletService, private binanceService: BinanceService) {}

  @Post('add')
  @UseGuards(UserAuthGuard)
  async userSetWalletData(
    @Body() body: userSetWalletData_DTO
  ) {
    return this.walletService.userSetWalletData(body.email, body.walletId, body.apiKey, body.apiSecret);
  }

  @Get('get')
  @UseGuards(UserAuthGuard)
  async getUserWalletsData (
    @Query() query: UserWalletData
  ) {
    return this.walletService.getUserWalletsData(query.email, query.walletId, query.userWallet_Id);
  }

  @Post('delete')
  @UseGuards(UserAuthGuard)
  async deleteUserWalletData (
    @Body() body: UserWalletData
  ) {
    return this.walletService.deleteUserWalletData(body.email, body.userWallet_Id);
  }

  @Get('/exchange/info/get')
  async getExchangeInfo (
    @Query() query: { walletId: string }
  ) {
    return this.walletService.getExchangeWalletInfo(query.walletId);
  }

  @Get('/balances/get')
  @UseGuards(UserAuthGuard)
  async getExchangeWalletBalances (
    @UserWallet() userWallet: UserWalletData
  ) {
    return this.walletService.getExchangeWalletBalances(userWallet);
  }

  @Get('/trades/get')
  @UseGuards(UserAuthGuard)
  async getAccountTradeHistory (
    @Query() query: { symbol: string; limit?: number; fromId?: number; },
    @UserWallet() userWallet: UserWalletData
  ) {
    return this.walletService.getExchangeTradeHistory(userWallet, query.symbol, query);
  }

  @Get('/orders/get')
  @UseGuards(UserAuthGuard)
  async getAccountOrders (
    @Query() query: {symbol: string;},
    @UserWallet() userWallet: UserWalletData
  ) {
    return this.walletService.getExchangeOrders(userWallet, query.symbol);
  }

  @Get('/deposits/get')
  @UseGuards(UserAuthGuard)
  async getDepositHistory (
    @Query() query: { coin?: string; },
    @UserWallet() userWallet: UserWalletData
  ) {
    return this.walletService.getDepositHistory(userWallet, query.coin);
  }

  @Get('/withdraws/get')
  @UseGuards(UserAuthGuard)
  async getWithdrawHistory (
    @Query() query: { coin?: string; },
    @UserWallet() userWallet: UserWalletData
  ) {
    return this.walletService.getWithdrawHistory(userWallet, query.coin);
  }


  @Post('/record/data')
  @UseGuards(UserAuthGuard)
  async recordUserExchangeData(
    // @Body() body: { userWallet_Id: string },
    @UserWallet() userWallet: UserWalletData
  ) {
    return this.walletService.recordUserExchangeData(userWallet);
  }




  //// BINANCE WALLET APIS START HERE ////

  @Get('binance/balances/get')
  @UseGuards(UserAuthGuard)
  async getBinanceWalletBalances (
    // @Query() query: { email: string; userWallet_Id: string }
    @UserWallet() userWallet: UserWalletData
  ) {
    return this.binanceService.getCurrentBalancesList(userWallet);
  }

  @Get('binance/trades/get')
  @UseGuards(UserAuthGuard)
  async getBinanceTradeHistory (
    @Query() query: { symbol: string; limit?: number; fromId?: number },
    @UserWallet() userWallet: UserWalletData
  ) {
    return this.binanceService.getAccountTradeHistory(userWallet, query.symbol, query);
  }

  @Get('binance/orders/get')
  @UseGuards(UserAuthGuard)
  async getBinanceAccountAllOrders (
    @Query() query: { symbol: string },
    @UserWallet() userWallet: UserWalletData
  ) {
    return this.binanceService.getAccountAllOrders(userWallet, query.symbol);
  }

  @Get('binance/deposits/get')
  @UseGuards(UserAuthGuard)
  async getBinanceDepositHistory (
    @Query() query: { symbol?: string; },
    @UserWallet() userWallet: UserWalletData
  ) {
    return this.binanceService.getDepositHistory(userWallet, query.symbol);
  }
  
  @Get('binance/withdraws/get')
  @UseGuards(UserAuthGuard)
  async getBinanceWithdrawHistory (
    @Query() query: { symbol?: string },
    @UserWallet() userWallet: UserWalletData
  ) {
    return this.binanceService.getWithdrawHistory(userWallet, query.symbol);
  }

  //// BINANCE WALLET APIS END HERE ////

}