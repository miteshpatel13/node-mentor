#!/usr/bin/env bash
set -euo pipefail
mkdir -p src/orders/dto src/auth src/payments test
cat > package.json <<'EOF'
{ "name": "shop-api", "scripts": { "test": "jest", "test:e2e": "jest --config ./test/jest-e2e.json" },
  "dependencies": { "@nestjs/common": "^10.0.0", "@nestjs/core": "^10.0.0", "@nestjs/platform-express": "^10.0.0", "@nestjs/typeorm": "^10.0.0", "typeorm": "^0.3.20", "class-validator": "^0.14.1", "class-transformer": "^0.5.1" },
  "devDependencies": { "@nestjs/testing": "^10.0.0", "jest": "^29.5.0", "ts-jest": "^29.1.0", "supertest": "^7.0.0", "typescript": "^5.1.3" },
  "jest": { "rootDir": "src", "testRegex": ".*\\.spec\\.ts$", "transform": { "^.+\\.ts$": "ts-jest" } } }
EOF
cat > src/main.ts <<'EOF'
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  await app.listen(3000);
}
bootstrap();
EOF
cat > src/auth/current-user.decorator.ts <<'EOF'
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export interface AuthUser { id: string; role: 'customer' | 'admin'; }
export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): AuthUser => ctx.switchToHttp().getRequest().user);
EOF
cat > src/orders/order.entity.ts <<'EOF'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() customerId: string;
  @Column('numeric') total: string;
  @Column() status: 'pending' | 'paid' | 'shipped';
  @Column({ nullable: true }) invoiceNumber: string | null;
  @Column({ type: 'timestamptz', nullable: true }) paidAt: Date | null;
}
EOF
cat > src/orders/orders.service.ts <<'EOF'
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUser } from '../auth/current-user.decorator';
import { Order } from './order.entity';

@Injectable()
export class OrdersService {
  constructor(@InjectRepository(Order) private readonly orders: Repository<Order>) {}

  async findOneForUser(id: string, user: AuthUser): Promise<Order> {
    const order = await this.orders.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    if (user.role !== 'admin' && order.customerId !== user.id) throw new ForbiddenException();
    return order;
  }
}
EOF
cat > src/orders/orders.controller.ts <<'EOF'
import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(AuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return this.ordersService.findOneForUser(id, user);
  }
}
EOF
cat > src/orders/orders.service.spec.ts <<'EOF'
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  const repo = { findOne: jest.fn() };
  let service: OrdersService;
  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      providers: [OrdersService, { provide: getRepositoryToken(Order), useValue: repo }],
    }).compile();
    service = mod.get(OrdersService);
    jest.resetAllMocks();
  });
  it('returns the order to its owner', async () => {
    repo.findOne.mockResolvedValue({ id: 'o1', customerId: 'u1' });
    await expect(service.findOneForUser('o1', { id: 'u1', role: 'customer' })).resolves.toMatchObject({ id: 'o1' });
  });
  it('404s when missing', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOneForUser('o1', { id: 'u1', role: 'customer' })).rejects.toBeInstanceOf(NotFoundException);
  });
  it("forbids another customer's order", async () => {
    repo.findOne.mockResolvedValue({ id: 'o1', customerId: 'u2' });
    await expect(service.findOneForUser('o1', { id: 'u1', role: 'customer' })).rejects.toBeInstanceOf(ForbiddenException);
  });
});
EOF
cat > src/orders/orders.module.ts <<'EOF'
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), PaymentsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
EOF

cat > src/payments/payments.module.ts <<'EOF'
import { Module } from '@nestjs/common';
@Module({})
export class PaymentsModule {}
EOF
