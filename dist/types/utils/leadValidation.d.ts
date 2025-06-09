import { LeadsConfig } from '@/components/Bot';
declare const emailValidationPatterns: {
    basic: RegExp;
    strict: RegExp;
};
declare const disposableEmailDomains: string[];
declare const testNamePatterns: RegExp;
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
declare const isDisposableEmail: (email: string) => boolean;
export declare const validateEmail: (email: string, config: LeadsConfig) => {
    valid: boolean;
    message?: undefined;
} | {
    valid: boolean;
    message: string;
};
export declare const validatePhone: (phone: string, config: LeadsConfig) => {
    valid: boolean;
    message?: undefined;
} | {
    valid: boolean;
    message: string;
};
export declare const validateName: (name: string, config: LeadsConfig) => {
    valid: boolean;
    message?: undefined;
} | {
    valid: boolean;
    message: string;
};
export declare const validateMessage: (message: string, config: LeadsConfig) => {
    valid: boolean;
    message?: undefined;
} | {
    valid: boolean;
    message: string;
};
export declare class RateLimiter {
    private attempts;
    private readonly maxAttempts;
    private readonly timeWindow;
    private readonly minInterval;
    constructor(maxAttempts?: number, timeWindow?: number, minInterval?: number);
    canAttempt(): {
        allowed: boolean;
        message?: string;
    };
    recordAttempt(): void;
    reset(): void;
}
export declare const validateLeadForm: (formData: FormData, config: LeadsConfig) => ValidationResult;
export declare const validateFieldRealTime: (fieldName: string, value: string, config: LeadsConfig) => string | null;
export declare const formatPhoneForDisplay: (phone: string) => string;
export declare const getEmailDomain: (email: string) => string;
export { emailValidationPatterns, disposableEmailDomains, testNamePatterns, isDisposableEmail };
