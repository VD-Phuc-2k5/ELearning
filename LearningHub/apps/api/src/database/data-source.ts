import { DataSource } from "typeorm";
import * as dotenv from 'dotenv';

dotenv.config({ path: 'apps/api/.env' });

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    entities: ['apps/api/src/**/*.entity.ts'],
    migrations: ['apps/api/src/migrations/*.ts'],
});