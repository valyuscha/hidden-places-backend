import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Place, User } from '../../entities';
import { CreatePlaceInput } from '../../dto';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

@Injectable()
export class PlaceService {
  constructor(
    @InjectRepository(Place)
    private readonly placeRepo: Repository<Place>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(data: CreatePlaceInput): Promise<Place> {
    try {
      const user = await this.userRepo.findOneByOrFail({id: data.createdById});

      const place = this.placeRepo.create({
        ...data,
        createdBy: user,
      });

      console.log('[SUCCESSFULY CREATED PLACE]');
      return this.placeRepo.save(place);
    } catch (error) {
      console.log('[CREATE PLACE ERROR]: ', error);
      return error;
    }
  }

  async findAll(
    limit = 9,
    offset = 0,
    search?: string,
    tags?: string[],
  ): Promise<Place[]> {
    const query = this.placeRepo
      .createQueryBuilder('place')
      .leftJoinAndSelect('place.comments', 'comment')
      .leftJoinAndSelect('comment.user', 'commentUser')
      .leftJoinAndSelect('place.createdBy', 'createdBy')
      .orderBy('place.createdAt', 'DESC')
      .skip(offset)
      .take(limit);

    if (search) {
      query.andWhere('LOWER(place.title) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    if (tags?.length) {
      query.andWhere(':tags && place.tags', { tags });
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<Place> {
    const place = await this.placeRepo.findOne({
      where: { id },
      relations: ['comments', 'comments.user'],
    });

    if (!place) throw new NotFoundException(`Place with ID ${id} not found`);
    return place;
  }

  async update(id: number, data: Partial<Place>): Promise<Place> {
    await this.placeRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const place = await this.placeRepo.findOneBy({ id });

    if (!place) throw new NotFoundException('Place not found');

    if (place.imagePublicId) {
      await this.cloudinaryService.deleteImage(place.imagePublicId);
    }

    await this.placeRepo.delete(id);
  }
}
