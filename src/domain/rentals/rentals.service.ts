import { Biker } from '@bikers/entities/biker.entity';
import { Bike } from '@bikes/entities/bike.entity';
import { BikeStatus } from '@bikes/enums/bike-status.enum';
import { Charge } from '@charges/entities/charge.entity';
import { ERROR_MESSAGES } from '@constants';
import { Dock } from '@docks/entities/dock.entity';
import { DockStatus } from '@docks/enums/dock-status.enum';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransformInstanceToPlain } from 'class-transformer';
import { DataSource, IsNull, Repository } from 'typeorm';
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
    @InjectRepository(Charge)
    private readonly chargesRepository: Repository<Charge>,
    @InjectRepository(Rental)
    private readonly rentalsRepository: Repository<Rental>,
    private readonly dataSource: DataSource,
  ) {}

  @TransformInstanceToPlain()
  async create(
    bikerId: string,
    bikeSerial: string,
    dockSerial: string,
  ): Promise<Rental> {
    const errorMessages: string[] = [];

    const biker = await this.bikersRepository.findOneBy({ id: bikerId });

    let chargeRequestedAt: Date;

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
      chargeRequestedAt = new Date();
    }

    const bike = await this.bikesRepository.findOneBy({ bikeSerial });

    let rentalBike: Bike;

    if (!bike) {
      errorMessages.push(ERROR_MESSAGES.SHARED.NOT_FOUND(Bike.name));
    } else if (bike.status !== BikeStatus.AVAILABLE) {
      errorMessages.push(ERROR_MESSAGES.SHARED.INVALID_STATUS(Bike.name));
    } else {
      bike.status = BikeStatus.RENTED;
      rentalBike = bike;
    }

    const dock = await this.docksRepository.findOneBy({ dockSerial });

    let rentalPerformedFrom: Dock;

    if (!dock) {
      errorMessages.push(ERROR_MESSAGES.SHARED.NOT_FOUND(Dock.name));
    } else if (dock.status !== DockStatus.OCCUPIED) {
      errorMessages.push(ERROR_MESSAGES.SHARED.INVALID_STATUS(Dock.name));
    } else {
      dock.status = DockStatus.AVAILABLE;
      rentalPerformedFrom = dock;
    }

    if (errorMessages.length > 0) {
      throw new BadRequestException(errorMessages);
    }

    const charge = this.chargesRepository.create({
      requestedAt: chargeRequestedAt!,
      biker: biker!,
    });

    // Should have payment service right here
    charge.completedAt = new Date();

    const rental = this.rentalsRepository.create({
      biker: biker!,
      bike: bike!,
      rentedFromDock: rentalPerformedFrom!,
    });

    return await this.dataSource.transaction(async (manager) => {
      const savedCharge = await manager.save(charge);

      rental.initialCharge = savedCharge;

      return await manager.save(rental);
    });
  }

  @TransformInstanceToPlain()
  async registerReturn(
    bikeSerial: string,
    dockSerial: string,
  ): Promise<Rental> {
    const errorMessages: Array<string> = [];

    const rental = await this.rentalsRepository.findOne({
      where: { finishedAt: IsNull(), bike: { bikeSerial } },
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

    const elapsedHours =
      (Date.now() - rental!.startedAt.getTime()) / (1000 * 60 * 60);

    let extraCharge: Charge | null = null;

    if (elapsedHours > 2) {
      const extraAmount = Math.ceil((elapsedHours - 2) / 0.5) * 5;

      extraCharge = this.chargesRepository.create({
        requestedAt: new Date(),
        amount: extraAmount,
        biker: rental!.biker,
      });

      // Should have payment service right here
      extraCharge.completedAt = new Date();
    }

    dock!.status = DockStatus.OCCUPIED;
    rental!.bike.status = BikeStatus.AVAILABLE;
    rental!.retunedToDock = dock;
    rental!.finishedAt = new Date();

    return await this.dataSource.transaction(async (manager) => {
      await manager.save(dock);

      if (extraCharge) {
        const savedCharged = await manager.save(extraCharge);

        rental!.extraCharge = savedCharged;
      }

      return await manager.save(rental!);
    });
  }
}
