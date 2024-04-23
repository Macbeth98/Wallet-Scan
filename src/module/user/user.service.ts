import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { FindAllUserDto } from './dto/findAll-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    if (createUserDto.signedup_date) {
      createUserDto.signedup_date = new Date();
    }
    return await this.userRepository.save(createUserDto);
  }

  async findAll(findAllUserDto: FindAllUserDto): Promise<User[]> {
    const { limit = 50, page = 1 } = findAllUserDto;

    const skip = limit * (page - 1);

    const query = this.userRepository.createQueryBuilder('user');

    delete findAllUserDto.limit;
    delete findAllUserDto.page;

    for (const key in findAllUserDto) {
      if (findAllUserDto[key] === undefined) {
        delete findAllUserDto[key];
      }
      query.andWhere(`user.${key} = :${key}`, { [key]: findAllUserDto[key] });
    }

    query.skip(skip);
    query.take(limit);

    return await query.getMany();
  }

  async findOne(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findOneByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findOneByUsername(username: string): Promise<User> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findOneByEmailOrUsername(email: string, username: string): Promise<User> {
    return this.userRepository.findOne({ where: [{ email }, { username }] });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    return await this.userRepository.save({ ...updateUserDto, id: Number(id) });
  }

  async remove(id: number): Promise<boolean> {
    return (await this.userRepository.delete(id)).affected > 0;
  }
}
