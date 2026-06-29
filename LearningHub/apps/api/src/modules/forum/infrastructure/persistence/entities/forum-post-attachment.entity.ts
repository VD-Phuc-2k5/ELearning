import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ForumPostEntity } from './forum-post.entity';

@Entity('forum_post_attachments')
export class ForumPostAttachmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'post_id' })
  postId!: string;

  @ManyToOne(() => ForumPostEntity)
  @JoinColumn({ name: 'post_id' })
  post!: ForumPostEntity;

  @Column({ name: 'file_url' })
  fileUrl!: string;

  @Column({ name: 'file_name' })
  fileName!: string;

  @Column({ name: 'file_type', type: 'varchar', nullable: true })
  fileType!: string | null;

  @Column({ name: 'file_size', type: 'int', nullable: true })
  fileSize!: number | null;
}
