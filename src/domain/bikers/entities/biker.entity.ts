import bcrypt from 'bcryptjs';
import { TransformDate } from 'src/decorators/transformation/transform-date.decorator';
import { Charge } from 'src/domain/charges/entities/charge.entity';
import { CreditCard } from 'src/domain/credit-cards/entities/credit-card.entity';
import { Passport } from 'src/domain/passports/entities/passport.entity';
import { Rental } from 'src/domain/rentals/entities/rental.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BikerStatus } from '../enums/biker-status.enum';

@Entity()
export class Biker {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('char', { length: 11, unique: true, nullable: true })
  cpf?: string;

  @Column('varchar', { length: 100 })
  name: string;

  @Column('timestamptz')
  @TransformDate()
  birthDate: Date;

  @Column({ unique: true })
  email: string;

  @Column('char', { length: 60 })
  password: string;

  @Column('enum', { enum: BikerStatus, default: BikerStatus.PENDING })
  status: BikerStatus;

  @ManyToOne(() => CreditCard, (creditCard) => creditCard.bikers, {
    nullable: false,
  })
  creditCard: CreditCard;

  @OneToOne(() => Passport, (passport) => passport.biker, {
    eager: true,
    cascade: true,
  })
  passport?: Passport;

  @OneToMany(() => Charge, (charge) => charge.biker)
  charges: Charge[];

  @OneToMany(() => Rental, (rental) => rental.biker)
  rentals: Rental[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  papersPlease() {
    let errorMessage = '';

    if (this.cpf && this.passport) {
      errorMessage = 'Biker cannot have both cpf and passport';
    } else if (!this.cpf && !this.passport) {
      errorMessage = 'Biker must have either cpf or passport';
    }

    if (errorMessage) {
      throw new Error(errorMessage);
    }
  }
}
