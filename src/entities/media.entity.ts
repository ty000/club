import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Creator } from './creator.entity';

@Entity()
export class Media {
  @PrimaryGeneratedColumn('uuid')
  mediaId: string;

  @Column()
  mediaUrl: string;

  @Column()
  blurredMediaUrl: string;

  @ManyToOne(() => Creator, creator => creator.medias)
  creator: Creator;
}
