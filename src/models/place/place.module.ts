import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Place, User } from '../../entities';
import { PlaceService } from './place.service';
import { PlaceResolver } from './place.resolver';
import { CloudinaryModule } from '../../cloudinary/cloudinary.module';

@Module({
  imports: [TypeOrmModule.forFeature([Place, User]), CloudinaryModule],
  providers: [PlaceService, PlaceResolver],
  exports: [PlaceService],
})
export class PlaceModule {}
