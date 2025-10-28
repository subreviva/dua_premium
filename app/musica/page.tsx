"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/components/ui/use-mobile"
import {
  Music2,
  Sparkles,
  Mic,
  FileMusic,
  Split,
  Plus,
  FileText,
  Shuffle,
  Download,
  Volume2,
  Video,
  ArrowRight,
  Check,
  Zap,
  Globe,
  Headphones,
} from "lucide-react"
import { BeamsBackground } from "@/components/ui/beams-background"
import { PremiumNavbar } from "@/components/ui/premium-navbar"
import { RevealText } from "@/components/ui/reveal-text"
import Link from "next/link"

export default function MusicPage() {
  const isMobile = useIsMobile()

  const features = [
    {
      icon: FileText,
      title: "Criar músicas a partir de texto",
      description:
        "Escreve o que sentes e a DUA transforma em som o que ainda não sabias dizer. Recebes duas versões diferentes que podes usar como base ou ponto de partida. Não é preciso saber teoria musical, basta ter algo a expressar.",
      image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=600&fit=crop",
    },
    {
      icon: Mic,
      title: "Criar música a partir de melodia",
      description:
        "Grava um assobio, uma voz ou uma ideia simples. A DUA acompanha-te e constrói o resto no estilo que escolheres. És tu quem define a direção criativa, a DUA apenas traduz a tua intenção em som.",
      image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=600&fit=crop",
    },
    {
      icon: FileMusic,
      title: "Estender músicas",
      description:
        "Tens uma faixa curta ou uma ideia inacabada? A DUA prolonga a composição mantendo o mesmo estilo e coerência. Não substitui o teu trabalho, amplifica-o e poupa-te tempo de estúdio.",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
    },
    {
      icon: Split,
      title: "Separar voz e instrumental",
      description:
        "Isola voz e instrumental de qualquer faixa para estudar, remixar ou reutilizar. Ferramentas antes exclusivas de grandes estúdios, agora acessíveis a qualquer criador.",
      image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop",
    },
    {
      icon: Plus,
      title: "Adicionar voz ou instrumental",
      description:
        "Tens um beat mas falta voz ou tens voz mas falta instrumental? A DUA preenche o que falta e ajuda-te a visualizar o potencial completo da tua música.",
      image: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=800&h=600&fit=crop",
    },
    {
      icon: FileText,
      title: "Gerar letras originais",
      description:
        "Se estiveres bloqueado, a DUA gera letras em português sobre qualquer tema. Podes usar, adaptar ou apenas inspirar-te. A ferramenta está ao teu serviço, nunca o contrário.",
      image: "https://images.unsplash.com/photo-1507838153414-b4bf5292ceea?w=800&h=600&fit=crop",
    },
    {
      icon: Shuffle,
      title: "Fazer remixes e versões alternativas",
      description:
        "Explora a tua música noutros estilos antes de lançar. O que antes levava semanas e custava centenas de euros, agora acontece em minutos.",
      image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop",
    },
    {
      icon: Download,
      title: "Exportar em qualidade profissional",
      description:
        "Todas as músicas podem ser exportadas em MP3 ou WAV com qualidade de estúdio. Som profissional acessível e pronto para lançamento.",
      image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=600&fit=crop",
    },
    {
      icon: Volume2,
      title: "Intensificar estilos musicais",
      description:
        "A DUA reforça o carácter do género que escolheres e ajuda-te a encontrar o tom certo antes da mixagem ou master final.",
      image: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=800&h=600&fit=crop",
    },
    {
      icon: Video,
      title: "Criar vídeos e capas",
      description:
        "A DUA cria vídeos e capas de álbum em poucos segundos. Usa o resultado final ou aproveita como referência visual. Qualidade profissional ao alcance de todos.",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
    },
  ]

  const benefits = [
    {
      icon: Zap,
      title: "Velocidade",
      description: "Testa dez ideias antes de escolher uma. Poupa tempo e orçamento para o que realmente importa.",
    },
    {
      icon: Globe,
      title: "Acesso Universal",
      description: "Ferramentas de estúdio profissional acessíveis a partir de casa, sem barreiras técnicas ou financeiras.",
    },
    {
      icon: Headphones,
      title: "Qualidade Profissional",
      description: "Som com qualidade de estúdio, pronto para lançamento. MP3 e WAV em alta resolução.",
    },
    {
      icon: Sparkles,
      title: "Liberdade Criativa",
      description: "Explora estilos, experimenta versões e descobre novas direções sem limites.",
    },
  ]

  const otherStudios = [
    {
      name: "Estúdio de Chat",
      description: "Escrita, pesquisa, programação e análise com IA avançada",
      link: "/chat",
    },
    {
      name: "Estúdio de Imagem",
      description: "Geração e edição visual profissional",
      link: "/imagestudio",
    },
    {
      name: "Estúdio de Vídeo",
      description: "Criação cinematográfica em 4K",
      link: "/videostudio",
    },
    {
      name: "Estúdio de Documentos",
      description: "Análise e geração de textos complexos",
      link: "/designstudio",
    },
  ]

  return (
    <BeamsBackground>
      <div className="relative min-h-screen">
        <PremiumNavbar />

        {/* Hero Section */}
        <section className={cn("relative", isMobile ? "pt-24 pb-16 px-6" : "pt-32 pb-24 px-4 sm:px-6 lg:px-8")}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 mb-6">
                <Music2 className="w-10 h-10 text-white" />
              </div>

              <h1
                className={cn(
                  "font-bold text-white mb-6",
                  isMobile ? "text-4xl leading-tight" : "text-5xl sm:text-6xl lg:text-7xl",
                )}
              >
                Democratizar a criação musical.
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Para todos.
                </span>
              </h1>

              <p
                className={cn(
                  "text-white/70 max-w-3xl mx-auto leading-relaxed mb-8",
                  isMobile ? "text-lg" : "text-xl sm:text-2xl",
                )}
              >
                A DUA transforma ideias em som. Produz, escreve e experimenta sem limites, sem precisar de estúdio,
                equipamento caro ou formação técnica. Aqui, qualquer pessoa pode criar música real com qualidade
                profissional.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/musicstudio">
                  <Button
                    size="lg"
                    className={cn(
                      "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-2xl shadow-purple-500/30",
                      isMobile ? "w-full h-14 text-lg" : "h-14 px-8 text-lg",
                    )}
                  >
                    <Music2 className="w-5 h-5 mr-2" />
                    Entrar no Estúdio
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className={cn(
                    "border-white/20 text-white hover:bg-white/10",
                    isMobile ? "w-full h-14 text-lg" : "h-14 px-8 text-lg",
                  )}
                  onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Saber mais
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative max-w-5xl mx-auto">
              <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1400&h=800&fit=crop"
                  alt="Estúdio de Música"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className={cn("relative", isMobile ? "py-16 px-6" : "py-24 px-4 sm:px-6 lg:px-8")}>
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 sm:p-12">
              <h2
                className={cn(
                  "font-bold text-white mb-6 text-center",
                  isMobile ? "text-3xl" : "text-4xl sm:text-5xl",
                )}
              >
                Uma nova forma de criar
              </h2>
              <div className="space-y-6 text-white/80 leading-relaxed text-lg">
                <p>
                  Durante décadas, produzir música de qualidade exigia investimento alto, tempo e conhecimento técnico.
                  O Estúdio de Música da DUA nasceu para mudar isso.
                </p>
                <p>
                  Agora, qualquer pessoa com uma ideia pode criar, experimentar e partilhar música de nível
                  profissional, sem barreiras financeiras ou técnicas.
                </p>
                <p className="text-purple-300 font-semibold text-xl">
                  A DUA não existe para substituir o humano. Existe para libertar a criatividade que estava presa por
                  falta de meios.
                </p>
                <p>
                  Foi criada por quem sabe o que é começar sem recursos e acredita que o talento não depende de lugar,
                  mas de intenção.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section
          id="features"
          className={cn("relative", isMobile ? "py-16 px-6" : "py-24 px-4 sm:px-6 lg:px-8")}
        >
          <div className="max-w-7xl mx-auto">
            <h2
              className={cn(
                "font-bold text-white mb-4 text-center",
                isMobile ? "text-3xl" : "text-4xl sm:text-5xl",
              )}
            >
              O que podes fazer no Estúdio de Música da DUA
            </h2>
            <p className="text-white/60 text-center mb-12 text-lg max-w-3xl mx-auto">
              Ferramentas profissionais acessíveis a todos. Do conceito ao lançamento.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div
                    key={index}
                    className="group bg-white/5 backdrop-blur-sm hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-2xl overflow-hidden transition-all duration-300"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                      <div className="absolute bottom-4 left-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-white/70 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className={cn("relative", isMobile ? "py-16 px-6" : "py-24 px-4 sm:px-6 lg:px-8")}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2
                className={cn(
                  "font-bold text-white mb-6",
                  isMobile ? "text-3xl" : "text-4xl sm:text-5xl",
                )}
              >
                A DUA democratiza.{" "}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Não substitui.
                </span>
              </h2>
            </div>

            <div className="space-y-8">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <p className="text-white/80 text-lg leading-relaxed mb-4">
                  A DUA não vem tirar espaço a músicos, produtores ou escritores. Vem abrir portas para quem nunca teve
                  oportunidade.
                </p>
                <p className="text-white/80 text-lg leading-relaxed">
                  Antes, só quem tinha dinheiro para estúdios, formação ou contactos podia criar música profissional.
                  Agora, qualquer pessoa pode fazê-lo a partir de casa, com as mesmas ferramentas e a mesma qualidade.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
                  <Check className="w-8 h-8 text-purple-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Para Profissionais</h3>
                  <p className="text-white/70 leading-relaxed">
                    Ganham velocidade e novas possibilidades. Testam ideias rapidamente e focam-se no que realmente
                    importa: a arte.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-pink-500/20 to-pink-500/5 backdrop-blur-sm border border-pink-500/20 rounded-2xl p-6">
                  <Check className="w-8 h-8 text-pink-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Para Iniciantes</h3>
                  <p className="text-white/70 leading-relaxed">
                    Ganham coragem para começar. Acesso a ferramentas profissionais sem barreiras financeiras ou
                    técnicas.
                  </p>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <p className="text-white/80 text-lg leading-relaxed text-center italic">
                  "Se estás sem inspiração, a DUA ajuda-te a recomeçar. Se precisas de rapidez, acelera o processo. Se
                  queres explorar, dá-te liberdade. Mas a decisão final é sempre tua e a arte continua a ser humana."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className={cn("relative", isMobile ? "py-16 px-6" : "py-24 px-4 sm:px-6 lg:px-8")}>
          <div className="max-w-7xl mx-auto">
            <h2
              className={cn(
                "font-bold text-white mb-4 text-center",
                isMobile ? "text-3xl" : "text-4xl sm:text-5xl",
              )}
            >
              O lado positivo que ninguém fala
            </h2>
            <p className="text-white/60 text-center mb-12 text-lg max-w-3xl mx-auto">
              A criatividade sempre usou ferramentas novas. A guitarra elétrica, o sintetizador e o Auto-Tune também
              foram criticados. Hoje, são parte da história da música.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <div
                    key={index}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-purple-500/50 rounded-2xl p-6 transition-all duration-300 hover:bg-white/10"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                    <p className="text-white/70 text-sm leading-relaxed">{benefit.description}</p>
                  </div>
                )
              })}
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center">
              <p className="text-white/80 text-lg leading-relaxed mb-4">
                A DUA é o próximo passo dessa evolução. Não mata a música, multiplica-a.
              </p>
              <p className="text-purple-300 font-semibold text-xl">
                Dá palco a quem nunca o teve e transforma desigualdade em possibilidade.
              </p>
            </div>
          </div>
        </section>

        {/* Credits Section */}
        <section className={cn("relative", isMobile ? "py-16 px-6" : "py-24 px-4 sm:px-6 lg:px-8")}>
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 sm:p-12">
              <h2
                className={cn(
                  "font-bold text-white mb-6 text-center",
                  isMobile ? "text-3xl" : "text-4xl",
                )}
              >
                Como funciona o sistema de créditos
              </h2>
              <div className="space-y-4 text-white/80 text-lg leading-relaxed">
                <p>Os créditos podem ser comprados em euros ou em DUA COIN.</p>
                <p className="text-purple-300 font-semibold">
                  Quem usa DUA COIN recebe sempre mais créditos e vantagens progressivas.
                </p>
                <p>
                  Os créditos não expiram e podem ser usados a qualquer momento, sem prazos e sem desperdício.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Integration Section */}
        <section className={cn("relative", isMobile ? "py-16 px-6" : "py-24 px-4 sm:px-6 lg:px-8")}>
          <div className="max-w-5xl mx-auto text-center">
            <h2
              className={cn(
                "font-bold text-white mb-6",
                isMobile ? "text-3xl" : "text-4xl sm:text-5xl",
              )}
            >
              Porquê usar o Estúdio de Música da DUA
            </h2>
            <p className="text-white/80 text-lg leading-relaxed mb-4 max-w-3xl mx-auto">
              O Estúdio de Música está integrado em todo o ecossistema da DUA. Aqui crias, na KYNTAL distribuis e com
              a DUA COIN cresces.
            </p>
            <p className="text-purple-300 font-semibold text-xl mb-8">
              É o ciclo completo da nova era criativa, feito em Portugal e ligado ao mundo.
            </p>
            <p className="text-white/70 text-lg mb-12">
              A DUA é mais do que uma ferramenta. É um sistema completo que acompanha o artista desde o primeiro
              rascunho até ao lançamento final.
            </p>
          </div>
        </section>

        {/* Other Studios */}
        <section className={cn("relative", isMobile ? "py-16 px-6" : "py-24 px-4 sm:px-6 lg:px-8")}>
          <div className="max-w-7xl mx-auto">
            <h2
              className={cn(
                "font-bold text-white mb-12 text-center",
                isMobile ? "text-3xl" : "text-4xl sm:text-5xl",
              )}
            >
              Outros estúdios e ferramentas DUA
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {otherStudios.map((studio, index) => (
                <Link key={index} href={studio.link}>
                  <div className="group bg-white/5 backdrop-blur-sm hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-2xl p-6 transition-all duration-300 h-full cursor-pointer">
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
                      {studio.name}
                    </h3>
                    <p className="text-white/70 text-sm leading-relaxed mb-4">{studio.description}</p>
                    <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-2 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className={cn("relative", isMobile ? "py-16 px-6" : "py-24 px-4 sm:px-6 lg:px-8")}>
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-white/30 rounded-3xl p-12 text-center">
              <h2
                className={cn(
                  "font-bold text-white mb-6",
                  isMobile ? "text-3xl" : "text-4xl sm:text-5xl",
                )}
              >
                A DUA é o maior ecossistema criativo português.
              </h2>
              <div className="space-y-3 mb-8">
                <p className="text-purple-300 font-semibold text-2xl">Feita para democratizar.</p>
                <p className="text-pink-300 font-semibold text-2xl">Criada para inspirar.</p>
                <p className="text-white font-semibold text-2xl">Construída para ti.</p>
              </div>
              <Link href="/musicstudio">
                <Button
                  size="lg"
                  className={cn(
                    "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-2xl shadow-purple-500/30",
                    isMobile ? "w-full h-16 text-xl" : "h-16 px-12 text-xl",
                  )}
                >
                  <Music2 className="w-6 h-6 mr-2" />
                  Começar a Criar Agora
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </BeamsBackground>
  )
}
