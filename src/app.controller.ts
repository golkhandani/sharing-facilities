import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, Query, Render, Res } from '@nestjs/common';
import { Collection, ObjectId } from 'mongodb';
import { InjectCollection } from 'nest-mongodb';
import { AppService } from './app.service';
import { Facility, Reservation, Room } from './models/room';
import slug from 'limax';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectCollection(Room.name) private readonly roomCollection: Collection<Room>,
    @InjectCollection(Facility.name) private readonly facilityCollection: Collection<Facility>,
    @InjectCollection(Reservation.name) private readonly reservationCollection: Collection<Reservation>
  ) { }

  @Get("faker")
  async fake() {
    const fakes = await this.facilityCollection.insertMany([
      {
        name: "Dish Washer",
        slug: slug("Dish Washer")
      },
      {
        name: "Hair Dryer",
        slug: slug("Hair Dryer")
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
    @Param() param: { room: string },
  ) {
    const room = slug(param.room);
    const exists = await this.roomCollection.findOne({ slug: room })
    if (exists) {
      return { data: exists };
    } else {
      throw new NotFoundException()
    }

  }

  @Get("rooms/:room/reservation")
  async getReserved(
    @Param() param: { room: string },
    @Query() query: { facility: string, date: Date, time?: string },
  ) {
    const room = slug(param.room);
    const mongoQuery = {
      "room.slug": room,
      "facility._id": new ObjectId(query.facility),
      ...((query.date && query.time) && {
        startDate: new Date(`${query.date}T${query.time}:00`)
      }),
      ...((query.date && !query.time) && {
        startDate: { $gte: new Date(`${query.date}T00:00:00`), $lte: new Date(`${query.date}T23:59:59`) }
      }),
    }
    const exists = await this.reservationCollection.find(mongoQuery).toArray()
    if (exists) {
      return { data: exists };
    } else {
      throw new NotFoundException()
    }
  }

  @Post("rooms/:room/reservation")
  async addReserved(
    @Param() param: { room: string },
    @Body() body: { facility: string, datetime: string, user: string },
  ) {

    const roomSlug = slug(param.room);
    const facility = await this.facilityCollection.findOne({ _id: new ObjectId(body.facility) });
    const room = await this.roomCollection.findOne({ slug: roomSlug });
    const reservation = new Reservation({
      user: body.user,
      reservedAt: new Date(),
      duration: "1 hour",
      facility: facility,
      room: room,
      startDate: new Date(body.datetime),
    })
    const mongoQuery = {
      "room.slug": reservation.room.slug,
      "facility._id": reservation.facility._id,
      "startDate": reservation.startDate
    }

    const exists = await this.reservationCollection.findOne(mongoQuery);

    if (!exists) {
      const submittedReservation = (await this.reservationCollection.insertOne(reservation)).ops[0]
      return { data: submittedReservation };
    } else {
      throw new BadRequestException()
    }



  }
}
