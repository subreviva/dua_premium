"use client"

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

// --- SiriOrb Component ---
interface SiriOrbProps {
  size?: string
  className?: string
  colors?: {
    bg?: string
    c1?: string
    c2?: string
    c3?: string
  }
  animationDuration?: number
  isListening?: boolean
  audioStream?: MediaStream | null // NOVO: Stream de áudio para análise em tempo real
}

export const SiriOrb: React.FC<SiriOrbProps> = ({
  size = "192px",
  className,
  colors,
  animationDuration = 20,
  isListening = false,
  audioStream = null,
}) => {
  const [audioLevel, setAudioLevel] = useState(0); // 0-1 nível de áudio
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // NOVO: Análise de áudio em tempo real (apenas mobile)
  useEffect(() => {
    if (!isMobile || !audioStream) {
      setAudioLevel(0);
      return;
    }

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(audioStream);
      
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateAudioLevel = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calcular nível médio (0-255 → 0-1)
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        const normalized = Math.min(average / 128, 1); // Normalizar para 0-1
        
        setAudioLevel(normalized);
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };

      updateAudioLevel();

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        source.disconnect();
        analyser.disconnect();
        audioContext.close();
      };
    } catch (error) {
      console.error("Erro ao configurar análise de áudio:", error);
    }
  }, [audioStream, isMobile]);

  const defaultColors = {
    bg: "transparent",
    c1: "oklch(75% 0.15 350)",
    c2: "oklch(80% 0.12 200)", 
    c3: "oklch(78% 0.14 280)",
  }

  const finalColors = { ...defaultColors, ...colors }
  const sizeValue = parseInt(size.replace("px", ""), 10)

  // MELHORADO: Blur e contrast adaptam-se ao nível de áudio (mobile)
  const baseBlur = Math.max(sizeValue * 0.08, 8);
  const baseContrast = Math.max(sizeValue * 0.003, 1.8);
  
  const blurAmount = isMobile ? baseBlur + (audioLevel * baseBlur * 0.5) : baseBlur;
  const contrastAmount = isMobile ? baseContrast + (audioLevel * 0.5) : baseContrast;
  const scaleAmount = isMobile ? 1 + (audioLevel * 0.15) : 1; // Pulsa com o áudio

  return (
    <div
      className={cn("siri-orb", className, isListening && "siri-orb-listening")}
      style={
        {
          width: size,
          height: size,
          "--bg": finalColors.bg,
          "--c1": finalColors.c1,
          "--c2": finalColors.c2,
          "--c3": finalColors.c3,
          "--animation-duration": `${animationDuration}s`,
          "--blur-amount": `${blurAmount}px`,
          "--contrast-amount": contrastAmount,
          "--scale-amount": scaleAmount,
          "--audio-level": audioLevel,
        } as React.CSSProperties
      }
    >
      <style jsx>{`
        @property --angle {
          syntax: "<angle>";
          inherits: false;
          initial-value: 0deg;
        }

        .siri-orb {
          display: grid;
          grid-template-areas: "stack";
          overflow: hidden;
          border-radius: 50%;
          position: relative;
          background: radial-gradient(
            circle,
            rgba(0, 0, 0, 0.08) 0%,
            rgba(0, 0, 0, 0.03) 30%,
            transparent 70%
          );
          /* NOVO: Transform baseado no nível de áudio (mobile) */
          transform: scale(var(--scale-amount, 1));
          transition: transform 0.15s ease-out;
        }

        .siri-orb:hover {
          transform: scale(1.05);
        }

        /* MELHORADO: Pulso mais suave */
        .siri-orb-listening {
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(var(--scale-amount, 1));
          }
          50% {
            transform: scale(calc(var(--scale-amount, 1) * 1.08));
          }
        }

        /* override for dark mode */
        .dark .siri-orb {
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.08) 0%,
            rgba(255, 255, 255, 0.02) 30%,
            transparent 70%
          );
        }

        .siri-orb::before {
          content: "";
          display: block;
          grid-area: stack;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background:
            conic-gradient(
              from calc(var(--angle) * 1.2) at 30% 65%,
              var(--c3) 0deg,
              transparent 45deg 315deg,
              var(--c3) 360deg
            ),
            conic-gradient(
              from calc(var(--angle) * 0.8) at 70% 35%,
              var(--c2) 0deg,
              transparent 60deg 300deg,
              var(--c2) 360deg
            ),
            conic-gradient(
              from calc(var(--angle) * -1.5) at 65% 75%,
              var(--c1) 0deg,
              transparent 90deg 270deg,
              var(--c1) 360deg
            ),
            conic-gradient(
              from calc(var(--angle) * 2.1) at 25% 25%,
              var(--c2) 0deg,
              transparent 30deg 330deg,
              var(--c2) 360deg
            ),
            conic-gradient(
              from calc(var(--angle) * -0.7) at 80% 80%,
              var(--c1) 0deg,
              transparent 45deg 315deg,
              var(--c1) 360deg
            ),
            radial-gradient(
              ellipse 120% 80% at 40% 60%,
              var(--c3) 0%,
              transparent 50%
            );
          /* MELHORADO: Filter adapta-se ao nível de áudio (mobile) */
          filter: blur(var(--blur-amount)) contrast(var(--contrast-amount)) saturate(calc(1.2 + var(--audio-level, 0) * 0.3)) brightness(calc(1 + var(--audio-level, 0) * 0.2));
          animation: rotate var(--animation-duration) linear infinite;
          transform: translateZ(0);
          will-change: transform, filter;
        }

        .siri-orb::after {
          content: "";
          display: block;
          grid-area: stack;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          /* MELHORADO: Brilho reage ao áudio (mobile) */
          background: radial-gradient(
            circle at 45% 55%,
            rgba(255, 255, 255, calc(0.1 + var(--audio-level, 0) * 0.15)) 0%,
            rgba(255, 255, 255, calc(0.05 + var(--audio-level, 0) * 0.08)) 30%,
            transparent 60%
          );
          mix-blend-mode: overlay;
          transition: opacity 0.15s ease-out;
        }

        @keyframes rotate {
          from {
            --angle: 0deg;
          }
          to {
            --angle: 360deg;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .siri-orb::before {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}
