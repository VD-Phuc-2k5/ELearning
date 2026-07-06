import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTagCreatedBy1784000000009 implements MigrationInterface {
  name = 'AddTagCreatedBy1784000000009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "forums" DROP CONSTRAINT "FK_forums_owner"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_posts" DROP CONSTRAINT "FK_forum_posts_roadmap"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_posts" DROP CONSTRAINT "FK_forum_posts_author"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_posts" DROP CONSTRAINT "FK_forum_posts_forum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_posts" DROP CONSTRAINT "FK_forum_posts_question_bank"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_bookmarks" DROP CONSTRAINT "FK_forum_bookmarks_post"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_bookmarks" DROP CONSTRAINT "FK_forum_bookmarks_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_comments" DROP CONSTRAINT "FK_forum_comments_parent"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_comments" DROP CONSTRAINT "FK_forum_comments_author"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_comments" DROP CONSTRAINT "FK_forum_comments_post"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_follows" DROP CONSTRAINT "FK_forum_follows_forum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_follows" DROP CONSTRAINT "FK_forum_follows_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_invites" DROP CONSTRAINT "FK_forum_invites_invitee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_invites" DROP CONSTRAINT "FK_forum_invites_inviter"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_invites" DROP CONSTRAINT "FK_forum_invites_forum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_members" DROP CONSTRAINT "FK_forum_members_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_members" DROP CONSTRAINT "FK_forum_members_forum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_mentions" DROP CONSTRAINT "FK_forum_mentions_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_mentions" DROP CONSTRAINT "FK_forum_mentions_comment"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_mentions" DROP CONSTRAINT "FK_forum_mentions_post"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_notifications" DROP CONSTRAINT "FK_forum_notifications_actor"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_notifications" DROP CONSTRAINT "FK_forum_notifications_recipient"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_polls" DROP CONSTRAINT "FK_forum_polls_post"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_poll_options" DROP CONSTRAINT "FK_forum_poll_options_poll"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_poll_votes" DROP CONSTRAINT "FK_forum_poll_votes_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_poll_votes" DROP CONSTRAINT "FK_forum_poll_votes_option"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_poll_votes" DROP CONSTRAINT "FK_forum_poll_votes_poll"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_reactions" DROP CONSTRAINT "FK_forum_reactions_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_reports" DROP CONSTRAINT "FK_forum_reports_resolver"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_reports" DROP CONSTRAINT "FK_forum_reports_reporter"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_rules" DROP CONSTRAINT "FK_forum_rules_forum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempts" DROP CONSTRAINT "FK_quiz_attempts_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempts" DROP CONSTRAINT "FK_quiz_attempts_bank"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempt_answers" DROP CONSTRAINT "FK_quiz_attempt_answers_question"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempt_answers" DROP CONSTRAINT "FK_quiz_attempt_answers_option"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempt_answers" DROP CONSTRAINT "FK_quiz_attempt_answers_attempt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_bank_progress" DROP CONSTRAINT "FK_user_bank_progress_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_bank_progress" DROP CONSTRAINT "FK_user_bank_progress_bank"`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmaps" DROP CONSTRAINT "FK_roadmaps_creator"`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmap_items" DROP CONSTRAINT "FK_roadmap_items_roadmap"`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmap_items" DROP CONSTRAINT "FK_roadmap_items_bank"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" DROP CONSTRAINT "FK_user_roadmap_progress_roadmap"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" DROP CONSTRAINT "FK_user_roadmap_progress_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" DROP CONSTRAINT "FK_user_roadmap_progress_last_bank"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" DROP CONSTRAINT "FK_user_roadmap_progress_current_bank"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_tags" DROP CONSTRAINT "FK_0080ed5370dd9cb8fe58893bf0a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_tags" DROP CONSTRAINT "FK_e96d0df5c99e347a42d29948354"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_post_tags" DROP CONSTRAINT "FK_forum_post_tags_tag"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_post_tags" DROP CONSTRAINT "FK_forum_post_tags_post"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_forums_search"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_forum_posts_forum_status_created"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_forum_posts_author"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_forum_posts_search"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_forum_comments_post_depth_created"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_forum_comments_parent"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_forum_invites_forum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_forum_members_forum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_forum_members_user"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_forum_mentions_user"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_forum_notifications_recipient_read_created"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_forum_poll_options_poll"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_forum_reactions_target"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_forum_reports_status"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_forum_rules_forum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_quiz_attempts_user_bank"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_quiz_attempts_user_created"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_quiz_attempt_answers_attempt"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_roadmaps_creator_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_roadmaps_status"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_roadmap_items_roadmap_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_forum_post_tags_post_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_forum_post_tags_tag_id"`);
    await queryRunner.query(
      `ALTER TABLE "forum_members" DROP CONSTRAINT "UQ_forum_members_forum_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_reactions" DROP CONSTRAINT "UQ_forum_reactions_target_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_reports" DROP CONSTRAINT "UQ_forum_reports_reporter_target"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_bank_progress" DROP CONSTRAINT "UQ_user_bank_progress"`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmap_items" DROP CONSTRAINT "UQ_roadmap_items_bank"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" DROP CONSTRAINT "UQ_user_roadmap_progress"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_posts" DROP COLUMN "search_vector"`,
    );
    await queryRunner.query(`ALTER TABLE "forum_tags" ADD "created_by" uuid`);
    await queryRunner.query(`ALTER TABLE "forums" DROP COLUMN "banner_url"`);
    await queryRunner.query(
      `ALTER TABLE "forums" ADD "banner_url" character varying(255)`,
    );
    await queryRunner.query(`ALTER TABLE "forums" DROP COLUMN "icon_url"`);
    await queryRunner.query(
      `ALTER TABLE "forums" ADD "icon_url" character varying(255)`,
    );
    await queryRunner.query(`ALTER TABLE "forum_tags" DROP COLUMN "color"`);
    await queryRunner.query(
      `ALTER TABLE "forum_tags" ADD "color" character varying(7)`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" ALTER COLUMN "passing_score" SET DEFAULT '60'`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_posts" DROP COLUMN "roadmap_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_posts" ADD "roadmap_id" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_invites" DROP COLUMN "invitee_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_invites" ADD "invitee_id" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_mentions" DROP COLUMN "comment_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_mentions" ADD "comment_id" character varying`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_28107daecb75fee6ad6f98dff6" ON "forums" USING gin ("search_vector") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_forum_members_forum_user" ON "forum_members"  ("forum_id", "user_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_forum_reactions_target_user" ON "forum_reactions"  ("target_type", "target_id", "user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_69a52815b2ff87be8d13b81ee1" ON "forum_post_tags"  ("post_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fa5a581850cadc0ea65cc125e1" ON "forum_post_tags"  ("tag_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "forums" ADD CONSTRAINT "FK_314f23fd56338af75150b56a030" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_posts" ADD CONSTRAINT "FK_67071706515dfcc2076ad58ec85" FOREIGN KEY ("forum_id") REFERENCES "forums"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_posts" ADD CONSTRAINT "FK_141ee222adc1090094e49486a00" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_posts" ADD CONSTRAINT "FK_2c8ed980bc89a078de103252fc3" FOREIGN KEY ("question_bank_id") REFERENCES "question_banks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_bookmarks" ADD CONSTRAINT "FK_241f9419c31f7e772751cf60651" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_bookmarks" ADD CONSTRAINT "FK_87bda613a149a12bfa73812e7f4" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_comments" ADD CONSTRAINT "FK_274dc9abde99249ab89a47789b2" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_comments" ADD CONSTRAINT "FK_8e7d4ffc2c0ccb3087e2d590c57" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_comments" ADD CONSTRAINT "FK_e7e5018020265b504f5f3fba230" FOREIGN KEY ("parent_id") REFERENCES "forum_comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_follows" ADD CONSTRAINT "FK_1199c7eb127edacdd1fb0fb7102" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_follows" ADD CONSTRAINT "FK_5f59040ba3df5800ff2f71fae16" FOREIGN KEY ("forum_id") REFERENCES "forums"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_invites" ADD CONSTRAINT "FK_5cd2fc7d54feddf43a49033212e" FOREIGN KEY ("forum_id") REFERENCES "forums"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_invites" ADD CONSTRAINT "FK_7da8d583e9fd1ed022591f47b5b" FOREIGN KEY ("inviter_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_members" ADD CONSTRAINT "FK_e948682ad2932e255251cabe014" FOREIGN KEY ("forum_id") REFERENCES "forums"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_members" ADD CONSTRAINT "FK_a8ba7fbe0a52d8cf5effcccb396" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_mentions" ADD CONSTRAINT "FK_6d5fdacaeda15b48b4667820343" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_mentions" ADD CONSTRAINT "FK_b6dcaa486cf0f0f621ec7eceb67" FOREIGN KEY ("mentioned_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_notifications" ADD CONSTRAINT "FK_29da2c723fa9e13921521a38b90" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_notifications" ADD CONSTRAINT "FK_ae3de5ca1f9d834a97d022b29c9" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_polls" ADD CONSTRAINT "FK_c5beba2fc86343db6a44031e3a1" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_poll_options" ADD CONSTRAINT "FK_7547a61b1bf3ab0491ab5f5dd8c" FOREIGN KEY ("poll_id") REFERENCES "forum_polls"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_poll_votes" ADD CONSTRAINT "FK_45a3df29984d116f2670587f89d" FOREIGN KEY ("poll_id") REFERENCES "forum_polls"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_poll_votes" ADD CONSTRAINT "FK_4aa3be28b3cac56b1b505f40bf1" FOREIGN KEY ("option_id") REFERENCES "forum_poll_options"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_poll_votes" ADD CONSTRAINT "FK_498646aee8e57d805e519d990b9" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_reports" ADD CONSTRAINT "FK_bfcd7579fa92c6c2180ec72d2d0" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_reports" ADD CONSTRAINT "FK_ec1ed85c00676620533894247d3" FOREIGN KEY ("resolved_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_rules" ADD CONSTRAINT "FK_e19a0977fdf3f701c5755003fb1" FOREIGN KEY ("forum_id") REFERENCES "forums"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempts" ADD CONSTRAINT "FK_1701aaf48f6a78e96bfe08dd395" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempts" ADD CONSTRAINT "FK_4a83f0e71278764116e60c52811" FOREIGN KEY ("question_bank_id") REFERENCES "question_banks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "FK_5637534756d07a1f243d1517c10" FOREIGN KEY ("attempt_id") REFERENCES "quiz_attempts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "FK_8aece94c843ae12e0698aa3b614" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "FK_c751cd10e70dd842ddebcfd15e9" FOREIGN KEY ("selected_option_id") REFERENCES "answer_options"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_bank_progress" ADD CONSTRAINT "FK_23dd604e6fad1632aa94e326c0d" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_bank_progress" ADD CONSTRAINT "FK_245fbe3338c97bf1c5a03d8c327" FOREIGN KEY ("question_bank_id") REFERENCES "question_banks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmaps" ADD CONSTRAINT "FK_d3f6fcd5c48ebd4940bfcbb8afb" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmap_items" ADD CONSTRAINT "FK_7e316ee924d1227bfd4062d1476" FOREIGN KEY ("roadmap_id") REFERENCES "roadmaps"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmap_items" ADD CONSTRAINT "FK_43ac131fb57225ad391d62253e9" FOREIGN KEY ("question_bank_id") REFERENCES "question_banks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" ADD CONSTRAINT "FK_52907d6297d1057593f203aed9b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" ADD CONSTRAINT "FK_918fef5517cf82309df4d4d3591" FOREIGN KEY ("roadmap_id") REFERENCES "roadmaps"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" ADD CONSTRAINT "FK_388e4326e4c6db6cb82044e1b85" FOREIGN KEY ("current_bank_id") REFERENCES "question_banks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" ADD CONSTRAINT "FK_1c5426f87cca79b85093f911d79" FOREIGN KEY ("last_accessed_bank_id") REFERENCES "question_banks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_tags" ADD CONSTRAINT "FK_e96d0df5c99e347a42d29948354" FOREIGN KEY ("question_bank_id") REFERENCES "question_banks"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_tags" ADD CONSTRAINT "FK_0080ed5370dd9cb8fe58893bf0a" FOREIGN KEY ("tag_id") REFERENCES "bank_tags"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_post_tags" ADD CONSTRAINT "FK_69a52815b2ff87be8d13b81ee1a" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_post_tags" ADD CONSTRAINT "FK_fa5a581850cadc0ea65cc125e1e" FOREIGN KEY ("tag_id") REFERENCES "forum_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "forum_post_tags" DROP CONSTRAINT "FK_fa5a581850cadc0ea65cc125e1e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_post_tags" DROP CONSTRAINT "FK_69a52815b2ff87be8d13b81ee1a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_tags" DROP CONSTRAINT "FK_0080ed5370dd9cb8fe58893bf0a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_tags" DROP CONSTRAINT "FK_e96d0df5c99e347a42d29948354"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" DROP CONSTRAINT "FK_1c5426f87cca79b85093f911d79"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" DROP CONSTRAINT "FK_388e4326e4c6db6cb82044e1b85"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" DROP CONSTRAINT "FK_918fef5517cf82309df4d4d3591"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" DROP CONSTRAINT "FK_52907d6297d1057593f203aed9b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmap_items" DROP CONSTRAINT "FK_43ac131fb57225ad391d62253e9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmap_items" DROP CONSTRAINT "FK_7e316ee924d1227bfd4062d1476"`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmaps" DROP CONSTRAINT "FK_d3f6fcd5c48ebd4940bfcbb8afb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_bank_progress" DROP CONSTRAINT "FK_245fbe3338c97bf1c5a03d8c327"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_bank_progress" DROP CONSTRAINT "FK_23dd604e6fad1632aa94e326c0d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempt_answers" DROP CONSTRAINT "FK_c751cd10e70dd842ddebcfd15e9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempt_answers" DROP CONSTRAINT "FK_8aece94c843ae12e0698aa3b614"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempt_answers" DROP CONSTRAINT "FK_5637534756d07a1f243d1517c10"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempts" DROP CONSTRAINT "FK_4a83f0e71278764116e60c52811"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempts" DROP CONSTRAINT "FK_1701aaf48f6a78e96bfe08dd395"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_rules" DROP CONSTRAINT "FK_e19a0977fdf3f701c5755003fb1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_reports" DROP CONSTRAINT "FK_ec1ed85c00676620533894247d3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_reports" DROP CONSTRAINT "FK_bfcd7579fa92c6c2180ec72d2d0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_poll_votes" DROP CONSTRAINT "FK_498646aee8e57d805e519d990b9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_poll_votes" DROP CONSTRAINT "FK_4aa3be28b3cac56b1b505f40bf1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_poll_votes" DROP CONSTRAINT "FK_45a3df29984d116f2670587f89d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_poll_options" DROP CONSTRAINT "FK_7547a61b1bf3ab0491ab5f5dd8c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_polls" DROP CONSTRAINT "FK_c5beba2fc86343db6a44031e3a1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_notifications" DROP CONSTRAINT "FK_ae3de5ca1f9d834a97d022b29c9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_notifications" DROP CONSTRAINT "FK_29da2c723fa9e13921521a38b90"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_mentions" DROP CONSTRAINT "FK_b6dcaa486cf0f0f621ec7eceb67"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_mentions" DROP CONSTRAINT "FK_6d5fdacaeda15b48b4667820343"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_members" DROP CONSTRAINT "FK_a8ba7fbe0a52d8cf5effcccb396"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_members" DROP CONSTRAINT "FK_e948682ad2932e255251cabe014"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_invites" DROP CONSTRAINT "FK_7da8d583e9fd1ed022591f47b5b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_invites" DROP CONSTRAINT "FK_5cd2fc7d54feddf43a49033212e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_follows" DROP CONSTRAINT "FK_5f59040ba3df5800ff2f71fae16"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_follows" DROP CONSTRAINT "FK_1199c7eb127edacdd1fb0fb7102"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_comments" DROP CONSTRAINT "FK_e7e5018020265b504f5f3fba230"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_comments" DROP CONSTRAINT "FK_8e7d4ffc2c0ccb3087e2d590c57"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_comments" DROP CONSTRAINT "FK_274dc9abde99249ab89a47789b2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_bookmarks" DROP CONSTRAINT "FK_87bda613a149a12bfa73812e7f4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_bookmarks" DROP CONSTRAINT "FK_241f9419c31f7e772751cf60651"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_posts" DROP CONSTRAINT "FK_2c8ed980bc89a078de103252fc3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_posts" DROP CONSTRAINT "FK_141ee222adc1090094e49486a00"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_posts" DROP CONSTRAINT "FK_67071706515dfcc2076ad58ec85"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forums" DROP CONSTRAINT "FK_314f23fd56338af75150b56a030"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fa5a581850cadc0ea65cc125e1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_69a52815b2ff87be8d13b81ee1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."UQ_forum_reactions_target_user"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."UQ_forum_members_forum_user"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_28107daecb75fee6ad6f98dff6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_mentions" DROP COLUMN "comment_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_mentions" ADD "comment_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_invites" DROP COLUMN "invitee_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_invites" ADD "invitee_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_posts" DROP COLUMN "roadmap_id"`,
    );
    await queryRunner.query(`ALTER TABLE "forum_posts" ADD "roadmap_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "question_banks" ALTER COLUMN "passing_score" SET DEFAULT 60.00`,
    );
    await queryRunner.query(`ALTER TABLE "forum_tags" DROP COLUMN "color"`);
    await queryRunner.query(
      `ALTER TABLE "forum_tags" ADD "color" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "forums" DROP COLUMN "icon_url"`);
    await queryRunner.query(
      `ALTER TABLE "forums" ADD "icon_url" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "forums" DROP COLUMN "banner_url"`);
    await queryRunner.query(
      `ALTER TABLE "forums" ADD "banner_url" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_tags" DROP COLUMN "created_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_posts" ADD "search_vector" tsvector`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" ADD CONSTRAINT "UQ_user_roadmap_progress" UNIQUE ("user_id", "roadmap_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmap_items" ADD CONSTRAINT "UQ_roadmap_items_bank" UNIQUE ("roadmap_id", "question_bank_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_bank_progress" ADD CONSTRAINT "UQ_user_bank_progress" UNIQUE ("user_id", "question_bank_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_reports" ADD CONSTRAINT "UQ_forum_reports_reporter_target" UNIQUE ("reporter_id", "target_type", "target_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_reactions" ADD CONSTRAINT "UQ_forum_reactions_target_user" UNIQUE ("target_type", "target_id", "user_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_members" ADD CONSTRAINT "UQ_forum_members_forum_user" UNIQUE ("forum_id", "user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_forum_post_tags_tag_id" ON "forum_post_tags" USING btree ("tag_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_forum_post_tags_post_id" ON "forum_post_tags" USING btree ("post_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_roadmap_items_roadmap_id" ON "roadmap_items" USING btree ("position", "roadmap_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_roadmaps_status" ON "roadmaps" USING btree ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_roadmaps_creator_id" ON "roadmaps" USING btree ("creator_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_quiz_attempt_answers_attempt" ON "quiz_attempt_answers" USING btree ("attempt_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_quiz_attempts_user_created" ON "quiz_attempts" USING btree ("created_at", "user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_quiz_attempts_user_bank" ON "quiz_attempts" USING btree ("question_bank_id", "user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_forum_rules_forum" ON "forum_rules" USING btree ("forum_id", "order") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_forum_reports_status" ON "forum_reports" USING btree ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_forum_reactions_target" ON "forum_reactions" USING btree ("target_id", "target_type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_forum_poll_options_poll" ON "forum_poll_options" USING btree ("display_order", "poll_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_forum_notifications_recipient_read_created" ON "forum_notifications" USING btree ("created_at", "is_read", "recipient_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_forum_mentions_user" ON "forum_mentions" USING btree ("mentioned_user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_forum_members_user" ON "forum_members" USING btree ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_forum_members_forum" ON "forum_members" USING btree ("forum_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_forum_invites_forum" ON "forum_invites" USING btree ("forum_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_forum_comments_parent" ON "forum_comments" USING btree ("parent_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_forum_comments_post_depth_created" ON "forum_comments" USING btree ("created_at", "depth", "post_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_forum_posts_search" ON "forum_posts" USING gin ("search_vector") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_forum_posts_author" ON "forum_posts" USING btree ("author_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_forum_posts_forum_status_created" ON "forum_posts" USING btree ("created_at", "forum_id", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_forums_search" ON "forums" USING gin ("search_vector") `,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_post_tags" ADD CONSTRAINT "FK_forum_post_tags_post" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_post_tags" ADD CONSTRAINT "FK_forum_post_tags_tag" FOREIGN KEY ("tag_id") REFERENCES "forum_tags"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_tags" ADD CONSTRAINT "FK_e96d0df5c99e347a42d29948354" FOREIGN KEY ("question_bank_id") REFERENCES "question_banks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_tags" ADD CONSTRAINT "FK_0080ed5370dd9cb8fe58893bf0a" FOREIGN KEY ("tag_id") REFERENCES "bank_tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" ADD CONSTRAINT "FK_user_roadmap_progress_current_bank" FOREIGN KEY ("current_bank_id") REFERENCES "question_banks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" ADD CONSTRAINT "FK_user_roadmap_progress_last_bank" FOREIGN KEY ("last_accessed_bank_id") REFERENCES "question_banks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" ADD CONSTRAINT "FK_user_roadmap_progress_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" ADD CONSTRAINT "FK_user_roadmap_progress_roadmap" FOREIGN KEY ("roadmap_id") REFERENCES "roadmaps"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmap_items" ADD CONSTRAINT "FK_roadmap_items_bank" FOREIGN KEY ("question_bank_id") REFERENCES "question_banks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmap_items" ADD CONSTRAINT "FK_roadmap_items_roadmap" FOREIGN KEY ("roadmap_id") REFERENCES "roadmaps"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmaps" ADD CONSTRAINT "FK_roadmaps_creator" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_bank_progress" ADD CONSTRAINT "FK_user_bank_progress_bank" FOREIGN KEY ("question_bank_id") REFERENCES "question_banks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_bank_progress" ADD CONSTRAINT "FK_user_bank_progress_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "FK_quiz_attempt_answers_attempt" FOREIGN KEY ("attempt_id") REFERENCES "quiz_attempts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "FK_quiz_attempt_answers_option" FOREIGN KEY ("selected_option_id") REFERENCES "answer_options"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "FK_quiz_attempt_answers_question" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempts" ADD CONSTRAINT "FK_quiz_attempts_bank" FOREIGN KEY ("question_bank_id") REFERENCES "question_banks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempts" ADD CONSTRAINT "FK_quiz_attempts_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_rules" ADD CONSTRAINT "FK_forum_rules_forum" FOREIGN KEY ("forum_id") REFERENCES "forums"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_reports" ADD CONSTRAINT "FK_forum_reports_reporter" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_reports" ADD CONSTRAINT "FK_forum_reports_resolver" FOREIGN KEY ("resolved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_reactions" ADD CONSTRAINT "FK_forum_reactions_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_poll_votes" ADD CONSTRAINT "FK_forum_poll_votes_poll" FOREIGN KEY ("poll_id") REFERENCES "forum_polls"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_poll_votes" ADD CONSTRAINT "FK_forum_poll_votes_option" FOREIGN KEY ("option_id") REFERENCES "forum_poll_options"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_poll_votes" ADD CONSTRAINT "FK_forum_poll_votes_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_poll_options" ADD CONSTRAINT "FK_forum_poll_options_poll" FOREIGN KEY ("poll_id") REFERENCES "forum_polls"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_polls" ADD CONSTRAINT "FK_forum_polls_post" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_notifications" ADD CONSTRAINT "FK_forum_notifications_recipient" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_notifications" ADD CONSTRAINT "FK_forum_notifications_actor" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_mentions" ADD CONSTRAINT "FK_forum_mentions_post" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_mentions" ADD CONSTRAINT "FK_forum_mentions_comment" FOREIGN KEY ("comment_id") REFERENCES "forum_comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_mentions" ADD CONSTRAINT "FK_forum_mentions_user" FOREIGN KEY ("mentioned_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_members" ADD CONSTRAINT "FK_forum_members_forum" FOREIGN KEY ("forum_id") REFERENCES "forums"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_members" ADD CONSTRAINT "FK_forum_members_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_invites" ADD CONSTRAINT "FK_forum_invites_forum" FOREIGN KEY ("forum_id") REFERENCES "forums"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_invites" ADD CONSTRAINT "FK_forum_invites_inviter" FOREIGN KEY ("inviter_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_invites" ADD CONSTRAINT "FK_forum_invites_invitee" FOREIGN KEY ("invitee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_follows" ADD CONSTRAINT "FK_forum_follows_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_follows" ADD CONSTRAINT "FK_forum_follows_forum" FOREIGN KEY ("forum_id") REFERENCES "forums"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_comments" ADD CONSTRAINT "FK_forum_comments_post" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_comments" ADD CONSTRAINT "FK_forum_comments_author" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_comments" ADD CONSTRAINT "FK_forum_comments_parent" FOREIGN KEY ("parent_id") REFERENCES "forum_comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_bookmarks" ADD CONSTRAINT "FK_forum_bookmarks_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_bookmarks" ADD CONSTRAINT "FK_forum_bookmarks_post" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_posts" ADD CONSTRAINT "FK_forum_posts_question_bank" FOREIGN KEY ("question_bank_id") REFERENCES "question_banks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_posts" ADD CONSTRAINT "FK_forum_posts_forum" FOREIGN KEY ("forum_id") REFERENCES "forums"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_posts" ADD CONSTRAINT "FK_forum_posts_author" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_posts" ADD CONSTRAINT "FK_forum_posts_roadmap" FOREIGN KEY ("roadmap_id") REFERENCES "roadmaps"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forums" ADD CONSTRAINT "FK_forums_owner" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
