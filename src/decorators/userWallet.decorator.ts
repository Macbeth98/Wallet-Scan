import { createParamDecorator, ExecutionContext, ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { db } from 'src/dbconnection';
import { UserWalletData, userWalletData_collection } from 'src/dto';
import { decryptFunction } from 'src/utils/cipher';

export const UserWallet = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const obj = {...request.query, ...request.body};

    const { email, userWallet_Id }: {email: string; userWallet_Id: string;} = obj;

    const userWallet = await db.collection(userWalletData_collection).findOne({userWallet_Id}) as UserWalletData;

    if(!userWallet) throw new NotFoundException('User Wallet not Found!');

    if(userWallet.email !== email) throw new UnauthorizedException('Access Denied!');

    const { ident,  apiSecret } = userWallet;

    const plainText = await decryptFunction(apiSecret, ident);

    if(!plainText.status) throw new ForbiddenException('There is an Error in acquiring the Credentials!');

    userWallet.apiSecret = plainText.text;

    return userWallet;
  },
);