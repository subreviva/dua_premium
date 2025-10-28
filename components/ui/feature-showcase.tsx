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
import { cn } from "@/lib/utils";

export type TabMedia = {
  value: string; // unique value for Tabs
  label: string; // button label
  src: string;   // image url
  alt?: string;
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

  return (
    <section className={cn("w-full text-white", className)}>
      <div className="container mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-16 md:grid-cols-12 md:py-20 lg:gap-14">
        {/* Left column */}
        <div className="md:col-span-6">
          <Badge variant="outline" className="mb-6 border-white/20 bg-white/5 text-white backdrop-blur-sm">
            {eyebrow}
          </Badge>

          <h2 className="text-balance text-4xl font-extralight leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            {title}
          </h2>

          {description ? (
            <p className="mt-6 max-w-xl text-lg text-white/70 font-light">{description}</p>
          ) : null}

          {/* Stats chips */}
          {stats.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {stats.map((s, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="bg-white/10 text-white/90 backdrop-blur-sm border border-white/10"
                >
                  {s}
                </Badge>
              ))}
            </div>
          )}

          {/* Steps (Accordion) */}
          <div className="mt-10 max-w-xl">
            <Accordion type="single" collapsible className="w-full border-white/10">
              {steps.map((step) => (
                <AccordionItem key={step.id} value={step.id} className="border-white/10">
                  <AccordionTrigger className="text-left text-base font-medium text-white hover:text-white/90 hover:no-underline">
                    {step.title}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-white/70 font-light leading-relaxed">
                    {step.text}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-full">
                <Link href="#start">Começar</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="border border-white/20 bg-transparent hover:bg-white/5 text-white rounded-full"
              >
                <Link href="#examples">Explorar</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="md:col-span-6">
          <Card
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-0 shadow-2xl"
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
                      loading={idx === 0 ? "eager" : "lazy"}
                    />
                  </TabsContent>
                ))}
              </div>

              {/* Tab controls (pill) */}
              <div className="pointer-events-auto absolute inset-x-0 bottom-6 z-10 flex w-full justify-center px-4">
                <TabsList className="flex gap-2 rounded-full border border-white/20 bg-black/40 p-1.5 backdrop-blur-xl">
                  {tabs.map((t) => (
                    <TabsTrigger
                      key={t.value}
                      value={t.value}
                      className="rounded-full px-6 py-2.5 text-white/70 data-[state=active]:bg-white/20 data-[state=active]:text-white font-light transition-all"
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
    </section>
  );
}
