import { Transform } from 'class-transformer';
import { Biker } from 'src/domain/bikers/entities/biker.entity';
import { Rental } from 'src/domain/rentals/entities/rental.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Charge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  @Transform(({ value }) => value.toISOString(), { toPlainOnly: true })
  requestedAt: Date;

  @Column('timestamptz')
  @Transform(({ value }) => value.toISOString(), { toPlainOnly: true })
  completedAt: Date | null;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @ManyToOne(() => Biker, (biker) => biker.charges, { nullable: false })
  biker: Biker;

  @OneToOne(() => Rental, (rental) => rental.initialCharge)
  rentals: Rental[];

  @OneToOne(() => Rental, (rental) => rental.extraCharge)
  extras: Rental[];
}
