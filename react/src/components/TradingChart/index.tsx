import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';
import { io } from 'socket.io-client';
import styled from 'styled-components';

const ChartContainer = styled.div`
  width: 100%;
  height: 400px;
  margin-top: 20px;
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0,0,0,0.5);
`;

const TradingChart: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const priceLinesRef = useRef<Map<string, any>>(new Map()); // Para rastrear líneas por ticket o ID

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

    // Añadir serie de velas (Candlesticks)
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    // Generar datos de prueba que terminen justo AHORA
    const data = [];
    let currentTime = Math.floor(Date.now() / 1000) - (100 * 60); // Hace 100 minutos
    let lastClose = 49850; // Ajustado al precio actual del DJ30

    for (let i = 0; i < 100; i++) {
      const open = lastClose + (Math.random() - 0.5) * 50;
      const close = open + (Math.random() - 0.5) * 50;
      const high = Math.max(open, close) + Math.random() * 20;
      const low = Math.min(open, close) - Math.random() * 20;
      
      data.push({
        time: currentTime as any,
        open,
        high,
        low,
        close,
      });

      lastClose = close;
      currentTime += 60; // +1 minuto
    }

    candlestickSeries.setData(data);

    // Conectar WebSocket al backend (ahora en el puerto 80)
    const socket = io('http://localhost');
    
    socket.on('tradingData', (newData: any) => {
      console.log("Nuevo dato recibido:", newData);
      
      if (newData.isOrder) {
        if (newData.isClose) {
          // SEÑAL DE CIERRE: Quitar la línea
          const lineId = newData.ticket ? String(newData.ticket) : newData.type;
          const existingLine = priceLinesRef.current.get(lineId);
          if (existingLine) {
            candlestickSeries.removePriceLine(existingLine);
            priceLinesRef.current.delete(lineId);
          }
        } else {
          // SEÑAL DE APERTURA: Crear línea horizontal
          const isBuy = newData.type === 'BUY';
          const lineId = newData.ticket ? String(newData.ticket) : newData.type;
          
          // Si ya existía una línea para este tipo/ticket, la quitamos antes
          const oldLine = priceLinesRef.current.get(lineId);
          if (oldLine) candlestickSeries.removePriceLine(oldLine);

          const priceLine = (candlestickSeries as any).createPriceLine({
            price: newData.price,
            color: isBuy ? '#26a69a' : '#ef5350',
            lineWidth: 2,
            lineStyle: 2, // Punteada (Dashed)
            axisLabelVisible: true,
            title: `${newData.type} (${newData.lots} lots)`,
          });

          priceLinesRef.current.set(lineId, priceLine);
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

    // Ajustar el tamaño al contenedor
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

  return <ChartContainer ref={chartContainerRef} />;
};

export default TradingChart;
