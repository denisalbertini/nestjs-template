import { Body, Controller, Post } from '@nestjs/common';
import { RentalsService } from './rentals.service';

@Controller('rentals')
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @Post()
  create(
    @Body('bikerId') bikerId: string,
    @Body('bikeSerial') bikeSerial: string,
    @Body('dockSerial') dockSerial: string,
  ) {
    return this.rentalsService.create(bikerId, bikeSerial, dockSerial);
  }

  @Post('/return')
  postReturn(
    @Body('bikeSerial') bikeSerial: string,
    @Body('dockSerial') dockSerial: string,
  ) {
    return this.rentalsService.registerReturn(bikeSerial, dockSerial);
  }
}
