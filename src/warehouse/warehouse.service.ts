import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { PrismaService } from 'src/utils/prisma.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class WarehouseService {
  constructor(private db: PrismaService, private userService: UserService) {}
  async create(createWarehouseDto: CreateWarehouseDto) {
    const user = await this.userService.findOne(createWarehouseDto.distributorId);
    if (user.role != 'DISTRIBUTOR') {
      throw new BadRequestException('User is not a DISTRIBUTOR');
    }
    return await this.db.warehouse.create({ data: createWarehouseDto });
  }

  async findAll() {
    return await this.db.warehouse.findMany();
  }

  async findOne(id: number) {
    const warehouse = await this.db.warehouse.findFirst({ where: { id } });
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }
    return warehouse;
  }

  async update(id: number, updateWarehouseDto: UpdateWarehouseDto) {
    const warehouse = await this.findOne(id);
    if (warehouse.distributorId && warehouse.distributorId != updateWarehouseDto.distributorId) {
      const user =await this.userService.findOne(updateWarehouseDto.distributorId);
      if (user.role != 'DISTRIBUTOR') {
        throw new BadRequestException('User is not a DISTRIBUTOR');
      }
    }
    return await this.db.warehouse.update({ where: { id }, data: updateWarehouseDto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.db.warehouse.delete({ where: { id } });
  }
}
