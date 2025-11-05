/**
 * Hook personalizado para gerenciar estado de formulários
 * com validação avançada e feedback visual
 */

import { useState, useCallback } from 'react';

export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

export interface FormField {
  value: string;
  error: string | null;
  touched: boolean;
  validation?: FieldValidation;
}

export interface FormState {
  [key: string]: FormField;
}

export function useFormState(initialFields: Record<string, FieldValidation>) {
  const [fields, setFields] = useState<FormState>(() => {
    const initial: FormState = {};
    Object.keys(initialFields).forEach(key => {
      initial[key] = {
        value: '',
        error: null,
        touched: false,
        validation: initialFields[key]
      };
    });
    return initial;
  });

  const validateField = useCallback((name: string, value: string): string | null => {
    const validation = fields[name]?.validation;
    if (!validation) return null;

    // Required validation
    if (validation.required && !value.trim()) {
      return 'Este campo é obrigatório';
    }

    // Min length validation
    if (validation.minLength && value.length < validation.minLength) {
      return `Mínimo ${validation.minLength} caracteres`;
    }

    // Max length validation
    if (validation.maxLength && value.length > validation.maxLength) {
      return `Máximo ${validation.maxLength} caracteres`;
    }

    // Pattern validation
    if (validation.pattern && !validation.pattern.test(value)) {
      if (name === 'email') return 'Email inválido';
      if (name === 'password') return 'Senha deve conter letras e números';
      return 'Formato inválido';
    }

    // Custom validation
    if (validation.custom) {
      return validation.custom(value);
    }

    return null;
  }, [fields]);

  const updateField = useCallback((name: string, value: string) => {
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        value,
        error: prev[name].touched ? validateField(name, value) : null,
      }
    }));
  }, [validateField]);

  const touchField = useCallback((name: string) => {
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        touched: true,
        error: validateField(name, prev[name].value),
      }
    }));
  }, [validateField]);

  const touchAllFields = useCallback(() => {
    setFields(prev => {
      const newFields = { ...prev };
      Object.keys(newFields).forEach(name => {
        newFields[name] = {
          ...newFields[name],
          touched: true,
          error: validateField(name, newFields[name].value),
        };
      });
      return newFields;
    });
  }, [validateField]);

  const isValid = Object.values(fields).every(field => !field.error);
  const hasErrors = Object.values(fields).some(field => field.error);

  const resetForm = useCallback(() => {
    setFields(prev => {
      const reset: FormState = {};
      Object.keys(prev).forEach(key => {
        reset[key] = {
          ...prev[key],
          value: '',
          error: null,
          touched: false,
        };
      });
      return reset;
    });
  }, []);

  return {
    fields,
    updateField,
    touchField,
    touchAllFields,
    isValid,
    hasErrors,
    resetForm,
  };
}