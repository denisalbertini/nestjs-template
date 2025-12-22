import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RentalsService } from './rentals.service';

@Controller('rentals')
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @ApiBearerAuth()
  @Post()
  create(
    @Body('bikerId') bikerId: string,
    @Body('bikeSerial') bikeSerial: string,
    @Body('dockSerial') dockSerial: string,
  ) {
    return this.rentalsService.create(bikerId, bikeSerial, dockSerial);
  }

  @ApiBearerAuth()
  @Post('/return')
  postReturn(
    @Body('bikeSerial') bikeSerial: string,
    @Body('dockSerial') dockSerial: string,
  ) {
    return this.rentalsService.registerReturn(bikeSerial, dockSerial);
  }
}
