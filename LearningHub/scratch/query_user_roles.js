const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'dev_learning_hub',
  password: '123456',
  port: 5432,
});

async function main() {
  await client.connect();
  try {
    const userId = '7319c6b7-fea2-466a-95fe-613fe31daee8'; // hoquocnam92@gmail.com

    // Check if role is already assigned
    const checkRes = await client.query(
      'SELECT * FROM user_roles WHERE user_id = $1 AND role_id = 1',
      [userId],
    );

    if (checkRes.rows.length === 0) {
      await client.query(
        'INSERT INTO user_roles (user_id, role_id, "assignedAt") VALUES ($1, 1, NOW())',
        [userId],
      );
      console.log('Successfully promoted hoquocnam92@gmail.com to OWNER!');
    } else {
      console.log('hoquocnam92@gmail.com is already OWNER!');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

main();
