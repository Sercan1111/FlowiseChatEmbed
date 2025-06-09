import { Component, createSignal, onMount, onCleanup } from 'solid-js';
import './PhoneInput.css';

// ✅ Doğru type import'u
import type { CountryCode } from 'libphonenumber-js';

export interface PhoneInputWrapperProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  defaultCountry?: CountryCode; // ✅ CountryCode kullan
  required?: boolean;
  class?: string;
  style?: { [key: string]: string };
  error?: boolean;
}

export const PhoneInputWrapper: Component<PhoneInputWrapperProps> = (props) => {
  let containerRef: HTMLDivElement | undefined;
  const [mounted, setMounted] = createSignal(false);

  onMount(async () => {
    if (!containerRef) return;

    try {
      // Dynamically import React components
      const [React, ReactDOM, PhoneInputModule] = await Promise.all([
        import('react'),
        import('react-dom/client'),
        import('react-phone-number-input')
      ]);

      const PhoneInput = PhoneInputModule.default;

      // Create container
      const phoneInputDiv = document.createElement('div');
      phoneInputDiv.className = `phone-input-wrapper ${props.error ? 'error' : ''}`;
      containerRef.appendChild(phoneInputDiv);

      // Create React root
      const root = ReactDOM.createRoot(phoneInputDiv);

      // Handle value change
      const handleChange = (value: string | undefined) => {
        props.onChange?.(value || '');
      };

      // ✅ CountryCode type'ına uygun default değer
      const defaultCountry: CountryCode = props.defaultCountry || 'US';

      // Create React element
      const element = React.createElement(PhoneInput, {
        value: props.value || '',
        onChange: handleChange,
        onBlur: props.onBlur,
        international: true,
        countryCallingCodeEditable: false,
        defaultCountry: defaultCountry, // ✅ Doğru type
        placeholder: props.placeholder || 'Enter phone number',
        required: props.required,
        className: props.class,
        style: props.style
      });

      // Render
      root.render(element);
      setMounted(true);

      onCleanup(() => {
        try {
          root.unmount();
          phoneInputDiv.remove();
        } catch (e) {
          console.warn('Cleanup error:', e);
        }
      });
    } catch (error) {
      console.error('PhoneInput initialization error:', error);
    }
  });

  return (
    <div 
      ref={containerRef}
      class={`phone-input-container ${props.class || ''}`}
      style={{
        width: '100%',
        position: 'relative',
        ...props.style
      }}
    />
  );
};