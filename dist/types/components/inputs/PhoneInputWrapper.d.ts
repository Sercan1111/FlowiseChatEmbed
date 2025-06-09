import { Component } from 'solid-js';
import './PhoneInput.css';
import type { CountryCode } from 'libphonenumber-js';
export interface PhoneInputWrapperProps {
    value?: string;
    onChange?: (value: string) => void;
    onBlur?: () => void;
    placeholder?: string;
    defaultCountry?: CountryCode;
    required?: boolean;
    class?: string;
    style?: {
        [key: string]: string;
    };
    error?: boolean;
}
export declare const PhoneInputWrapper: Component<PhoneInputWrapperProps>;
