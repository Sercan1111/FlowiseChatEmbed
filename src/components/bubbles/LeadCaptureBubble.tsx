import { createSignal, Show, createEffect } from 'solid-js';
import type { JSX } from 'solid-js';
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
  formStyling?: {
    formContainer: {
      background: string;
      borderColor: string;
    };
    inputFields: {
      background: string;
      textColor: string;
      borderColor: string;
    };
    saveButton: {
      background: string;
      textColor: string;
    };
  };
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
  reachUsHandler?: () => void;
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
      setFieldTouched(prev => ({ ...prev, [fieldName]: true }));
      validateField(fieldName, value);
    }
  };

  // ✅ CANVAS EXACT INPUT STYLING
  const getInputStyle = (fieldName: string) => {
    const config = props.leadsConfig;
    const formStyling = props.formStyling;
    const hasError = (props.fieldTouched?.[fieldName] || fieldTouched()[fieldName]) && 
                    (props.fieldErrors?.[fieldName] || fieldErrors()[fieldName]);

    return {
      'background-color': formStyling?.inputFields?.background || config?.inputBackgroundColor || '#ffffff',
      'color': formStyling?.inputFields?.textColor || config?.inputTextColor || '#000000',
      'border': hasError 
        ? '1px solid #ef4444' 
        : `1px solid ${formStyling?.inputFields?.borderColor || config?.inputBorderColor || '#e2e8f0'}`,
      'border-radius': '8px', // ✅ Canvas: borderRadius: '8px'
      'padding': '14px 16px', // ✅ Canvas: padding: '14px 16px'
      'font-size': '16px', // ✅ Canvas: fontSize: '16px'
      'font-family': 'Roboto, sans-serif',
      'font-weight': '400',
      'transition': 'all 0.2s ease',
      'outline': 'none',
      'width': '100%',
      'line-height': '1.5',
      'box-shadow': 'none' // ✅ Canvas: no shadow
    };
  };

  const handleSubmit = async (e?: Event) => {
    if (e) e.preventDefault();

    // Rate limiting check
    const rateLimitCheck = rateLimiter.canAttempt();
    if (!rateLimitCheck.allowed) {
      setGeneralError(rateLimitCheck.message || 'Too many attempts. Please wait a moment.');
      return;
    }

    // Validation
    const formData: FormData = {
      name: leadName(),
      email: leadEmail(),
      phone: leadPhone(),
      message: leadMessage()
    };

    const validation = validateLeadForm(formData, props.leadsConfig || { status: true });
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setIsLeadSaving(true);
    rateLimiter.recordAttempt();

    try {
      if (props.onFormSubmit) {
        await props.onFormSubmit(formData);
      } else {
        // Default submission logic
        if (props.apiHost && props.chatflowid && props.chatId) {
          const leadCaptureRequest = {
            apiHost: props.apiHost,
            body: {
              chatflowid: props.chatflowid,
              chatId: props.chatId,
              name: formData.name,
              email: formData.email,
              phone: formData.phone || '',
              message: formData.message || ''
            }
          };

          await addLeadQuery(leadCaptureRequest);
          props.setIsLeadSaved(true);
          props.setLeadEmail(formData.email);
        }
      }
    } catch (error) {
      console.error('Error submitting lead form:', error);
      setGeneralError('Failed to submit form. Please try again.');
    } finally {
      setIsLeadSaving(false);
    }
  };

  const getCurrentError = (fieldName: string) => {
    return props.fieldErrors?.[fieldName] || fieldErrors()[fieldName];
  };

  const isFieldTouched = (fieldName: string) => {
    return props.fieldTouched?.[fieldName] || fieldTouched()[fieldName];
  };
  return (
    <div
      class="flex flex-row justify-start mb-4 items-start host-container lead-capture-container"
      style={{
        width: '100%',
        margin: '0',
        padding: '0',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        background: 'transparent',
      } as JSX.CSSProperties}
    >
      {/* Avatar (optional, always left) */}
      {props.showAvatar !== false && (
        <div class="mr-3 flex-shrink-0" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' } as JSX.CSSProperties}>
          <Avatar initialAvatarSrc={props.avatarSrc} />
        </div>
      )}
      {/* Bubble container */}
      <div class="flex flex-col flex-1" style={{ alignItems: 'flex-start', width: '100%' } as JSX.CSSProperties}>
        <div
          class="chatbot-host-bubble prose relative"
          data-testid="host-bubble"
          style={{
            display: 'block',
            position: 'relative',
            padding: '6px',
            borderRadius: '8px',
            backgroundColor: props.backgroundColor || '#fff',
            border: `1px solid ${props.formStyling?.formContainer?.borderColor || '#e5e7eb'}`,
            color: props.textColor || '#1e293b',
            width: '100%',
            maxWidth: '220px',
            minWidth: '120px',
            fontSize: `${props.fontSize || 14}px`,
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            lineHeight: '1.4',
            boxSizing: 'border-box',
            overflow: 'visible',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          } as JSX.CSSProperties}
        >
          {/* HEADER: Close, Reach Us */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            marginBottom: '2px',
            minHeight: '24px',
            position: 'relative',
            gap: 0,
          } as JSX.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: '0 0 auto' } as JSX.CSSProperties}>
              {/* Close Button */}
              <Show when={props.onDismiss}>
                <button
                  onClick={props.onDismiss}
                  class="absolute transition-all duration-200"
                  style={{
                    position: 'relative',
                    top: '0',
                    left: '0',
                    zIndex: 1,
                    backgroundColor: 'rgba(0,0,0,0.08)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '22px',
                    height: '22px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#374151',
                    fontSize: '15px',
                    fontWeight: 400,
                    transition: 'all 0.2s ease'
                  } as JSX.CSSProperties}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.16)'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.08)'; }}
                  title="Close"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </Show>
            </div>
            <div style={{ flex: 1 }} />
            {/* Reach Us Button (props.reachUsHandler) */}
            <Show when={props.reachUsHandler}>
              <button
                onClick={props.reachUsHandler}
                class="transition-all duration-200"
                style={{
                  position: 'relative',
                  right: 0,
                  top: 0,
                  zIndex: 1,
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  padding: '2px 10px',
                  minWidth: '60px',
                  height: '22px',
                  cursor: 'pointer',
                  marginLeft: 'auto',
                  boxShadow: '0 1px 4px rgba(59,130,246,0.10)',
                  alignSelf: 'flex-end',
                } as JSX.CSSProperties}
                title="Reach Us"
              >
                Reach Us
              </button>
            </Show>
          </div>
          {/* BAŞLIK - kutusuz, üstte, sade */}
          <div style={{
            'font-size': '14px',
            'font-weight': '500',
            'line-height': '1.3',
            'color': props.textColor || '#1e293b',
            'margin-bottom': '2px',
            'margin-top': '2px',
            'padding': '0',
            'background': 'none',
            'border': 'none',
            'box-shadow': 'none',
            'text-align': 'left',
          } as JSX.CSSProperties}>
            {props.title || props.leadsConfig?.title || 'HEY'}
          </div>
          {/* FORM */}
          <form
            style={{
              'display': 'flex',
              'flex-direction': 'column',
              'gap': '3px', // was 6px
              'width': '100%'
            } as JSX.CSSProperties}
            onSubmit={(e) => {
              e.preventDefault();
              if (props.onFormSubmit) {
                props.onFormSubmit({
                  name: leadName(),
                  email: leadEmail(),
                  phone: leadPhone(),
                  message: leadMessage()
                });
              } else {
                handleSubmit(e);
              }
            }}
          >
            {/* NAME FIELD */}
            <Show when={props.leadsConfig?.name !== false}>
              <div class="flex flex-col gap-1">
                <input
                  class="transition-all duration-200"
                  placeholder="Name"
                  name="name"
                  style={{
                    ...getInputStyle('name'),
                    boxSizing: 'border-box',
                    padding: '7px 8px', // sağdan ve soldan 8px, overflow'u engeller
                    fontSize: '14px',
                    borderRadius: '6px',
                    height: '30px',
                    minHeight: '30px',
                    maxHeight: '30px',
                    width: '100%',
                    margin: 0,
                  } as JSX.CSSProperties}
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
                  onBlur={() => handleFieldBlur('name', leadName())}
                />
                <Show when={getCurrentError('name')}>
                  <div style={{ 'color': '#ef4444', 'font-size': '11px', 'margin-top': '1px' }}>
                    {getCurrentError('name')}
                  </div>
                </Show>
              </div>
            </Show>
            {/* EMAIL FIELD */}
            <Show when={props.leadsConfig?.email !== false}>
              <div class="flex flex-col gap-1">
                <input
                  class="transition-all duration-200"
                  placeholder="Email Address"
                  name="email"
                  type="email"
                  style={{
                    ...getInputStyle('email'),
                    boxSizing: 'border-box',
                    padding: '7px 8px',
                    fontSize: '14px',
                    borderRadius: '6px',
                    height: '30px',
                    minHeight: '30px',
                    maxHeight: '30px',
                    width: '100%',
                    margin: 0,
                  } as JSX.CSSProperties}
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
                  onBlur={() => handleFieldBlur('email', leadEmail())}
                />
                <Show when={getCurrentError('email')}>
                  <div style={{ 'color': '#ef4444', 'font-size': '11px', 'margin-top': '1px' }}>
                    {getCurrentError('email')}
                  </div>
                </Show>
              </div>
            </Show>
            {/* PHONE FIELD */}
            <Show when={props.leadsConfig?.phone !== false}>
              <div class="flex flex-col gap-1">
                <PhoneInput
                  placeholder="Phone Number"
                  value={leadPhone()}
                  onChange={(value) => {
                    setLeadPhone(value || '');
                    if (isFieldTouched('phone')) {
                      if (props.onFieldValidation) {
                        props.onFieldValidation('phone', value || '');
                      } else {
                        validateField('phone', value || '');
                      }
                    }
                  }}
                  onBlur={() => handleFieldBlur('phone', leadPhone())}
                  style={{
                    padding: '7px 8px',
                    fontSize: '14px',
                    borderRadius: '6px',
                    height: '30px',
                    minHeight: '30px',
                    maxHeight: '30px',
                    width: '100%',
                    boxSizing: 'border-box',
                    margin: '0',
                  }}
                />
                <Show when={getCurrentError('phone')}>
                  <div style={{ 'color': '#ef4444', 'font-size': '11px', 'margin-top': '1px' }}>
                    {getCurrentError('phone')}
                  </div>
                </Show>
              </div>
            </Show>
            {/* MESSAGE FIELD */}
            <Show when={props.leadsConfig?.enableMessage !== false}>
              <div class="flex flex-col gap-1">
                <textarea
                  class="transition-all duration-200"
                  placeholder=""
                  name="message"
                  rows={2}
                  style={{
                    ...getInputStyle('message'),
                    resize: 'vertical',
                    minHeight: '38px',
                    maxHeight: '50px',
                    padding: '7px 8px',
                    fontSize: '14px',
                    borderRadius: '6px',
                    width: '100%',
                    boxSizing: 'border-box',
                    margin: 0,
                  } as JSX.CSSProperties}
                  value={leadMessage()}
                  onChange={(e) => {
                    const value = e.currentTarget.value;
                    setLeadMessage(value);
                    if (isFieldTouched('message')) {
                      if (props.onFieldValidation) {
                        props.onFieldValidation('message', value);
                      } else {
                        validateField('message', value);
                      }
                    }
                  }}
                  onBlur={() => handleFieldBlur('message', leadMessage())}
                />
                <Show when={getCurrentError('message')}>
                  <div style={{ 'color': '#ef4444', 'font-size': '11px', 'margin-top': '1px' }}>
                    {getCurrentError('message')}
                  </div>
                </Show>
              </div>
            </Show>
            {/* SAVE BUTTON */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: '2px',
            } as JSX.CSSProperties}>
              <button
                type="submit"
                disabled={isLeadSaving()}
                style={{
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${props.formStyling?.saveButton?.background || '#3b82f6'}, ${props.formStyling?.saveButton?.background || '#3b82f6'}dd)`,
                  color: props.formStyling?.saveButton?.textColor || '#ffffff',
                  boxShadow: `0 2px 8px ${props.formStyling?.saveButton?.background ? `${props.formStyling?.saveButton?.background}20` : 'rgba(59, 130, 246, 0.18)'}`,
                  border: 'none',
                  padding: '7px 0',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: isLeadSaving() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  width: '100%',
                  opacity: isLeadSaving() ? '0.7' : '1',
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  height: '30px',
                  minHeight: '30px',
                  maxHeight: '30px',
                } as JSX.CSSProperties}
                onMouseEnter={(e) => {
                  if (!isLeadSaving()) {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${props.formStyling?.saveButton?.background || '#3b82f6'}dd, ${props.formStyling?.saveButton?.background || '#3b82f6'})`;
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = `0 4px 12px ${props.formStyling?.saveButton?.background ? `${props.formStyling?.saveButton?.background}30` : 'rgba(59, 130, 246, 0.22)'}`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLeadSaving()) {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${props.formStyling?.saveButton?.background || '#3b82f6'}, ${props.formStyling?.saveButton?.background || '#3b82f6'}dd)`;
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `0 2px 8px ${props.formStyling?.saveButton ? `${props.formStyling?.saveButton?.background}20` : 'rgba(59, 130, 246, 0.18)'}`;
                  }
                }}
              >
                {isLeadSaving() ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
