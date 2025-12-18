import { Body, Controller, Post } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { RentalsService } from './rentals.service';

@Controller('rentals')
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @Post()
  async create(
    @Body('bikerId') bikerId: string,
    @Body('bikeSerial') bikeSerial: string,
    @Body('dockSerial') dockSerial: string,
  ) {
    const rental = await this.rentalsService.create(
      bikerId,
      dockSerial,
      bikeSerial,
    );
    return instanceToPlain(rental);
  }

  @Post('/return')
  async postReturn(
    @Body('bikeSerial') bikeSerial: string,
    @Body('dockSerial') dockSerial: string,
  ) {
    const rental = await this.rentalsService.registerReturn(
      bikeSerial,
      dockSerial,
    );
    return instanceToPlain(rental);
  }
}
