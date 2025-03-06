import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DepartmentRepository } from '../../domain/ports/department.repository';
import { DepartmentEntity } from '../../domain/entities/department.entity';
import { Department, DepartmentDocument } from '../schemas/department.schema';
import { User } from 'src/modules/user/schemas/user.schema';

@Injectable()
export class MongoDepartmentRepository implements DepartmentRepository {
  private readonly logger = new Logger(MongoDepartmentRepository.name);

  constructor(
    @InjectModel(Department.name) private readonly departmentModel: Model<DepartmentDocument>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  /**
   * Mapea un documento Mongoose a una entidad de dominio
   */
  private mapToDomainEntity(departmentDoc: any): DepartmentEntity {
    if (!departmentDoc) return null;

    // Convertir documento Mongoose a objeto plano si no lo es ya
    const department = departmentDoc.toObject ? departmentDoc.toObject() : departmentDoc;

    return new DepartmentEntity({
      id: department._id.toString(),
      _id: department._id.toString(), // Explícitamente establecer _id también
      name: department.name
    });
  }

  async create(department: DepartmentEntity): Promise<DepartmentEntity> {
    try {
      const newDepartment = new this.departmentModel({
        name: department.name
      });

      const savedDepartment = await newDepartment.save();
      return this.mapToDomainEntity(savedDepartment);
    } catch (error) {
      this.logger.error(`Error creating department: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findById(id: string): Promise<DepartmentEntity | null> {
    try {
      const department = await this.departmentModel.findById(new Types.ObjectId(id));
      return department ? this.mapToDomainEntity(department) : null;
    } catch (error) {
      this.logger.error(`Error finding department by ID ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(): Promise<DepartmentEntity[]> {
    try {
      const departments = await this.departmentModel.find().sort({ name: 1 });
      return departments.map(dept => this.mapToDomainEntity(dept));
    } catch (error) {
      this.logger.error(`Error finding departments: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, departmentData: Partial<DepartmentEntity>): Promise<DepartmentEntity | null> {
    try {
      const department = await this.departmentModel.findById(new Types.ObjectId(id));
      
      if (!department) {
        return null;
      }

      if (departmentData.name) department.name = departmentData.name;
      
      const updatedDepartment = await department.save();
      return this.mapToDomainEntity(updatedDepartment);
    } catch (error) {
      this.logger.error(`Error updating department ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.departmentModel.deleteOne({ _id: new Types.ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      this.logger.error(`Error deleting department ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async hasUsers(id: string): Promise<boolean> {
    try {
      const count = await this.userModel.countDocuments({
        departmentIds: new Types.ObjectId(id)
      });
      return count > 0;
    } catch (error) {
      this.logger.error(`Error checking if department ${id} has users: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getUsers(id: string): Promise<any[]> {
    try {
      return await this.userModel.find({
        departmentIds: new Types.ObjectId(id)
      }).lean();
    } catch (error) {
      this.logger.error(`Error getting users for department ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async assignUser(departmentId: string, userId: string): Promise<boolean> {
    try {
      // Verificamos que el usuario no esté ya asignado
      const alreadyAssigned = await this.userModel.findOne({
        _id: new Types.ObjectId(userId),
        departmentIds: new Types.ObjectId(departmentId)
      });

      if (alreadyAssigned) {
        return false; // Ya asignado
      }

      // Agregamos el departamento a la lista de departamentos del usuario
      const result = await this.userModel.updateOne(
        { _id: new Types.ObjectId(userId) },
        { $push: { departmentIds: new Types.ObjectId(departmentId) } }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      this.logger.error(
        `Error assigning user ${userId} to department ${departmentId}: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  async removeUser(departmentId: string, userId: string): Promise<boolean> {
    try {
      // Removemos el departamento de la lista de departamentos del usuario
      const result = await this.userModel.updateOne(
        { _id: new Types.ObjectId(userId) },
        { $pull: { departmentIds: new Types.ObjectId(departmentId) } }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      this.logger.error(
        `Error removing user ${userId} from department ${departmentId}: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }
}