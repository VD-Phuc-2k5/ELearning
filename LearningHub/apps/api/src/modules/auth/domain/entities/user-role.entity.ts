import { Role } from "./role.entity";
import { User } from "./user.entity";

export class UserRole {
    constructor(
        public readonly id: number,
        public user: User,
        public role: Role,
        public assignedBy: string,
        public assignedAt: Date,
    ) { }
}