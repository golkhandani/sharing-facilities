import { Module } from '@nestjs/common';
import { MongoModule } from 'nest-mongodb';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Facility, Room } from './models/room';

@Module({
  imports: [
    MongoModule.forRoot('mongodb://localhost:27017', 'SharingFacility'),
    MongoModule.forFeature([Facility.name, Room.name])
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
