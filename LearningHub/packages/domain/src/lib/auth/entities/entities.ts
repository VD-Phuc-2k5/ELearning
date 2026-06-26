export interface User {
    readonly id: string;
    readonly email: string;
    readonly username: string;
    readonly roles?: Role[];
}

export interface Role {
    readonly id: number;
    readonly code: string;
    readonly name: string;
}

export interface Permission {
    readonly id: number;
    readonly code: string;
    readonly name: string;
}
