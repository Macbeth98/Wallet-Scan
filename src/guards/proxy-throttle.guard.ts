import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProxyThrottleGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const ip = req.ips?.length > 0 ? req.ips[0] : req.ip;
    req.headers['x-client-ip'] = ip;
    return ip;
  }
}
