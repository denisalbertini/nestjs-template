import { ApiHideProperty } from '@nestjs/swagger';
import { Biker } from 'src/domain/bikers/entities/biker.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CreditCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 19, unique: true })
  creditCardNumber: string;

  @Column('varchar', { length: 100 })
  holderName: string;

  @Column('char', { length: 5 })
  expirationDate: string;

  @ApiHideProperty()
  @OneToMany(() => Biker, biker => biker.creditCard)
  bikers: Biker[];
}
