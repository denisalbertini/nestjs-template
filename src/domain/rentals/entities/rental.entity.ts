import { TransformDate } from 'src/decorators/transformation/transform-date.decorator';
import { Biker } from 'src/domain/bikers/entities/biker.entity';
import { Bike } from 'src/domain/bikes/entities/bike.entity';
import { Charge } from 'src/domain/charges/entities/charge.entity';
import { Dock } from 'src/domain/docks/entities/dock.entity';
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
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  @TransformDate()
  startedAt: Date;

  @Column('timestamptz', { nullable: true })
  @TransformDate()
  finishedAt: Date | null;

  @ManyToOne(() => Biker, (biker) => biker.rentals, { nullable: false })
  biker: Biker;

  @ManyToOne(() => Bike, (bike) => bike.rentals, { nullable: false })
  bike: Bike;

  @ManyToOne(() => Dock, (dock) => dock.rentals, { nullable: false })
  @JoinColumn({ name: 'rented_from_dock_id' })
  rentedFromDock: Dock;

  @ManyToOne(() => Dock, (dock) => dock.returns)
  @JoinColumn({ name: 'returned_to_dock_id' })
  retunedToDock: Dock | null;

  @OneToOne(() => Charge, (charge) => charge.rentals, { nullable: false })
  @JoinColumn({ name: 'initial_charge_id' })
  initialCharge: Charge;

  @OneToOne(() => Charge, (charge) => charge.extras)
  @JoinColumn({ name: 'extra_charge_id' })
  extraCharge?: Charge;
}
