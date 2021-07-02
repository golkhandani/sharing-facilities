import { Body, Controller, Get, NotFoundException, Param, Post, Render, Res } from '@nestjs/common';
import { Collection } from 'mongodb';
import { InjectCollection } from 'nest-mongodb';
import { AppService } from './app.service';
import { Facility, Room } from './models/room';
import slug from 'limax';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectCollection(Room.name) private readonly roomCollection: Collection<Room>,
    @InjectCollection(Facility.name) private readonly facilityCollection: Collection<Facility>
  ) { }

  @Get("faker")
  async fake() {
    const fakes = await this.facilityCollection.insertMany([
      {
        name: "Shower",
        slug: slug("Shower"),
      },
      {
        name: "Washing machine",
        slug: slug("Washing machine")
      }
    ])
    return fakes;
  }

  @Get()
  @Render("pages/home")
  home() {
    return;
  }


  @Post()
  async createRoom(
    @Body() body: { "room": string }
  ) {
    const room = slug(body.room);
    const exists = await this.roomCollection.findOne({ slug: room });

    if (exists) {
      return { error: { room: "Can't create room! please set another name!" } };
    } else {
      const newRoom = new Room({
        name: body.room,
        slug: room,
        facilities: await this.facilityCollection.find().toArray(),
        roomMateNumber: 2,
        createdAt: new Date(),
      });
      const submittedRoom = await this.roomCollection.insertOne(newRoom);
      return { data: submittedRoom }
    }

  }

  @Get("rooms/:room")
  @Render("pages/room")
  async getRoom(
    @Param() param: { "room": string },
  ) {
    const room = slug(param.room);
    const exists = await this.roomCollection.findOne({ slug: room })
    if (exists) {
      return { data: exists };
    } else {
      throw new NotFoundException()
    }

  }
}
