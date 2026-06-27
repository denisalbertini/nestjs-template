import { Biker } from '@bikers/entities/biker.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Charge {
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  @Column('timestamptz')
  readonly requestedAt!: Date;

  @Column('timestamptz')
  completedAt!: Date | null;

  @Column('decimal', { precision: 10, scale: 2 })
  readonly amount: number = 10;

  @ManyToOne(() => Biker, (biker) => biker.charges, { nullable: false })
  readonly biker?: Biker;
}
