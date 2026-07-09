import { Column, Index } from 'typeorm';

import { BaseEntity } from './base.entity';

/**
 * Persistence model for business entities that track the acting user.
 *
 * Adds nullable UUID audit columns without foreign-key relations.
 * Relations to the User entity will be introduced when that module exists.
 */
export abstract class AuditableEntity extends BaseEntity {
  @Index()
  @Column({
    name: 'created_by',
    type: 'char',
    length: 36,
    nullable: true,
  })
  createdBy!: string | null;

  @Index()
  @Column({
    name: 'updated_by',
    type: 'char',
    length: 36,
    nullable: true,
  })
  updatedBy!: string | null;

  @Index()
  @Column({
    name: 'deleted_by',
    type: 'char',
    length: 36,
    nullable: true,
  })
  deletedBy!: string | null;
}
