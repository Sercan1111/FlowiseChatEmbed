import { parsePhoneNumber } from 'libphonenumber-js';
import { LeadsConfig } from '@/components/Bot';

// ✅ Canvas'taki validation patterns
const emailValidationPatterns = {
  basic: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  strict: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
};

// ✅ Canvas'taki disposable email domains
const disposableEmailDomains = [
  '10minutemail.com',
  'tempmail.org', 
  'guerrillamail.com',
  'throwaway.email',
  'temp-mail.org',
  'yopmail.com',
  'mailinator.com',
  'maildrop.cc',
  'getnada.com',
  'trashmail.com',
  '20minutemail.com',
  'tempail.com',
  'guerrillamailblock.com',
  'sharklasers.com',
  'guerrillamail.info',
  'guerrillamail.biz',
  'guerrillamail.de',
  'guerrillamail.net',
  'guerrillamail.org',
  'pokemail.net',
  'spam4.me',
  'grr.la',
  'guerrillamail.com'
];

// ✅ Canvas'taki test name patterns
const testNamePatterns = /^(test|demo|sample|example|john doe|jane doe|asdf|qwerty|firstname|lastname|your name|enter name|test user|demo user)$/i;


// ✅ Form validation interface
export interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// ✅ Email validation with disposable check
const isDisposableEmail = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase();
  return disposableEmailDomains.includes(domain);
};

// ✅ Enhanced validation functions
export const validateEmail = (email: string, config: LeadsConfig) => {
  if (!config.email) return { valid: true };

  // Required check
  if (!email?.trim()) {
    return { valid: false, message: 'Email address is required' };
  }

  // Pattern validation (basic vs strict)
  const level = config.emailValidationLevel || 'basic';
  const pattern = emailValidationPatterns[level];

  if (!pattern.test(email)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }

  // Disposable email check
  if (config.blockDisposableEmail && isDisposableEmail(email)) {
    return { valid: false, message: 'Disposable email addresses are not allowed' };
  }

  return { valid: true };
};

export const validatePhone = (phone: string, config: LeadsConfig) => {
  if (!config.phone) return { valid: true };

  if (!phone?.trim()) {
    return { valid: false, message: 'Phone number is required' };
  }

  try {
    const phoneNumber = parsePhoneNumber(phone);

    if (!phoneNumber?.isValid()) {
      return { valid: false, message: 'Please enter a valid phone number' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, message: 'Please enter a valid phone number' };
  }
};

export const validateName = (name: string, config: LeadsConfig) => {
  if (!config.name) return { valid: true };

  if (!name?.trim()) {
    return { valid: false, message: 'Name is required' };
  }

  // Length validation
  const minLength = config.minNameLength || 2;
  const maxLength = config.maxNameLength || 50;

  if (name.length < minLength) {
    return { valid: false, message: `Name must be at least ${minLength} characters long` };
  }

  if (name.length > maxLength) {
    return { valid: false, message: `Name must be no more than ${maxLength} characters long` };
  }

  // Test name patterns check
  if (config.blockTestNames && testNamePatterns.test(name.toLowerCase())) {
    return { valid: false, message: 'Please enter your real name' };
  }

  return { valid: true };
};

export const validateMessage = (message: string, config: LeadsConfig) => {
  if (!config.enableMessage) return { valid: true };

  // Optional field, so empty is valid
  if (!message?.trim()) return { valid: true };

  // Length check
  if (message.length > 500) {
    return { valid: false, message: 'Message must be no more than 500 characters' };
  }

  return { valid: true };
};

// ✅ Enhanced rate limiter class
export class RateLimiter {
  private attempts: number[] = [];
  private readonly maxAttempts: number;
  private readonly timeWindow: number;
  private readonly minInterval: number;

  constructor(maxAttempts: number = 3, timeWindow: number = 60000, minInterval: number = 5000) {
    this.maxAttempts = maxAttempts;
    this.timeWindow = timeWindow;
    this.minInterval = minInterval;
  }

  canAttempt(): { allowed: boolean; message?: string } {
    const now = Date.now();
    
    // Remove old attempts outside time window
    this.attempts = this.attempts.filter(time => now - time < this.timeWindow);

    // Check if too many attempts
    if (this.attempts.length >= this.maxAttempts) {
      const oldestAttempt = Math.min(...this.attempts);
      const waitTime = Math.ceil((this.timeWindow - (now - oldestAttempt)) / 1000);
      return { 
        allowed: false, 
        message: `Too many attempts. Please wait ${waitTime} seconds.` 
      };
    }

    // Check minimum interval
    if (this.attempts.length > 0) {
      const lastAttempt = Math.max(...this.attempts);
      if (now - lastAttempt < this.minInterval) {
        const waitTime = Math.ceil((this.minInterval - (now - lastAttempt)) / 1000);
        return { 
          allowed: false, 
          message: `Please wait ${waitTime} seconds before submitting again.` 
        };
      }
    }

    return { allowed: true };
  }

  recordAttempt(): void {
    this.attempts.push(Date.now());
  }

  reset(): void {
    this.attempts = [];
  }
}

// ✅ Complete form validation
export const validateLeadForm = (formData: FormData, config: LeadsConfig): ValidationResult => {
  const errors: Record<string, string> = {};

  // Name validation
  if (config.name) {
    const nameValidation = validateName(formData.name, config);
    if (!nameValidation.valid) {
      errors.name = nameValidation.message || 'Invalid name';
    }
  }

  // Email validation  
  if (config.email) {
    const emailValidation = validateEmail(formData.email, config);
    if (!emailValidation.valid) {
      errors.email = emailValidation.message || 'Invalid email';
    }
  }

  // Phone validation
  if (config.phone) {
    const phoneValidation = validatePhone(formData.phone, config);
    if (!phoneValidation.valid) {
      errors.phone = phoneValidation.message || 'Invalid phone';
    }
  }

  // Message validation
  if (config.enableMessage) {
    const messageValidation = validateMessage(formData.message, config);
    if (!messageValidation.valid) {
      errors.message = messageValidation.message || 'Invalid message';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ✅ Real-time field validation
export const validateFieldRealTime = (fieldName: string, value: string, config: LeadsConfig): string | null => {
  let error: string | null = null;

  switch (fieldName) {
    case 'name':
      if (config.name && value.trim()) {
        const validation = validateName(value, config);
        if (!validation.valid) error = validation.message || 'Invalid name';
      }
      break;

    case 'email':
      if (config.email && value.trim()) {
        const validation = validateEmail(value, config);
        if (!validation.valid) error = validation.message || 'Invalid email';
      }
      break;

    case 'phone':
      if (config.phone && value.trim()) {
        const validation = validatePhone(value, config);
        if (!validation.valid) error = validation.message || 'Invalid phone';
      }
      break;

    case 'message':
      if (config.enableMessage && value.trim()) {
        const validation = validateMessage(value, config);
        if (!validation.valid) error = validation.message || 'Invalid message';
      }
      break;
  }

  return error;
};


// ✅ Phone formatting utility (optional)
export const formatPhoneForDisplay = (phone: string): string => {
  try {
    const phoneNumber = parsePhoneNumber(phone);
    return phoneNumber?.formatInternational() || phone;
  } catch {
    return phone;
  }
};

// ✅ Email domain extractor
export const getEmailDomain = (email: string): string => {
  return email.split('@')[1]?.toLowerCase() || '';
};

// ✅ Export all utilities
export {
  emailValidationPatterns,
  disposableEmailDomains,
  testNamePatterns,
  isDisposableEmail
};
