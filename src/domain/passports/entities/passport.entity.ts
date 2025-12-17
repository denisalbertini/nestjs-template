import { ApiHideProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Biker } from 'src/domain/bikers/entities/biker.entity';
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
  id: string;

  @Column('varchar', { length: 9, unique: true })
  passportNumber: string;

  @Column('char', { length: 3 })
  countryCode: string;

  @Column('timestamptz')
  @Transform(({ value }) => value.toISOString(), { toPlainOnly: true })
  expirationDate: Date;

  @ApiHideProperty()
  @OneToOne(() => Biker, (biker) => biker.passport, { nullable: false })
  @JoinColumn()
  biker: Biker;
}
