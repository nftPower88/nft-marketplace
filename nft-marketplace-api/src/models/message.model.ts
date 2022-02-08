import {model, property} from '@loopback/repository';
import { BaseEntity } from '.';

@model()
export class Message extends BaseEntity {

  @property({
    type: 'string',
    required: true,
  })
  text: string;

  @property({
    type: 'string',
    required: true,
    mongodb: {
      dataType: 'ObjectID'
    },

  })
  senderId: object;

  @property({
    type: 'string',
    required: true,
  })
  walletAddress: string;


  constructor(data?: Partial<Message>) {
    super(data);
  }
}

export interface MessageRelations {
  // describe navigational properties here
}

export type MessageWithRelations = Message & MessageRelations;
