const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres123',
  database: 'dev_learning_hub',
});
(async () => {
  const users = await pool.query(
    "SELECT id FROM users WHERE email LIKE '%@e2e-%'",
  );
  if (users.rows.length === 0) {
    console.log('No users');
    await pool.end();
    return;
  }
  const ids = users.rows.map((r) => "'" + r.id + "'").join(',');
  await pool.query('DELETE FROM roadmaps WHERE creator_id IN (' + ids + ')');
  await pool.query(
    'DELETE FROM question_banks WHERE uploader_id IN (' + ids + ')',
  );
  await pool.query(
    'DELETE FROM forum_mentions WHERE mentioned_user_id IN (' + ids + ')',
  );
  await pool.query(
    'DELETE FROM forum_notifications WHERE recipient_id IN (' +
      ids +
      ') OR actor_id IN (' +
      ids +
      ')',
  );
  await pool.query(
    'DELETE FROM forum_reports WHERE reporter_id IN (' +
      ids +
      ') OR resolved_by IN (' +
      ids +
      ')',
  );
  await pool.query('DELETE FROM forum_posts WHERE author_id IN (' + ids + ')');
  await pool.query(
    'DELETE FROM forum_comments WHERE author_id IN (' + ids + ')',
  );
  await pool.query('DELETE FROM forums WHERE owner_id IN (' + ids + ')');
  await pool.query(
    'DELETE FROM forum_bookmarks WHERE user_id IN (' + ids + ')',
  );
  await pool.query('DELETE FROM forum_follows WHERE user_id IN (' + ids + ')');
  await pool.query(
    'DELETE FROM forum_invites WHERE inviter_id IN (' + ids + ')',
  );
  await pool.query('DELETE FROM forum_members WHERE user_id IN (' + ids + ')');
  await pool.query(
    'DELETE FROM forum_poll_votes WHERE user_id IN (' + ids + ')',
  );
  await pool.query('DELETE FROM quiz_attempts WHERE user_id IN (' + ids + ')');
  await pool.query(
    'DELETE FROM user_bank_progress WHERE user_id IN (' + ids + ')',
  );
  await pool.query(
    'DELETE FROM user_roadmap_progress WHERE user_id IN (' + ids + ')',
  );
  await pool.query('DELETE FROM user_roles WHERE user_id IN (' + ids + ')');
  await pool.query(
    'DELETE FROM user_permissions WHERE user_id IN (' + ids + ')',
  );
  await pool.query('DELETE FROM refresh_tokens WHERE user_id IN (' + ids + ')');
  await pool.query(
    'DELETE FROM question_bank_uploads WHERE uploaded_by IN (' + ids + ')',
  );
  await pool.query("DELETE FROM users WHERE email LIKE '%@e2e-%'");
  console.log('Cleaned ' + users.rows.length + ' users');
  await pool.end();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
