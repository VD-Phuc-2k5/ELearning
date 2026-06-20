import { Role } from "../entities/role.entity";

export interface IRoleRepository {
    findById(id: number): Promise<Role | null>;
    findByCode(code: string): Promise<Role | null>;
    findAll(): Promise<Role[]>;
    create(role: Role): Promise<Role>;
    update(role: Role): Promise<Role>;
    delete(id: number): Promise<void>;
}