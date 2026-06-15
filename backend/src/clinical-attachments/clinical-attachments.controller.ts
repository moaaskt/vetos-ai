import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as express from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ClinicalAttachmentsService } from './clinical-attachments.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class ClinicalAttachmentsController {
  constructor(
    private readonly clinicalAttachmentsService: ClinicalAttachmentsService,
  ) {}

  @Post('pets/:petId/attachments')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, callback) => {
        const allowedMimes = [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'image/webp',
        ];
        if (!allowedMimes.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              'Formato de arquivo inválido. Apenas PDF, JPEG, PNG e WEBP são permitidos.',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async upload(
    @CurrentUser() user: any,
    @Param('petId') petId: string,
    @UploadedFile() file: any, // Express.Multer.File
    @Body('clinicalRecordId') clinicalRecordId?: string,
    @Body('notes') notes?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado ou limite de tamanho excedido.');
    }

    const attachment = await this.clinicalAttachmentsService.create(
      user.clinicId,
      petId,
      {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer,
      },
      user.id,
      clinicalRecordId,
      notes,
    );

    // Converte BigInt para Number antes de retornar
    return {
      ...attachment,
      fileSize: Number(attachment.fileSize),
    };
  }

  @Get('pets/:petId/attachments')
  async list(@CurrentUser() user: any, @Param('petId') petId: string) {
    return this.clinicalAttachmentsService.findAllByPet(user.clinicId, petId);
  }

  @Get('attachments/:id/download')
  async download(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Res() res: express.Response,
  ) {
    const { stream, mimeType, originalFileName } =
      await this.clinicalAttachmentsService.getDownloadStream(user.clinicId, id);

    // Garante caracteres seguros para download
    const safeName = encodeURIComponent(originalFileName);

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${safeName}"`,
    });

    stream.pipe(res);
  }

  @Delete('attachments/:id')
  @HttpCode(HttpStatus.OK)
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.clinicalAttachmentsService.remove(user.clinicId, id);
  }
}
