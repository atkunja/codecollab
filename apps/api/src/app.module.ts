import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppGateway } from './app.gateway';
import { RoomController } from './room.controller'; // <-- this should match the filename

@Module({
  imports: [],
  controllers: [AppController, RoomController], // <-- add RoomController here
  providers: [AppService, AppGateway],
})
export class AppModule {}
