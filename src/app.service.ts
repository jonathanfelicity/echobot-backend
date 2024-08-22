import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): any {
    return {
      message:
        "🚀 Welcome aboard! You've just landed on our API. Fasten your seatbelt, and let's build something awesome!",
      status: 'success',
      timestamp: new Date().toISOString(),
    };
  }
}
