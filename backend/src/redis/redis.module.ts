import { Global, Module, OnApplicationShutdown, Logger, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        const logger = new Logger('RedisModule');
        const redisHost = process.env.REDIS_HOST;
        const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
        const redisUrl = process.env.REDIS_URL;

        const client = redisUrl
          ? new Redis(redisUrl, {
              lazyConnect: true,
              enableOfflineQueue: false,
              retryStrategy: (times) => Math.min(times * 100, 3000),
            })
          : new Redis({
              host: redisHost || 'localhost',
              port: redisPort,
              lazyConnect: true,
              enableOfflineQueue: false,
              retryStrategy: (times) => Math.min(times * 100, 3000),
            });

        client.on('error', (err) => {
          logger.warn(`Redis client error: ${err.message}`);
        });

        return client;
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule implements OnApplicationShutdown {
  private readonly logger = new Logger(RedisModule.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async onApplicationShutdown() {
    try {
      if (this.redis && this.redis.status === 'ready') {
        await this.redis.quit();
        this.logger.log('Redis client gracefully disconnected.');
      }
    } catch (err: any) {
      this.logger.warn(`Error disconnecting Redis: ${err.message}`);
    }
  }
}
