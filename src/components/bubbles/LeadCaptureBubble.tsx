import { createSignal, Show, createEffect } from 'solid-js';
import { FormEvent, LeadsConfig, MessageType } from '@/components/Bot';
import { addLeadQuery, LeadCaptureInput } from '@/queries/sendMessageQuery';
import { Avatar } from '@/components/avatars/Avatar';
import { getLocalStorageChatflow, setLocalStorageChatflow } from '@/utils';
import { validateLeadForm, RateLimiter } from '@/utils/leadValidation';
import { PhoneInput } from '@/components/inputs/PhoneInput';

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

type Props = {
  message: MessageType;
  chatflowid: string;
  chatId: string;
  leadsConfig?: LeadsConfig;
  apiHost?: string;
  showAvatar?: boolean;
  avatarSrc?: string;
  backgroundColor?: string;
  textColor?: string;
  sendButtonColor?: string;
  fontSize?: number;
  isLeadSaved: boolean;
  setIsLeadSaved: (value: boolean) => void;
  setLeadEmail: (value: string) => void;
  onDismiss?: () => void;
  fieldErrors?: Record<string, string>;
  fieldTouched?: Record<string, boolean>;
  onFieldValidation?: (fieldName: string, value: string) => boolean;
  onFieldBlur?: (fieldName: string, value: string) => void;
  onFormSubmit?: (formData: FormData) => void;
  title?: string;
};

const defaultBackgroundColor = '#ffffff';
const defaultTextColor = '#1f2937';
const defaultFontSize = 16;

const rateLimiter = new RateLimiter(3, 60000, 5000);

