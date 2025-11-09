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

  return (
    <section className={cn("w-full text-white", className)}>
      {/* MOBILE VERSION - Carrossel horizontal */}
      <div className="md:hidden w-full py-16">
        {/* Header mobile */}
        <div className="px-4 mb-8 space-y-8">
          {eyebrow && (
            <Badge variant="outline" className="border-white/20 bg-white/5 text-white backdrop-blur-sm text-sm px-4 py-1.5">
              {eyebrow}
            </Badge>
          )}
          {title && (
            <h2 className="text-balance text-4xl sm:text-5xl font-extralight leading-[1.08] tracking-tight">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-lg text-white/70 font-light leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Carrossel mobile - cada step com sua imagem */}
        <Carousel
          setApi={setCarouselApi}
          opts={{
            align: "start",
            loop: true,
            dragFree: true,
            skipSnaps: false,
          }}
          className="w-full touch-pan-x"
        >
          <CarouselContent className="ml-4">
            {steps.map((step, idx) => {
              const tab = tabs[idx] || tabs[0];
              return (
                <CarouselItem key={step.id} className="pl-4 basis-[90%] sm:basis-[85%]">
                  <Card className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-0 shadow-2xl h-[580px] flex flex-col">
                    {/* Imagem - altura fixa */}
                    <div className="relative h-[280px] overflow-hidden flex-shrink-0">
                      <img
                        src={tab.src}
                        alt={tab.alt ?? tab.label}
                        className="h-full w-full object-cover"
                        style={{ objectPosition: tab.objectPosition || "center center" }}
                        loading={idx === 0 ? "eager" : "lazy"}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      
                      {/* Badge sobre a imagem */}
                      {tab.label && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-white/15 text-white/95 backdrop-blur-xl border border-white/20 text-xs px-3 py-1.5 shadow-lg">
                            {tab.label}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Conteúdo do step - altura fixa */}
                    <div className="p-8 flex flex-col justify-between flex-1">
                      <div className="space-y-5">
                        <h3 className="text-2xl sm:text-3xl font-extralight text-white tracking-tight leading-tight">
                          {step.title}
                        </h3>
                        <p className="text-base text-white/70 font-light leading-relaxed">
                          {step.text}
                        </p>
                      </div>
                    </div>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>

        {/* CTAs mobile */}
        <div className="px-4 mt-10 flex flex-col gap-4">
          <Button asChild size="lg" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-full text-base h-12 px-8 min-h-[48px] touch-manipulation shadow-lg">
            <Link href="#start">Começar</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="border border-white/20 bg-transparent hover:bg-white/5 text-white rounded-full text-base h-12 px-8 min-h-[48px] touch-manipulation"
          >
            <Link href="#examples">Explorar</Link>
          </Button>
        </div>
      </div>

      {/* DESKTOP VERSION - Grid layout original */}
      <div className="hidden md:block">
        <div className="container mx-auto grid max-w-7xl grid-cols-1 gap-10 sm:gap-12 md:gap-14 lg:gap-16 px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 lg:py-28 md:grid-cols-12">
        {/* Left column */}
        <div className="md:col-span-6 space-y-8 sm:space-y-10">
          {eyebrow && (
            <Badge variant="outline" className="border-white/20 bg-white/5 text-white backdrop-blur-sm text-sm sm:text-base px-4 py-1.5">
              {eyebrow}
            </Badge>
          )}

          {title && (
            <h2 className="text-balance text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extralight leading-[1.08] tracking-tight">
              {title}
            </h2>
          )}

          {description && (
            <p className="max-w-xl text-lg sm:text-xl text-white/70 font-light leading-relaxed">{description}</p>
          )}

          {/* Stats chips */}
          {stats.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {stats.map((s, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="bg-white/10 text-white/90 backdrop-blur-sm border border-white/10 text-sm sm:text-base px-4 py-2"
                >
                  {s}
                </Badge>
              ))}
            </div>
          )}

          {/* Steps (Accordion) */}
          <div className="mt-12 sm:mt-14 lg:mt-16 max-w-xl w-full">
            <Accordion type="single" collapsible className="w-full border-white/10">
              {steps.map((step) => (
                <AccordionItem key={step.id} value={step.id} className="border-white/10 py-3 sm:py-4">
                  <AccordionTrigger className="text-left text-base sm:text-lg font-medium text-white hover:text-white/90 hover:no-underline py-4 sm:py-5">
                    {step.title}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm sm:text-base text-white/70 font-light leading-relaxed pb-5 sm:pb-6 pt-2">
                    {step.text}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* CTAs */}
            <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row flex-wrap gap-4">
              <Button asChild size="lg" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-full text-base sm:text-lg h-12 sm:h-14 px-8 min-h-[48px] touch-manipulation">
                <Link href="#start">Começar</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="border border-white/20 bg-transparent hover:bg-white/5 text-white rounded-full text-base sm:text-lg h-12 sm:h-14 px-8 min-h-[48px] touch-manipulation"
              >
                <Link href="#examples">Explorar</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="md:col-span-6 mt-12 md:mt-0">
          <Card
            className="relative overflow-hidden rounded-3xl sm:rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl p-0 shadow-2xl"
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
                      className="h-full w-full object-cover"
                      style={{ objectPosition: t.objectPosition || "center center" }}
                      loading={idx === 0 ? "eager" : "lazy"}
                    />
                  </TabsContent>
                ))}
              </div>

              {/* Tab controls (pill) */}
              <div className="pointer-events-auto absolute inset-x-0 bottom-6 sm:bottom-8 z-10 flex w-full justify-center px-4 sm:px-6">
                <TabsList className="flex gap-1.5 sm:gap-2 rounded-full border border-white/20 bg-black/40 p-1.5 sm:p-2 backdrop-blur-xl shadow-xl">
                  {tabs.map((t) => (
                    <TabsTrigger
                      key={t.value}
                      value={t.value}
                      className="rounded-full px-5 sm:px-7 py-2.5 sm:py-3 text-sm sm:text-base text-white/70 data-[state=active]:bg-white/20 data-[state=active]:text-white font-light transition-all min-h-[44px] touch-manipulation"
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
