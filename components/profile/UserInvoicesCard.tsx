"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Receipt, Download, FileText } from "lucide-react";
import { supabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

interface Invoice {
  id: string;
  package_name: string;
  tokens_amount: number;
  price_paid: number;
  currency: string;
  purchased_at: string;
  payment_status: string;
  transaction_id: string | null;
}

export function UserInvoicesCard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      completed: { label: "Pago", color: "bg-white/10 text-green-400 border-white/20" },
      pending: { label: "Pendente", color: "bg-white/10 text-yellow-400 border-white/20" },
      failed: { label: "Falhou", color: "bg-white/10 text-red-400 border-white/20" },
      refunded: { label: "Reembolsado", color: "bg-white/10 text-gray-400 border-white/20" },
    };

    const config = statusConfig[status.toLowerCase()] || statusConfig.pending;

    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleDownloadPDF = (transactionId: string | null) => {
    if (!transactionId) {
      return;
    }
    // Link para recibo Stripe (se disponível)
    window.open(`https://pay.stripe.com/receipts/${transactionId}`, "_blank");
  };

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabaseClient
          .from("user_purchases")
          .select("id, package_name, tokens_amount, price_paid, currency, purchased_at, payment_status, transaction_id")
          .eq("user_id", user.id)
          .order("purchased_at", { ascending: false })
          .limit(5);

        if (error) throw error;
        setInvoices(data || []);
      } catch (error) {
        console.error("Erro ao carregar faturas:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border border-white/10 bg-black/20 backdrop-blur-sm p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/20 border-t-white"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-lg border border-white/10 bg-black/20 backdrop-blur-sm p-6 hover:border-white/20 transition-all duration-300"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Histórico de Faturas</h3>
          <Receipt className="w-4 h-4 text-gray-500" />
        </div>

        {invoices.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Nenhuma compra realizada</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="p-3 rounded border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-2 gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white mb-1 truncate">
                      {invoice.package_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(invoice.purchased_at)}
                    </p>
                  </div>
                  {getStatusBadge(invoice.payment_status)}
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                  <p className="text-sm font-medium text-white">
                    {invoice.price_paid} {invoice.currency}
                  </p>
                  
                  {invoice.transaction_id ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownloadPDF(invoice.transaction_id)}
                      className="h-7 text-xs hover:bg-white/10 px-2"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      <span>PDF</span>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled
                      className="h-7 text-xs opacity-50 cursor-not-allowed px-2"
                      title="Recibo em breve"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      <span>Em breve</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </motion.div>
  );
}
