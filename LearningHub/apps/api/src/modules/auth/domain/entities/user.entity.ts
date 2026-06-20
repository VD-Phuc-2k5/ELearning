export class User {
    constructor(
        public readonly id: string,
        public email: string,
        private password: string,
        public username: string,
        public avatarUrl: string,
        public isActive: boolean,
        public readonly createdAt: Date,
        public updatedAt: Date,
        public lockedAt: Date | null,
    ) { }

    getPassword(): string {
        return this.password;
    }
}
