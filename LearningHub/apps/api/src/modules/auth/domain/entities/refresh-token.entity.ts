export class RefreshToken {
    constructor(
        public readonly id: string,
        public readonly tokenHash: string,
        public readonly userId: string,
        public readonly createdAt: Date,
        public readonly expiresAt: Date,
        public readonly revokedAt: Date | null,
    ) { }
}