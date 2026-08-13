import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { PrismaModule } from './prisma/prisma.module'
import { EmailModule } from './email/email.module'
import { SmsModule } from './sms/sms.module'
import { AuthModule } from './auth/auth.module'
import { PoliciesModule } from './policies/policies.module'
import { InvestmentsModule } from './investments/investments.module'
import { LoansModule } from './loans/loans.module'
import { BeneficiariesModule } from './beneficiaries/beneficiaries.module'
import { NotificationsModule } from './notifications/notifications.module'
import { DocumentsModule } from './documents/documents.module'
import { DashboardModule } from './dashboard/dashboard.module'
import { ReportsModule } from './reports/reports.module'
import { CatalogModule } from './catalog/catalog.module'
import { EventsModule } from './events/events.module'
import { StorageModule } from './storage/storage.module'
import { JwtAuthGuard } from './common/guards/jwt-auth.guard'
import { GlobalExceptionFilter } from './common/filters/http-exception.filter'
import { ResponseInterceptor } from './common/interceptors/response.interceptor'

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    PrismaModule,
    EmailModule,
    SmsModule,
    AuthModule,
    PoliciesModule,
    InvestmentsModule,
    LoansModule,
    BeneficiariesModule,
    NotificationsModule,
    DocumentsModule,
    DashboardModule,
    ReportsModule,
    CatalogModule,
    EventsModule,
    StorageModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}
