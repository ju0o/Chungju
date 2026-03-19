"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  {
    src: "/청주축제2.jpg",
    alt: "청주 축제 메인 배너 이미지 1",
    caption: "공원의 빛과 사람들의 머무름",
  },
  {
    src: "/청주축제3.jpg",
    alt: "청주 축제 메인 배너 이미지 2",
    caption: "꽃시장과 문화 부스가 이어지는 장면",
  },
];

export function HeroBannerSlider() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-[1.7rem] border border-[rgba(255,255,255,0.35)] bg-[rgba(255,255,255,0.16)] shadow-[0_20px_40px_rgba(52,41,29,0.16)]">
      <div className="relative aspect-[4/5] min-h-[21rem]">
        {slides.map((slide, index) => (
          <div
            key={slide.src}
            className={`absolute inset-0 transition-all duration-700 ${index === activeIndex ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"}`}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={index === 0}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 420px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(31,23,17,0.58)] via-[rgba(31,23,17,0.12)] to-transparent" />
          </div>
        ))}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-white">
          <div className="max-w-[18ch] rounded-full border border-white/25 bg-black/20 px-3 py-2 text-xs tracking-[0.06em] backdrop-blur-sm">
            {slides[activeIndex]?.caption}
          </div>
          <div className="flex gap-2">
            {slides.map((slide, index) => (
              <span
                key={slide.src}
                className={`h-2.5 rounded-full transition-all ${index === activeIndex ? "w-8 bg-white" : "w-2.5 bg-white/45"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
