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

  @Column({ type: 'int' })
  iron: number;

  @Column({ type: 'int' })
  time: number;

  @Column({ type: 'int' })
  hitPoints: number;

  @Column({ type: 'float' })
  hpRegen: number;

  @Column({ type: 'int' })
  mana: number;

  @Column({ type: 'float' })
  manaRegen: number;

  @Column({ type: 'int' })
  armor: number;

  @Column({ nullable: true })
  armorType: string;

  @Column({ type: 'int' })
  food: number;

  @Column({ type: 'boolean' })
  builds: boolean;

  @Column({ nullable: true })
  requisito: string;

  @Column({ type: 'int' })
  speed: number;

  @Column()
  type: string;

  @Column({ type: 'int' })
  damage: number;

  @Column({ type: 'int' })
  range: number;

  @Column({ nullable: true })
  weaponType: string;

  @Column({ type: 'float' })
  cooldown: number;

  @Column()
  targets: string;
}
