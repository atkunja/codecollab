import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppGateway } from './app.gateway';
import { RoomController } from './room.controller'; // If you have this

@Module({
  imports: [],
  controllers: [AppController, RoomController], // Add RoomController if you have one
  providers: [AppService, AppGateway],
})
export class AppModule {}
