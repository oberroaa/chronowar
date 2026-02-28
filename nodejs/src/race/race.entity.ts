import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Hero } from '../hero/hero.entity';
import { Building } from '../building/building.entity';
import { Unit } from '../unit/unit.entity';

@Entity()
export class Race {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  img: string;

  @Column('text')
  characteristics: string;

  @OneToMany(() => Hero, (hero) => hero.race)
  heroes: Hero[];

  @OneToMany(() => Building, (building) => building.race)
  buildings: Building[];

  @OneToMany(() => Unit, (unit) => unit.race)
  units: Unit[];
}
