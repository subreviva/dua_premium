"use client";

import { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, XCircle, UserCheck, Users, Clock, 
  RefreshCw, AlertCircle, CheckSquare, Square, Settings
} from "lucide-react";

interface PendingUser {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  days_waiting: number;
}

interface UserApprovalPanelProps {
  onClose: () => void;
  onUsersApproved: () => void;
}

export default function UserApprovalPanel({ onClose, onUsersApproved }: UserApprovalPanelProps) {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [autoApprove, setAutoApprove] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(false);

  useEffect(() => {
    loadPendingUsers();
    loadSettings();
  }, []);

  const loadPendingUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabaseClient.rpc('get_pending_users');
      
      if (error) throw error;
      
      setPendingUsers(data || []);
    } catch (error: any) {
      toast.error('Error loading pending users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'auto_approve_users')
        .single();
      
      if (error) throw error;
      
      setAutoApprove(data.setting_value === 'true');
    } catch (error: any) {
      console.error('Error loading settings:', error.message);
    }
  };

  const handleApproveUser = async (userId: string) => {
    setProcessing(true);
    try {
      const { error } = await supabaseClient.rpc('approve_user', { user_id: userId });
      
      if (error) throw error;
      
      toast.success('User approved successfully!');
      await loadPendingUsers();
      onUsersApproved();
    } catch (error: any) {
      toast.error('Error approving user: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedUserIds.size === 0) {
      toast.error('Select at least one user');
      return;
    }

    setProcessing(true);
    try {
      const { data, error } = await supabaseClient.rpc('bulk_approve_users', {
        user_ids: Array.from(selectedUserIds)
      });
      
      if (error) throw error;
      
      toast.success(`${data} users approved successfully!`);
      setSelectedUserIds(new Set());
      await loadPendingUsers();
      onUsersApproved();
    } catch (error: any) {
      toast.error('Error approving users: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleApproveAll = async () => {
    if (pendingUsers.length === 0) return;
    
    if (!confirm(`Approve all ${pendingUsers.length} pending users?`)) return;

    setProcessing(true);
    try {
      const allIds = pendingUsers.map(u => u.id);
      const { data, error } = await supabaseClient.rpc('bulk_approve_users', {
        user_ids: allIds
      });
      
      if (error) throw error;
      
      toast.success(`All ${data} users approved!`);
      await loadPendingUsers();
      onUsersApproved();
    } catch (error: any) {
      toast.error('Error approving all: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const toggleAutoApprove = async () => {
    setSettingsLoading(true);
    try {
      const newValue = !autoApprove;
      
      const { error } = await supabaseClient
        .from('system_settings')
        .update({ setting_value: newValue ? 'true' : 'false' })
        .eq('setting_key', 'auto_approve_users');
      
      if (error) throw error;
      
      setAutoApprove(newValue);
      toast.success(`Auto-approval ${newValue ? 'enabled' : 'disabled'}`);
    } catch (error: any) {
      toast.error('Error updating settings: ' + error.message);
    } finally {
      setSettingsLoading(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSet = new Set(selectedUserIds);
    if (newSet.has(userId)) {
      newSet.delete(userId);
    } else {
      newSet.add(userId);
    }
    setSelectedUserIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedUserIds.size === pendingUsers.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(pendingUsers.map(u => u.id)));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-b border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <UserCheck className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">User Approval Panel</h2>
                <p className="text-sm text-gray-400">Manage pending user registrations</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-white/10"
            >
              <XCircle className="w-5 h-5" />
            </Button>
          </div>

          {/* Stats & Settings */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-black/30 rounded-lg px-4 py-2">
                <p className="text-xs text-gray-400">Pending</p>
                <p className="text-xl font-bold text-yellow-400">{pendingUsers.length}</p>
              </div>
              <div className="bg-black/30 rounded-lg px-4 py-2">
                <p className="text-xs text-gray-400">Selected</p>
                <p className="text-xl font-bold text-blue-400">{selectedUserIds.size}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2">
                <Settings className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400">Auto-Approval:</span>
                <Button
                  size="sm"
                  variant={autoApprove ? "default" : "outline"}
                  onClick={toggleAutoApprove}
                  disabled={settingsLoading}
                  className={`h-6 text-xs ${autoApprove ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                >
                  {autoApprove ? 'ON' : 'OFF'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No Pending Users</h3>
              <p className="text-gray-400">All users have been approved!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Bulk Actions */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={toggleSelectAll}
                  className="border-white/10 hover:bg-white/5"
                >
                  {selectedUserIds.size === pendingUsers.length ? (
                    <CheckSquare className="w-4 h-4 mr-2" />
                  ) : (
                    <Square className="w-4 h-4 mr-2" />
                  )}
                  {selectedUserIds.size === pendingUsers.length ? 'Deselect All' : 'Select All'}
                </Button>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleBulkApprove}
                    disabled={processing || selectedUserIds.size === 0}
                    className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Selected ({selectedUserIds.size})
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleApproveAll}
                    disabled={processing}
                    className="bg-green-500/20 hover:bg-green-500/30 text-green-400"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Approve All
                  </Button>
                </div>
              </div>

              {/* User List */}
              {pendingUsers.map((user) => (
                <div
                  key={user.id}
                  className={`group bg-black/30 border ${
                    selectedUserIds.has(user.id) ? 'border-blue-500/50 bg-blue-500/10' : 'border-white/5'
                  } rounded-lg p-4 hover:border-white/20 transition-all cursor-pointer`}
                  onClick={() => toggleUserSelection(user.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          selectedUserIds.has(user.id) ? 'bg-blue-500/20' : 'bg-white/5'
                        }`}
                      >
                        {selectedUserIds.has(user.id) ? (
                          <CheckSquare className="w-5 h-5 text-blue-400" />
                        ) : (
                          <Users className="w-5 h-5 text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{user.email}</p>
                          {user.name && (
                            <span className="text-xs text-gray-400">({user.name})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <p className="text-xs text-gray-400">
                            Registered {new Date(user.created_at).toLocaleDateString()} 
                            {user.days_waiting > 0 && ` (${user.days_waiting} days ago)`}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApproveUser(user.id);
                      }}
                      disabled={processing}
                      className="bg-green-500/20 hover:bg-green-500/30 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-gray-900/50 to-black/50 border-t border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <AlertCircle className="w-4 h-4" />
              <span>
                {autoApprove 
                  ? 'Auto-approval is ON - new users get instant access' 
                  : 'Auto-approval is OFF - manual approval required'}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadPendingUsers}
                disabled={loading}
                className="border-white/10 hover:bg-white/5"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="border-white/10 hover:bg-white/5"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
