import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateForumTables1784000000001 implements MigrationInterface {
  name = 'CreateForumTables1784000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE "forum_categories" (
        "id" SERIAL NOT NULL,
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "order" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_forum_categories" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_forum_categories_slug" UNIQUE ("slug")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "forum_tags" (
        "id" SERIAL NOT NULL,
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "color" character varying,
        CONSTRAINT "PK_forum_tags" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_forum_tags_slug" UNIQUE ("slug")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "forums" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "description" text,
        "visibility" character varying NOT NULL DEFAULT 'public',
        "banner_url" character varying,
        "icon_url" character varying,
        "member_count" integer NOT NULL DEFAULT 0,
        "post_count" integer NOT NULL DEFAULT 0,
        "owner_id" uuid NOT NULL,
        "category_id" integer,
        "is_locked" boolean NOT NULL DEFAULT false,
        "search_vector" tsvector,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_forums" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_forums_slug" UNIQUE ("slug"),
        CONSTRAINT "FK_forums_owner" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION,
        CONSTRAINT "FK_forums_category" FOREIGN KEY ("category_id") REFERENCES "forum_categories"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "forum_rules" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "forum_id" uuid NOT NULL,
        "title" character varying NOT NULL,
        "body" text NOT NULL,
        "order" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_forum_rules" PRIMARY KEY ("id"),
        CONSTRAINT "FK_forum_rules_forum" FOREIGN KEY ("forum_id") REFERENCES "forums"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "forum_members" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "forum_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "role" character varying NOT NULL DEFAULT 'member',
        "joined_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_forum_members" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_forum_members_forum_user" UNIQUE ("forum_id", "user_id"),
        CONSTRAINT "FK_forum_members_forum" FOREIGN KEY ("forum_id") REFERENCES "forums"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_forum_members_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "forum_invites" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "forum_id" uuid NOT NULL,
        "inviter_id" uuid NOT NULL,
        "invitee_id" uuid,
        "token" character varying NOT NULL,
        "status" character varying NOT NULL DEFAULT 'pending',
        "expires_at" TIMESTAMP NOT NULL,
        CONSTRAINT "PK_forum_invites" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_forum_invites_token" UNIQUE ("token"),
        CONSTRAINT "FK_forum_invites_forum" FOREIGN KEY ("forum_id") REFERENCES "forums"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_forum_invites_inviter" FOREIGN KEY ("inviter_id") REFERENCES "users"("id") ON DELETE NO ACTION,
        CONSTRAINT "FK_forum_invites_invitee" FOREIGN KEY ("invitee_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "forum_join_requests" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "forum_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "status" character varying NOT NULL DEFAULT 'pending',
        "message" text,
        "reviewed_by" uuid,
        "reviewed_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_forum_join_requests" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_forum_join_requests_forum_user" UNIQUE ("forum_id", "user_id"),
        CONSTRAINT "FK_forum_join_requests_forum" FOREIGN KEY ("forum_id") REFERENCES "forums"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_forum_join_requests_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_forum_join_requests_reviewer" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "forum_posts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "forum_id" uuid NOT NULL,
        "author_id" uuid NOT NULL,
        "title" character varying NOT NULL,
        "content" jsonb,
        "post_type" character varying NOT NULL DEFAULT 'text',
        "status" character varying NOT NULL DEFAULT 'published',
        "is_pinned" boolean NOT NULL DEFAULT false,
        "is_locked" boolean NOT NULL DEFAULT false,
        "comment_count" integer NOT NULL DEFAULT 0,
        "reaction_count" integer NOT NULL DEFAULT 0,
        "view_count" integer NOT NULL DEFAULT 0,
        "roadmap_id" uuid,
        "question_bank_id" uuid,
        "search_vector" tsvector,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_forum_posts" PRIMARY KEY ("id"),
        CONSTRAINT "FK_forum_posts_forum" FOREIGN KEY ("forum_id") REFERENCES "forums"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_forum_posts_author" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE NO ACTION,
        CONSTRAINT "FK_forum_posts_roadmap" FOREIGN KEY ("roadmap_id") REFERENCES "roadmaps"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_forum_posts_question_bank" FOREIGN KEY ("question_bank_id") REFERENCES "question_banks"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "forum_post_tags" (
        "post_id" uuid NOT NULL,
        "tag_id" integer NOT NULL,
        CONSTRAINT "PK_forum_post_tags" PRIMARY KEY ("post_id", "tag_id"),
        CONSTRAINT "FK_forum_post_tags_post" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_forum_post_tags_tag" FOREIGN KEY ("tag_id") REFERENCES "forum_tags"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "forum_post_attachments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "post_id" uuid NOT NULL,
        "file_url" character varying NOT NULL,
        "file_name" character varying NOT NULL,
        "file_type" character varying,
        "file_size" integer,
        CONSTRAINT "PK_forum_post_attachments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_forum_post_attachments_post" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "forum_drafts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "author_id" uuid NOT NULL,
        "forum_id" uuid,
        "title" character varying,
        "content" jsonb,
        "post_type" character varying NOT NULL DEFAULT 'text',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_forum_drafts" PRIMARY KEY ("id"),
        CONSTRAINT "FK_forum_drafts_author" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_forum_drafts_forum" FOREIGN KEY ("forum_id") REFERENCES "forums"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "forum_polls" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "post_id" uuid NOT NULL,
        "question" character varying NOT NULL,
        "ends_at" TIMESTAMP,
        "is_multiple_choice" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_forum_polls" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_forum_polls_post" UNIQUE ("post_id"),
        CONSTRAINT "FK_forum_polls_post" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "forum_poll_options" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "poll_id" uuid NOT NULL,
        "text" character varying NOT NULL,
        "vote_count" integer NOT NULL DEFAULT 0,
        "display_order" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_forum_poll_options" PRIMARY KEY ("id"),
        CONSTRAINT "FK_forum_poll_options_poll" FOREIGN KEY ("poll_id") REFERENCES "forum_polls"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "forum_poll_votes" (
        "poll_id" uuid NOT NULL,
        "option_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        CONSTRAINT "PK_forum_poll_votes" PRIMARY KEY ("poll_id", "option_id", "user_id"),
        CONSTRAINT "FK_forum_poll_votes_poll" FOREIGN KEY ("poll_id") REFERENCES "forum_polls"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_forum_poll_votes_option" FOREIGN KEY ("option_id") REFERENCES "forum_poll_options"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_forum_poll_votes_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "forum_comments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "post_id" uuid NOT NULL,
        "author_id" uuid NOT NULL,
        "parent_id" uuid,
        "depth" smallint NOT NULL DEFAULT 0,
        "content" text NOT NULL,
        "status" character varying NOT NULL DEFAULT 'published',
        "reply_count" integer NOT NULL DEFAULT 0,
        "reaction_count" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_forum_comments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_forum_comments_post" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_forum_comments_author" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE NO ACTION,
        CONSTRAINT "FK_forum_comments_parent" FOREIGN KEY ("parent_id") REFERENCES "forum_comments"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "forum_reactions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "target_type" character varying NOT NULL,
        "target_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "emoji" character varying NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_forum_reactions" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_forum_reactions_target_user" UNIQUE ("target_type", "target_id", "user_id"),
        CONSTRAINT "FK_forum_reactions_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "forum_bookmarks" (
        "user_id" uuid NOT NULL,
        "post_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_forum_bookmarks" PRIMARY KEY ("user_id", "post_id"),
        CONSTRAINT "FK_forum_bookmarks_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_forum_bookmarks_post" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "forum_follows" (
        "user_id" uuid NOT NULL,
        "forum_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_forum_follows" PRIMARY KEY ("user_id", "forum_id"),
        CONSTRAINT "FK_forum_follows_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_forum_follows_forum" FOREIGN KEY ("forum_id") REFERENCES "forums"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "forum_mentions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "post_id" uuid,
        "comment_id" uuid,
        "mentioned_user_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_forum_mentions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_forum_mentions_post" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_forum_mentions_comment" FOREIGN KEY ("comment_id") REFERENCES "forum_comments"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_forum_mentions_user" FOREIGN KEY ("mentioned_user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "forum_notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "recipient_id" uuid NOT NULL,
        "actor_id" uuid,
        "type" character varying NOT NULL,
        "target_type" character varying,
        "target_id" uuid,
        "metadata" jsonb,
        "is_read" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_forum_notifications" PRIMARY KEY ("id"),
        CONSTRAINT "FK_forum_notifications_recipient" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_forum_notifications_actor" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "forum_reports" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "reporter_id" uuid NOT NULL,
        "target_type" character varying NOT NULL,
        "target_id" uuid NOT NULL,
        "reason" character varying NOT NULL,
        "description" text,
        "status" character varying NOT NULL DEFAULT 'pending',
        "resolved_by" uuid,
        "resolution_note" text,
        "resolved_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_forum_reports" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_forum_reports_reporter_target" UNIQUE ("reporter_id", "target_type", "target_id"),
        CONSTRAINT "FK_forum_reports_reporter" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_forum_reports_resolver" FOREIGN KEY ("resolved_by") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "forum_moderation_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "moderator_id" uuid NOT NULL,
        "action" character varying NOT NULL,
        "target_type" character varying,
        "target_id" uuid,
        "reason_code" character varying,
        "reason_text" text,
        "forum_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_forum_moderation_logs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_forum_moderation_logs_moderator" FOREIGN KEY ("moderator_id") REFERENCES "users"("id") ON DELETE NO ACTION,
        CONSTRAINT "FK_forum_moderation_logs_forum" FOREIGN KEY ("forum_id") REFERENCES "forums"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_forum_rules_forum" ON "forum_rules" ("forum_id", "order");
      CREATE INDEX "IDX_forum_members_forum" ON "forum_members" ("forum_id");
      CREATE INDEX "IDX_forum_members_user" ON "forum_members" ("user_id");
      CREATE INDEX "IDX_forum_invites_forum" ON "forum_invites" ("forum_id");
      CREATE INDEX "IDX_forum_join_requests_forum" ON "forum_join_requests" ("forum_id", "status");
      CREATE INDEX "IDX_forum_posts_forum_status_created" ON "forum_posts" ("forum_id", "status", "created_at" DESC);
      CREATE INDEX "IDX_forum_posts_author" ON "forum_posts" ("author_id");
      CREATE INDEX "IDX_forum_post_attachments_post" ON "forum_post_attachments" ("post_id");
      CREATE INDEX "IDX_forum_poll_options_poll" ON "forum_poll_options" ("poll_id", "display_order");
      CREATE INDEX "IDX_forum_comments_post_depth_created" ON "forum_comments" ("post_id", "depth", "created_at");
      CREATE INDEX "IDX_forum_comments_parent" ON "forum_comments" ("parent_id");
      CREATE INDEX "IDX_forum_reactions_target" ON "forum_reactions" ("target_type", "target_id");
      CREATE INDEX "IDX_forum_mentions_user" ON "forum_mentions" ("mentioned_user_id");
      CREATE INDEX "IDX_forum_notifications_recipient_read_created" ON "forum_notifications" ("recipient_id", "is_read", "created_at" DESC);
      CREATE INDEX "IDX_forum_reports_status" ON "forum_reports" ("status");
      CREATE INDEX "IDX_forum_moderation_logs_forum" ON "forum_moderation_logs" ("forum_id", "created_at" DESC);
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_forums_search" ON "forums" USING GIN ("search_vector");`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_forum_posts_search" ON "forum_posts" USING GIN ("search_vector");`,
    );

    await queryRunner.query(`
      CREATE FUNCTION forums_search_vector_update() RETURNS trigger AS $$
      BEGIN
        NEW.search_vector := setweight(to_tsvector('simple', coalesce(NEW.name, '')), 'A') ||
                             setweight(to_tsvector('simple', coalesce(NEW.description, '')), 'B');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE TRIGGER forums_search_vector_trigger
      BEFORE INSERT OR UPDATE ON "forums"
      FOR EACH ROW EXECUTE FUNCTION forums_search_vector_update();
    `);

    await queryRunner.query(`
      UPDATE "forums" SET search_vector = search_vector;
    `);

    await queryRunner.query(`
      CREATE FUNCTION forum_posts_search_vector_update() RETURNS trigger AS $$
      BEGIN
        NEW.search_vector := setweight(to_tsvector('simple', coalesce(NEW.title, '')), 'A');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE TRIGGER forum_posts_search_vector_trigger
      BEFORE INSERT OR UPDATE ON "forum_posts"
      FOR EACH ROW EXECUTE FUNCTION forum_posts_search_vector_update();
    `);

    await queryRunner.query(`
      UPDATE "forum_posts" SET search_vector = search_vector;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_forum_moderation_logs_forum";`);
    await queryRunner.query(`DROP INDEX "IDX_forum_reports_status";`);
    await queryRunner.query(
      `DROP INDEX "IDX_forum_notifications_recipient_read_created";`,
    );
    await queryRunner.query(`DROP INDEX "IDX_forum_mentions_user";`);
    await queryRunner.query(`DROP INDEX "IDX_forum_reactions_target";`);
    await queryRunner.query(`DROP INDEX "IDX_forum_comments_parent";`);
    await queryRunner.query(
      `DROP INDEX "IDX_forum_comments_post_depth_created";`,
    );
    await queryRunner.query(`DROP INDEX "IDX_forum_poll_options_poll";`);
    await queryRunner.query(`DROP INDEX "IDX_forum_post_attachments_post";`);
    await queryRunner.query(`DROP INDEX "IDX_forum_posts_author";`);
    await queryRunner.query(
      `DROP INDEX "IDX_forum_posts_forum_status_created";`,
    );
    await queryRunner.query(`DROP INDEX "IDX_forum_join_requests_forum";`);
    await queryRunner.query(`DROP INDEX "IDX_forum_invites_forum";`);
    await queryRunner.query(`DROP INDEX "IDX_forum_members_user";`);
    await queryRunner.query(`DROP INDEX "IDX_forum_members_forum";`);
    await queryRunner.query(`DROP INDEX "IDX_forum_rules_forum";`);
    await queryRunner.query(`DROP INDEX "IDX_forum_posts_search";`);
    await queryRunner.query(`DROP INDEX "IDX_forums_search";`);

    await queryRunner.query(
      `DROP TRIGGER forum_posts_search_vector_trigger ON "forum_posts";`,
    );
    await queryRunner.query(
      `DROP FUNCTION "forum_posts_search_vector_update";`,
    );
    await queryRunner.query(
      `DROP TRIGGER forums_search_vector_trigger ON "forums";`,
    );
    await queryRunner.query(`DROP FUNCTION "forums_search_vector_update";`);

    await queryRunner.query(`DROP TABLE "forum_moderation_logs";`);
    await queryRunner.query(`DROP TABLE "forum_reports";`);
    await queryRunner.query(`DROP TABLE "forum_notifications";`);
    await queryRunner.query(`DROP TABLE "forum_mentions";`);
    await queryRunner.query(`DROP TABLE "forum_follows";`);
    await queryRunner.query(`DROP TABLE "forum_bookmarks";`);
    await queryRunner.query(`DROP TABLE "forum_reactions";`);
    await queryRunner.query(`DROP TABLE "forum_comments";`);
    await queryRunner.query(`DROP TABLE "forum_poll_votes";`);
    await queryRunner.query(`DROP TABLE "forum_poll_options";`);
    await queryRunner.query(`DROP TABLE "forum_polls";`);
    await queryRunner.query(`DROP TABLE "forum_drafts";`);
    await queryRunner.query(`DROP TABLE "forum_post_attachments";`);
    await queryRunner.query(`DROP TABLE "forum_post_tags";`);
    await queryRunner.query(`DROP TABLE "forum_posts";`);
    await queryRunner.query(`DROP TABLE "forum_join_requests";`);
    await queryRunner.query(`DROP TABLE "forum_invites";`);
    await queryRunner.query(`DROP TABLE "forum_members";`);
    await queryRunner.query(`DROP TABLE "forum_rules";`);
    await queryRunner.query(`DROP TABLE "forums";`);
    await queryRunner.query(`DROP TABLE "forum_tags";`);
    await queryRunner.query(`DROP TABLE "forum_categories";`);
  }
}
