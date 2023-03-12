import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ScannableWallet } from "src/dto";
import { AdminAuthGuard } from "src/Guards/auth.guard";
import { AdminService } from "./admin.service";

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @UseGuards(AdminAuthGuard)
  @Post('scannable/wallet/add')
  adminAddScannableWallet(
    @Body() scannableWallet: ScannableWallet,
    @Body() body: any
  ) {
    return this.adminService.adminAddScannableWallet(scannableWallet, body);
  }

  @UseGuards(AdminAuthGuard)
  @Post('scannable/wallet/edit')
  adminEditScannableWallet(
    @Body() body: any
  ) {
    return this.adminService.adminEditScannableWallet(body);
  }

  @UseGuards(AdminAuthGuard)
  @Post('scannable/wallet/delete')
  adminDeleteScannableWallet(
    @Body() body: any
  ) {
    return this.adminService.adminDeleteScannableWallet(body);
  }

  @Get('scannable/wallets/get')
  getScannableWallets (
    @Query() query: any
  ) {
    return this.adminService.getScannableWallets(query);
  }
}