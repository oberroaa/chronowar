import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';
import { io } from 'socket.io-client';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 350px;
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0,0,0,0.5);
`;

const OrdersContainer = styled.div`
  width: 100%;
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 8px;
  background: rgba(10, 8, 5, 0.95);
  padding: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.4);
`;

const SectionTitle = styled.h3`
  font-family: 'Cinzel', serif;
  color: #ffd700;
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.1rem;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
`;

const TableWrapper = styled.div`
  width: 100%;
  max-height: 180px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(0,0,0,0.2);
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 215, 0, 0.3);
    border-radius: 3px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: 'Consolas', monospace;
  font-size: 0.85rem;
  color: #f0d080;
  text-align: left;
`;

const Th = styled.th`
  border-bottom: 2px solid rgba(255, 215, 0, 0.3);
  padding: 8px;
  color: #ffd700;
  font-weight: bold;
`;

const Td = styled.td`
  border-bottom: 1px solid rgba(255, 215, 0, 0.1);
  padding: 8px;
  vertical-align: middle;
`;

const Badge = styled.span<{ $type: string }>`
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.75rem;
  background: ${props => props.$type === 'BUY' ? 'rgba(38, 166, 154, 0.2)' : 'rgba(239, 83, 80, 0.2)'};
  color: ${props => props.$type === 'BUY' ? '#26a69a' : '#ef5350'};
  border: 1px solid ${props => props.$type === 'BUY' ? 'rgba(38, 166, 154, 0.4)' : 'rgba(239, 83, 80, 0.4)'};
`;

const ProfitText = styled.span<{ $profit: number }>`
  color: ${props => props.$profit > 0 ? '#26a69a' : props.$profit < 0 ? '#ef5350' : '#888'};
  font-weight: ${props => props.$profit !== 0 ? 'bold' : 'normal'};
`;

const StatusText = styled.span<{ $status: string }>`
  color: ${props => props.$status === 'OPEN' ? '#26a69a' : '#888'};
  font-weight: ${props => props.$status === 'OPEN' ? 'bold' : 'normal'};
