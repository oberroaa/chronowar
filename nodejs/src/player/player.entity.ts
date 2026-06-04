import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  level: number;

  @Column()
  race: string;

  @Column({ default: false })
  isSystem: boolean;

  @Column('json', { default: {} })
  resources: any;

  @Column('json', { default: {} })
  formations: any;

  @Column('json', { default: [] })
  gameUnits: any;

  @Column('json', { default: {} })
  buildingLevels: any;
}
