import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as PDFDocument from 'pdfkit';
import { PrismaService } from './prisma.service'; // Подключаем сервис Prisma

@Injectable()
export class GeneratePdfService {
  constructor(private readonly prisma: PrismaService) {}

  async generatePDF(checkId: number): Promise<string> {
    const check = await this.prisma.check.findUnique({
      where: { id: checkId },
      include: {
        product: {
          include: {
            maker: true,
          },
        },
        distributor: true,
        maker: true,
        diler: true,
      },
    });
    
    let type

    switch (check.type) {
      case 'SALE':
        type = 'договор на продажу товаров';
        break;
      case 'RECEPTION':
        type = 'договор на приём товаров';
        break;
    }

    const doc = new PDFDocument();
    const filename = path.join(__dirname, '..', '..', 'uploads', `${checkId}.pdf`);
    const stream = fs.createWriteStream(filename);

    doc.pipe(stream);
    const fontPath = path.join(__dirname, '..', '..', 'fonts', 'arial.ttf');
    doc.font(fontPath);

    doc.fontSize(14).text('Данные чека:', { align: 'center', lineGap: 20 });

    doc.fontSize(12).text(`Количество продукта: ${check.productQuantity}`);
    doc.fontSize(12).text(`Дата: ${check.date}`);

    doc.fontSize(14).text('Информация о продукте:', { align: 'center', lineGap: 20 });
    doc.fontSize(12).text(`Наименование продукта: ${check.product.name}`);
    doc.fontSize(12).text(`Цена продукта: ${check.product.price}`);

    doc.fontSize(14).text('Информация о дистрибьюторе:', { align: 'center', lineGap: 20 });
    doc.fontSize(12).text(`Имя: ${check.distributor.name}`);
    doc.fontSize(12).text(`Фамилия: ${check.distributor.lastname}`);
    doc.fontSize(12).text(`Отчество: ${check.distributor.surname}`);
    doc.fontSize(12).text(`Юридический адрес: ${check.distributor.legalAddress}`);
    doc.fontSize(12).text(`Контактный номер: ${check.distributor.contactNumber}`);

    if (check.maker) {
      doc.fontSize(14).text('Информация о производителе:', { align: 'center', lineGap: 20 });
      doc.fontSize(12).text(`Имя: ${check.maker.name}`);
      doc.fontSize(12).text(`Фамилия: ${check.maker.lastname}`);
      doc.fontSize(12).text(`Отчество: ${check.maker.surname}`);
      doc.fontSize(12).text(`Юридический адрес: ${check.maker.legalAddress}`);
      doc.fontSize(12).text(`Контактный номер: ${check.maker.contactNumber}`);
    } else if (check.diler) {
      doc.fontSize(14).text('Информация о дилере:', { align: 'center', lineGap: 20 });
      doc.fontSize(12).text(`Имя: ${check.diler.name}`);
      doc.fontSize(12).text(`Фамилия: ${check.diler.lastname}`);
      doc.fontSize(12).text(`Отчество: ${check.diler.surname}`);
      doc.fontSize(12).text(`Юридический адрес: ${check.diler.legalAddress}`);
      doc.fontSize(12).text(`Контактный номер: ${check.diler.contactNumber}`);
    }

    doc.fontSize(14).text('Тип чека:', { align: 'center', lineGap: 20 });
    doc.fontSize(12).text(`Тип: ${type}`);

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(filename));
      stream.on('error', reject);
    });
  }
}