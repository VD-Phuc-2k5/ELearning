export class Role {
    constructor(
        public readonly id: number,
        public code: string,
        public name: string,
        public description: string,
        public readonly createdAt: Date,
        public updatedAt: Date,
    ) { }
}