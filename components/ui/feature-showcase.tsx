"use client";

import * as React from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export type TabMedia = {
  value: string; // unique value for Tabs
  label: string; // button label
  src: string;   // image url
  alt?: string;
  objectPosition?: string; // CSS object-position (ex: "center 20%", "50% 30%")
};

export type ShowcaseStep = {
  id: string;
  title: string;
  text: string;
};

export type FeatureShowcaseProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  /** small chips under the description */
  stats?: string[];
  /** accordion steps on the left */
  steps?: ShowcaseStep[];
  /** right-side tabs (image per tab) */
  tabs: TabMedia[];
  /** which tab is active initially */
  defaultTab?: string;
  /** fixed panel height in px (also applied as min-height) */
  panelMinHeight?: number;
  className?: string;
};

export function FeatureShowcase({
  eyebrow = "Discover",
  title,
  description,
  stats = ["1 reference", "30s setup", "Share‑ready"],
  steps = [
    {
      id: "step-1",
      title: "Drop a reference",
      text:
        "Upload a single image. We read it like a brief and extract palette, texture and cues.",
    },
    {
      id: "step-2",
      title: "Pick the vibe",
      text:
        "Switch between mockup, screen, or abstract views and tune the mood instantly.",
    },
    {
      id: "step-3",
      title: "Export & share",
      text:
        "Get a moodboard ready for your team with consistent visuals and notes.",
    },
  ],
  tabs,
  defaultTab,
  panelMinHeight = 720,
  className,
}: FeatureShowcaseProps) {
  const initial = defaultTab ?? (tabs[0]?.value ?? "tab-0");
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi>();
  const [expandedCards, setExpandedCards] = React.useState<Record<string, boolean>>({});

  const toggleCard = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const truncateText = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <section className={cn("w-full text-white", className)}>
      {/* MOBILE VERSION - Apple/Revolut Premium Design */}
      <div className="md:hidden w-full py-12 sm:py-16">
        {/* Header mobile - Minimal Premium Typography */}
        <div className="px-5 sm:px-6 mb-10 sm:mb-12 space-y-5">
          {eyebrow && (
            <Badge variant="outline" className="border-white/20 bg-white/5 text-white/80 backdrop-blur-xl text-[11px] font-light px-4 py-1.5 rounded-full">
              {eyebrow}
            </Badge>
          )}
          {title && (
            <h2 className="text-balance text-[32px] sm:text-[38px] font-light leading-[1.1] tracking-[-0.03em] text-white">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-[15px] text-white/60 font-light leading-[1.5] tracking-tight max-w-xl">
              {description}
            </p>
          )}
        </div>

        {/* Carrossel Premium - Apple/Revolut Style */}
        <Carousel
          setApi={setCarouselApi}
          opts={{
            align: "center",
            loop: true,
            dragFree: true,
            skipSnaps: false,
          }}
          className="w-full touch-pan-x"
        >
          <CarouselContent className="-ml-3">
            {steps.map((step, idx) => {
              const tab = tabs[idx] || tabs[0];
              const isExpanded = expandedCards[step.id];
              const shouldTruncate = step.text.length > 120;
              
              return (
                <CarouselItem key={step.id} className="pl-3 basis-[85%] sm:basis-[80%]">
                  {/* Card Premium Apple Style */}
                  <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-2xl h-[540px] flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-500 hover:shadow-[0_16px_48px_rgba(0,0,0,0.5)] hover:border-white/[0.12]">
                    
                    {/* Imagem Full com Gradient Premium */}
                    <div className="relative h-[280px] w-full overflow-hidden">
                      <img
                        src={tab.src}
                        alt={tab.alt ?? tab.label}
                        className="h-full w-full object-cover scale-105"
                        style={{ objectPosition: tab.objectPosition || "center center" }}
                        loading={idx === 0 ? "eager" : "lazy"}
                      />
                      {/* Gradient Apple - Suave e elegante */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/90" />
                      
                      {/* Badge flutuante premium */}
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-black/40 text-white backdrop-blur-xl border border-white/20 text-[10px] font-medium px-3 py-1 rounded-full">
                          {tab.label}
                        </Badge>
                      </div>
                    </div>

                    {/* Content Area - Clean & Spacious */}
                    <div className="relative z-10 p-6 flex flex-col flex-1 bg-gradient-to-b from-black/60 to-black/80">
                      
                      {/* Número elegante */}
                      <div className="mb-4">
                        <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 border border-white/10">
                          <span className="text-white/70 text-xs font-light">{String(idx + 1).padStart(2, '0')}</span>
                        </div>
                      </div>

                      {/* Título Apple Style */}
                      <h3 className="text-[26px] font-normal text-white tracking-[-0.02em] leading-[1.2] mb-3">
                        {step.title}
                      </h3>

                      {/* Texto Premium */}
                      <div className="flex-1">
                        <p className="text-[14px] text-white/70 font-light leading-[1.6] tracking-tight">
                          {isExpanded || !shouldTruncate ? step.text : truncateText(step.text)}
                        </p>

                        {/* Ver mais discreto */}
                        {shouldTruncate && (
                          <button
                            onClick={() => toggleCard(step.id)}
                            className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-white/50 hover:text-white/80 transition-colors duration-300 font-light"
                          >
                            <span>{isExpanded ? "Menos" : "Mais"}</span>
                            <ChevronDown 
                              className={cn(
                                "w-3.5 h-3.5 transition-transform duration-300",
                                isExpanded && "rotate-180"
                              )} 
                            />
                          </button>
                        )}
                      </div>

                      {/* Progress Dots - Apple Style */}
                      <div className="mt-6 pt-4 border-t border-white/[0.06]">
                        <div className="flex items-center justify-center gap-1.5">
                          {steps.map((_, i) => (
                            <div 
                              key={i} 
                              className={cn(
                                "rounded-full transition-all duration-300",
                                i === idx 
                                  ? "h-1.5 w-6 bg-white/80" 
                                  : "h-1.5 w-1.5 bg-white/20"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>

        {/* Stats Premium - Apple Style */}
        {stats && stats.length > 0 && (
          <div className="px-5 mt-8 flex items-center justify-center gap-6">
            {stats.map((stat, i) => (
              <React.Fragment key={i}>
                <span className="text-[12px] text-white/40 font-light tracking-wide">{stat}</span>
                {i < stats.length - 1 && <div className="h-1 w-1 rounded-full bg-white/20" />}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* CTA Button - Apple Minimal */}
        <div className="px-5 mt-10 flex justify-center">
          <Button 
            asChild 
            size="lg" 
            className="bg-white text-black hover:bg-white/90 active:bg-white/80 rounded-full text-[15px] font-medium h-12 px-8 shadow-lg transition-all duration-300 active:scale-[0.96]"
          >
            <Link href="/registo">Começar Agora</Link>
          </Button>
        </div>
      </div>

      {/* DESKTOP VERSION - Ultra Premium Design */}
      <div className="hidden md:block">
        <div className="container mx-auto grid max-w-7xl grid-cols-1 gap-10 sm:gap-12 md:gap-14 lg:gap-16 px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 lg:py-28 md:grid-cols-12">
        {/* Left column */}
        <div className="md:col-span-6 space-y-8 sm:space-y-10">
          {eyebrow && (
            <Badge variant="outline" className="border-white/25 bg-white/[0.08] text-white/95 backdrop-blur-2xl text-sm sm:text-base font-medium px-5 py-2 rounded-full shadow-lg">
              {eyebrow}
            </Badge>
          )}

          {title && (
            <h2 className="text-balance text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extralight leading-[1.08] tracking-[-0.02em]">
              {title}
            </h2>
          )}

          {description && (
            <p className="max-w-xl text-lg sm:text-xl text-white/75 font-normal leading-[1.6]">{description}</p>
          )}

          {/* Stats chips - iOS Premium Style */}
          {stats.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {stats.map((s, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="bg-white/12 text-white/90 backdrop-blur-xl border border-white/20 text-sm sm:text-base font-medium px-5 py-2.5 rounded-full shadow-md"
                >
                  {s}
                </Badge>
              ))}
            </div>
          )}

          {/* Steps (Accordion) - iOS Style */}
          <div className="mt-12 sm:mt-14 lg:mt-16 max-w-xl w-full">
            <Accordion type="single" collapsible className="w-full border-white/10">
              {steps.map((step) => (
                <AccordionItem key={step.id} value={step.id} className="border-white/15 py-3 sm:py-4">
                  <AccordionTrigger className="text-left text-base sm:text-lg font-medium text-white hover:text-white/95 hover:no-underline py-4 sm:py-5">
                    {step.title}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm sm:text-base text-white/75 font-normal leading-[1.6] pb-5 sm:pb-6 pt-2">
                    {step.text}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* CTAs - iOS Premium Desktop */}
            <div className="mt-10 sm:mt-12 flex justify-start">
              <Button 
                asChild 
                size="lg" 
                className="bg-white/15 hover:bg-white/25 active:bg-white/20 backdrop-blur-2xl border border-white/30 text-white rounded-2xl text-base sm:text-lg font-medium h-12 sm:h-14 px-8 min-h-[48px] shadow-lg transition-all duration-200"
              >
                <Link href="/registo">Começar Agora</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Right column - iOS Premium Card */}
        <div className="md:col-span-6 mt-12 md:mt-0">
          <Card
            className="relative overflow-hidden rounded-[32px] border border-white/15 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-2xl p-0 shadow-[0_8px_48px_rgba(0,0,0,0.4)]"
            style={{ height: panelMinHeight, minHeight: panelMinHeight }}
          >
            <Tabs defaultValue={initial} className="relative h-full w-full">
              {/* Absolute-fill media container */}
              <div className="relative h-full w-full">
                {tabs.map((t, idx) => (
                  <TabsContent
                    key={t.value}
                    value={t.value}
                    className={cn(
                      "absolute inset-0 m-0 h-full w-full",
                      "data-[state=inactive]:hidden"
                    )}
                  >
                    <img
                      src={t.src}
                      alt={t.alt ?? t.label}
                      className="h-full w-full object-cover transition-transform duration-500"
                      style={{ objectPosition: t.objectPosition || "center center" }}
                      loading={idx === 0 ? "eager" : "lazy"}
                    />
                  </TabsContent>
                ))}
              </div>

              {/* Tab controls (pill) - iOS Premium Style */}
              <div className="pointer-events-auto absolute inset-x-0 bottom-6 sm:bottom-8 z-10 flex w-full justify-center px-4 sm:px-6">
                <TabsList className="flex gap-2 rounded-[20px] border border-white/25 bg-black/50 p-2 backdrop-blur-2xl shadow-xl">
                  {tabs.map((t) => (
                    <TabsTrigger
                      key={t.value}
                      value={t.value}
                      className="rounded-[16px] px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base text-white/70 data-[state=active]:bg-white/25 data-[state=active]:text-white font-medium transition-all duration-300 min-h-[44px] touch-manipulation data-[state=active]:shadow-lg"
                    >
                      {t.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </Tabs>
          </Card>
        </div>
        </div>
      </div>
    </section>
  );
}