export const LeadCaptureBubble = (props: Props) => {
  const [leadName, setLeadName] = createSignal<string>('');
  const [leadEmail, setLeadEmail] = createSignal<string>('');
  const [leadPhone, setLeadPhone] = createSignal<string>('');
  const [leadMessage, setLeadMessage] = createSignal<string>('');
  const [isLeadSaving, setIsLeadSaving] = createSignal(false);
  const [fieldErrors, setFieldErrors] = createSignal<Record<string, string>>({});
  const [fieldTouched, setFieldTouched] = createSignal<Record<string, boolean>>({
    name: false,
    email: false,
    phone: false,
    message: false
  });
  const [lastSubmissionTime, setLastSubmissionTime] = createSignal(0);
  const [submissionAttempts, setSubmissionAttempts] = createSignal(0);
  const [generalError, setGeneralError] = createSignal<string>('');

  // Keep original validation logic
  const validateField = (fieldName: string, value: string) => {
    if (props.onFieldValidation) {
      return props.onFieldValidation(fieldName, value);
    } else {
      if (!fieldTouched()[fieldName]) return true;
      const formData: FormData = {
        name: fieldName === 'name' ? value : leadName(),
        email: fieldName === 'email' ? value : leadEmail(),
        phone: fieldName === 'phone' ? value : leadPhone(),
        message: fieldName === 'message' ? value : leadMessage()
      };
      const validation = validateLeadForm(formData, props.leadsConfig || { status: true });
      setFieldErrors(prev => ({
        ...prev,
        [fieldName]: validation.errors[fieldName] || ''
      }));
      return !validation.errors[fieldName];
    }
  };

  const handleFieldBlur = (fieldName: string, value: string) => {
    if (props.onFieldBlur) {
      props.onFieldBlur(fieldName, value);
    } else {
      setFieldTouched(prev => ({
        ...prev,
        [fieldName]: true
      }));
      validateField(fieldName, value);
    }
  };

  // Keep original validation effects
  createEffect(() => validateField('name', leadName()));
  createEffect(() => validateField('email', leadEmail()));
  createEffect(() => validateField('phone', leadPhone()));
  createEffect(() => validateField('message', leadMessage()));

  const validateFormBeforeSubmit = (): { isValid: boolean; errors: Record<string, string> } => {
    const formData: FormData = {
      name: leadName(),
      email: leadEmail(),
      phone: leadPhone(),
      message: leadMessage()
    };

    const validation = validateLeadForm(formData, props.leadsConfig || { status: true });
    setFieldErrors(validation.errors);

    setFieldTouched({
      name: true,
      email: true,
      phone: true,
      message: true
    });

    return validation;
  };

  const checkRateLimit = (): boolean => {
    const now = Date.now();
    const timeSinceLastSubmission = now - lastSubmissionTime();

    if (timeSinceLastSubmission < 5000) {
      setGeneralError('Please wait 5 seconds before submitting again.');
      return false;
    }

    if (submissionAttempts() >= 3 && timeSinceLastSubmission < 60000) {
      setGeneralError('Too many attempts. Please wait 1 minute.');
      return false;
    }

    if (timeSinceLastSubmission > 60000) {
      setSubmissionAttempts(0);
    }

    return true;
  };

  const handleLeadCaptureSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError('');

    if (!checkRateLimit()) {
      return;
    }

    const now = Date.now();
    setLastSubmissionTime(now);
    setSubmissionAttempts(prev => prev + 1);

    const validation = validateFormBeforeSubmit();
    if (!validation.isValid) {
      return;
    }

    const formData: FormData = {
      name: leadName(),
      email: leadEmail(),
      phone: leadPhone(),
      message: leadMessage()
    };

    setIsLeadSaving(true);

    try {
      if (props.onFormSubmit) {
        await props.onFormSubmit(formData);
        
        const currentStorage = getLocalStorageChatflow(props.chatflowid) || {};
        setLocalStorageChatflow(props.chatflowid, props.chatId, {
          ...currentStorage,
          lead: {
            name: leadName(),
            email: leadEmail(),
            phone: leadPhone(),
            message: leadMessage()
          },
          leadFormDismissed: false
        });

        props.setIsLeadSaved(true);
        props.setLeadEmail(leadEmail());
        setSubmissionAttempts(0);
        setFieldErrors({});
        
      } else {
        const body: LeadCaptureInput = {
          chatflowid: props.chatflowid,
          chatId: props.chatId,
          name: leadName(),
          email: leadEmail(),
          phone: leadPhone(),
          message: leadMessage()
        };

        const result = await addLeadQuery({
          apiHost: props.apiHost,
          body,
        });

        if (result.data) {
          const currentStorage = getLocalStorageChatflow(props.chatflowid) || {};
          setLocalStorageChatflow(props.chatflowid, props.chatId, {
            ...currentStorage,
            lead: {
              name: leadName(),
              email: leadEmail(),
              phone: leadPhone(),
              message: leadMessage()
            },
            leadFormDismissed: false
          });

          props.setIsLeadSaved(true);
          props.setLeadEmail(leadEmail());
          setSubmissionAttempts(0);
          setFieldErrors({});
        } else {
          throw new Error('Failed to save lead');
        }
      }
    } catch (error) {
      console.error('Lead capture error:', error);
      setGeneralError('Failed to save your information. Please try again.');
    } finally {
      setIsLeadSaving(false);
    }
  };

  // ✅ CANVAS MODERN STYLING - Wider and more modern
  const getInputStyle = (fieldName: string) => {
    const config = props.leadsConfig;
    const hasError = (props.fieldTouched?.[fieldName] || fieldTouched()[fieldName]) && 
                    (props.fieldErrors?.[fieldName] || fieldErrors()[fieldName]);

    return {
      'background-color': config?.inputBackgroundColor || '#ffffff',
      'color': config?.inputTextColor || '#111827',
      'border': hasError 
        ? '2px solid #ef4444' 
        : '2px solid #e5e7eb',
      'border-radius': '12px', // ✅ More rounded like Canvas
      'padding': '14px 18px', // ✅ More padding
      'font-size': `${(props.fontSize || defaultFontSize)}px`,
      'font-family': 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      'transition': 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', // ✅ Smooth transition
      'outline': 'none',
      'width': '100%',
      'line-height': '1.5',
      'font-weight': '500', // ✅ Medium weight like Canvas
      'box-shadow': '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
    };
  };

  const getInputFocusStyle = () => ({
    'border-color': '#3b82f6',
    'box-shadow': '0 0 0 4px rgba(59, 130, 246, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    'transform': 'translateY(-1px)'
  });

  const getCurrentError = (fieldName: string) => {
    return props.fieldErrors?.[fieldName] || fieldErrors()[fieldName];
  };

  const isFieldTouched = (fieldName: string) => {
    return props.fieldTouched?.[fieldName] || fieldTouched()[fieldName];
  };

  return (
    <div 
      class="flex flex-row justify-start mb-4 items-start host-container" 
      style={{ 'margin-right': '40px' }} // ✅ Less margin for more space
    >
      <Show when={props.showAvatar}>
        <div style={{ 'margin-right': '16px', 'flex-shrink': '0' }}>
          <Avatar initialAvatarSrc={props.avatarSrc} />
        </div>
      </Show>
      
      {/* ✅ COMPACT MODERN CONTAINER - Daha küçük ve sığacak boyut */}
      <div
        class="px-5 py-5 max-w-full chatbot-host-bubble prose relative"
        data-testid="host-bubble"
        style={{
          // ✅ MODERN BACKGROUND - Canvas-like
          'background': 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          'border': '1px solid rgba(226, 232, 240, 0.8)',
          'color': props.textColor || '#111827',
          'border-radius': '16px',
          'font-size': `${props.fontSize || defaultFontSize}px`,
          'box-shadow': '0 8px 20px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)', // ✅ Daha hafif shadow
          'font-family': 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          'line-height': '1.5',
          
          // ✅ WIDGET İÇİN OPTIMIZE - Daha küçük boyutlar
          'max-width': '350px', // ✅ 480px -> 350px (widget için daha uygun)
          'min-width': '320px', // ✅ 400px -> 320px  
          'width': '100%',
          'position': 'relative',
          
          // ✅ MODERN BACKDROP
          'backdrop-filter': 'blur(12px)', // ✅ Hafif azaltıldı
          '-webkit-backdrop-filter': 'blur(12px)'
        }}
      >
        
        {/* ✅ CANVAS MODERN CLOSE BUTTON */}
        <Show when={props.onDismiss}>
          <button
            onClick={props.onDismiss}
            class="absolute flex items-center justify-center transition-all duration-200"
            style={{
              'top': '12px',
              'right': '12px',
              'width': '28px',  // ✅ Larger
              'height': '28px', // ✅ Larger
              'border-radius': '8px', // ✅ More rounded
              'background': 'rgba(107, 114, 128, 0.1)',
              'border': 'none',
              'cursor': 'pointer',
              'color': '#6b7280',
              'font-size': '18px',
              'font-weight': '600',
              'z-index': '10',
              'display': 'flex',
              'align-items': 'center',
              'justify-content': 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(107, 114, 128, 0.2)';
              e.currentTarget.style.color = '#374151';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(107, 114, 128, 0.1)';
              e.currentTarget.style.color = '#6b7280';
            }}
            title="Close"
          >
            ×
          </button>
        </Show>

        {/* SUCCESS STATE - Canvas style */}
        {props.isLeadSaved || getLocalStorageChatflow(props.chatflowid)?.lead ? (
          <div class="flex flex-col gap-4">
            {/* ✅ SUCCESS ICON - Canvas style */}
            <div style={{
              'display': 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              'margin-bottom': '8px'
            }}>
              <div style={{
                'width': '48px',
                'height': '48px',
                'background': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                'border-radius': '50%',
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                'color': 'white',
                'font-size': '24px',
                'font-weight': '600',
                'box-shadow': '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}>
                ✓
              </div>
            </div>
            
            <span style={{ 
              'white-space': 'pre-line',
              'line-height': '1.6',
              'color': props.textColor || '#111827',
              'text-align': 'center',
              'font-weight': '500',
              'font-size': `${(props.fontSize || defaultFontSize) + 1}px`
            }}>
              {props.leadsConfig?.successMessage || 'Thank you!\nWhat can I do for you?'}
            </span>
          </div>
        ) : (
          <form class="flex flex-col gap-4" onSubmit={handleLeadCaptureSubmit}>
            {/* ✅ CANVAS MODERN TITLE */}
            <div style={{ 
              'color': props.textColor || '#111827',
              'font-weight': '700', // ✅ Bold like Canvas
              'font-size': `${(props.fontSize || defaultFontSize) + 2}px`, // ✅ Larger
              'line-height': '1.3',
              'white-space': 'pre-line',
              'margin-bottom': '8px',
              'text-align': 'center' // ✅ Centered like Canvas
            }}>
              {props.title || props.leadsConfig?.title || '👋 Thanks for your interest!\nLet us know where we can reach you'}
            </div>
            
            {/* ERROR DISPLAY - Canvas style */}
            <Show when={generalError() || props.fieldErrors?.general}>
              <div 
                class="text-sm p-4 rounded-xl"
                style={{
                  'color': '#dc2626',
                  'background': 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                  'border': '1px solid #fecaca',
                  'font-size': '14px',
                  'font-weight': '500',
                  'box-shadow': '0 2px 4px rgba(220, 38, 38, 0.1)'
                }}
              >
                {generalError() || props.fieldErrors?.general}
              </div>
            </Show>

            {/* ✅ FORM FIELDS - Daha compact */}
            <div class="flex flex-col gap-3"> {/* ✅ gap-4 -> gap-3 */}
              
              {/* NAME FIELD */}
              <Show when={props.leadsConfig?.name !== false}>
                <div class="flex flex-col gap-2">
                  <label style={{
                    'font-weight': '600', // ✅ Bolder
                    'font-size': '14px',
                    'color': props.textColor || '#374151',
                    'margin-bottom': '4px'
                  }}>
                    Name *
                  </label>
                  <input
                    class="transition-all duration-200"
                    placeholder="Enter your name"
                    name="name"
                    style={getInputStyle('name')}
                    value={leadName()}
                    onChange={(e) => {
                      const value = e.currentTarget.value;
                      setLeadName(value);
                      if (isFieldTouched('name')) {
                        if (props.onFieldValidation) {
                          props.onFieldValidation('name', value);
                        } else {
                          validateField('name', value);
                        }
                      }
                    }}
                    onFocus={(e) => {
                      Object.assign(e.currentTarget.style, getInputFocusStyle());
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = getCurrentError('name') ? '#ef4444' : '#e5e7eb';
                      e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      handleFieldBlur('name', leadName());
                    }}
                    minLength={props.leadsConfig?.minNameLength || 2}
                    maxLength={props.leadsConfig?.maxNameLength || 50}
                    required
                  />
                  <Show when={isFieldTouched('name') && getCurrentError('name')}>
                    <span style={{ 
                      'color': '#ef4444',
                      'font-size': '12px',
                      'font-weight': '500',
                      'margin-top': '2px'
                    }}>
                      {getCurrentError('name')}
                    </span>
                  </Show>
                </div>
              </Show>

              {/* EMAIL FIELD */}
              <Show when={props.leadsConfig?.email !== false}>
                <div class="flex flex-col gap-2">
                  <label style={{
                    'font-weight': '600',
                    'font-size': '14px',
                    'color': props.textColor || '#374151',
                    'margin-bottom': '4px'
                  }}>
                    Email Address *
                  </label>
                  <input
                    class="transition-all duration-200"
                    type="email"
                    placeholder="Enter your email"
                    name="email"
                    style={getInputStyle('email')}
                    value={leadEmail()}
                    onChange={(e) => {
                      const value = e.currentTarget.value;
                      setLeadEmail(value);
                      if (isFieldTouched('email')) {
                        if (props.onFieldValidation) {
                          props.onFieldValidation('email', value);
                        } else {
                          validateField('email', value);
                        }
                      }
                    }}
                    onFocus={(e) => {
                      Object.assign(e.currentTarget.style, getInputFocusStyle());
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = getCurrentError('email') ? '#ef4444' : '#e5e7eb';
                      e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      handleFieldBlur('email', leadEmail());
                    }}
                    required
                  />
                  <Show when={isFieldTouched('email') && getCurrentError('email')}>
                    <span style={{ 
                      'color': '#ef4444',
                      'font-size': '12px',
                      'font-weight': '500',
                      'margin-top': '2px'
                    }}>
                      {getCurrentError('email')}
                    </span>
                  </Show>
                </div>
              </Show>

              {/* PHONE FIELD */}
              <Show when={props.leadsConfig?.phone}>
                <div class="flex flex-col gap-2">
                  <label style={{
                    'font-weight': '600',
                    'font-size': '14px',
                    'color': props.textColor || '#374151',
                    'margin-bottom': '4px'
                  }}>
                    Phone Number
                  </label>
                  <div style={{
                    'border': isFieldTouched('phone') && getCurrentError('phone')
                      ? '2px solid #ef4444'
                      : '2px solid #e5e7eb',
                    'border-radius': '12px',
                    'transition': 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    'box-shadow': '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  }}>
                    <PhoneInput
                      value={leadPhone()}
                      onChange={(value) => {
                        setLeadPhone(value);
                        if (isFieldTouched('phone')) {
                          if (props.onFieldValidation) {
                            props.onFieldValidation('phone', value);
                          } else {
                            validateField('phone', value);
                          }
                        }
                      }}
                      onBlur={() => handleFieldBlur('phone', leadPhone())}
                      placeholder="Phone Number"
                      defaultCountry="US"
                      disabled={isLeadSaving()}
                      style={{
                        'background-color': props.leadsConfig?.inputBackgroundColor || '#ffffff',
                        'color': props.leadsConfig?.inputTextColor || '#111827',
                        'border': 'none',
                        'border-radius': '10px',
                        'padding': '14px 18px',
                        'font-size': `${props.fontSize || defaultFontSize}px`,
                        'font-family': 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        'outline': 'none',
                        'width': '100%',
                        'font-weight': '500'
                      }}
                    />
                  </div>
                  <Show when={isFieldTouched('phone') && getCurrentError('phone')}>
                    <span style={{ 
                      'color': '#ef4444',
                      'font-size': '12px',
                      'font-weight': '500',
                      'margin-top': '2px'
                    }}>
                      {getCurrentError('phone')}
                    </span>
                  </Show>
                </div>
              </Show>

              {/* MESSAGE FIELD */}
              <Show when={props.leadsConfig?.enableMessage}>
                <div class="flex flex-col gap-2">
                  <label style={{
                    'font-weight': '600',
                    'font-size': '14px',
                    'color': props.textColor || '#374151',
                    'margin-bottom': '4px'
                  }}>
                    Message (Optional)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <textarea
                      class="transition-all duration-200 resize-none"
                      placeholder="Tell us more about your inquiry..."
                      name="message"
                      style={{
                        ...getInputStyle('message'), 
                        'min-height': '88px', // ✅ Taller
                        'padding-bottom': '28px'
                      }}
                      value={leadMessage()}
                      onChange={(e) => {
                        if (e.currentTarget.value.length <= 250) {
                          setLeadMessage(e.currentTarget.value);
                        }
                      }}
                      onFocus={(e) => {
                        Object.assign(e.currentTarget.style, getInputFocusStyle());
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    />
                    {/* CHARACTER COUNTER */}
                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '14px',
                      'font-size': '11px',
                      'color': '#9ca3af',
                      'pointer-events': 'none',
                      'font-weight': '500'
                    }}>
                      {leadMessage().length}/250
                    </div>
                  </div>
                </div>
              </Show>

              {/* ✅ CANVAS MODERN SUBMIT BUTTON */}
              <div class="flex items-center justify-center pt-3">
                <button
                  type="submit"
                  disabled={isLeadSaving()}
                  class="transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    'width': '100%',
                    'padding': '14px 28px', // ✅ 16px 32px -> 14px 28px (daha compact)
                    'border-radius': '12px',
                    'border': 'none',
                    'font-weight': '700', // ✅ Bolder
                    'font-size': `${(props.fontSize || defaultFontSize)}px`,
                    'cursor': isLeadSaving() ? 'not-allowed' : 'pointer',
                    'background': isLeadSaving() 
                      ? '#9ca3af' 
                      : `linear-gradient(135deg, ${props.leadsConfig?.saveButtonBackground || props.sendButtonColor || '#3b82f6'} 0%, ${props.leadsConfig?.saveButtonBackground || props.sendButtonColor || '#1d4ed8'} 100%)`,
                    'color': props.leadsConfig?.saveButtonTextColor || '#ffffff',
                    'font-family': 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    'box-shadow': isLeadSaving() 
                      ? 'none' 
                      : '0 4px 12px rgba(59, 130, 246, 0.3)',
                    'transform': isLeadSaving() ? 'none' : 'translateY(0)',
                    'letter-spacing': '0.025em' // ✅ Slight letter spacing
                  }}
                  onMouseEnter={(e) => {
                    if (!isLeadSaving()) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLeadSaving()) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                    }
                  }}
                >
                  {isLeadSaving() ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
