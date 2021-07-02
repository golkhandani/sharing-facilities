import { ObjectId } from "mongodb";

export type WithOutId<T> = Omit<T, '_id'>

export class Facility {
    _id: ObjectId;

    name: string;

    slug: string;

    constructor(data: WithOutId<Facility>) {
        return Object.assign(this, data);
    }
}

export class Room {
    _id: ObjectId;

    name: string;

    slug: string;

    roomMateNumber: number;

    facilities: Facility[];

    createdAt: Date;

    constructor(data: WithOutId<Room>) {
        return Object.assign(this, data);
    }

}