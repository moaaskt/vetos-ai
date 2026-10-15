import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Hardening de cabeçalhos HTTP com Helmet
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // Suporte a visualização/download de anexos e PDFs
    }),
  );

  // Configuração segura de CORS orientada a ambiente
  const allowedOriginsEnv = process.env.CORS_ORIGINS;
  const isDev = process.env.NODE_ENV !== 'production';

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Permite requisições sem origin (como chamadas server-to-server, curl ou ferramentas locais)
      if (!origin) return callback(null, true);

      if (isDev) {
        if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
          return callback(null, true);
        }
      }

      if (allowedOriginsEnv) {
        const allowedOrigins = allowedOriginsEnv.split(',').map((o) => o.trim());
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
      }

      if (isDev) {
        return callback(null, true);
      }

      return callback(new Error('Origem não autorizada pelas diretivas de CORS do VetOS AI.'));
    },
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
