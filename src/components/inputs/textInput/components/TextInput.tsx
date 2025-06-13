import { ShortTextInput } from './ShortTextInput';
import { isMobile } from '@/utils/isMobileSignal';
import { Show, createSignal, createEffect, onMount, Setter } from 'solid-js';
import { SendButton } from '@/components/buttons/SendButton';
import type { FileEvent } from '@/components/Bot';
import { ImageUploadButton } from '@/components/buttons/ImageUploadButton';
import { RecordAudioButton } from '@/components/buttons/RecordAudioButton';
import { AttachmentUploadButton } from '@/components/buttons/AttachmentUploadButton';
import { ChatInputHistory } from '@/utils/chatInputHistory';

type TextInputProps = {
  placeholder?: string;
  backgroundColor?: string;
  textColor?: string;
  sendButtonColor?: string;
  inputValue: string;
  fontSize?: number;
  disabled?: boolean;
  onSubmit: (value: string) => void;
  onInputChange: (value: string) => void;
  uploadsConfig?: Partial<any>;
  isFullFileUpload?: boolean;
  setPreviews: Setter<unknown[]>;
  onMicrophoneClicked: () => void;
  handleFileChange: (event: FileEvent<HTMLInputElement>) => void;
  maxChars?: number;
  maxCharsWarningMessage?: string;
  autoFocus?: boolean;
  sendMessageSound?: boolean;
  sendSoundLocation?: string;
  fullFileUploadAllowedTypes?: string;
  enableInputHistory?: boolean;
  maxHistorySize?: number;
  isDragActive?: boolean;
  setIsDragActive?: (active: boolean) => void;
};

const defaultBackgroundColor = '#ffffff';
const defaultTextColor = '#374151';
const defaultSendSound = 'https://cdn.jsdelivr.net/gh/FlowiseAI/FlowiseChatEmbed@latest/src/assets/send_message.mp3';

