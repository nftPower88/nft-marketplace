import {Entity, model, property} from '@loopback/repository';


export abstract class BaseEntity extends Entity {

  @property({
    type: 'string',
    id: true,
    mongodb: {
      dataType: 'ObjectID'
    }
  })
  id?: string;

  @property({
    type: 'number',
    required: true,
  })
  createdBy: number;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  createdOn?: Date;

  @property({
    type: 'number',
  })
  updatedBy?: number;

  @property({
    type: 'date',
  })
  updatedOn?: Date;


  @property({
    type: 'string',
  })
  updatedByName?: string;

  @property({
    type: 'boolean',
    default: false,
  })
  deleted?: boolean;

  @property({
    type: 'date',
    jsonSchema: {
      nullable: true,
    },
  })
  deletedOn?: Date;

  @property({
    type: 'string',
    jsonSchema: {
      nullable: true,
    },
  })
  deletedBy?: string;

}

