"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase';
import Link from 'next/link';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  total_tokens: number;
  tokens_used: number;
  subscription_tier: string;
  total_projects: number;
  total_generated_content: number;
  last_login?: string;
}

interface TokenPackage {
  id: number;
  name: string;
  description: string;
  tokens_amount: number;
  price: number;
  currency: string;
  is_featured: boolean;
}

const ProfilePage = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [tokenPackages, setTokenPackages] = useState<TokenPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const router = useRouter();

  useEffect(() => {
    loadUserProfile();
    loadTokenPackages();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser();
      
      if (authError || !authUser) {
        router.push('/login');
        return;
      }

      const { data: profile, error } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        // console.error('Erro ao carregar perfil:', error);
        return;
      }

      setUser(profile);
      setFormData(profile);
    } catch (error) {
      // console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTokenPackages = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('token_packages')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) {
        // console.error('Erro ao carregar pacotes:', error);
        return;
      }

      setTokenPackages(data || []);
    } catch (error) {
      // console.error('Erro:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabaseClient
        .from('users')
        .update({
          full_name: formData.full_name,
          display_name: formData.display_name,
          bio: formData.bio,
          location: formData.location,
          website: formData.website,
          phone: formData.phone
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      await loadUserProfile();
      setEditMode(false);
    } catch (error) {
      // console.error('Erro ao atualizar perfil:', error);
    }
  };

  const handlePurchaseTokens = async (packageId: number) => {
    if (!user) return;

    const selectedPackage = tokenPackages.find(p => p.id === packageId);
    if (!selectedPackage) return;

    try {
      // Simular compra (integrar com Stripe/PayPal depois)
      const { error: purchaseError } = await supabaseClient
        .from('user_purchases')
        .insert({
          user_id: user.id,
          package_name: selectedPackage.name,
          tokens_amount: selectedPackage.tokens_amount,
          price_paid: selectedPackage.price,
          currency: selectedPackage.currency,
          payment_status: 'completed' // Simular pagamento aprovado
        });

      if (purchaseError) {
        throw purchaseError;
      }

      // Recarregar perfil para ver novos tokens
      await loadUserProfile();
      
      alert(`Parabéns! Você adquiriu ${selectedPackage.tokens_amount} tokens!`);
    } catch (error) {
      // console.error('Erro na compra:', error);
      alert('Erro ao processar compra. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-400"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const tokensRemaining = user.total_tokens - user.tokens_used;
  const usagePercentage = (user.tokens_used / user.total_tokens) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-purple-500/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link 
            href="/" 
            className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar
          </Link>
          
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Meu Perfil Premium
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">Tokens Disponíveis</div>
              <div className="text-xl font-bold text-purple-400">
                {tokensRemaining.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Profile Overview */}
        <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col items-center lg:items-start space-y-4">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl font-bold text-white">
                {user.full_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
              </div>
              
              <div className="text-center lg:text-left">
                <h2 className="text-2xl font-bold text-white">
                  {user.display_name || user.full_name || 'Usuário Premium'}
                </h2>
                <p className="text-purple-300">{user.email}</p>
                <div className="mt-2 px-3 py-1 bg-purple-500/20 rounded-full text-sm text-purple-300 inline-block">
                  {user.subscription_tier === 'free' ? 'Plano Gratuito' : `Plano ${user.subscription_tier}`}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-black/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{user.total_tokens.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Total de Tokens</div>
              </div>
              
              <div className="bg-black/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-orange-400">{user.tokens_used.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Tokens Usados</div>
              </div>
              
              <div className="bg-black/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{user.total_projects}</div>
                <div className="text-sm text-gray-400">Projetos</div>
              </div>
              
              <div className="bg-black/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-pink-400">{user.total_generated_content}</div>
                <div className="text-sm text-gray-400">Conteúdos Gerados</div>
              </div>
            </div>
          </div>

          {/* Usage Bar */}
          <div className="mt-8">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Uso de Tokens</span>
              <span>{usagePercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Edit Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setEditMode(true)}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Editar Perfil
            </button>
          </div>
        </div>

        {/* Token Packages */}
        <div className="bg-gradient-to-r from-slate-900/40 to-purple-900/40 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Pacotes de Tokens Premium</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {tokenPackages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative bg-gradient-to-br from-slate-800/60 to-purple-900/60 rounded-xl p-6 border transition-all hover:scale-105 ${
                  pkg.is_featured 
                    ? 'border-yellow-400/50 shadow-lg shadow-yellow-400/20' 
                    : 'border-purple-500/20 hover:border-purple-400/40'
                }`}
              >
                {pkg.is_featured && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-xs font-bold px-3 py-1 rounded-full">
                    POPULAR
                  </div>
                )}
                
                <div className="text-center">
                  <h4 className="text-lg font-bold text-white mb-2">{pkg.name}</h4>
                  <p className="text-sm text-gray-400 mb-4">{pkg.description}</p>
                  
                  <div className="text-3xl font-bold text-purple-400 mb-1">
                    {pkg.tokens_amount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400 mb-4">tokens</div>
                  
                  <div className="text-2xl font-bold text-green-400 mb-6">
                    €{pkg.price.toFixed(2)}
                  </div>
                  
                  <button
                    onClick={() => handlePurchaseTokens(pkg.id)}
                    className={`w-full py-3 rounded-lg font-medium transition-all ${
                      pkg.is_featured
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                    }`}
                  >
                    Comprar Agora
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editMode && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-2xl p-8 border border-purple-500/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-white mb-6">Editar Perfil</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">Nome Completo</label>
                <input
                  type="text"
                  value={formData.full_name || ''}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">Nome de Exibição</label>
                <input
                  type="text"
                  value={formData.display_name || ''}
                  onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">Bio</label>
                <textarea
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all resize-none"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">Localização</label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">Website</label>
                  <input
                    type="url"
                    value={formData.website || ''}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setEditMode(false)}
                className="flex-1 py-3 px-6 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateProfile}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;