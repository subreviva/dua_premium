'use client'

import { useState, useMemo } from 'react'
import { Search, Filter, Grid3x3, List, SlidersHorizontal, Calendar, Music2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MusicCard } from '@/components/ui/music-card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Song {
  id: string
  title: string
  imageUrl: string
  audioUrl: string
  status: 'pending' | 'processing' | 'complete' | 'error'
  duration?: number
  model: string
  style?: string
  genre?: string
  createdAt: string
  prompt?: string
}

interface LibrarySectionProps {
  songs: Song[]
  onPlaySong: (id: string) => void
  onDownloadSong: (id: string) => void
  onShareSong: (id: string) => void
  onExtendSong: (id: string) => void
}

type ViewMode = 'grid' | 'list'
type SortBy = 'recent' | 'oldest' | 'title' | 'model'

export function LibrarySection({
  songs,
  onPlaySong,
  onDownloadSong,
  onShareSong,
  onExtendSong
}: LibrarySectionProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortBy>('recent')
  
  // Filters
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['complete', 'processing', 'pending'])
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')

  // Extract unique values for filters
  const availableModels = useMemo(() => 
    [...new Set(songs.map(s => s.model))].filter(Boolean),
    [songs]
  )

  const availableGenres = useMemo(() =>
    [...new Set(songs.map(s => s.genre).filter(Boolean))],
    [songs]
  )

  // Filter and sort songs
  const filteredSongs = useMemo(() => {
    let filtered = songs

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(song =>
        song.title?.toLowerCase().includes(query) ||
        song.style?.toLowerCase().includes(query) ||
        song.prompt?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (selectedStatuses.length < 4) {
      filtered = filtered.filter(song => selectedStatuses.includes(song.status))
    }

    // Model filter
    if (selectedModels.length > 0) {
      filtered = filtered.filter(song => selectedModels.includes(song.model))
    }

    // Genre filter
    if (selectedGenres.length > 0) {
      filtered = filtered.filter(song => song.genre && selectedGenres.includes(song.genre))
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const filterDate = new Date()
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          break
      }

      filtered = filtered.filter(song => new Date(song.createdAt) >= filterDate)
    }

    // Sort
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'title':
        filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
        break
      case 'model':
        filtered.sort((a, b) => a.model.localeCompare(b.model))
        break
    }

    return filtered
  }, [songs, searchQuery, selectedStatuses, selectedModels, selectedGenres, dateFilter, sortBy])

  const activeFiltersCount = 
    (selectedStatuses.length < 4 ? 1 : 0) +
    selectedModels.length +
    selectedGenres.length +
    (dateFilter !== 'all' ? 1 : 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Biblioteca</h2>
          <p className="text-muted-foreground">
            {filteredSongs.length} de {songs.length} músicas
          </p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Procurar por título, estilo ou prompt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mais Recentes</SelectItem>
                <SelectItem value="oldest">Mais Antigas</SelectItem>
                <SelectItem value="title">Por Título</SelectItem>
                <SelectItem value="model">Por Modelo</SelectItem>
              </SelectContent>
            </Select>

            {/* Filters Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="relative">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filtros
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Estado</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={selectedStatuses.includes('complete')}
                  onCheckedChange={(checked) => {
                    setSelectedStatuses(prev =>
                      checked ? [...prev, 'complete'] : prev.filter(s => s !== 'complete')
                    )
                  }}
                >
                  Concluídas
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedStatuses.includes('processing')}
                  onCheckedChange={(checked) => {
                    setSelectedStatuses(prev =>
                      checked ? [...prev, 'processing'] : prev.filter(s => s !== 'processing')
                    )
                  }}
                >
                  A Processar
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedStatuses.includes('pending')}
                  onCheckedChange={(checked) => {
                    setSelectedStatuses(prev =>
                      checked ? [...prev, 'pending'] : prev.filter(s => s !== 'pending')
                    )
                  }}
                >
                  Pendentes
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedStatuses.includes('error')}
                  onCheckedChange={(checked) => {
                    setSelectedStatuses(prev =>
                      checked ? [...prev, 'error'] : prev.filter(s => s !== 'error')
                    )
                  }}
                >
                  Com Erro
                </DropdownMenuCheckboxItem>

                {availableModels.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Modelo</DropdownMenuLabel>
                    {availableModels.map(model => (
                      <DropdownMenuCheckboxItem
                        key={model}
                        checked={selectedModels.includes(model)}
                        onCheckedChange={(checked) => {
                          setSelectedModels(prev =>
                            checked ? [...prev, model] : prev.filter(m => m !== model)
                          )
                        }}
                      >
                        {model}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </>
                )}

                {availableGenres.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Género</DropdownMenuLabel>
                    {availableGenres.map(genre => genre && (
                      <DropdownMenuCheckboxItem
                        key={genre}
                        checked={selectedGenres.includes(genre)}
                        onCheckedChange={(checked) => {
                          setSelectedGenres(prev =>
                            checked ? [...prev, genre] : prev.filter(g => g !== genre)
                          )
                        }}
                      >
                        {genre}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuLabel>Data</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={dateFilter === 'today'}
                  onCheckedChange={(checked) => setDateFilter(checked ? 'today' : 'all')}
                >
                  Hoje
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={dateFilter === 'week'}
                  onCheckedChange={(checked) => setDateFilter(checked ? 'week' : 'all')}
                >
                  Última Semana
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={dateFilter === 'month'}
                  onCheckedChange={(checked) => setDateFilter(checked ? 'month' : 'all')}
                >
                  Último Mês
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Mode */}
            <div className="flex gap-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
              {selectedModels.map(model => (
                <Badge key={model} variant="secondary" className="cursor-pointer" onClick={() => {
                  setSelectedModels(prev => prev.filter(m => m !== model))
                }}>
                  Modelo: {model}
                  <span className="ml-1">×</span>
                </Badge>
              ))}
              {selectedGenres.map(genre => (
                <Badge key={genre} variant="secondary" className="cursor-pointer" onClick={() => {
                  setSelectedGenres(prev => prev.filter(g => g !== genre))
                }}>
                  {genre}
                  <span className="ml-1">×</span>
                </Badge>
              ))}
              {dateFilter !== 'all' && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setDateFilter('all')}>
                  {dateFilter === 'today' ? 'Hoje' : dateFilter === 'week' ? 'Semana' : 'Mês'}
                  <span className="ml-1">×</span>
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={() => {
                setSelectedModels([])
                setSelectedGenres([])
                setDateFilter('all')
                setSelectedStatuses(['complete', 'processing', 'pending'])
              }}>
                Limpar filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Songs Grid/List */}
      {filteredSongs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Music2 className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Nenhuma música encontrada</h3>
            <p className="text-muted-foreground text-sm text-center max-w-sm">
              {searchQuery || activeFiltersCount > 0
                ? 'Tente ajustar os filtros ou termo de pesquisa'
                : 'Comece a criar músicas para ver o seu histórico aqui'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {filteredSongs.map(song => (
            <MusicCard
              key={song.id}
              {...song}
              onPlay={() => onPlaySong(song.id)}
              onDownload={() => onDownloadSong(song.id)}
              onShare={() => onShareSong(song.id)}
              onExtend={() => onExtendSong(song.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
