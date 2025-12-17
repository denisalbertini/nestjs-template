import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Public } from 'src/auth/auth.guard';
import { CreateCreditCardDto } from '../credit-cards/dto/create-credit-card.dto';
import { BikersService } from './bikers.service';
import { CreateBikerDto } from './dto/create-biker.dto';
import { UpdateBikerDto } from './dto/update-biker.dto';

@Controller('bikers')
export class BikersController {
  constructor(private readonly bikersService: BikersService) {}

  @Public()
  @Post()
  create(@Body() createBikerDto: CreateBikerDto) {
    return this.bikersService.create(createBikerDto);
  }

  @Public()
  @Get(':id/confirm')
  @HttpCode(204)
  activate(@Param('id') id: string, @Query('token') token: string) {
    return this.bikersService.activate(id, token);
  }

  @ApiBearerAuth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBikerDto: UpdateBikerDto) {
    return this.bikersService.update(id, updateBikerDto);
  }

  @ApiBearerAuth()
  @Post(':id/credit-cards')
  @HttpCode(204)
  changeCreditCard(
    @Param('id') id: string,
    @Body() createCreditCardDto: CreateCreditCardDto,
  ) {
    return this.bikersService.changeCreditCard(id, createCreditCardDto);
  }
}