`;

interface OrderData {
  id?: number;
  ticket: number;
  type: string;
  price: number;
  lots: number;
  openTime: string;
  closeTime?: string;
  profit?: number;
  status: string;
}

const TradingChart: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const priceLinesRef = useRef<Map<string, any>>(new Map());
  const [orders, setOrders] = useState<OrderData[]>([]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Crear el gráfico con estilo oscuro
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#000000' },
        textColor: 'rgba(255, 255, 255, 0.9)',
      },
      grid: {
        vertLines: { color: 'rgba(197, 203, 206, 0.2)' },
        horzLines: { color: 'rgba(197, 203, 206, 0.2)' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Añadir serie de velas
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    // Generar datos de prueba iniciales
    const initialData = [];
    let currentTime = Math.floor(Date.now() / 1000) - (100 * 60);
    let lastClose = 49850;

    for (let i = 0; i < 100; i++) {
      const open = lastClose + (Math.random() - 0.5) * 50;
      const close = open + (Math.random() - 0.5) * 50;
      const high = Math.max(open, close) + Math.random() * 20;
      const low = Math.min(open, close) - Math.random() * 20;

      initialData.push({
        time: currentTime as any,
        open,
        high,
        low,
        close,
      });

      lastClose = close;
      currentTime += 60;
    }

    candlestickSeries.setData(initialData);

    // Cargar órdenes desde base de datos y dibujar líneas activas
    fetch('http://localhost:3001/api/trading/orders')
      .then(res => res.json())
      .then((data: OrderData[]) => {
        setOrders(data);
        data.filter(o => o.status === 'OPEN').forEach(o => {
          const isBuy = o.type === 'BUY';
          const lineId = String(o.ticket);
          const priceLine = (candlestickSeries as any).createPriceLine({
            price: o.price,
            color: isBuy ? '#26a69a' : '#ef5350',
            lineWidth: 2,
            lineStyle: 2,
            axisLabelVisible: true,
            title: `${o.type} (${o.lots} lots)`,
          });
          priceLinesRef.current.set(lineId, priceLine);
        });
      })
      .catch(err => console.error("Error loading trading orders:", err));

    // Conectar WebSocket al backend (puerto 3001)
    const socket = io('http://localhost:3001');

    socket.on('tradingData', (newData: any) => {
      console.log("Nuevo dato recibido:", newData);

      if (newData.isOrder) {
        const ticket = Number(newData.ticket);
        const type = newData.type;
        const price = Number(newData.price);
        const lots = Number(newData.lots);
        const profit = newData.profit ? Number(newData.profit) : 0;
        const timeStr = new Date(newData.time ? newData.time * 1000 : Date.now()).toISOString();

        if (newData.isClose) {
          // SEÑAL DE CIERRE: Quitar la línea
          const lineId = String(ticket);
          const existingLine = priceLinesRef.current.get(lineId);
          if (existingLine) {
            candlestickSeries.removePriceLine(existingLine);
            priceLinesRef.current.delete(lineId);
          }

          // Actualizar en el estado local
          setOrders(prev => {
            const idx = prev.findIndex(o => o.ticket === ticket);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = {
                ...updated[idx],
                status: 'CLOSED',
                closeTime: timeStr,
                profit: profit,
              };
              return updated;
            } else {
              return [
                {
                  ticket,
                  type,
                  price,
                  lots,
                  openTime: timeStr,
                  closeTime: timeStr,
                  profit,
                  status: 'CLOSED',
                },
                ...prev
              ];
            }
          });
        } else {
          // SEÑAL DE APERTURA: Crear línea horizontal
          const isBuy = type === 'BUY';
          const lineId = String(ticket);

          const oldLine = priceLinesRef.current.get(lineId);
          if (oldLine) candlestickSeries.removePriceLine(oldLine);

          const priceLine = (candlestickSeries as any).createPriceLine({
            price: price,
            color: isBuy ? '#26a69a' : '#ef5350',
            lineWidth: 2,
            lineStyle: 2,
            axisLabelVisible: true,
            title: `${type} (${lots} lots)`,
          });

          priceLinesRef.current.set(lineId, priceLine);

          // Agregar al estado local
          setOrders(prev => {
            const exists = prev.some(o => o.ticket === ticket);
            if (exists) return prev;
            return [
              {
                ticket,
                type,
                price,
                lots,
                openTime: timeStr,
                status: 'OPEN',
              },
              ...prev
            ];
          });
        }
      } else {
        // Actualización de vela normal
        candlestickSeries.update({
          time: newData.time as any,
          open: newData.open,
          high: newData.high,
          low: newData.low,
          close: newData.close,
        });
      }
    });

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      socket.disconnect();
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  const formatTime = (timeStr: string) => {
    const d = new Date(timeStr);
    return d.toLocaleString();
  };

  return (
    <Container>
      <ChartContainer ref={chartContainerRef} />
      <OrdersContainer>
        <SectionTitle>Historial de Transacciones (Trazabilidad)</SectionTitle>
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>Ticket</Th>
                <Th>Tipo</Th>
                <Th>Lotes</Th>
                <Th>Precio Entrada</Th>
                <Th>Apertura</Th>
                <Th>Cierre</Th>
                <Th>Beneficio</Th>
                <Th>Estado</Th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <Td colSpan={8} style={{ textAlign: 'center', color: '#888' }}>
                    No hay transacciones registradas del bot.
                  </Td>
                </tr>
              ) : (
                orders.slice(0, 10).map(order => (
                  <tr key={order.ticket}>
                    <Td>#{order.ticket}</Td>
                    <Td><Badge $type={order.type}>{order.type}</Badge></Td>
                    <Td>{order.lots.toFixed(2)}</Td>
                    <Td>${order.price.toFixed(2)}</Td>
                    <Td>{formatTime(order.openTime)}</Td>
                    <Td>{order.closeTime ? formatTime(order.closeTime) : '-'}</Td>
                    <Td>
                      {order.status === 'CLOSED' ? (
                        <ProfitText $profit={order.profit || 0}>
                          ${(order.profit || 0).toFixed(2)}
                        </ProfitText>
                      ) : '-'}
                    </Td>
                    <Td>
                      <StatusText $status={order.status}>
                        {order.status === 'OPEN' ? 'ABIERTA' : 'CERRADA'}
                      </StatusText>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </TableWrapper>
      </OrdersContainer>
    </Container>
  );
};

export default TradingChart;
