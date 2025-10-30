'use client'

import { useState } from 'react'
import { Sparkles, Music, Mic, Wand2, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AudioUpload } from '@/components/ui/audio-upload'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const MODELS = [
  { value: 'V5', label: 'V5 - Última Geração', description: 'Melhor qualidade, até 5000 chars' },
  { value: 'V4_5PLUS', label: 'V4.5 Plus - Avançado', description: 'Camadas complexas, 1000 chars' },
  { value: 'V4_5', label: 'V4.5 - Standard', description: 'Até 2 min, 1000 chars' },
  { value: 'V3_5', label: 'V3.5 - Legacy', description: 'Compatibilidade' }
]

const GENRES = [
  'Pop', 'Rock', 'Hip-Hop', 'Trap', 'EDM', 'House', 'Techno', 'Ambient',
  'Jazz', 'Blues', 'R&B', 'Soul', 'Funk', 'Reggae', 'Country', 'Folk',
  'Classical', 'Metal', 'Punk', 'Indie', 'Lo-Fi', 'Chill', 'Cinematic'
]

const MOODS = [
  'Energético', 'Calmo', 'Melancólico', 'Alegre', 'Épico', 'Sombrio',
  'Romântico', 'Motivacional', 'Nostálgico', 'Misterioso', 'Triste', 'Festivo'
]

const INSTRUMENTS = [
  'Piano', 'Guitarra', 'Baixo', 'Bateria', '808s', 'Sintetizador',
  'Strings', 'Brass', 'Saxofone', 'Violino', 'Pads', 'Vocal Samples'
]

const PERSONAS = [
  { id: 'persona1', name: 'Voz Masculina Grave', style: 'Deep male voice' },
  { id: 'persona2', name: 'Voz Feminina Suave', style: 'Soft female voice' },
  { id: 'persona3', name: 'Voz Masculina Energética', style: 'Energetic male voice' },
  { id: 'persona4', name: 'Voz Feminina Poderosa', style: 'Powerful female voice' },
  { id: 'persona5', name: 'Voz Neutra', style: 'Neutral voice' },
]

interface CreateSectionProps {
  onGenerate: (params: any) => void
  credits: number
  isGenerating: boolean
}

