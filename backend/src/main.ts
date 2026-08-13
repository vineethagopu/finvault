import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  })

  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production',
      crossOriginEmbedderPolicy: false,
    }),
  )

  app.use(cookieParser())

  // Hosted behind a TLS-terminating proxy (Render, NGINX). Without this Express
  // sees plain HTTP and refuses to set `Secure` cookies, and req.ip is the
  // proxy's address rather than the client's.
  if (process.env.TRUST_PROXY !== 'false') {
    app.getHttpAdapter().getInstance().set('trust proxy', 1)
  }

  // Comma-separated so a split deployment can allow the production SPA origin
  // alongside preview/branch URLs. Credentials are on, so '*' is not valid —
  // each allowed origin must be listed explicitly.
  const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)

  app.enableCors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  })

  app.setGlobalPrefix('api/v1')

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('PolicyNext API')
      .setDescription('Complete financial management API')
      .setVersion('1.0')
      .addBearerAuth()
      .addCookieAuth('access_token')
      .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api/docs', app, document)
  }

  const port = process.env.PORT || 3000
  await app.listen(port)
  console.log(`PolicyNext API running on http://localhost:${port}/api/v1`)
}

bootstrap()
