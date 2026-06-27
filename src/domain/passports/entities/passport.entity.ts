import { Biker } from '@bikers/entities/biker.entity';
import { TransformDate } from '@decorators/transformation/transform-date.decorator';
import { ApiHideProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Passport {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { length: 9, unique: true })
  passportNumber!: string;

  @Column('char', { length: 3 })
  countryCode!: string;

  @Column('timestamptz')
  @TransformDate()
  expirationDate!: Date;

  @ApiHideProperty()
  @OneToOne(() => Biker, (biker) => biker.passport, { nullable: false })
  @JoinColumn()
  biker?: Biker;
}
