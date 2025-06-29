export interface PhoneInputProps {
    value?: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    placeholder?: string;
    style?: Record<string, string>;
    defaultCountry?: string;
    disabled?: boolean;
    required?: boolean;
    inputBackgroundColor?: string;
    inputTextColor?: string;
    inputBorderColor?: string;
}
export declare const PhoneInput: (props: PhoneInputProps) => import("solid-js").JSX.Element;
