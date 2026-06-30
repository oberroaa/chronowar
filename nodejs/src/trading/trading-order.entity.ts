import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('trading_order')
export class TradingOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'integer' })
  ticket: number;

  @Column()
  type: string;

  @Column({ type: 'double precision' })
  price: number;

  @Column({ type: 'double precision' })
  lots: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  openTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  closeTime: Date;

  @Column({ type: 'double precision', nullable: true })
  profit: number;

  @Column({ default: 'OPEN' })
  status: string;
}
