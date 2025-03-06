import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { RolesGuard } from 'src/config/guard/roles/roles.guard';
import { Roles } from 'src/config/guard/roles/roles.decorator';
import { CreateCompanyUseCase } from '../../application/use-cases/create-company.use-case';
import { UpdateCompanyUseCase } from '../../application/use-cases/update-company.use-case';
import { DeleteCompanyUseCase } from '../../application/use-cases/delete-company.use-case';
import { GetCompanyUseCase } from '../../application/use-cases/get-company.use-case';
import { GetCompaniesUseCase } from '../../application/use-cases/get-companies.use-case';
import { AddContractUseCase } from '../../application/use-cases/add-contract.use-case';
import { RemoveContractUseCase } from '../../application/use-cases/remove-contract.use-case';
import { CreateCompanyDto } from '../dtos/in/create-company.dto';
import { UpdateCompanyDto } from '../dtos/in/update-company.dto';
import { AddContractDto } from '../dtos/in/add-contract.dto';
import { CompanyDto } from '../dtos/out/company.dto';
import { CompaniesDto } from '../dtos/out/companies.dto';

@UseGuards(RolesGuard)
@Controller('company')
export class CompanyController {
  constructor(
    private readonly createCompanyUseCase: CreateCompanyUseCase,
    private readonly updateCompanyUseCase: UpdateCompanyUseCase,
    private readonly deleteCompanyUseCase: DeleteCompanyUseCase,
    private readonly getCompanyUseCase: GetCompanyUseCase,
    private readonly getCompaniesUseCase: GetCompaniesUseCase,
    private readonly addContractUseCase: AddContractUseCase,
    private readonly removeContractUseCase: RemoveContractUseCase
  ) {}

  @Post()
  @Roles(['admin'])
  async createCompany(@Body() createCompanyDto: CreateCompanyDto): Promise<CompanyDto> {
    const company = await this.createCompanyUseCase.execute(createCompanyDto);
    
    return plainToInstance(CompanyDto, {
      ...company,
      _id: company._id || company.id
    }, { excludeExtraneousValues: true });
  }

  @Get()
  @Roles(['admin', 'agent'])
  async getCompanies(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string
  ): Promise<CompaniesDto> {
    const result = await this.getCompaniesUseCase.execute({ page, limit, search });
    
    // Transformación para asegurar que _id esté presente en cada compañía
    const transformedResult = {
      ...result,
      companies: result.companies.map(company => ({
        ...company,
        _id: company._id || company.id  // Asegurar que _id se muestra
      }))
    };
    
    return plainToInstance(CompaniesDto, transformedResult, { excludeExtraneousValues: true });
  }

  @Get(':id')
  @Roles(['admin', 'agent'])
  async getCompany(@Param('id') id: string): Promise<CompanyDto> {
    const company = await this.getCompanyUseCase.execute(id);
    
    // Transformación más explícita para asegurar que _id está presente
    const companyDto = plainToInstance(CompanyDto, {
      ...company,
      _id: company._id || company.id  // Asegurar que _id se muestra
    }, { 
      excludeExtraneousValues: true 
    });
    
    return companyDto;
  }

  @Put(':id')
  @Roles(['admin'])
  async updateCompany(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto
  ): Promise<CompanyDto> {
    const company = await this.updateCompanyUseCase.execute(id, updateCompanyDto);
    
    return plainToInstance(CompanyDto, {
      ...company,
      _id: company._id || company.id
    }, { excludeExtraneousValues: true });
  }

  @Delete(':id')
  @Roles(['admin'])
  async deleteCompany(@Param('id') id: string): Promise<{ success: boolean }> {
    const result = await this.deleteCompanyUseCase.execute(id);
    return { success: result };
  }

  @Post(':id/contract')
  @Roles(['admin'])
  async addContract(
    @Param('id') id: string,
    @Body() addContractDto: AddContractDto
  ): Promise<CompanyDto> {
    const company = await this.addContractUseCase.execute(id, addContractDto);
    
    return plainToInstance(CompanyDto, {
      ...company,
      _id: company._id || company.id
    }, { excludeExtraneousValues: true });
  }

  @Delete(':id/contract/:contractId')
  @Roles(['admin'])
  async removeContract(
    @Param('id') id: string,
    @Param('contractId') contractId: string
  ): Promise<CompanyDto> {
    const company = await this.removeContractUseCase.execute(id, contractId);
    
    return plainToInstance(CompanyDto, {
      ...company,
      _id: company._id || company.id
    }, { excludeExtraneousValues: true });
  }
}