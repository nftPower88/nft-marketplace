import {Entity, model, property} from '@loopback/repository';
import { BaseEntity } from '.';

@model()
export class User extends BaseEntity {

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  walletAddress: string;

  @property({
    type: 'string',
    default: 'https://pbs.twimg.com/profile_images/1393399819213983746/2a8l5muc_400x400.png',
  })
  image?: string;

  @property({
    type: 'boolean',
    default: false,
  })
  published?: boolean;

  @property({
    type: 'string',
  })
  background?: string;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
