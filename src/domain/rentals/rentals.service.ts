import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransformInstanceToPlain } from 'class-transformer';
import { ERROR_MESSAGES } from 'src/constants';
import { IsNull, Repository } from 'typeorm';
import { Biker } from '../bikers/entities/biker.entity';
import { Bike } from '../bikes/entities/bike.entity';
import { BikeStatus } from '../bikes/enums/bike-status.enum';
import { Charge } from '../charges/entities/charge.entity';
import { Dock } from '../docks/entities/dock.entity';
import { DockStatus } from '../docks/enums/dock-status.enum';
import { Rental } from './entities/rental.entity';

@Injectable()
export class RentalsService {
  constructor(
    @InjectRepository(Biker)
    private readonly bikersRepository: Repository<Biker>,
    @InjectRepository(Bike)
    private readonly bikesRepository: Repository<Bike>,
    @InjectRepository(Dock)
    private readonly docksRepository: Repository<Dock>,
    @InjectRepository(Rental)
    private readonly rentalsRepository: Repository<Rental>,
  ) {}

  @TransformInstanceToPlain()
  async create(
    bikerId: string,
    bikeSerial: string,
    dockSerial: string,
  ): Promise<Rental> {
    const charge = new Charge();
    const rental = new Rental();

    const errorMessages: Array<string> = [];

    const biker = await this.bikersRepository.findOneBy({ id: bikerId });

    if (!biker) {
      errorMessages.push(ERROR_MESSAGES.SHARED.NOT_FOUND(Biker.name));
    } else if (
      await this.rentalsRepository
        .createQueryBuilder('rental')
        .where('rental.finished_at IS NULL')
        .andWhere('rental.biker_id = :bikerId', { bikerId })
        .getExists()
    ) {
      errorMessages.push(ERROR_MESSAGES.BIKER.RENTING);
    } else {
      charge.requestedAt = new Date();
      charge.biker = biker;
      rental.biker = biker;
    }

    const bike = await this.bikesRepository.findOneBy({ bikeSerial });

    if (!bike) {
      errorMessages.push(ERROR_MESSAGES.SHARED.NOT_FOUND(Bike.name));
    } else if (bike.status !== BikeStatus.AVAILABLE) {
      errorMessages.push(ERROR_MESSAGES.SHARED.INVALID_STATUS(Bike.name));
    } else {
      bike.status = BikeStatus.RENTED;
      rental.bike = bike;
    }

    const dock = await this.docksRepository.findOneBy({ dockSerial });

    if (!dock) {
      errorMessages.push(ERROR_MESSAGES.SHARED.NOT_FOUND(Dock.name));
    } else if (dock.status !== DockStatus.OCCUPIED) {
      errorMessages.push(ERROR_MESSAGES.SHARED.INVALID_STATUS(Dock.name));
    } else {
      dock.status = DockStatus.AVAILABLE;
      rental.rentedFromDock = dock;
    }

    if (errorMessages.length > 0) {
      throw new BadRequestException(errorMessages);
    }

    // Should have payment service right here
    charge.completedAt = new Date();

    rental.initialCharge = charge;

    return await this.rentalsRepository.save(rental);
  }

  @TransformInstanceToPlain()
  async registerReturn(
    bikeSerial: string,
    dockSerial: string,
  ): Promise<Rental> {
    const errorMessages: Array<string> = [];

    const rental = await this.rentalsRepository.findOne({
      where: { finishedAt: IsNull(), bike: { bikeSerial } },
      relations: { biker: true, bike: true },
    });

    if (!rental) {
      errorMessages.push(ERROR_MESSAGES.SHARED.NOT_FOUND(Rental.name));
    }

    const dock = await this.docksRepository.findOneBy({ dockSerial });

    if (!dock) {
      errorMessages.push(ERROR_MESSAGES.SHARED.NOT_FOUND(Dock.name));
    } else if (dock.status !== DockStatus.AVAILABLE) {
      errorMessages.push(ERROR_MESSAGES.SHARED.INVALID_STATUS(Dock.name));
    }

    if (errorMessages.length > 0) {
      throw new BadRequestException(errorMessages);
    }

    if (!rental || !dock) {
      throw new InternalServerErrorException(
        'Unexpected null values after validation',
      );
    }

    const elapsedHours =
      (Date.now() - rental.startedAt.getTime()) / (1000 * 60 * 60);

    if (elapsedHours > 2) {
      const extraAmount = Math.ceil((elapsedHours - 2) / 0.5) * 5;

      const extraCharge = new Charge();
      extraCharge.requestedAt = new Date();
      extraCharge.amount = extraAmount;
      extraCharge.biker = rental.biker;

      // Should have payment service right here
      extraCharge.completedAt = new Date();

      rental.extraCharge = extraCharge;
    }

    dock.status = DockStatus.OCCUPIED;
    rental.bike.status = BikeStatus.AVAILABLE;
    rental.retunedToDock = dock;
    rental.finishedAt = new Date();

    return await this.rentalsRepository.save(rental);
  }
}
