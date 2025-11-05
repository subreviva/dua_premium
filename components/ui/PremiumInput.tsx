/**
 * Componente de Input Premium com validação visual avançada
 * Estado de sucesso, erro, loading e feedback interativo
 */

import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';

interface PremiumInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  error?: string | null;
  success?: boolean;
  loading?: boolean;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  className?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const PremiumInput = forwardRef<HTMLInputElement, PremiumInputProps>(({
  label,
  value,
  onChange,
  onBlur,
  error,
  success,
  loading,
  type = "text",
  placeholder,
  disabled,
  required,
  minLength,
  maxLength,
  className = "",
  hint,
  leftIcon,
  rightIcon,
  ...props
}, ref) => {
  const hasError = Boolean(error);
  const hasSuccess = success && !hasError && value.length > 0;
  const isActive = Boolean(value) || document.activeElement === ref;

  return (
    <div className="space-y-2">
      {/* Label */}
      <motion.label 
        className={`block text-sm font-medium tracking-wide transition-colors duration-200 ${
          hasError 
            ? 'text-red-400' 
            : hasSuccess 
              ? 'text-emerald-400'
              : 'text-neutral-300'
        }`}
        animate={{ 
          y: hasError ? [0, -1, 1, 0] : 0,
          transition: { duration: 0.2 }
        }}
      >
        {label}
        {required && (
          <span className="ml-1 text-red-400">*</span>
        )}
      </motion.label>

      {/* Input Container */}
      <div className="relative group">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-neutral-400 group-focus-within:text-violet-400 transition-colors">
            {leftIcon}
          </div>
        )}

        {/* Input */}
        <Input
          ref={ref}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled || loading}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          className={`
            bg-neutral-900/50 border-2 text-white placeholder:text-neutral-500
            h-14 rounded-xl transition-all duration-300 
            ${leftIcon ? 'pl-12' : 'px-6'}
            ${rightIcon || loading ? 'pr-12' : 'px-6'}
            ${hasError 
              ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-red-500/5' 
              : hasSuccess
                ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-emerald-500/5'
                : 'border-neutral-700/50 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 focus:bg-neutral-900/70'
            }
            group-hover:border-neutral-600/50
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${className}
          `}
          {...props}
        />

        {/* Right Icon / Loading / Success */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="w-5 h-5 relative"
              >
                <div className="absolute inset-0 rounded-full border-2 border-neutral-600"></div>
                <div className="absolute inset-0 rounded-full border-2 border-violet-500 border-t-transparent animate-spin"></div>
              </motion.div>
            ) : hasSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                  <path d="M9.765 2.735a.5.5 0 0 1 0 .707L5.618 7.589a.5.5 0 0 1-.707 0L2.235 4.913a.5.5 0 1 1 .707-.707L5.265 6.528 9.058 2.735a.5.5 0 0 1 .707 0Z"/>
                </svg>
              </motion.div>
            ) : hasError ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                  <path d="M6 0C2.686 0 0 2.686 0 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm2.5 8.5L7 6.207 4.5 8.5 3.5 7.5 5.793 6 3.5 3.5 4.5 2.5 7 4.793 9.5 2.5l1 1L7.207 6 9.5 8.5l-1 1z"/>
                </svg>
              </motion.div>
            ) : rightIcon ? (
              <motion.div
                key="icon"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-neutral-400 group-focus-within:text-violet-400 transition-colors"
              >
                {rightIcon}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Hover Gradient Effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600/0 via-violet-600/5 to-violet-600/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

        {/* Focus Ring Effect */}
        <motion.div 
          className="absolute inset-0 rounded-xl border-2 border-violet-500/30 opacity-0"
          animate={{ 
            opacity: isActive ? 1 : 0,
            scale: isActive ? 1 : 0.95 
          }}
          transition={{ duration: 0.2 }}
        />
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {hasError && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 text-sm text-red-400"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" className="flex-shrink-0">
              <path d="M7 0C3.134 0 0 3.134 0 7s3.134 7 7 7 7-3.134 7-7S10.866 0 7 0zm3.5 9.5L9 10.5 7 8.5 5 10.5 3.5 9.5 5.5 7.5 3.5 5.5 5 4.5 7 6.5 9 4.5l1.5 1L8.5 7.5l2 2z"/>
            </svg>
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint Message */}
      {hint && !hasError && (
        <p className="text-xs text-neutral-500">{hint}</p>
      )}

      {/* Character Counter */}
      {maxLength && (
        <div className="flex justify-end">
          <span className={`text-xs transition-colors ${
            value.length > maxLength * 0.8 
              ? value.length >= maxLength 
                ? 'text-red-400' 
                : 'text-yellow-400'
              : 'text-neutral-500'
          }`}>
            {value.length}/{maxLength}
          </span>
        </div>
      )}
    </div>
  );
});

PremiumInput.displayName = 'PremiumInput';

export default PremiumInput;