import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Media } from './media.entity';
import { Subscription } from './subscription.entity';

@Entity()
export class Creator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  monthlyPrice: number;

  @ManyToOne(() => User, user => user.creators)
  user: User;

  @OneToMany(() => Media, media => media.creator)
  medias: Media[];

  @OneToMany(() => Subscription, subscription => subscription.creator)
  subscriptions: Subscription[];
}
