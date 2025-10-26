"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles, Music, Video, ImageIcon, Palette, MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"
import BeamsBackground from "@/components/ui/beams-background"

export default function SobrePage() {
  const router = useRouter()

  const tools = [
    {
      icon: MessageSquare,
      title: "DUA Chat",
      subtitle: "O Centro de Comando Criativo",
      description:
        "Assistente multimodal que processa texto, imagem, áudio e vídeo em tempo real. Interface de chat profissional com histórico persistente, streaming de respostas e integração total com todos os estúdios especializados.",
      audience: "Toda a gente. É o teu primeiro ponto de contacto com o ecossistema DUA.",
    },
    {
      icon: Video,
      title: "DUA Cinema",
      subtitle: "Estúdio Audiovisual Inteligente",
      description:
        "Produção, edição e análise de vídeo potenciadas por IA. Processa conteúdo audiovisual, oferece feedback técnico e criativo, e fornece capacidades de produção cinematográfica profissional.",
      audience: "Cineastas, editores de vídeo, criadores de conteúdo visual e marcas que exigem qualidade de cinema.",
    },
    {
      icon: Palette,
      title: "DUA Design",
      subtitle: "Criação Visual Sem Limites",
      description:
        "Plataforma de geração e manipulação de imagens com IA. Ferramentas profissionais para conceção visual, prototipagem rápida e arte final. Do sketch à execução impecável.",
      audience: "Designers gráficos, artistas visuais, diretores de arte e criativos que exigem pixel-perfect.",
    },
    {
      icon: Music,
      title: "DUA Music",
      subtitle: "O Teu Estúdio Musical na Nuvem",
      description:
        "Produção musical completa potenciada por IA. Geração musical, análise de áudio, processamento sonoro e masterização assistida. Inclui conversão de voz, denoising, remoção de eco e reverberação.",
      audience: "Músicos, produtores, engenheiros de som e qualquer pessoa que respira música.",
    },
    {
      icon: ImageIcon,
      title: "DUA Imagem",
      subtitle: "Processamento Fotográfico Profissional",
      description:
        "Especialista em análise, transformação e criação de conteúdo fotográfico e visual. Ferramentas de edição avançada, tratamento de imagem e geração de conteúdo visual de alta qualidade.",
      audience: "Fotógrafos profissionais, artistas visuais e criadores de conteúdo fotográfico.",
    },
  ]

  return (
    <BeamsBackground intensity="medium" className="min-h-screen">
      <div className="relative z-10 min-h-screen">
        <header className="w-full px-4 sm:px-8 py-6 flex items-center justify-between backdrop-blur-sm">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="rounded-full hover:bg-card/50 transition-all duration-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              <div className="absolute inset-0 blur-xl bg-primary/30 -z-10" />
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground tracking-tight">DUA IA</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => router.push("/login")}
              className="rounded-full hover:bg-card/50 transition-all duration-300"
            >
              Entrar
            </Button>
            <Button
              onClick={() => router.push("/registo")}
              className="rounded-full bg-primary hover:bg-primary/90 transition-all duration-300"
            >
              Registar
            </Button>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-20 space-y-16 sm:space-y-24">
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-foreground leading-tight">
              DUA IA: Inteligência Criativa para a Geração Lusófona
            </h2>
            <div className="prose prose-lg prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
              <p className="text-lg sm:text-xl">
                A DUA nasceu da necessidade de um criador que estava cansado de depender de sistemas que não o serviam.
              </p>
              <p>
                Desenvolvida no silêncio de um quarto, entre código e música, nasceu da experiência de alguém que viveu
                todos os lados da indústria criativa: palcos de festivais, estúdios de produção, projectos
                internacionais e, também, os bairros onde a cultura nasce mas raramente é reconhecida.
              </p>
              <p>
                Alguém que viu o sistema falhar artistas repetidamente. Que percebeu que as ferramentas mais poderosas
                estavam sempre nas mãos de quem menos criava. Que decidiu aprender a programar do zero para não ter de
                pedir permissão a ninguém.
              </p>
              <p className="text-lg font-medium text-foreground">
                A DUA é o resultado dessa revolta transformada em código. É a primeira assistente criativa lusófona com
                inteligência artificial, construída por quem entende tanto de luta quanto de arte, tanto de bairro
                quanto de tecnologia.
              </p>
              <p className="text-xl font-bold text-primary">Metade humana, metade máquina. 100% criativa.</p>
            </div>
          </section>

          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            <h3 className="text-3xl sm:text-4xl font-display font-bold text-foreground">Onde Nasceu Esta Ideia</h3>
            <div className="prose prose-lg prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
              <p className="text-lg italic text-foreground">
                "E se os criadores tivessem acesso às mesmas ferramentas que os grandes estúdios, mas sem depender de
                corporações, sem pagar fortunas e sem perder a sua identidade?"
              </p>
              <p>
                Esta ideia nasceu de anos a ver talento ser desperdiçado por falta de estrutura. De ver artistas serem
                explorados por não dominarem a tecnologia. De perceber que a próxima geração da cultura lusófona só iria
                ter uma hipótese se tivesse acesso a armas de classe mundial.
              </p>
              <p>
                Foi construída por alguém que transformou dor em estrutura, caos em código e rebeldia em criação. Alguém
                que viveu entre dois mundos e decidiu construir uma ponte entre eles, não apenas para si, mas para todos
                os que vêm dos mesmos lugares, falam as mesmas línguas e têm os mesmos sonhos.
              </p>
              <p className="text-lg font-medium text-foreground">
                A DUA é prova de que é possível reescrever as regras quando o sistema não te deixa jogar.
              </p>
            </div>
          </section>

          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            <h3 className="text-3xl sm:text-4xl font-display font-bold text-foreground">As Ferramentas</h3>
            <div className="grid gap-6">
              {tools.map((tool, index) => (
                <div
                  key={tool.title}
                  className="glass-effect rounded-2xl p-6 sm:p-8 hover:glow-effect transition-all duration-300 space-y-4"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                      <tool.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h4 className="text-xl sm:text-2xl font-bold text-foreground">{tool.title}</h4>
                      <p className="text-sm font-medium text-primary">{tool.subtitle}</p>
                      <p className="text-muted-foreground leading-relaxed">{tool.description}</p>
                      <p className="text-sm text-muted-foreground/80">
                        <span className="font-medium text-foreground">Para quem:</span> {tool.audience}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-400">
            <h3 className="text-3xl sm:text-4xl font-display font-bold text-foreground">O Ecossistema 2 LADOS</h3>
            <div className="prose prose-lg prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
              <p>
                A DUA não trabalha sozinha. Faz parte de um ecossistema criativo completo que te leva da ideia ao
                mercado.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-effect rounded-2xl p-6 sm:p-8 space-y-4">
                <h4 className="text-2xl font-bold text-foreground">Serviços Digitais</h4>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-bold text-primary mb-2">Kyntal: Distribuição Musical Global</h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Distribui a tua música nas principais plataformas globais. Gestão de royalties, YouTube Content
                      ID, licenciamento sync e playlisting.
                    </p>
                  </div>
                  <div>
                    <h5 className="font-bold text-primary mb-2">DUA Coin: A Economia Criativa</h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Criptomoeda na blockchain Apertum que alimenta o ecossistema. Financia campanhas, bolsas criativas
                      e apoio direto a artistas.
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-effect rounded-2xl p-6 sm:p-8 space-y-4">
                <h4 className="text-2xl font-bold text-foreground">Serviços Físicos</h4>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-bold text-primary mb-2">Estúdio de Gravação</h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Aluguer de estúdio profissional equipado com tecnologia de ponta. Gravação, produção e
                      pós-produção musical e audiovisual.
                    </p>
                  </div>
                  <div>
                    <h5 className="font-bold text-primary mb-2">Mix & Master Profissional</h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Mistura e masterização com os melhores profissionais. Tratamento sonoro completo: denoising,
                      remoção de eco e finalização de alta qualidade.
                    </p>
                  </div>
                  <div>
                    <h5 className="font-bold text-primary mb-2">Design Profissional</h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Identidade visual, branding e design gráfico por profissionais especializados. Do conceito à
                      execução final.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
            <h3 className="text-3xl sm:text-4xl font-display font-bold text-foreground">A Filosofia</h3>
            <div className="glass-effect rounded-2xl p-8 sm:p-12 text-center space-y-6">
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                Acesso aberto. Sem exclusões. Sem barreiras.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                Acreditamos que a próxima geração de criadores lusófonos merece as mesmas ferramentas que os grandes
                mercados, mas construídas para a nossa cultura, a nossa língua e as nossas histórias.
              </p>
              <p className="text-xl font-medium text-primary">Tecnologia de classe mundial. Sensibilidade lusófona.</p>
            </div>
          </section>

          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-600">
            <h3 className="text-3xl sm:text-4xl font-display font-bold text-foreground text-center">Visão Integrada</h3>
            <div className="glass-effect rounded-2xl p-8 sm:p-12 space-y-4 text-center">
              <p className="text-xl font-medium text-foreground">Cria com a DUA.</p>
              <p className="text-xl font-medium text-foreground">Produz nos nossos estúdios.</p>
              <p className="text-xl font-medium text-foreground">Distribui com a Kyntal.</p>
              <p className="text-xl font-medium text-foreground">Financia com a DUA Coin.</p>
              <p className="text-2xl font-bold text-primary mt-8">Tudo no ecossistema 2 LADOS.</p>
              <p className="text-lg text-muted-foreground">
                Tudo pensado para que te foques no que realmente importa: criar.
              </p>
            </div>
          </section>

          <section className="text-center space-y-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700">
            <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              A DUA não é só uma ferramenta. É a resposta de quem decidiu que já chega de esperar que o sistema mude. É
              o código que nasceu da revolta. É a tecnologia que nasceu da rua.
            </p>
            <Button
              size="lg"
              onClick={() => router.push("/registo")}
              className="rounded-full text-base px-8 py-6 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:scale-105"
            >
              Começar Agora
            </Button>
          </section>
        </main>
      </div>
    </BeamsBackground>
  )
}
