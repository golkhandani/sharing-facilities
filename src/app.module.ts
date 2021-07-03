import { Module } from '@nestjs/common';
import { MongoModule } from 'nest-mongodb';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Facility, Reservation, Room } from './models/room';

@Module({
  imports: [
    MongoModule.forRoot('mongodb+srv://m001-student:m001-mongodb-basics@cluster0.k5tdu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', 'SharingFacility'),
    MongoModule.forFeature([Facility.name, Room.name, Reservation.name])
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
