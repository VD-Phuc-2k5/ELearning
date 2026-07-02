import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedForumPermissions1784000000002 implements MigrationInterface {
  name = 'SeedForumPermissions1784000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "permissions" ("code", "name", "description", "resource", "action")
      VALUES
        ('forums:get',      'Xem diễn đàn',       'Xem danh sách và chi tiết diễn đàn',  'forums',      'get'),
        ('forums:create',   'Tạo diễn đàn',       'Tạo diễn đàn mới',                     'forums',      'create'),
        ('forums:update',   'Cập nhật diễn đàn',  'Chỉnh sửa diễn đàn',                   'forums',      'update'),
        ('forums:delete',   'Xóa diễn đàn',       'Xóa diễn đàn',                         'forums',      'delete'),
        ('forum_tags:get',    'Xem tag diễn đàn',     'Xem danh sách tag',                   'forum_tags',    'get'),
        ('forum_tags:create', 'Tạo tag diễn đàn',     'Tạo tag mới',                         'forum_tags',    'create'),
        ('forum_tags:update', 'Cập nhật tag diễn đàn','Chỉnh sửa tag',                       'forum_tags',    'update'),
        ('forum_tags:delete', 'Xóa tag diễn đàn',     'Xóa tag',                             'forum_tags',    'delete'),
        ('posts:get',      'Xem bài viết đã lưu','Xem danh sách bookmark',               'posts',        'get'),
        ('posts:create',   'Lưu bài viết',        'Bookmark bài viết',                    'posts',        'create'),
        ('posts:delete',   'Bỏ lưu bài viết',     'Bỏ bookmark bài viết',                 'posts',        'delete'),
        ('me:get',         'Xem thông tin cá nhân','Xem notification và bookmark cá nhân','me',           'get'),
        ('me:update',      'Cập nhật cá nhân',     'Đánh dấu đã đọc notification',        'me',           'update'),
        ('me:delete',      'Xóa thông báo đã đọc', 'Xóa các thông báo đã đọc',            'me',           'delete'),
        ('reports:create', 'Tạo báo cáo',          'Báo cáo nội dung vi phạm',             'reports',      'create'),
        ('invites:create', 'Chấp nhận lời mời',    'Chấp nhận lời mời tham gia diễn đàn',  'invites',      'create')
      ON CONFLICT ("code") DO NOTHING
    `);

    await queryRunner.query(`
      INSERT INTO "role_permissions" ("role_id", "permission_id")
      SELECT r.id, p.id
      FROM "roles" r CROSS JOIN "permissions" p
      WHERE r.code = 'STUDENT'
        AND p.code IN (
          'forums:get', 'forums:create',
          'forum_tags:get',
          'posts:get', 'posts:create', 'posts:delete',
          'me:get', 'me:update', 'me:delete',
          'reports:create',
          'invites:create'
        )
        AND NOT EXISTS (
          SELECT 1 FROM "role_permissions" rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
        )
    `);

    await queryRunner.query(`
      INSERT INTO "role_permissions" ("role_id", "permission_id")
      SELECT r.id, p.id
      FROM "roles" r CROSS JOIN "permissions" p
      WHERE r.code IN ('OWNER', 'ADMIN')
        AND (p.code LIKE 'forums:%' OR p.code LIKE 'forum_tags:%' OR p.code LIKE 'posts:%' OR p.code LIKE 'me:%' OR p.code LIKE 'reports:%' OR p.code LIKE 'invites:%')
        AND NOT EXISTS (
          SELECT 1 FROM "role_permissions" rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
        )
    `);

    await queryRunner.query(`
      INSERT INTO "role_permissions" ("role_id", "permission_id")
      SELECT r.id, p.id
      FROM "roles" r CROSS JOIN "permissions" p
      WHERE r.code = 'INSTRUCTOR'
        AND p.code IN (
          'forums:get', 'forums:create',
          'forum_tags:get',
          'posts:get', 'posts:create', 'posts:delete',
          'me:get', 'me:update', 'me:delete',
          'reports:create',
          'invites:create'
        )
        AND NOT EXISTS (
          SELECT 1 FROM "role_permissions" rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "permissions"
      WHERE code IN (
        'forums:get','forums:create','forums:update','forums:delete',
        'forum_tags:get','forum_tags:create','forum_tags:update','forum_tags:delete',
        'posts:get','posts:create','posts:delete',
        'me:get','me:update','me:delete',
        'reports:create',
        'invites:create'
      )
    `);
  }
}
