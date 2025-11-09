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
      <div className="container mx-auto px-6">
        <div className="mb-12 flex flex-col justify-between md:mb-16 md:flex-row md:items-end lg:mb-20">
          <div>
            <h2 className="mb-4 text-5xl sm:text-6xl md:text-7xl font-light text-white tracking-tight leading-tight">
              {heading}
            </h2>
            <p className="text-xl sm:text-2xl text-white/60 max-w-2xl font-light">
              Cinco estúdios especializados para a tua criatividade
            </p>
          </div>
          <div className="mt-8 flex shrink-0 items-center justify-start gap-3">
            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                carouselApi?.scrollPrev();
              }}
              disabled={!canScrollPrev}
              className="disabled:pointer-events-auto bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-xl h-12 w-12 rounded-full"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                carouselApi?.scrollNext();
              }}
              disabled={!canScrollNext}
              className="disabled:pointer-events-auto bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-xl h-12 w-12 rounded-full"
            >
              <ArrowRight className="size-5" />
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
            breakpoints: {
              "(max-width: 768px)": {
                dragFree: true,
              },
            },
          }}
          className="relative"
        >
          <CarouselContent className="ml-8 2xl:ml-[max(8rem,calc(50vw-700px+1rem))]">
            {items.map((item) => (
              <CarouselItem key={item.id} className="pl-4 md:max-w-[500px] lg:max-w-[550px]">
                <div
                  onClick={() => router.push("/acesso")}
                  className="group flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <div className="flex aspect-[3/2] overflow-clip rounded-2xl">
                      <div className="flex-1">
                        <div className="relative h-full w-full origin-center transition duration-500 group-hover:scale-105">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-full w-full object-cover object-center"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                          
                          {/* Login Required Badge */}
                          <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-xl border border-white/20 rounded-full">
                            <span className="text-white/90 text-xs font-medium">🔒 Login Obrigatório</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3 line-clamp-2 break-words pt-6 text-2xl sm:text-3xl font-light text-white md:mb-4 md:pt-6 lg:pt-6">
                    {item.title}
                  </div>
                  <div className="mb-8 line-clamp-3 text-base sm:text-lg text-white/60 font-light leading-relaxed md:mb-12 lg:mb-10">
                    {item.summary}
                  </div>
                  <div className="flex items-center text-base text-white/80 font-medium group-hover:text-white transition-colors">
                    Fazer Login para Aceder
                    <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
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
