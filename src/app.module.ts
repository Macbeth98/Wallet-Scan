import { Module } from "@nestjs/common";
// import { AppController } from "./app.controller";
// import { AppService } from "./app.service";
import { AdminModule } from "./admin/admin.module";
import { WalletModule } from "./wallets/wallet.module";

@Module({
  imports: [AdminModule, WalletModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
