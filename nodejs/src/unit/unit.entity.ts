import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Race } from '../race/race.entity';

@Entity()
export class Unit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  img: string;

  @ManyToOne(() => Race, (race) => race.units)
  race: Race;

  @Column({ default: false })
  upgradable: boolean;

  @Column({ type: 'int' })
  gold: number;

  @Column({ type: 'int' })
  wood: number;

  @Column({ type: 'int', nullable: true })
  stone: number;

  @Column({ type: 'int' })
  time: number;

  @Column({ type: 'int' })
  hitPoints: number;

  @Column({ type: 'int' })
  armor: number;

  @Column({ type: 'int' })
  food: number;

  @Column({ type: 'text', nullable: true })
  builds: string;

  @Column({ nullable: true })
  requisito: string;

  @Column()
  type: string;

  @Column({ type: 'float' })
  damage: number;

  @Column({ type: 'float' })
  range: number;

  @Column({ type: 'float' })
  cooldown: number;

  @Column({ nullable: true })
  skillName: string;

  @Column({ nullable: true })
  skillDesc: string;

  @Column({ nullable: true })
  skillAction: string;

  @Column({ nullable: true })
  skillName2: string;

  @Column({ nullable: true })
  skillDesc2: string;

  @Column({ nullable: true })
  skillAction2: string;
}
