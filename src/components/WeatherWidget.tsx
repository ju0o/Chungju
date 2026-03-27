'use client';

import { useState } from 'react';

interface WeatherInfo {
  temp: number;
  desc: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

// 축제 날짜 기반 시뮬레이션 날씨 (외부 API 없이 작동)
function getSeasonalWeather(): WeatherInfo {
  const hour = new Date().getHours();

  // 3월 말 청주 평균 기온 기반
  const baseTemp = 12;
  const hourlyAdjust = hour >= 6 && hour <= 14 ? (hour - 6) * 0.8 : hour > 14 ? (22 - hour) * 0.6 : 5;
  const temp = Math.round((baseTemp + hourlyAdjust + (Math.random() * 2 - 1)) * 10) / 10;

  // 봄 날씨 패턴
  const patterns: Array<{ desc: string; icon: string; weight: number }> = [
    { desc: '맑음', icon: '☀️', weight: 40 },
    { desc: '구름 조금', icon: '⛅', weight: 30 },
    { desc: '흐림', icon: '☁️', weight: 15 },
    { desc: '봄비', icon: '🌧️', weight: 10 },
    { desc: '봄바람', icon: '🌬️', weight: 5 },
  ];

  // 시간대 시드로 일정한 패턴
  const seed = new Date().toDateString();
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  const normalizedHash = Math.abs(hash) % 100;

  let cumulative = 0;
  let selected = patterns[0];
  for (const p of patterns) {
    cumulative += p.weight;
    if (normalizedHash < cumulative) { selected = p; break; }
  }

  return {
    temp,
    desc: selected.desc,
    icon: selected.icon,
    humidity: 45 + Math.round(Math.random() * 20),
    windSpeed: Math.round((1.5 + Math.random() * 3) * 10) / 10,
  };
}

export function WeatherWidget() {
  const [weather] = useState<WeatherInfo>(() => getSeasonalWeather());

  if (!weather) return null;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-white/70 px-4 py-3 text-sm">
      <span className="text-2xl">{weather.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-base">{weather.temp}°C</span>
          <span className="text-[var(--foreground-soft)]">{weather.desc}</span>
        </div>
        <div className="flex gap-3 text-xs text-[var(--foreground-soft)]">
          <span>💧 {weather.humidity}%</span>
          <span>🌬️ {weather.windSpeed}m/s</span>
          <span>📍 청주</span>
        </div>
      </div>
    </div>
  );
}
