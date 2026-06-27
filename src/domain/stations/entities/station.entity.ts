import { Dock } from '@docks/entities/dock.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Station {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('char', { length: 6, unique: true })
  stationSerial!: string;

  @Column('varchar', { length: 100 })
  name!: string;

  @Column('varchar', { length: 100 })
  location!: string;

  @OneToMany(() => Dock, (dock) => dock.station)
  docks?: Dock[];
}
