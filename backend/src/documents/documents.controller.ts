import {
  Controller, Get, Post, Delete, Body, Param, Query,
  UseInterceptors, UploadedFile, HttpCode, HttpStatus,
  StreamableFile, Res, ParseFilePipe, MaxFileSizeValidator,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger'
import type { Response } from 'express'
import { DocumentsService } from './documents.service'
import { UploadDocumentDto, DocumentFiltersDto } from './dto/document.dto'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@ApiTags('Documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentsController {
  constructor(private service: DocumentsService) {}

  @Get()
  findAll(@CurrentUser('id') uid: string, @Query() filters: DocumentFiltersDto) {
    return this.service.findAll(uid, filters)
  }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @CurrentUser('id') uid: string,
    @UploadedFile(new ParseFilePipe({ validators: [new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })] }))
    file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
  ) {
    return this.service.upload(uid, file, dto)
  }

  @Get(':id/download')
  async download(
    @CurrentUser('id') uid: string,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { doc, stream } = await this.service.downloadFile(uid, id)
    res.set({
      'Content-Type': doc.mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(doc.name)}"`,
      'X-Content-Type-Options': 'nosniff',
    })
    return new StreamableFile(stream)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@CurrentUser('id') uid: string, @Param('id') id: string) {
    return this.service.remove(uid, id)
  }
}
