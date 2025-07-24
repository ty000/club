import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Creator } from './creator.entity';

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.subscriptions)
  fan: User;

  @ManyToOne(() => Creator, creator => creator.subscriptions)
  creator: Creator;

  @Column({ default: 'CREATED' })
  status: string;

  @Column({ nullable: true })
  sessionId: string;
}
