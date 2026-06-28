import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Race } from '../race/race.entity';

@Entity()
export class Building {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  img: string;

  @Column({ default: false })
  upgradable: boolean;

  @Column({ nullable: true })
  gold: number;

  @Column({ nullable: true })
  supplies: number;

  @Column({ nullable: true })
  time: number;

  @Column({ nullable: true })
  hitPoints: number;

  @Column({ type: 'float', nullable: true })
  hpRegen: number;

  @Column({ nullable: true })
  armor: number;

  @Column({ nullable: true })
  armorType: string;

  @Column({ nullable: true })
  food: number;

  @Column({ nullable: true })
  builds: string;

  @Column({ nullable: true })
  upgrades: string;

  @Column({ nullable: true })
  requisito: string;

  @Column({ nullable: true })
  type: string;

  @Column({ type: 'float', nullable: true })
  damage: number;

  @Column({ type: 'float', nullable: true })
  range: number;

  @Column({ nullable: true })
  weapon: string;

  @Column({ type: 'float', nullable: true })
  cooldown: number;

  @Column({ nullable: true })
  targets: string;

  @ManyToOne(() => Race, (race) => race.buildings)
  race: Race;
}
