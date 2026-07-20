import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('forum_tags')
export class ForumTagEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ type: 'varchar', length: 7, nullable: true })
  color!: string | null;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy!: string | null;
}
