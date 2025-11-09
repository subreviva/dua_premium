"use client";

import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface GalleryItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  image: string;
}

interface Gallery6Props {
  heading?: string;
  items?: GalleryItem[];
}

const Gallery6 = ({
  heading = "Estúdios Criativos",
  items = [
    {
      id: "chat",
      title: "Chat Studio",
      summary:
        "Converse com a DUA. Ela responde por texto ou áudio, em português ou crioulo cabo-verdiano. Uma parceira criativa que entende a tua língua e cultura.",
      url: "/chat",
      image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80",
    },
    {
      id: "cinema",
      title: "Cinema Studio",
      summary:
        "Cria vídeos profissionais com inteligência artificial. Transforma as tuas ideias em conteúdo visual de alta qualidade para redes sociais, publicidade ou cinema.",
      url: "/videostudio",
      image: "https://images.unsplash.com/photo-1574267432644-f74f8ec574c8?w=800&q=80",
    },
    {
      id: "design",
      title: "Design Studio",
      summary:
        "Cria designs visuais únicos. Logótipos, posters, capas de álbuns, identidades visuais — tudo gerado com IA e adaptado à estética lusófona.",
      url: "/designstudio",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
    },
    {
      id: "music",
      title: "Music Studio",
      summary:
        "Produz música original. Desde batidas de afrobeat a melodias de kizomba, a DUA ajuda-te a criar sons autênticos da diáspora lusófona.",
      url: "/musicstudio",
      image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80",
    },
    {
      id: "image",
      title: "Image Studio",
      summary:
        "Gera imagens fotorrealistas ou artísticas. Cria artwork, ilustrações, mockups — qualquer imagem que conseguires imaginar, a DUA consegue criar.",
      url: "/imagestudio",
      image: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&q=80",
    },
  ],
}: Gallery6Props) => {
  const router = useRouter();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  
  useEffect(() => {
    if (!carouselApi) {
      return;
    }
    const updateSelection = () => {
      setCanScrollPrev(carouselApi.canScrollPrev());
      setCanScrollNext(carouselApi.canScrollNext());
    };
    updateSelection();
    carouselApi.on("select", updateSelection);
    return () => {
      carouselApi.off("select", updateSelection);
    };
  }, [carouselApi]);

  return (
    <section className="py-0">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-10 sm:mb-12 md:mb-16 lg:mb-20 flex flex-col justify-between md:flex-row md:items-end gap-6">
          <div className="max-w-3xl w-full">
            {/* Destaque em Mobile - Linha decorativa */}
            <div className="mb-6 sm:mb-8 h-1 w-12 sm:w-16 bg-gradient-to-r from-white/80 via-white/40 to-transparent rounded-full" />
            
            <h2 className="mb-4 text-6xl sm:text-7xl md:text-8xl lg:text-8xl font-extralight text-white tracking-tighter leading-[0.9] bg-gradient-to-br from-white via-white/95 to-white/70 bg-clip-text text-transparent md:bg-none md:text-white">
              {heading}
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-white/70 max-w-2xl font-light leading-relaxed">
              Cinco estúdios especializados para a tua criatividade
            </p>
          </div>
          <div className="mt-6 sm:mt-8 flex shrink-0 items-center justify-start gap-3">
            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                carouselApi?.scrollPrev();
              }}
              disabled={!canScrollPrev}
              className="disabled:pointer-events-auto bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30 text-white backdrop-blur-xl h-12 w-12 sm:h-14 sm:w-14 rounded-full transition-all duration-300"
            >
              <ArrowLeft className="size-5 sm:size-6" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                carouselApi?.scrollNext();
              }}
              disabled={!canScrollNext}
              className="disabled:pointer-events-auto bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30 text-white backdrop-blur-xl h-12 w-12 sm:h-14 sm:w-14 rounded-full transition-all duration-300"
            >
              <ArrowRight className="size-5 sm:size-6" />
            </Button>
          </div>
        </div>
      </div>
      <div className="w-full">
        <Carousel
          setApi={setCarouselApi}
          opts={{
            align: "start",
            loop: true,
            dragFree: true,
            skipSnaps: false,
            breakpoints: {
              "(max-width: 768px)": {
                dragFree: true,
                containScroll: "trimSnaps",
              },
            },
          }}
          className="relative touch-pan-x"
        >
          <CarouselContent className="ml-4 sm:ml-6 md:ml-8 2xl:ml-[max(8rem,calc(50vw-700px+1rem))] -webkit-overflow-scrolling-touch">
            {items.map((item) => (
              <CarouselItem key={item.id} className="pl-4 sm:pl-5 basis-[92%] sm:basis-[78%] md:basis-auto md:max-w-[500px] lg:max-w-[550px] touch-manipulation">
                <div
                  onClick={() => router.push("/acesso")}
                  className="group flex flex-col justify-between cursor-pointer h-full"
                >
                  <div>
                    <div className="flex aspect-[3/2] overflow-clip rounded-3xl sm:rounded-2xl shadow-2xl">
                      <div className="flex-1">
                        <div className="relative h-full w-full origin-center transition-transform duration-700 ease-out group-hover:scale-105 will-change-transform">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-full w-full object-cover object-center"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mb-4 line-clamp-2 break-words pt-8 text-3xl sm:text-4xl md:text-3xl font-extralight text-white tracking-tight leading-tight antialiased">
                    {item.title}
                  </div>
                  <div className="mb-10 line-clamp-4 text-lg sm:text-xl md:text-lg text-white/75 font-light leading-relaxed antialiased">
                    {item.summary}
                  </div>
                  <div className="flex items-center text-base sm:text-lg text-white/85 font-medium group-hover:text-white transition-all duration-300 min-h-[44px]">
                    Explorar
                    <ArrowRight className="ml-2 size-5 sm:size-6 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

export { Gallery6 };
