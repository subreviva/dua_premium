"use client";

import { useEffect, useState } from 'react';
import { validatePassword, estimateCrackTime, PasswordStrength } from '@/lib/password-validation';
import { Check, X, AlertCircle, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthMeterProps {
  password: string;
  userInfo?: {
    name?: string;
    email?: string;
    username?: string;
  };
  showRequirements?: boolean;
  showEstimate?: boolean;
  className?: string;
}

export function PasswordStrengthMeter({
  password,
  userInfo,
  showRequirements = true,
  showEstimate = true,
  className,
}: PasswordStrengthMeterProps) {
  const [strength, setStrength] = useState<PasswordStrength | null>(null);
  const [crackTime, setCrackTime] = useState<string>('');

  useEffect(() => {
    if (!password) {
      setStrength(null);
      setCrackTime('');
      return;
    }

    const validation = validatePassword(password, userInfo);
    setStrength(validation);

    if (showEstimate) {
      const time = estimateCrackTime(password);
      setCrackTime(time);
    }
  }, [password, userInfo, showEstimate]);

  if (!password || !strength) {
    return null;
  }

  // Determinar cor e label baseado no score
  const getStrengthInfo = (score: number) => {
    if (score === 0) return { color: 'bg-red-500', label: 'Muito Fraca', textColor: 'text-red-500' };
    if (score === 1) return { color: 'bg-red-400', label: 'Fraca', textColor: 'text-red-400' };
    if (score === 2) return { color: 'bg-orange-500', label: 'Razoável', textColor: 'text-orange-500' };
    if (score === 3) return { color: 'bg-yellow-500', label: 'Boa', textColor: 'text-yellow-500' };
    if (score === 4) return { color: 'bg-blue-500', label: 'Forte', textColor: 'text-blue-500' };
    return { color: 'bg-green-500', label: 'Muito Forte', textColor: 'text-green-500' };
  };

  const strengthInfo = getStrengthInfo(strength.score);
  const progressPercentage = (strength.score / 5) * 100;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Barra de progresso */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-400">Força da password:</span>
          <span className={cn('font-medium', strengthInfo.textColor)}>
            {strengthInfo.label}
          </span>
        </div>
        <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
          <div
            className={cn('h-full transition-all duration-300', strengthInfo.color)}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Feedback e sugestões */}
      {strength.feedback.length > 0 && (
        <div className="space-y-1">
          {strength.feedback.map((feedback, index) => (
            <div
              key={index}
              className="flex items-start gap-2 text-sm"
            >
              {feedback.includes('✅') || feedback.includes('🎉') ? (
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              )}
              <span className="text-neutral-300">{feedback}</span>
            </div>
          ))}
        </div>
      )}

      {/* Requisitos (checklist) */}
      {showRequirements && (
        <div className="space-y-2 p-3 bg-neutral-900/50 rounded-lg border border-neutral-800">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-300">
            <Shield className="w-4 h-4" />
            <span>Requisitos de Segurança</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <RequirementItem
              met={password.length >= 12}
              label="12+ caracteres"
            />
            <RequirementItem
              met={/[A-Z]/.test(password)}
              label="MAIÚSCULAS"
            />
            <RequirementItem
              met={/[a-z]/.test(password)}
              label="minúsculas"
            />
            <RequirementItem
              met={/[0-9]/.test(password)}
              label="Números"
            />
            <RequirementItem
              met={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)}
              label="Símbolos (!@#$)"
            />
            {strength.containsPersonalInfo !== undefined && (
              <RequirementItem
                met={!strength.containsPersonalInfo}
                label="Sem info pessoal"
              />
            )}
          </div>
        </div>
      )}

      {/* Estimativa de tempo para quebrar */}
      {showEstimate && crackTime && (
        <div className="flex items-center gap-2 text-sm text-neutral-400 p-2 bg-neutral-900/30 rounded border border-neutral-800">
          <Shield className="w-4 h-4" />
          <span>
            Tempo estimado para quebrar:{' '}
            <span className="font-medium text-neutral-300">{crackTime}</span>
          </span>
        </div>
      )}

      {/* Sugestões (se houver) */}
      {strength.suggestions.length > 0 && !strength.isValid && (
        <div className="space-y-1 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="text-sm font-medium text-blue-400">💡 Dicas:</div>
          {strength.suggestions.map((suggestion, index) => (
            <div key={index} className="text-sm text-neutral-300 ml-4">
              • {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface RequirementItemProps {
  met: boolean;
  label: string;
}

function RequirementItem({ met, label }: RequirementItemProps) {
  return (
    <div className={cn(
      'flex items-center gap-2 text-xs',
      met ? 'text-green-500' : 'text-neutral-500'
    )}>
      {met ? (
        <Check className="w-3 h-3" />
      ) : (
        <X className="w-3 h-3" />
      )}
      <span>{label}</span>
    </div>
  );
}
