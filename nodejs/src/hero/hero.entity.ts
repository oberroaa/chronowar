import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Race } from '../race/race.entity';

@Entity()
export class Hero {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  img: string;

  @ManyToOne(() => Race, (race) => race.heroes)
  race: Race;
}
