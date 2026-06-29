import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('forum_categories')
export class ForumCategoryEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ default: 0 })
  order!: number;
}