export function CreateSection({ onGenerate, credits, isGenerating }: CreateSectionProps) {
  // Basic Fields
  const [prompt, setPrompt] = useState('')
  const [lyrics, setLyrics] = useState('')
  const [title, setTitle] = useState('')
  const [model, setModel] = useState('V5')
  
  // Style Building
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedMoods, setSelectedMoods] = useState<string[]>([])
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([])
  const [customStyle, setCustomStyle] = useState('')
  
  // Advanced Options
  const [instrumental, setInstrumental] = useState(false)
  const [customMode, setCustomMode] = useState(false)
  const [selectedPersona, setSelectedPersona] = useState('')
  const [negativeTags, setNegativeTags] = useState('')
  
  // Advanced Controls (V4.5+)
  const [styleWeight, setStyleWeight] = useState(0.5)
  const [weirdnessConstraint, setWeirdnessConstraint] = useState(0.5)
  
  // Upload
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadUrl, setUploadUrl] = useState('')

  const buildStyle = () => {
    const parts = []
    if (selectedGenres.length) parts.push(selectedGenres.join(', '))
    if (selectedMoods.length) parts.push(selectedMoods.join(', '))
    if (selectedInstruments.length) parts.push(`com ${selectedInstruments.join(', ')}`)
    if (customStyle) parts.push(customStyle)
    return parts.join(' | ')
  }

  const toggleSelection = (item: string, list: string[], setList: (list: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item))
    } else {
      setList([...list, item])
    }
  }

  const estimatedCredits = 12 // Base cost for generation

  const handleGenerate = () => {
    const style = buildStyle()
    
    const params = {
      prompt: customMode ? lyrics : prompt,
      title,
      style: style || undefined,
      model,
      customMode,
      instrumental,
      negativeTags: negativeTags || undefined,
      personaId: selectedPersona || undefined,
      styleWeight: model.includes('V4_5') || model === 'V5' ? styleWeight : undefined,
      weirdnessConstraint: model.includes('V4_5') || model === 'V5' ? weirdnessConstraint : undefined,
      uploadUrl: uploadUrl || undefined
    }

    onGenerate(params)
  }

  const isValid = () => {
    if (customMode) {
      if (instrumental) {
        return style && title
      } else {
        return prompt && style && title
      }
    }
    return prompt
  }

  const style = buildStyle()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Criar Música</h2>
          <p className="text-muted-foreground">
            Use engenharia de prompt avançada para resultados profissionais
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Créditos Disponíveis</p>
          <p className="text-3xl font-bold text-primary">{credits}</p>
        </div>
      </div>

      {/* Mode Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-semibold">Modo Personalizado</Label>
              <p className="text-sm text-muted-foreground">
                Controlo total sobre estilo, título e letras
              </p>
            </div>
            <Switch
              checked={customMode}
              onCheckedChange={setCustomMode}
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Main Inputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prompt Field */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                {customMode ? 'Letras Personalizadas' : 'Prompt Principal'}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-semibold mb-1">Fórmula Recomendada:</p>
                      <p className="text-xs">
                        [Género] + [Energia/Tempo] + [Instrumentos] + [Mood] + [Termos Negativos Opcionais]
                      </p>
                      <p className="text-xs mt-2 italic">
                        Ex: "High-energy trap beat with rolling 808s, fast hi-hats, dark cinematic strings, no autotune"
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {customMode ? (
                <>
                  <div className="space-y-2">
                    <Label>
                      Letras (8-12 linhas recomendado)
                      <Badge variant="outline" className="ml-2">
                        {lyrics.split('\n').filter(l => l.trim()).length} linhas
                      </Badge>
                    </Label>
                    <Textarea
                      placeholder="Midnight rain, city lights&#10;Longing hearts through endless nights&#10;&#10;Escreva suas letras aqui..."
                      value={lyrics}
                      onChange={(e) => setLyrics(e.target.value)}
                      className="min-h-[200px] font-mono"
                      maxLength={5000}
                    />
                    <p className="text-xs text-muted-foreground">
                      💡 Dica: Teste o refrão separadamente primeiro. Frases curtas e repetidas melhoram o alinhamento.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Descrição da Música</Label>
                    <Textarea
                      placeholder="Descreva o som, género, mood e estrutura que pretende...&#10;&#10;Ex: Uma música relaxante de piano com melodias suaves, atmosfera nostálgica, acordes menores, sem vocais"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[150px]"
                      maxLength={5000}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{prompt.length} / 5000 caracteres</span>
                      <span>
                        {model === 'V5' && '✨ V5: até 5000 chars'}
                        {model.includes('V4_5') && '✨ V4.5: até 1000 chars'}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {customMode && (
                <div className="space-y-2">
                  <Label>Título da Música *</Label>
                  <Input
                    placeholder="Ex: Noite Estrelada"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={80}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Style Builder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Construtor de Estilo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="genres" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="genres">Géneros</TabsTrigger>
                  <TabsTrigger value="moods">Moods</TabsTrigger>
                  <TabsTrigger value="instruments">Instrumentos</TabsTrigger>
                </TabsList>

                <TabsContent value="genres" className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {GENRES.map(genre => (
                      <Badge
                        key={genre}
                        variant={selectedGenres.includes(genre) ? 'default' : 'outline'}
                        className="cursor-pointer transition-all hover:scale-105"
                        onClick={() => toggleSelection(genre, selectedGenres, setSelectedGenres)}
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="moods" className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {MOODS.map(mood => (
                      <Badge
                        key={mood}
                        variant={selectedMoods.includes(mood) ? 'default' : 'outline'}
                        className="cursor-pointer transition-all hover:scale-105"
                        onClick={() => toggleSelection(mood, selectedMoods, setSelectedMoods)}
                      >
                        {mood}
                      </Badge>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="instruments" className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {INSTRUMENTS.map(instrument => (
                      <Badge
                        key={instrument}
                        variant={selectedInstruments.includes(instrument) ? 'default' : 'outline'}
                        className="cursor-pointer transition-all hover:scale-105"
                        onClick={() => toggleSelection(instrument, selectedInstruments, setSelectedInstruments)}
                      >
                        {instrument}
                      </Badge>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Custom Style */}
              <div className="space-y-2">
                <Label>Estilo Personalizado (Opcional)</Label>
                <Input
                  placeholder="Ex: BPM 140, sintetizadores analógicos, reverb pesado"
                  value={customStyle}
                  onChange={(e) => setCustomStyle(e.target.value)}
                />
              </div>

              {/* Style Preview */}
              {style && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Pré-visualização do Estilo:</p>
                  <p className="text-sm text-muted-foreground">{style}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Upload de Áudio (Opcional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AudioUpload
                onFileSelect={(file) => setUploadedFile(file)}
                onUrlProvide={(url) => setUploadUrl(url)}
              />
              <p className="text-xs text-muted-foreground mt-2">
                💡 Use para: Cover, Extend, Add Instrumentals/Vocals
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Settings */}
        <div className="space-y-6">
          {/* Model Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Modelo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODELS.map(m => (
                    <SelectItem key={m.value} value={m.value}>
                      <div>
                        <p className="font-medium">{m.label}</p>
                        <p className="text-xs text-muted-foreground">{m.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Vocal Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Opções Vocais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Instrumental Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Apenas Instrumental</Label>
                  <p className="text-xs text-muted-foreground">
                    Sem vocais (teste melodias primeiro)
                  </p>
                </div>
                <Switch
                  checked={instrumental}
                  onCheckedChange={setInstrumental}
                />
              </div>

              {/* Persona Selection */}
              {!instrumental && (
                <div className="space-y-2">
                  <Label>Persona Vocal</Label>
                  <Select value={selectedPersona} onValueChange={setSelectedPersona}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma persona..." />
                    </SelectTrigger>
                    <SelectContent>
                      {PERSONAS.map(persona => (
                        <SelectItem key={persona.id} value={persona.id}>
                          {persona.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    💡 Combine persona + prompt descritivo para melhores resultados
                  </p>
                </div>
              )}

              {/* Negative Tags */}
              <div className="space-y-2">
                <Label>Tags Negativas</Label>
                <Input
                  placeholder="Ex: no autotune, no heavy bass"
                  value={negativeTags}
                  onChange={(e) => setNegativeTags(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Elementos a evitar (não oficial, mas funciona)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Controls (V4.5+) */}
          {(model.includes('V4_5') || model === 'V5') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Controles Avançados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Ênfase no Estilo</Label>
                    <span className="text-sm text-muted-foreground">{styleWeight.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={styleWeight}
                    onChange={(e) => setStyleWeight(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Criatividade</Label>
                    <span className="text-sm text-muted-foreground">{weirdnessConstraint.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={weirdnessConstraint}
                    onChange={(e) => setWeirdnessConstraint(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maior = mais experimental
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generate Button */}
          <Card className="border-primary/50">
            <CardContent className="pt-6">
              <Button
                size="lg"
                className="w-full text-lg font-semibold"
                disabled={!isValid() || isGenerating || credits < estimatedCredits}
                onClick={handleGenerate}
              >
                {isGenerating ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                    A Gerar...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Gerar Música
                  </>
                )}
              </Button>
              
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Custo estimado:</span>
                  <span className="font-semibold">{estimatedCredits} créditos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Após geração:</span>
                  <span className="font-semibold">{credits - estimatedCredits} créditos</span>
                </div>
              </div>

              {credits < estimatedCredits && (
                <p className="text-sm text-destructive mt-3">
                  ⚠️ Créditos insuficientes
                </p>
              )}
            </CardContent>
          </Card>

          {/* Pro Tips */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                💡 Dicas Profissionais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <p>• Teste instrumental primeiro para validar melodia</p>
              <p>• Mantenha letras em 8-12 linhas para melhor timing</p>
              <p>• Use personas + prompts descritivos combinados</p>
              <p>• Guarde versões antes de fazer extends/edits</p>
              <p>• Qualidade do prompt = 70% da qualidade final</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
