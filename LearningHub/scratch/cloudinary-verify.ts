import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(process.cwd(), 'apps/api/.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function run() {
  console.log('Testing Cloudinary config with:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
  });

  try {
    const res = await cloudinary.api.ping();
    console.log('✅ Cloudinary Ping Response:', res);
  } catch (err) {
    console.error('❌ Cloudinary Ping Failed:', err);
  }
}

run();
