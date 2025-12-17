import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ERROR_MESSAGES } from 'src/constants';
import { DataSource, IsNull, Repository } from 'typeorm';
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
    private readonly dataSource: DataSource,
    @InjectRepository(Biker)
    private readonly bikersRepository: Repository<Biker>,
    @InjectRepository(Bike)
    private readonly bikesRepository: Repository<Bike>,
    @InjectRepository(Charge)
    private readonly chargesRepository: Repository<Charge>,
    @InjectRepository(Dock)
    private readonly docksRepository: Repository<Dock>,
    @InjectRepository(Rental)
    private readonly rentalsRepository: Repository<Rental>,
  ) {}

  async create(
    bikerId: string,
    dockSerial: string,
    bikeSerial: string,
  ): Promise<void> {
    const errors: Array<string> = [];

    if (!(await this.bikersRepository.count({ where: { id: bikerId } }))) {
      errors.push(ERROR_MESSAGES.SHARED.NOT_FOUND(Biker.name));
    } else if (
      await this.rentalsRepository
        .createQueryBuilder('rental')
        .where('rental.finishedAt = :finishedAt', { finishedAt: IsNull() })
        .andWhere('rental.bikerId = :bikerId', { bikerId })
        .getExists()
    ) {
      errors.push(ERROR_MESSAGES.BIKER.RENTING);
    }

    const dock = await this.docksRepository.findOneBy({ dockSerial });

    if (!dock) {
      errors.push(ERROR_MESSAGES.SHARED.NOT_FOUND(Dock.name));
    } else if (dock.status !== DockStatus.OCCUPIED) {
      errors.push(ERROR_MESSAGES.SHARED.INVALID_STATUS(Dock.name));
    }

    const bike = await this.bikesRepository.findOneBy({ bikeSerial });

    if (!bike) {
      errors.push(ERROR_MESSAGES.SHARED.NOT_FOUND(Bike.name));
    } else if (bike.status !== BikeStatus.AVAILABLE) {
      errors.push(ERROR_MESSAGES.SHARED.INVALID_STATUS(Bike.name));
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
  }
}