export const TextInput = (props: TextInputProps) => {
  const [isSendButtonDisabled, setIsSendButtonDisabled] = createSignal(false);
  const [warningMessage, setWarningMessage] = createSignal('');
  const [inputHistory] = createSignal(new ChatInputHistory(() => props.maxHistorySize || 10));
  let inputRef: HTMLInputElement | HTMLTextAreaElement | undefined;
  let fileUploadRef: HTMLInputElement | HTMLTextAreaElement | undefined;
  let imgUploadRef: HTMLInputElement | HTMLTextAreaElement | undefined;
  let audioRef: HTMLAudioElement | undefined;

  const handleInput = (inputValue: string) => {
    const wordCount = inputValue.length;

    if (props.maxChars && wordCount > props.maxChars) {
      setWarningMessage(props.maxCharsWarningMessage ?? `You exceeded the characters limit. Please input less than ${props.maxChars} characters.`);
      setIsSendButtonDisabled(true);
      return;
    }

    props.onInputChange(inputValue);
    setWarningMessage('');
    setIsSendButtonDisabled(false);
  };

  const checkIfInputIsValid = () => warningMessage() === '' && inputRef?.reportValidity();

  const submit = () => {
    if (checkIfInputIsValid()) {
      if (props.enableInputHistory) {
        inputHistory().addToHistory(props.inputValue);
      }
      props.onSubmit(props.inputValue);
      if (props.sendMessageSound && audioRef) {
        audioRef.play();
      }
    }
  };

  const handleImageUploadClick = () => {
    if (imgUploadRef) imgUploadRef.click();
  };

  const handleFileUploadClick = () => {
    if (fileUploadRef) fileUploadRef.click();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      const isIMEComposition = e.isComposing || e.keyCode === 229;
      if (!isIMEComposition) {
        e.preventDefault();
        submit();
      }
    } else if (props.enableInputHistory) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const previousInput = inputHistory().getPreviousInput(props.inputValue);
        props.onInputChange(previousInput);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextInput = inputHistory().getNextInput();
        props.onInputChange(nextInput);
      }
    }
  };

  createEffect(() => {
    const shouldAutoFocus = props.autoFocus !== undefined ? props.autoFocus : !isMobile() && window.innerWidth > 640;
    if (!props.disabled && shouldAutoFocus && inputRef) inputRef.focus();
  });

  onMount(() => {
    const shouldAutoFocus = props.autoFocus !== undefined ? props.autoFocus : !isMobile() && window.innerWidth > 640;
    if (!props.disabled && shouldAutoFocus && inputRef) inputRef.focus();

    if (props.sendMessageSound) {
      if (props.sendSoundLocation) {
        audioRef = new Audio(props.sendSoundLocation);
      } else {
        audioRef = new Audio(defaultSendSound);
      }
    }
  });

  const handleFileChange = (event: FileEvent<HTMLInputElement>) => {
    props.handleFileChange(event);
    if (event.target) event.target.value = '';
  };

  const getFileType = () => {
    if (props.isFullFileUpload) return props.fullFileUploadAllowedTypes === '' ? '*' : props.fullFileUploadAllowedTypes;
    if (props.uploadsConfig?.fileUploadSizeAndTypes?.length) {
      const allowedFileTypes = props.uploadsConfig?.fileUploadSizeAndTypes.map((allowed) => allowed.fileTypes).join(',');
      if (allowedFileTypes.includes('*')) return '*';
      else return allowedFileTypes;
    }
    return '*';
  };

  // ✅ CANVAS MODERN STYLING - Much better design
  return (
    <div
      class="flex flex-col w-full"
      style={{
        'font-family': 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
      onKeyDown={handleKeyDown}
    >
      {/* WARNING MESSAGE */}
      <Show when={warningMessage() !== ''}>
        <div 
          class="mb-3 px-4 py-2 rounded-xl text-sm"
          style={{
            'background': 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            'color': '#dc2626',
            'border': '1px solid #fecaca',
            'font-weight': '500'
          }}
        >
          {warningMessage()}
        </div>
      </Show>

      {/* ✅ MAIN INPUT CONTAINER - Horizontal layout */}
      <div
        class="flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 chatbot-input-container"
        style={{
          'background': props.backgroundColor || '#ffffff',
          'border': props.disabled ? '2px solid #e5e7eb' : '2px solid #f3f4f6',
          'box-shadow': '0 1px 2px rgba(0, 0, 0, 0.05)',
          'backdrop-filter': 'blur(8px)',
          '-webkit-backdrop-filter': 'blur(8px)',
          'width': '100%',
          'min-height': '52px'
        }}
        onFocus={() => {
          const container = document.querySelector('.chatbot-input-container') as HTMLElement;
          if (container && !props.disabled) {
            container.style.borderColor = props.sendButtonColor || '#3b82f6';
            container.style.boxShadow = `0 0 0 3px ${props.sendButtonColor || '#3b82f6'}20`;
          }
        }}
        onBlur={() => {
          const container = document.querySelector('.chatbot-input-container') as HTMLElement;
          if (container) {
            container.style.borderColor = '#f3f4f6';
            container.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
          }
        }}
      >
        
        {/* ✅ LEFT SIDE BUTTONS - More compact */}
        <div class="flex items-center gap-1 flex-shrink-0">
          
          {/* IMAGE UPLOAD - Smaller and cleaner */}
          <Show when={props.uploadsConfig?.isImageUploadAllowed}>
            <button
              type="button"
              disabled={props.disabled || isSendButtonDisabled()}
              onClick={handleImageUploadClick}
              class="p-2 rounded-lg transition-all duration-200 disabled:opacity-50"
              style={{
                'background': 'transparent',
                'border': 'none',
                'color': '#6b7280',
                'cursor': props.disabled ? 'not-allowed' : 'pointer',
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                'width': '32px',
                'height': '32px'
              }}
              onMouseEnter={(e) => {
                if (!props.disabled && !isSendButtonDisabled()) {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                  e.currentTarget.style.color = props.sendButtonColor || '#3b82f6';
                }
              }}
              onMouseLeave={(e) => {
                if (!props.disabled && !isSendButtonDisabled()) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#6b7280';
                }
              }}
              title="Upload Image"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </button>
            <input
              style={{ display: 'none' }}
              multiple
              ref={imgUploadRef as HTMLInputElement}
              type="file"
              onChange={handleFileChange}
              accept={
                props.uploadsConfig?.imgUploadSizeAndTypes?.length
                  ? props.uploadsConfig?.imgUploadSizeAndTypes.map((allowed) => allowed.fileTypes).join(',')
                  : '*'
              }
            />
          </Show>

          {/* FILE UPLOAD - Smaller icon */}
          <Show when={props.uploadsConfig?.isRAGFileUploadAllowed || props.isFullFileUpload}>
            <button
              type="button"
              disabled={props.disabled || isSendButtonDisabled()}
              onClick={handleFileUploadClick}
              class="p-2 rounded-lg transition-all duration-200 disabled:opacity-50"
              style={{
                'background': 'transparent',
                'border': 'none',
                'color': '#6b7280',
                'cursor': props.disabled ? 'not-allowed' : 'pointer',
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                'width': '32px',
                'height': '32px'
              }}
              onMouseEnter={(e) => {
                if (!props.disabled && !isSendButtonDisabled()) {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                  e.currentTarget.style.color = props.sendButtonColor || '#3b82f6';
                }
              }}
              onMouseLeave={(e) => {
                if (!props.disabled && !isSendButtonDisabled()) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#6b7280';
                }
              }}
              title="Upload File"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5a2.5 2.5 0 0 0 5 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.31 2.69 6 6 6s6-2.69 6-6V6h-2.5z"/>
              </svg>
            </button>
            <input
              style={{ display: 'none' }}
              multiple
              ref={fileUploadRef as HTMLInputElement}
              type="file"
              onChange={handleFileChange}
              accept={getFileType()}
            />
          </Show>

          {/* VOICE RECORDING - Smaller icon */}
          <Show when={props.uploadsConfig?.isSpeechToTextEnabled}>
            <button
              type="button"
              disabled={props.disabled || isSendButtonDisabled()}
              onClick={props.onMicrophoneClicked}
              class="p-2 rounded-lg transition-all duration-200 disabled:opacity-50"
              style={{
                'background': 'transparent',
                'border': 'none',
                'color': '#6b7280',
                'cursor': props.disabled ? 'not-allowed' : 'pointer',
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                'width': '32px',
                'height': '32px'
              }}
              onMouseEnter={(e) => {
                if (!props.disabled && !isSendButtonDisabled()) {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                  e.currentTarget.style.color = props.sendButtonColor || '#3b82f6';
                }
              }}
              onMouseLeave={(e) => {
                if (!props.disabled && !isSendButtonDisabled()) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#6b7280';
                }
              }}
              title="Record Audio"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/>
              </svg>
            </button>
          </Show>
        </div>

        {/* ✅ TEXT INPUT - Full width and centered */}
        <div class="flex-1 min-w-0 flex items-center">
          <ShortTextInput
            ref={inputRef as HTMLTextAreaElement}
            onInput={handleInput}
            value={props.inputValue}
            fontSize={props.fontSize}
            disabled={props.disabled}
            placeholder={props.placeholder ?? 'Type your message...'}
            style={{
              'background': 'transparent',
              'border': 'none',
              'outline': 'none',
              'resize': 'none',
              'font-family': 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              'font-size': `${props.fontSize || 15}px`,
              'color': props.textColor || defaultTextColor,
              'line-height': '1.5',
              'padding': '8px 0',
              'min-height': '24px',
              'max-height': '100px',
              'overflow-y': 'auto',
              'width': '100%'
            }}
          />
        </div>

        {/* ✅ SEND BUTTON - Circular and right side */}
        <div class="flex-shrink-0">
          <button
            type="button"
            disabled={props.disabled || isSendButtonDisabled() || !props.inputValue.trim()}
            onClick={submit}
            class="transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              'background': props.disabled || isSendButtonDisabled() || !props.inputValue.trim()
                ? '#e5e7eb'
                : `linear-gradient(135deg, ${props.sendButtonColor || '#3b82f6'} 0%, ${props.sendButtonColor || '#1d4ed8'} 100%)`,
              'color': props.disabled || isSendButtonDisabled() || !props.inputValue.trim()
                ? '#9ca3af'
                : '#ffffff',
              'border': 'none',
              'border-radius': '50%',
              'padding': '0',
              'cursor': props.disabled || isSendButtonDisabled() || !props.inputValue.trim() ? 'not-allowed' : 'pointer',
              'display': 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              'width': '36px',
              'height': '36px',
              'box-shadow': props.disabled || isSendButtonDisabled() || !props.inputValue.trim()
                ? 'none'
                : '0 2px 8px rgba(59, 130, 246, 0.3)',
              'transform': 'translateY(0)',
              'flex-shrink': '0'
            }}
            onMouseEnter={(e) => {
              if (!props.disabled && !isSendButtonDisabled() && props.inputValue.trim()) {
                e.currentTarget.style.transform = 'translateY(-1px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!props.disabled && !isSendButtonDisabled() && props.inputValue.trim()) {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
              }
            }}
            title="Send Message"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
