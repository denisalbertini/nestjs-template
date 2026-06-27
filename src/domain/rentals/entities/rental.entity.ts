import { Biker } from '@bikers/entities/biker.entity';
import { Bike } from '@bikes/entities/bike.entity';
import { Charge } from '@charges/entities/charge.entity';
import { TransformDate } from '@decorators/transformation/transform-date.decorator';
import { Dock } from '@docks/entities/dock.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Rental {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  @TransformDate()
  startedAt!: Date;

  @Column('timestamptz', { nullable: true })
  @TransformDate()
  finishedAt!: Date | null;

  @ManyToOne(() => Biker, (biker) => biker.rentals, {
    nullable: false,
    eager: true,
  })
  biker!: Biker;

  @ManyToOne(() => Bike, (bike) => bike.rentals, {
    nullable: false,
    eager: true,
    cascade: ['update'],
  })
  bike!: Bike;

  @ManyToOne(() => Dock, (dock) => dock.rentals, {
    nullable: false,
    eager: true,
    cascade: ['update'],
  })
  @JoinColumn({ name: 'rented_from_dock_id' })
  rentedFromDock!: Dock;

  @ManyToOne(() => Dock, (dock) => dock.returns, {
    eager: true,
    cascade: ['update'],
  })
  @JoinColumn({ name: 'returned_to_dock_id' })
  retunedToDock!: Dock | null;

  @OneToOne(() => Charge, { nullable: false, eager: true, cascade: ['update'] })
  @JoinColumn({ name: 'initial_charge_id' })
  initialCharge!: Charge;

  @OneToOne(() => Charge, { eager: true, cascade: ['update'] })
  @JoinColumn({ name: 'extra_charge_id' })
  extraCharge?: Charge;
}
