import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { CreatorsService } from './creators.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('creators')
@UseGuards(AuthGuard)
export class CreatorsController {
  constructor(private readonly creatorsService: CreatorsService) {}

  @Post()
  create(@Body() body: { username: string; monthlyPrice: number }) {
    return this.creatorsService.create(body.username, body.monthlyPrice);
  }

  @Get(':username')
  findOne(@Param('username') username: string) {
    return this.creatorsService.findByUsername(username);
  }
}
