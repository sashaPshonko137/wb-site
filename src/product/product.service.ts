import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/utils/prisma.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ProductService {
  constructor(private db: PrismaService, private userService: UserService) {}
  async create(createProductDto: CreateProductDto) {
    const user = await this.userService.findOne(createProductDto.makerId);
    if (user.role != 'MAKER') {
      throw new BadRequestException('User is not a MAKER');
    }
    const product = await this.db.product.create({ data: { name: createProductDto.name, price: createProductDto.price, makerId: createProductDto.makerId } });
    createProductDto.characteristics.forEach(async characteristic => {
      await this.db.characteristic.create({ data: { name: characteristic.name, value: characteristic.value, productId: product.id } })
      return product;
    })
  }

  async findAll() {
    return await this.db.product.findMany();
  }

  async findOne(id: number) {
    const product = await this.db.product.findFirst({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product =await this.findOne(id);
    if (updateProductDto.makerId && updateProductDto.makerId != product.makerId) {
      const user = await this.userService.findOne(updateProductDto.makerId);
      if (user.role != 'MAKER') {
        throw new BadRequestException('User is not a MAKER');
      }
    }
    return await this.db.product.update({ where: { id }, data: {name: updateProductDto.name, price: updateProductDto.price, makerId: updateProductDto.makerId} });
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.db.product.delete({ where: { id } });
  }
}
