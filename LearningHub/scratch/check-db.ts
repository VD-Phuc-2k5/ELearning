import { Client } from 'pg';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(process.cwd(), 'apps/api/.env') });

async function run() {
  const client = new Client({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || '123456',
    database: process.env.POSTGRES_DB || 'dev_learning_hub',
  });

  await client.connect();
  const res = await client.query(
    'SELECT id, name, slug, visibility FROM forums;',
  );
  console.log('--- FORUMS IN DATABASE ---');
  console.log(res.rows);
  await client.end();
}

run().catch(console.error);
