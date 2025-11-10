'use client';

import { useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Save,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  ImageIcon,
  Music,
  Video,
  Volume2,
  Mic,
  MessageSquare,
  Code,
  Languages,
  Palette,
  Coins,
  AlertCircle,
  CheckCircle,
  History,
  Edit2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceCost {
  id: string;
  service_name: string;
  service_label: string;
  service_description: string;
  credits_cost: number;
  is_active: boolean;
  icon: string;
  category: string;
  updated_at: string;
}

const ICON_MAP: Record<string, any> = {
  ImageIcon,
  Music,
  Video,
  Volume2,
  Mic,
  MessageSquare,
  Code,
  Languages,
  Palette,
};

const CATEGORY_COLORS: Record<string, string> = {
  generation: 'from-purple-500 to-pink-500',
  design: 'from-blue-500 to-cyan-500',
  audio: 'from-green-500 to-emerald-500',
  chat: 'from-orange-500 to-amber-500',
  development: 'from-red-500 to-rose-500',
  text: 'from-indigo-500 to-violet-500',
};

export default function ServiceCostsConfig() {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<ServiceCost[]>([]);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [processing, setProcessing] = useState(false);
  const [changes, setChanges] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    loadServiceCosts();
  }, []);

  const loadServiceCosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabaseClient
        .from('service_costs')
        .select('*')
        .order('category', { ascending: true })
        .order('credits_cost', { ascending: false });

      if (error) throw error;

      setServices(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar custos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service: ServiceCost) => {
    setEditingService(service.id);
    setEditValue(service.credits_cost);
  };

  const handleCancel = () => {
    setEditingService(null);
    setEditValue(0);
  };

  const handleSave = async (service: ServiceCost) => {
    if (editValue === service.credits_cost) {
      setEditingService(null);
      return;
    }

    if (editValue < 0) {
      toast.error('O custo não pode ser negativo');
      return;
    }

    if (editValue > 1000) {
      toast.error('O custo máximo é 1000 créditos');
      return;
    }

    setProcessing(true);
    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      
      const { data, error } = await supabaseClient.rpc('update_service_cost', {
        p_service_name: service.service_name,
        p_new_cost: editValue,
        p_admin_email: user?.email,
      });

      if (error) throw error;

      toast.success(
        `Custo de "${service.service_label}" atualizado: ${service.credits_cost} → ${editValue} créditos`,
        { duration: 5000 }
      );

      // Registrar mudança para exibir
      setChanges(prev => new Map(prev).set(service.id, service.credits_cost));

      // Recarregar lista
      await loadServiceCosts();
      setEditingService(null);
    } catch (error: any) {
      toast.error('Erro ao atualizar custo: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleQuickAdjust = async (service: ServiceCost, delta: number) => {
    const newCost = service.credits_cost + delta;
    
    if (newCost < 0) {
      toast.error('O custo não pode ser negativo');
      return;
    }

    if (newCost > 1000) {
      toast.error('O custo máximo é 1000 créditos');
      return;
    }

    setProcessing(true);
    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      
      const { data, error } = await supabaseClient.rpc('update_service_cost', {
        p_service_name: service.service_name,
        p_new_cost: newCost,
        p_admin_email: user?.email,
      });

      if (error) throw error;

      toast.success(
        `${service.service_label}: ${service.credits_cost} → ${newCost} créditos`,
        { duration: 3000 }
      );

      setChanges(prev => new Map(prev).set(service.id, service.credits_cost));
      await loadServiceCosts();
    } catch (error: any) {
      toast.error('Erro ao atualizar: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const getTotalStats = () => {
    const total = services.reduce((sum, s) => sum + s.credits_cost, 0);
    const average = services.length > 0 ? Math.round(total / services.length) : 0;
    const min = Math.min(...services.map(s => s.credits_cost));
    const max = Math.max(...services.map(s => s.credits_cost));
    
    return { total, average, min, max, count: services.length };
  };

  const groupedServices = services.reduce((acc, service) => {
    const category = service.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(service);
    return acc;
  }, {} as Record<string, ServiceCost[]>);

  const stats = getTotalStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="w-6 h-6 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Configuração de Custos de Serviços
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Defina quantos créditos cada serviço consome
          </p>
        </div>
        <Button
          onClick={loadServiceCosts}
          variant="outline"
          size="sm"
          disabled={processing}
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", processing && "animate-spin")} />
          Recarregar
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Coins className="w-4 h-4" />
            Total de Serviços
          </div>
          <div className="text-2xl font-bold">{stats.count}</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <TrendingUp className="w-4 h-4" />
            Custo Médio
          </div>
          <div className="text-2xl font-bold">{stats.average} créditos</div>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <TrendingDown className="w-4 h-4" />
            Mínimo
          </div>
          <div className="text-2xl font-bold">{stats.min} créditos</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <TrendingUp className="w-4 h-4" />
            Máximo
          </div>
          <div className="text-2xl font-bold">{stats.max} créditos</div>
        </div>
      </div>

      {/* Info Alert */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
        <div className="flex-1 text-sm">
          <p className="font-medium text-blue-500 mb-1">Importante:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>As alterações afetam <strong>imediatamente</strong> o consumo de créditos</li>
            <li>Todas as mudanças são registradas no histórico de transações</li>
            <li>Use os botões +/- para ajustes rápidos ou clique em editar para valor específico</li>
          </ul>
        </div>
      </div>

      {/* Services by Category */}
      <div className="space-y-6">
        {Object.entries(groupedServices).map(([category, categoryServices]) => (
          <div key={category} className="space-y-3">
            <h3 className="text-lg font-semibold capitalize flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full bg-gradient-to-r",
                CATEGORY_COLORS[category] || "from-gray-500 to-gray-600"
              )} />
              {category === 'generation' && 'Geração'}
              {category === 'design' && 'Design'}
              {category === 'audio' && 'Áudio'}
              {category === 'chat' && 'Chat'}
              {category === 'development' && 'Desenvolvimento'}
              {category === 'text' && 'Texto'}
              {category === 'other' && 'Outros'}
              <span className="text-sm text-muted-foreground font-normal">
                ({categoryServices.length})
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryServices.map((service) => {
                const IconComponent = ICON_MAP[service.icon] || Settings;
                const isEditing = editingService === service.id;
                const oldCost = changes.get(service.id);

                return (
                  <div
                    key={service.id}
                    className={cn(
                      "bg-card border rounded-lg p-4 transition-all",
                      isEditing && "ring-2 ring-purple-500",
                      processing && "opacity-50"
                    )}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br",
                          CATEGORY_COLORS[service.category] || "from-gray-500 to-gray-600"
                        )}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{service.service_label}</h4>
                          <p className="text-xs text-muted-foreground">
                            {service.service_name}
                          </p>
                        </div>
                      </div>
                      
                      {!service.is_active && (
                        <Badge variant="secondary" className="text-xs">
                          Inativo
                        </Badge>
                      )}
                    </div>

                    {/* Description */}
                    {service.service_description && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {service.service_description}
                      </p>
                    )}

                    {/* Cost Editor */}
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="1000"
                            value={editValue}
                            onChange={(e) => setEditValue(Number(e.target.value))}
                            className="text-center font-bold"
                            autoFocus
                            disabled={processing}
                          />
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            créditos
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleSave(service)}
                            size="sm"
                            className="flex-1"
                            disabled={processing}
                          >
                            <Save className="w-3 h-3 mr-1" />
                            Salvar
                          </Button>
                          <Button
                            onClick={handleCancel}
                            size="sm"
                            variant="outline"
                            disabled={processing}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Current Cost Display */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Custo Atual:</span>
                          <div className="flex items-center gap-2">
                            {oldCost !== undefined && (
                              <span className="text-xs text-muted-foreground line-through">
                                {oldCost}
                              </span>
                            )}
                            <Badge className={cn(
                              "bg-gradient-to-r text-white font-bold",
                              CATEGORY_COLORS[service.category] || "from-gray-500 to-gray-600"
                            )}>
                              {service.credits_cost} créditos
                            </Badge>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleQuickAdjust(service, -1)}
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            disabled={processing || service.credits_cost <= 0}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={() => handleEdit(service)}
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            disabled={processing}
                          >
                            <Edit2 className="w-3 h-3 mr-1" />
                            Editar
                          </Button>
                          <Button
                            onClick={() => handleQuickAdjust(service, 1)}
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            disabled={processing || service.credits_cost >= 1000}
                          >
                            <TrendingUp className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Last Updated */}
                    <div className="mt-3 pt-3 border-t text-xs text-muted-foreground flex items-center gap-1">
                      <History className="w-3 h-3" />
                      Atualizado: {new Date(service.updated_at).toLocaleString('pt-BR')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
