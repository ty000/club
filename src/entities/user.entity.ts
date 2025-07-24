import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Creator } from './creator.entity';
import { Subscription } from './subscription.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  token: string;

  @OneToMany(() => Creator, creator => creator.user)
  creators: Creator[];

  @OneToMany(() => Subscription, subscription => subscription.fan)
  subscriptions: Subscription[];
}
