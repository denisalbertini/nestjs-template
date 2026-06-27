import { Bike } from '@bikes/entities/bike.entity';
import { Rental } from '@rentals/entities/rental.entity';
import { Station } from '@stations/entities/station.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DockStatus } from '../enums/dock-status.enum';

@Entity()
export class Dock {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('char', { length: 6, unique: true })
  dockSerial!: string;

  @Column('varchar', { length: 100 })
  model!: string;

  @Column('timestamptz')
  manufactureDate!: Date;

  @Column('enum', { enum: DockStatus, default: DockStatus.OPERATIONAL })
  status!: DockStatus;

  @OneToOne(() => Bike, (bike) => bike.dock)
  @JoinColumn()
  bike?: Bike;

  @ManyToOne(() => Station, (station) => station.docks)
  station?: Station;

  @OneToMany(() => Rental, (rental) => rental.rentedFromDock)
  rentals?: Rental[];

  @OneToMany(() => Rental, (rental) => rental.retunedToDock)
  returns?: Rental[];
}
