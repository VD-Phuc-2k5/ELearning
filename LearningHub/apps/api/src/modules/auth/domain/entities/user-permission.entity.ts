import { User } from "./user.entity";
import { Permission } from "./permission.entity";

export class UserPermission {
    constructor(
        public readonly id: number,
        public user: User,
        public permission: Permission,
        public isGranted: boolean,
        public grantedBy: string,
        public grantedAt: Date,
    ) { }
}