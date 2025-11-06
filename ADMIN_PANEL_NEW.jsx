// ADMIN PANEL JSX - Cole este código no lugar do painel admin atual

<div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-4 md:p-6">
  <div className="max-w-[1600px] mx-auto space-y-4">
    
    {/* Header Compacto */}
    <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-xl p-4 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          🔧 Admin Dev Panel
        </h1>
        <p className="text-sm text-white/80">Ultra-prático • Controlo Total</p>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
          variant="outline"
          size="sm"
          className="border-white/30 text-white"
        >
          {viewMode === 'list' ? <Grid3x3 className="w-4 h-4" /> : <List className="w-4 h-4" />}
        </Button>
      </div>
    </div>

    {/* Stats Compactos */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-400" />
          <div>
            <p className="text-xs text-white/60">Usuários</p>
            <p className="text-xl font-bold">{allUsers.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-purple-400" />
          <div>
            <p className="text-xs text-white/60">Tokens</p>
            <p className="text-xl font-bold">
              {allUsers.reduce((sum, u) => sum + (u.total_tokens || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-green-400" />
          <div>
            <p className="text-xs text-white/60">Gerações</p>
            <p className="text-xl font-bold">
              {allUsers.reduce((sum, u) => sum + (u.total_generated_content || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <div>
            <p className="text-xs text-white/60">Premium</p>
            <p className="text-xl font-bold">
              {allUsers.filter(u => u.subscription_tier !== 'free').length}
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Barra de Ferramentas */}
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-4">
      <div className="flex flex-wrap gap-3">
        {/* Busca */}
        <div className="flex-1 min-w-[250px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              placeholder="Buscar usuário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-black/50 border-white/10 text-white h-9 text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Filtro por Tier */}
        <select
          value={filterTier}
          onChange={(e) => setFilterTier(e.target.value)}
          className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
        >
          <option value="all">Todos os Tiers</option>
          <option value="free">Free</option>
          <option value="basic">Basic</option>
          <option value="premium">Premium</option>
          <option value="ultimate">Ultimate</option>
        </select>

        {/* Ordenar */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
        >
          <option value="created">Mais Recentes</option>
          <option value="email">Email (A-Z)</option>
          <option value="tokens">Mais Tokens</option>
          <option value="usage">Mais Usados</option>
        </select>

        <Button
          onClick={() => loadUserData()}
          variant="outline"
          size="sm"
          className="border-white/20 text-white"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Atualizar
        </Button>
      </div>
    </div>

    {/* Quick Actions - Injeção Rápida */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Injeção Rápida */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-4">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-green-400" />
          Injeção Rápida de Tokens
        </h3>
        
        {selectedUserId ? (
          <div className="space-y-3">
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
              <p className="text-xs text-purple-300 mb-1">Usuário Selecionado:</p>
              <p className="text-sm font-medium">
                {allUsers.find(u => u.id === selectedUserId)?.email}
              </p>
            </div>

            <div className="flex gap-2">
              <Input
                type="number"
                value={tokensToAdd}
                onChange={(e) => setTokensToAdd(Number(e.target.value))}
                className="bg-black/50 border-white/10 text-white text-center font-bold"
                placeholder="Quantidade"
              />
              <Button
                onClick={handleInjectTokens}
                disabled={processing}
                className="bg-green-600 hover:bg-green-500"
              >
                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[100, 500, 1000, 5000].map(amount => (
                <Button
                  key={amount}
                  onClick={() => setTokensToAdd(amount)}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-xs"
                >
                  +{amount}
                </Button>
              ))}
            </div>

            <Button
              onClick={() => setSelectedUserId(null)}
              variant="outline"
              size="sm"
              className="w-full border-white/20"
            >
              Cancelar
            </Button>
          </div>
        ) : (
          <p className="text-sm text-white/60 text-center py-4">
            Selecione um usuário abaixo para injetar tokens
          </p>
        )}
      </div>

      {/* Estatísticas Rápidas */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-4">
        <h3 className="text-sm font-bold mb-3">📊 Estatísticas Rápidas</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">Total de Tokens Distribuídos:</span>
            <span className="font-bold">
              {allUsers.reduce((sum, u) => sum + (u.total_tokens || 0), 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Total de Tokens Usados:</span>
            <span className="font-bold text-red-400">
              {allUsers.reduce((sum, u) => sum + (u.tokens_used || 0), 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Tokens Disponíveis:</span>
            <span className="font-bold text-green-400">
              {allUsers.reduce((sum, u) => sum + ((u.total_tokens || 0) - (u.tokens_used || 0)), 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-white/10">
            <span className="text-white/60">Média por Usuário:</span>
            <span className="font-bold">
              {Math.round(allUsers.reduce((sum, u) => sum + (u.total_tokens || 0), 0) / allUsers.length)}
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* Lista de Usuários - Modo Compacto */}
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold">
          👥 Todos os Usuários ({filteredUsers.length})
        </h3>
      </div>
      
      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className={cn(
              "bg-black/30 border rounded-lg p-3 transition-all hover:bg-white/5",
              selectedUserId === user.id && "border-purple-500 bg-purple-500/10"
            )}
          >
            <div className="flex items-center justify-between gap-3">
              {/* Avatar e Info */}
              <div 
                className="flex items-center gap-3 flex-1 cursor-pointer"
                onClick={() => setSelectedUserId(user.id)}
              >
                <img
                  src={getAvatarUrl(user)}
                  alt={user.email}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{user.email}</p>
                  <p className="text-xs text-white/60 truncate">
                    {user.full_name || user.display_name || 'Sem nome'}
                  </p>
                </div>
              </div>

              {/* Stats Compactos */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-white/60">Tokens</p>
                  <p className="text-sm font-bold">{user.total_tokens || 0}</p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-white/60">Usado</p>
                  <p className="text-sm font-bold text-red-400">{user.tokens_used || 0}</p>
                </div>

                <Badge 
                  className={cn(
                    "text-xs bg-gradient-to-r",
                    getTierBadge(user.subscription_tier)
                  )}
                >
                  {user.subscription_tier}
                </Badge>

                {/* Actions Menu */}
                <div className="flex gap-1">
                  <Button
                    onClick={() => {
                      setEditingUser(user.id);
                      setEditForm(user);
                    }}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    title="Editar"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>

                  <Button
                    onClick={() => handleResetTokens(user.id)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    title="Resetar Tokens Usados"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </Button>

                  <Button
                    onClick={() => handleToggleAccess(user.id, (user as AdminData).has_access)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    title="Toggle Acesso"
                  >
                    {(user as AdminData).has_access ? (
                      <Unlock className="w-3 h-3 text-green-400" />
                    ) : (
                      <Lock className="w-3 h-3 text-red-400" />
                    )}
                  </Button>

                  <Button
                    onClick={() => handleDeleteUser(user.id, user.email)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-red-500/20"
                    title="Excluir"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Modal de Edição Inline */}
            {editingUser === user.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 pt-3 border-t border-white/10 space-y-2"
              >
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Nome Completo"
                    value={editForm.full_name || ''}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    className="bg-black/50 border-white/10 text-white text-sm h-8"
                  />
                  <Input
                    placeholder="Display Name"
                    value={editForm.display_name || ''}
                    onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                    className="bg-black/50 border-white/10 text-white text-sm h-8"
                  />
                </div>

                <select
                  value={editForm.subscription_tier || 'free'}
                  onChange={(e) => setEditForm({ ...editForm, subscription_tier: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white"
                >
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="ultimate">Ultimate</option>
                </select>

                <Input
                  placeholder="Bio"
                  value={editForm.bio || ''}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="bg-black/50 border-white/10 text-white text-sm h-8"
                />

                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdateUser}
                    disabled={processing}
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-500 h-8"
                  >
                    {processing ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                    Salvar
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingUser(null);
                      setEditForm({});
                    }}
                    variant="outline"
                    size="sm"
                    className="border-white/20 h-8"
                  >
                    <XCircle className="w-3 h-3 mr-1" />
                    Cancelar
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-white/60">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhum usuário encontrado</p>
          </div>
        )}
      </div>
    </div>
  </div>
</div>
