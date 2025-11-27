import { useMemo } from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

type StrengthLevel = 'weak' | 'fair' | 'good' | 'strong';

interface StrengthConfig {
  label: string;
  color: string;
  width: string;
}

const strengthConfigs: Record<StrengthLevel, StrengthConfig> = {
  weak: { label: 'Débil', color: 'bg-red-500', width: 'w-1/4' },
  fair: { label: 'Regular', color: 'bg-orange-500', width: 'w-2/4' },
  good: { label: 'Buena', color: 'bg-yellow-500', width: 'w-3/4' },
  strong: { label: 'Fuerte', color: 'bg-green-500', width: 'w-full' },
};

const calculateStrength = (password: string): StrengthLevel => {
  if (!password) return 'weak';
  
  let score = 0;
  
  // Longitud
  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Mayúsculas
  if (/[A-Z]/.test(password)) score += 1;
  
  // Minúsculas
  if (/[a-z]/.test(password)) score += 1;
  
  // Números
  if (/[0-9]/.test(password)) score += 1;
  
  // Símbolos especiales
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  
  // No permitir contraseñas muy comunes
  const commonPatterns = ['123456', 'password', 'qwerty', 'abc123'];
  if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
    score = Math.max(0, score - 2);
  }
  
  if (score <= 2) return 'weak';
  if (score <= 4) return 'fair';
  if (score <= 5) return 'good';
  return 'strong';
};

export const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const strength = useMemo(() => calculateStrength(password), [password]);
  const config = strengthConfigs[strength];
  
  if (!password) return null;
  
  return (
    <div className="space-y-1.5 mt-2">
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full ${config.color} ${config.width} transition-all duration-300 ease-out rounded-full`}
        />
      </div>
      <p className={`text-xs ${
        strength === 'weak' ? 'text-red-500' : 
        strength === 'fair' ? 'text-orange-500' : 
        strength === 'good' ? 'text-yellow-600' : 
        'text-green-500'
      }`}>
        Fortaleza: {config.label}
        {strength === 'weak' && ' - Usa mayúsculas, números y símbolos'}
      </p>
    </div>
  );
};
