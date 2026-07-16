import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Public } from '../common/decorators/public.decorator'
import { CatalogService } from './catalog.service'

@ApiTags('Catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private service: CatalogService) {}

  @Public()
  @Get()
  findAll() { return this.service.findAll() }
}
