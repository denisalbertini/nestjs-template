import { Dock } from '@docks/entities/dock.entity';
import { Rental } from '@rentals/entities/rental.entity';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BikeStatus } from '../enums/bike-status.enum';

@Entity()
export class Bike {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('char', { length: 6, unique: true })
  bikeSerial!: string;

  @Column('varchar', { length: 100 })
  brand!: string;

  @Column('varchar', { length: 100 })
  model!: string;

  @Column('int')
  manufactureYear!: number;

  @Column('enum', { enum: BikeStatus, default: BikeStatus.NEW })
  status!: BikeStatus;

  @OneToOne(() => Dock, (dock) => dock.bike)
  dock?: Dock;

  @OneToMany(() => Rental, (rental) => rental.bike)
  rentals?: Rental[];
}
