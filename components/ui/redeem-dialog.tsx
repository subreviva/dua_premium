"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface RedeemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRedeem: (code: string) => Promise<void>;
  cardBackgroundImage?: string;
}

export function RedeemDialog({ 
  open, 
  onOpenChange, 
  onRedeem,
  cardBackgroundImage 
}: RedeemDialogProps) {
  const [code, setCode] = React.useState("");
  const [isRedeeming, setIsRedeeming] = React.useState(false);

  const handleRedeemClick = async () => {
    if (!code) return;
    setIsRedeeming(true);
    try {
      await onRedeem(code);
    } catch (error) {
      console.error("Redemption failed:", error);
    } finally {
      setIsRedeeming(false);
    }
  };

  React.useEffect(() => {
    if (!open) {
      setCode("");
      setIsRedeeming(false);
    }
  }, [open]);

  const cardStyle = cardBackgroundImage
    ? { backgroundImage: `url(${cardBackgroundImage})` }
    : {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-black/95 backdrop-blur-3xl border-none p-0 overflow-hidden">
        <div className="relative p-6 sm:p-12">
          {/* Ultra-minimal header */}
          <DialogHeader className="space-y-3 mb-8 sm:mb-12">
            <DialogTitle className="text-2xl sm:text-4xl font-light tracking-tight text-white text-center">
              Acesso Exclusivo
            </DialogTitle>
            <DialogDescription className="text-neutral-500 text-xs sm:text-sm font-light tracking-wide text-center">
              Insira seu código de convite
            </DialogDescription>
          </DialogHeader>

          {/* BLACK CARD 3D - Ultra Exclusive DUA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative mb-6 sm:mb-8"
          >
            {/* 3D Card container */}
            <motion.div
              animate={{
                rotateX: [0, -3, 0],
                rotateY: [0, 2, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                transformStyle: "preserve-3d",
                perspective: "2000px",
              }}
              className="relative"
            >
              {/* BLACK CARD - Premium exclusive */}
              <div className="relative w-full aspect-[1.586/1] max-w-[480px] mx-auto bg-gradient-to-br from-neutral-900 via-black to-neutral-950 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/80 overflow-hidden border border-neutral-800/50">
                
                {/* Carbon fiber texture pattern */}
                <div 
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage: `
                      linear-gradient(45deg, transparent 45%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.03) 55%, transparent 55%),
                      linear-gradient(-45deg, transparent 45%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.03) 55%, transparent 55%)
                    `,
                    backgroundSize: '8px 8px',
                  }}
                />
                
                {/* Subtle premium shine */}
                <motion.div
                  animate={{
                    x: ["-150%", "250%"],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    repeatDelay: 4,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                  style={{
                    transform: "skewX(-20deg)",
                  }}
                />

                {/* Card content */}
                <div className="relative h-full flex flex-col justify-between p-6 sm:p-10">
                  
                  {/* Top section - Brand */}
                  <div className="flex items-start justify-between">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                    >
                      <h3 className="text-lg sm:text-2xl font-light tracking-[0.3em] text-neutral-300 uppercase">
                        Black Card
                      </h3>
                    </motion.div>
                    
                    {/* Chip simulation */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6, duration: 0.4 }}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-amber-400/80 via-yellow-500/70 to-amber-600/80 relative overflow-hidden"
                      style={{
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
                      }}
                    >
                      <div className="absolute inset-[2px] bg-gradient-to-br from-amber-300/40 to-transparent rounded-md" />
                      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-[1px] p-2">
                        {[...Array(9)].map((_, i) => (
                          <div key={i} className="bg-amber-900/30 rounded-[1px]" />
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  {/* Middle section - Code display */}
                  <div className="flex-1 flex items-center justify-center">
                    {code ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-center w-full px-2"
                      >
                        <p className="text-[8px] sm:text-xs font-light text-neutral-500 tracking-[0.3em] uppercase mb-2">
                          Access Code
                        </p>
                        <div className="overflow-hidden w-full flex items-center justify-center">
                          <p 
                            className="font-light text-neutral-200 tracking-[0.15em] break-all"
                            style={{
                              fontSize: `clamp(${code.length > 16 ? '1rem' : code.length > 12 ? '1.25rem' : code.length > 8 ? '1.5rem' : '1.75rem'}, ${Math.max(1.2, 2.5 - code.length * 0.1)}rem, ${code.length > 12 ? '1.5rem' : '2rem'})`,
                              wordBreak: 'break-all',
                              lineHeight: '1.4',
                              maxWidth: '100%',
                              fontFamily: 'ui-monospace, monospace',
                            }}
                          >
                            {code}
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center"
                      >
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3">
                          <motion.div 
                            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 rounded-full border border-neutral-700/30"
                          />
                          <div className="absolute inset-4 rounded-full border border-neutral-700/40" />
                          <div className="absolute inset-8 rounded-full bg-gradient-to-br from-neutral-800/20 to-neutral-900/20" />
                        </div>
                        <p className="text-neutral-600 text-xs sm:text-sm font-light tracking-wide">
                          Enter exclusive code
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* Bottom section - DUA branding */}
                  <div className="flex items-end justify-between">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8, duration: 0.6 }}
                      className="space-y-0.5"
                    >
                      <p className="text-[8px] sm:text-[10px] text-neutral-600 tracking-widest uppercase">
                        Valid Thru
                      </p>
                      <p className="text-xs sm:text-sm text-neutral-400 font-light tracking-wider">
                        ∞
                      </p>
                    </motion.div>
                    
                    {/* DUA Brand mark - styled like VISA */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1, duration: 0.6 }}
                      className="relative"
                    >
                      <h2 className="text-3xl sm:text-5xl font-bold tracking-tight bg-gradient-to-br from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent"
                        style={{
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                          fontStyle: 'italic',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        DUA
                      </h2>
                    </motion.div>
                  </div>
                </div>

                {/* Edge metallic highlight */}
                <div className="absolute inset-0 rounded-2xl sm:rounded-3xl ring-1 ring-inset ring-white/5" />
              </div>

              {/* 3D depth layers - black card style */}
              <div 
                className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-black/90 blur-sm"
                style={{
                  transform: "translateZ(-10px)",
                  zIndex: -1,
                }}
              />
              <div 
                className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-black/70 blur-md"
                style={{
                  transform: "translateZ(-20px)",
                  zIndex: -2,
                }}
              />
              <div 
                className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-black/50 blur-lg"
                style={{
                  transform: "translateZ(-30px)",
                  zIndex: -3,
                }}
              />
            </motion.div>
          </motion.div>

          {/* Input field - elegant dark input */}
          <div className="space-y-4 sm:space-y-6">
            <Input
              type="text"
              placeholder="DIGITE SEU CÓDIGO"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={isRedeeming}
              className="bg-black/50 border border-neutral-800/50 text-white placeholder:text-neutral-600 focus:border-neutral-700 focus:bg-black/60 h-12 sm:h-16 text-center text-sm sm:text-base font-light tracking-[0.3em] rounded-xl focus-visible:ring-1 focus-visible:ring-neutral-700/30 focus-visible:ring-offset-0 transition-all duration-300"
              maxLength={20}
              autoFocus
            />

            {/* Minimal black & white button */}
            <Button
              onClick={handleRedeemClick}
              disabled={!code || isRedeeming}
              className="w-full h-12 sm:h-16 bg-white hover:bg-neutral-100 text-black font-normal text-sm sm:text-base tracking-widest rounded-xl transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed shadow-lg shadow-white/10 hover:shadow-white/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isRedeeming ? (
                <span className="flex items-center justify-center gap-2 sm:gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-black/20 border-t-black rounded-full"
                  />
                  <span className="tracking-widest">VALIDANDO</span>
                </span>
              ) : (
                <span className="tracking-widest">VALIDAR ACESSO</span>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
