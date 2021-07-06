
import { Body, Controller, Get, Post, Param, Query, Put} from '@nestjs/common';
import { AppService } from './app.service';
import { CreateIdentityDTO } from './dto/create-identity-dto';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  
  @Get('/identity/ein/:value')
  getIdentityFromEIN(@Param('value') value: number): any {
    return this.appService.getIdentityFromEIN(value);
  }

  @Get('/identity/address/:value')
  getIdentityFromAddress(@Param('value') value: string): any {
    return this.appService.getIdentityFromAddress(value);
  }
  
  @Post('identity') 
  createIdentity(@Body() identity: CreateIdentityDTO): any {
    return this.appService.createIdentity(
                    identity.recoveryAddress,
                    identity.providers,
                    identity.resolvers);
  }

  @Put('identity/providers/add')
  addProviders(@Body() identity: CreateIdentityDTO): any {
    return this.appService.addProviders(identity.providers);
  }

  @Put('identity/providers/remove')
  removeProviders(@Body() identity: CreateIdentityDTO): any {
    return this.appService.removeProviders(identity.providers);
  }



  @Get()
  getHello(): any {
    return this.appService.getHello();
  }
}
