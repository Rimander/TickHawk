import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CompanyRepository } from '../../domain/ports/company.repository';
import { CompanyEntity } from '../../domain/entities/company.entity';
import { ContractEntity } from '../../domain/entities/contract.entity';
import { Company, CompanyDocument } from '../schemas/company.schema';
import { NotFoundException } from 'src/common/exceptions';

@Injectable()
export class MongoCompanyRepository implements CompanyRepository {
  private readonly logger = new Logger(MongoCompanyRepository.name);

  constructor(
    @InjectModel(Company.name) private readonly companyModel: Model<CompanyDocument>,
  ) {}

  /**
   * Maps a Mongoose document to a domain entity
   */
  private mapToDomainEntity(companyDoc: any): CompanyEntity {
    if (!companyDoc) return null;

    // Convert Mongoose document to plain object if it's not already
    const company = companyDoc.toObject ? companyDoc.toObject() : companyDoc;

    return new CompanyEntity({
      id: company._id.toString(),
      _id: company._id.toString(), // Explícitamente establecer _id también
      name: company.name,
      email: company.email,
      contracts: company.contracts?.map(contract => new ContractEntity({
        id: contract._id.toString(),
        name: contract.name,
        hours: contract.hours,
        type: contract.type as 'infinite' | 'one-time' | 'recurring',
        startDate: contract.startDate,
        endDate: contract.endDate,
        status: contract.status as 'active' | 'inactive' | 'finished',
        created_at: contract.created_at
      })) || [],
      createdAt: company.createdAt,
      updatedAt: company.updatedAt
    });
  }

  async create(company: CompanyEntity): Promise<CompanyEntity> {
    try {
      const newCompany = new this.companyModel({
        name: company.name,
        email: company.email,
        contracts: company.contracts || []
      });

      const savedCompany = await newCompany.save();
      return this.mapToDomainEntity(savedCompany);
    } catch (error) {
      this.logger.error(`Error creating company: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findById(id: string): Promise<CompanyEntity | null> {
    try {
      const company = await this.companyModel.findById(new Types.ObjectId(id));
      return company ? this.mapToDomainEntity(company) : null;
    } catch (error) {
      this.logger.error(`Error finding company by ID ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(options?: { page?: number; limit?: number; search?: string }): Promise<{ 
    companies: CompanyEntity[]; 
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const page = options?.page || 1;
      const limit = options?.limit || 10;
      const skip = (page - 1) * limit;
      
      // Build query
      const query: any = {};
      if (options?.search) {
        query.$or = [
          { name: { $regex: options.search, $options: 'i' } },
          { email: { $regex: options.search, $options: 'i' } }
        ];
      }

      // Run queries in parallel
      const [companies, total] = await Promise.all([
        this.companyModel.find(query).skip(skip).limit(limit).sort({ name: 1 }),
        this.companyModel.countDocuments(query)
      ]);

      return {
        companies: companies.map(company => this.mapToDomainEntity(company)),
        total,
        page,
        limit
      };
    } catch (error) {
      this.logger.error(`Error finding companies: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, companyData: Partial<CompanyEntity>): Promise<CompanyEntity | null> {
    try {
      const company = await this.companyModel.findById(new Types.ObjectId(id));
      
      if (!company) {
        return null;
      }

      if (companyData.name) company.name = companyData.name;
      if (companyData.email) company.email = companyData.email;
      
      const updatedCompany = await company.save();
      return this.mapToDomainEntity(updatedCompany);
    } catch (error) {
      this.logger.error(`Error updating company ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.companyModel.deleteOne({ _id: new Types.ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      this.logger.error(`Error deleting company ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async addContract(companyId: string, contract: ContractEntity): Promise<CompanyEntity | null> {
    try {
      const company = await this.companyModel.findById(new Types.ObjectId(companyId));
      
      if (!company) {
        return null;
      }

      company.contracts.push({
        name: contract.name,
        hours: contract.hours,
        type: contract.type,
        startDate: contract.startDate,
        endDate: contract.endDate,
        status: contract.status,
        created_at: new Date()
      } as any);

      const updatedCompany = await company.save();
      return this.mapToDomainEntity(updatedCompany);
    } catch (error) {
      this.logger.error(`Error adding contract to company ${companyId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async removeContract(companyId: string, contractId: string): Promise<CompanyEntity | null> {
    try {
      const company = await this.companyModel.findById(new Types.ObjectId(companyId));
      
      if (!company) {
        return null;
      }

      const contractIndex = company.contracts.findIndex(
        c => c._id.toString() === contractId
      );

      if (contractIndex === -1) {
        throw new NotFoundException('Contract not found', 'CONTRACT_NOT_FOUND');
      }

      company.contracts.splice(contractIndex, 1);
      const updatedCompany = await company.save();
      
      return this.mapToDomainEntity(updatedCompany);
    } catch (error) {
      this.logger.error(`Error removing contract ${contractId} from company ${companyId}: ${error.message}`, error.stack);
      throw error;
    }
  }
}