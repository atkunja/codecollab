import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppGateway } from './app.gateway';
import { RoomController } from './room.controller';

@Module({
  imports: [],
  controllers: [AppController, RoomController],
  providers: [AppService, AppGateway],
})
export class AppModule {}
