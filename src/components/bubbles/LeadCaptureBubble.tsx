import { createSignal, Show, createEffect } from 'solid-js';
import { FormEvent, LeadsConfig, MessageType } from '@/components/Bot';
import { addLeadQuery, LeadCaptureInput } from '@/queries/sendMessageQuery';
import { Avatar } from '@/components/avatars/Avatar';
import { getLocalStorageChatflow, setLocalStorageChatflow } from '@/utils';
import { validateLeadForm, RateLimiter } from '@/utils/leadValidation';
import { PhoneInputWrapper } from '@/components/inputs/PhoneInputWrapper';
import type { Country } from 'react-phone-number-input';

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
};

const defaultBackgroundColor = '#f7f8ff';
const defaultTextColor = '#303235';
const defaultFontSize = 16;

// Import Canvas rate limiter settings
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

  // Real-time validation
  const validateField = (fieldName: string, value: string) => {
    if (!fieldTouched()[fieldName]) return;

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
  };

  // Handle field blur
  const handleFieldBlur = (fieldName: string, value: string) => {
    setFieldTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
    validateField(fieldName, value);
  };

  // Real-time validation effects
  createEffect(() => validateField('name', leadName()));
  createEffect(() => validateField('email', leadEmail()));
  createEffect(() => validateField('phone', leadPhone()));
  createEffect(() => validateField('message', leadMessage()));

  // Form validation check
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

  // Check rate limit using Canvas logic
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

    setIsLeadSaving(true);

    try {
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
    } catch (error) {
      console.error('Lead capture error:', error);
      setGeneralError('Failed to save your information. Please try again.');
    } finally {
      setIsLeadSaving(false);
    }
  };

  const getInputStyle = (fieldName: string) => {
    const config = props.leadsConfig;
    const hasError = fieldTouched()[fieldName] && fieldErrors()[fieldName];

    return {
      'background-color': config?.inputBackgroundColor || 'transparent',
      'color': config?.inputTextColor || props.textColor || defaultTextColor,
      'border-color': hasError ? '#ef4444' : (config?.inputBorderColor || '#eeeeee'),
      'border-width': hasError ? '2px' : '1px',
      'border-style': 'solid',
      'border-radius': '8px',
      'padding': '14px 16px',
      'font-size': props.fontSize ? `${props.fontSize}px` : `${defaultFontSize}px`,
      'transition': 'border-color 0.2s ease',
      'outline': 'none',
      'width': '100%'
    };
  };

  const getPhoneInputStyle = () => {
    const hasError = fieldTouched().phone && fieldErrors().phone;
    return {
      'background-color': props.leadsConfig?.inputBackgroundColor || '#ffffff',
      'border-radius': '8px',
      'border': hasError 
        ? '2px solid #ef4444'
        : `1px solid ${props.leadsConfig?.inputBorderColor || '#e2e8f0'}`,
      'padding': '14px 16px',
      'font-size': '16px',
      'color': props.leadsConfig?.inputTextColor || '#000000',
      'box-shadow': 'none'
    };
  };

  return (
    <div class="flex flex-row justify-start mb-2 items-start host-container" style={{ 'margin-right': '50px' }}>
      <Show when={props.showAvatar}>
        <Avatar initialAvatarSrc={props.avatarSrc} />
      </Show>
      <div
        class="px-4 py-2 ml-2 max-w-full chatbot-host-bubble prose relative"
        data-testid="host-bubble"
        style={{
          'background-color': props.leadsConfig?.formContainerBackground || props.backgroundColor || defaultBackgroundColor,
          'border': props.leadsConfig?.formContainerBorder || '1px solid #e2e8f0',
          'color': props.textColor || defaultTextColor,
          'border-radius': '12px',
          'font-size': props.fontSize ? `${props.fontSize}px` : `${defaultFontSize}px`,
          'box-shadow': '0 8px 25px rgba(0,0,0,0.1)',
          'backdrop-filter': 'blur(10px)'
        }}
      >
        <Show when={props.onDismiss}>
          <button
            onClick={props.onDismiss}
            class="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
            style={{ color: props.textColor || defaultTextColor }}
            title="Close"
          >
            ×
          </button>
        </Show>

        {props.isLeadSaved || getLocalStorageChatflow(props.chatflowid)?.lead ? (
          <div class="flex flex-col gap-2">
            <span style={{ 'white-space': 'pre-line' }}>
              {props.leadsConfig?.successMessage || 'Thank you for submitting your contact information.'}
            </span>
          </div>
        ) : (
          <form class="flex flex-col gap-3" onSubmit={handleLeadCaptureSubmit}>
            <span style={{ 'white-space': 'pre-line' }}>
              {props.leadsConfig?.title || 'Let us know where we can reach you:'}
            </span>
            
            <Show when={generalError()}>
              <div class="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                {generalError()}
              </div>
            </Show>

            <div class="flex flex-col gap-3 w-full">
              <Show when={props.leadsConfig?.name}>
                <div class="w-full flex flex-col gap-1">
                  <input
                    class="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Name"
                    name="name"
                    style={getInputStyle('name')}
                    value={leadName()}
                    onChange={(e) => {
                      setLeadName(e.currentTarget.value);
                      if (fieldTouched().name) validateField('name', e.currentTarget.value);
                    }}
                    onBlur={() => handleFieldBlur('name', leadName())}
                    minLength={props.leadsConfig?.minNameLength || 2}
                    maxLength={props.leadsConfig?.maxNameLength || 50}
                    required
                  />
                  <Show when={fieldTouched().name && fieldErrors().name}>
                    <span class="text-sm text-red-600 ml-1">{fieldErrors().name}</span>
                  </Show>
                </div>
              </Show>

              <Show when={props.leadsConfig?.email}>
                <div class="w-full flex flex-col gap-1">
                  <input
                    class="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    type="email"
                    placeholder="Email Address"
                    name="email"
                    style={getInputStyle('email')}
                    value={leadEmail()}
                    onChange={(e) => {
                      setLeadEmail(e.currentTarget.value);
                      if (fieldTouched().email) validateField('email', e.currentTarget.value);
                    }}
                    onBlur={() => handleFieldBlur('email', leadEmail())}
                    required
                  />
                  <Show when={fieldTouched().email && fieldErrors().email}>
                    <span class="text-sm text-red-600 ml-1">{fieldErrors().email}</span>
                  </Show>
                </div>
              </Show>

              <Show when={props.leadsConfig?.phone}>
                <div class="w-full flex flex-col gap-1">
                  <PhoneInputWrapper
                    value={leadPhone()}
                    onChange={(value) => {
                      if (value) {
                        setLeadPhone(value);
                        if (fieldTouched().phone) validateField('phone', value);
                      }
                    }}
                    onBlur={() => handleFieldBlur('phone', leadPhone())}
                    error={fieldTouched().phone && !!fieldErrors().phone}
                    style={getPhoneInputStyle()}
                    required
                  />
                  <Show when={fieldTouched().phone && fieldErrors().phone}>
                    <span class="text-sm text-red-600 ml-1">{fieldErrors().phone}</span>
                  </Show>
                </div>
              </Show>

              <Show when={props.leadsConfig?.enableMessage}>
                <div class="w-full flex flex-col gap-1">
                  <textarea
                    class="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                    placeholder="Message (optional)"
                    name="message"
                    style={{...getInputStyle('message'), 'min-height': '80px', 'max-height': '120px'}}
                    value={leadMessage()}
                    onChange={(e) => {
                      if (e.currentTarget.value.length <= 500) {
                        setLeadMessage(e.currentTarget.value);
                      }
                    }}
                  />
                  <Show when={leadMessage().length > 400}>
                    <span class="text-xs text-gray-500 ml-1">
                      {500 - leadMessage().length} characters remaining
                    </span>
                  </Show>
                </div>
              </Show>

              <div class="flex items-center justify-between gap-3 pt-2">
                <Show when={props.onDismiss}>
                  <button
                    type="button"
                    onClick={props.onDismiss}
                    class="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                    style={{ 
                      color: props.textColor || defaultTextColor,
                      'border-color': '#d1d5db',
                      'background-color': 'transparent'
                    }}
                  >
                    Maybe Later
                  </button>
                </Show>
                
                <button
                  type="submit"
                  disabled={isLeadSaving()}
                  class="px-6 py-3 rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
                  style={{
                    'background': `linear-gradient(135deg, ${props.leadsConfig?.saveButtonBackground || props.sendButtonColor || '#3B81F6'}, ${props.leadsConfig?.saveButtonBackground || props.sendButtonColor || '#3B81F6'}dd)`,
                    'color': props.leadsConfig?.saveButtonTextColor || 'white'
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
