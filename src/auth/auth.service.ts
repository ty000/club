import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async login(email: string, password: string) {
    let user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return this.createUser(email, password);
    }
    if (user.password !== password) {
      throw new UnauthorizedException('Invalid password');
    }
    return { id: user.id, token: user.token };
  }

  async validateToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { token } });
  }

  async createUser(email: string, password: string) {
    const user = this.userRepository.create({
      email,
      password,
      token: Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2),
    });
    await this.userRepository.save(user);
    return { id: user.id, token: user.token };
  }
}
