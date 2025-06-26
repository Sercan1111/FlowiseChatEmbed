// ✅ packages/flowise-embed/src/components/inputs/PhoneInput.tsx - Fixed with IMG flags

import { createSignal, createEffect, Show, For, onMount } from 'solid-js';
import { countries, getCountryByCode, formatPhoneNumber, parsePhoneInput, type Country } from '@/data/countries';

export interface PhoneInputProps {
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  style?: Record<string, string>;
  defaultCountry?: string;
  disabled?: boolean;
  required?: boolean;
}

export const PhoneInput = (props: PhoneInputProps) => {
  const [selectedCountry, setSelectedCountry] = createSignal<Country>(
    getCountryByCode(props.defaultCountry || 'US') || countries[0]
  );
  const [nationalNumber, setNationalNumber] = createSignal('');
  const [dropdownOpen, setDropdownOpen] = createSignal(false);
  const [searchQuery, setSearchQuery] = createSignal('');
  
  // ✅ Initialize refs with undefined and proper types
  let inputRef: HTMLInputElement | undefined;
  let dropdownRef: HTMLDivElement | undefined;

  // Parse initial value
  createEffect(() => {
    if (props.value) {
      const parsed = parsePhoneInput(props.value);
      if (parsed.country) {
        setSelectedCountry(parsed.country);
      }
      setNationalNumber(parsed.nationalNumber);
    }
  });

  // Filter countries based on search
  const filteredCountries = () => {
    const query = searchQuery().toLowerCase();
    if (!query) return countries;
    
    return countries.filter(country => 
      country.name.toLowerCase().includes(query) ||
      country.dialCode.includes(query) ||
      country.code.toLowerCase().includes(query)
    );
  };

  // Handle country selection
  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setDropdownOpen(false);
    setSearchQuery('');
    
    // Update the full phone number
    const fullNumber = formatPhoneNumber(nationalNumber(), country);
    props.onChange(fullNumber);
    
    // Focus back to input
    inputRef?.focus();
  };

  // Handle number input
  const handleNumberInput = (value: string) => {
    // Only allow numbers, spaces, dashes, parentheses
    const cleanValue = value.replace(/[^\d\s\-\(\)]/g, '');
    setNationalNumber(cleanValue);
    
    // Update the full phone number
    const fullNumber = formatPhoneNumber(cleanValue, selectedCountry());
    props.onChange(fullNumber);
  };

  // Handle dropdown toggle
  const toggleDropdown = () => {
    if (props.disabled) return;
    setDropdownOpen(!dropdownOpen());
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (e: Event) => {
    if (dropdownRef && !dropdownRef.contains(e.target as Node)) {
      setDropdownOpen(false);
      setSearchQuery('');
    }
  };

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  });

  return (
    <div 
      class="phone-input-container" 
      ref={dropdownRef!} 
      style={{ position: 'relative', width: '100%' }}
    >
      {/* Main Input Container */}
      <div 
        class="phone-input-wrapper"
        style={{
          display: 'flex',
          'align-items': 'center',
          border: '1px solid #e2e8f0',
          'border-radius': '8px',
          'background-color': '#ffffff',
          overflow: 'hidden',
          ...props.style
        }}
      >
        {/* Country Selector Button */}
        <button
          type="button"
          class="country-selector-button"
          onClick={toggleDropdown}
          disabled={props.disabled}          style={{
            display: 'flex',
            'align-items': 'center',
            padding: '14px 12px',
            border: 'none',
            background: '#ffffff',
            cursor: props.disabled ? 'not-allowed' : 'pointer',
            'border-right': '1px solid #e2e8f0',
            'font-size': '16px',
            'min-width': '80px',
            'flex-shrink': '0'
          }}
        >
          {/* ✅ FLAG IMG TAG - CDN images */}
          <img 
            src={selectedCountry().flag} 
            alt={selectedCountry().code}
            style={{ 
              width: '20px', 
              height: '15px', 
              'margin-right': '8px',
              'object-fit': 'cover',
              'border-radius': '2px',
              'flex-shrink': '0'
            }}
            onError={(e) => {
              // Fallback to emoji if image fails
              e.currentTarget.style.display = 'none';
              console.warn('Flag image failed to load:', selectedCountry().flag);
            }}
          />
          <span style={{ 'margin-right': '4px', color: '#6b7280', 'font-size': '14px' }}>
            {selectedCountry().dialCode}
          </span>
          <svg 
            width="12" 
            height="12" 
            viewBox="0 0 12 12" 
            fill="none"
            style={{ 
              transform: dropdownOpen() ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}
          >
            <path d="M3 4.5L6 7.5L9 4.5" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        {/* Phone Number Input */}
        <input
          ref={inputRef!}
          type="tel"
          placeholder={props.placeholder || "Phone number"}
          value={nationalNumber()}
          onInput={(e) => handleNumberInput(e.currentTarget.value)}
          onBlur={props.onBlur}
          disabled={props.disabled}
          required={props.required}
          style={{
            flex: '1',            border: 'none',
            outline: 'none',
            padding: '14px 16px',
            'font-size': '16px',
            'background-color': '#ffffff'
          }}
        />
      </div>

      {/* Dropdown */}
      <Show when={dropdownOpen()}>
        <div 
          class="country-dropdown"
          style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            right: '0',
            'z-index': '1000',
            'background-color': '#ffffff',
            border: '1px solid #e2e8f0',
            'border-radius': '8px',
            'box-shadow': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            'margin-top': '4px',
            'max-height': '200px',
            'overflow-y': 'auto'
          }}
        >
          {/* Search Input */}
          <div style={{ padding: '8px' }}>
            <input
              type="text"
              placeholder="Search countries..."
              value={searchQuery()}
              onInput={(e) => setSearchQuery(e.currentTarget.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                'border-radius': '6px',
                outline: 'none',
                'font-size': '14px'
              }}
            />
          </div>

          {/* Country List */}
          <div class="country-list">
            <For each={filteredCountries()}>
              {(country) => (
                <button
                  type="button"
                  class="country-option"
                  onClick={() => handleCountrySelect(country)}
                  style={{
                    display: 'flex',
                    'align-items': 'center',
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    background: '#ffffff',
                    cursor: 'pointer',
                    'text-align': 'left',
                    'font-size': '14px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }}                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                >
                  {/* ✅ FLAG IMG TAG - CDN images in dropdown */}
                  <img 
                    src={country.flag} 
                    alt={country.code}
                    style={{ 
                      width: '20px', 
                      height: '15px', 
                      'margin-right': '12px',
                      'object-fit': 'cover',
                      'border-radius': '2px',
                      'flex-shrink': '0'
                    }}
                    onError={(e) => {
                      // Fallback to emoji if image fails
                      e.currentTarget.style.display = 'none';
                      console.warn('Flag image failed to load:', country.flag);
                    }}
                  />
                  <span style={{ flex: '1', color: '#1f2937' }}>
                    {country.name}
                  </span>
                  <span style={{ color: '#6b7280', 'margin-left': '8px' }}>
                    {country.dialCode}
                  </span>
                </button>
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
};