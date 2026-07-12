import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { PoliciesService } from './policies.service'
import { CreatePolicyDto, UpdatePolicyDto, PolicyFiltersDto } from './dto/policy.dto'

@ApiTags('Policies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('policies')
export class PoliciesController {
  constructor(private service: PoliciesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all policies' })
  findAll(@CurrentUser('id') userId: string, @Query() filters: PolicyFiltersDto) {
    return this.service.findAll(userId, filters)
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get policy summary and due premiums' })
  getSummary(@CurrentUser('id') userId: string) {
    return this.service.getSummary(userId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get policy by ID' })
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.findOne(userId, id)
  }

  @Post()
  @ApiOperation({ summary: 'Create new policy' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreatePolicyDto) {
    return this.service.create(userId, dto)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update policy' })
  update(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdatePolicyDto) {
    return this.service.update(userId, id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete policy' })
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.remove(userId, id)
  }
}
