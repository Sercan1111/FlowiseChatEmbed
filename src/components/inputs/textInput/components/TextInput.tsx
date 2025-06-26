import type { JSX } from 'solid-js';
import { ShortTextInput } from './ShortTextInput';
import { isMobile } from '@/utils/isMobileSignal';
import { Show, createSignal, createEffect, onMount, Setter } from 'solid-js';
import { SendButton } from '@/components/buttons/SendButton';
import { FileEvent, UploadsConfig } from '@/components/Bot';
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
  uploadsConfig?: Partial<UploadsConfig>;
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
};

const defaultBackgroundColor = '#ffffff';
const defaultTextColor = '#303235';
const defaultSendSound = 'https://cdn.jsdelivr.net/gh/FlowiseAI/FlowiseChatEmbed@latest/src/assets/send_message.mp3';

export const TextInput = (props: TextInputProps) => {
  const [isSendButtonDisabled, setIsSendButtonDisabled] = createSignal(false);
  const [warningMessage, setWarningMessage] = createSignal('');
  const [inputHistory] = createSignal(new ChatInputHistory(() => props.maxHistorySize || 10));
  let inputRef: HTMLInputElement | HTMLTextAreaElement | undefined;
  let fileUploadRef: HTMLInputElement | HTMLTextAreaElement | undefined;
  let imgUploadRef: HTMLInputElement | HTMLTextAreaElement | undefined;
  let audioRef: HTMLAudioElement | undefined;

  // ✅ REMOVE ALL CSS INJECTION - Back to clean approach
  // No more createEffect with CSS injection

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
    return '*';  };  return (
    <div
      class="chatbot-input border border-[#eeeeee] p-0 m-0 bg-white"
      data-testid="input"
      style={{
        margin: 'auto',
        width: '100%',
        'max-width': '100%',
        'box-sizing': 'border-box',
        'background-color': props.backgroundColor ?? defaultBackgroundColor,
        color: props.textColor ?? defaultTextColor,
        'font-family': 'Inter, system-ui, -apple-system, sans-serif',
        'font-weight': '400',
        'font-size': '16px',
        padding: '0',
        border: 'none',
      }}
      onKeyDown={handleKeyDown}
    >
      <Show when={warningMessage() !== ''}>
        <div class="px-4 pt-2 pb-1 text-red-500 text-xs" data-testid="warning-message">
          {warningMessage()}
        </div>
      </Show>
      <div>
        {/* IMAGE UPLOAD */}
        {props.uploadsConfig?.isImageUploadAllowed ? (
          <>
            <ImageUploadButton
              buttonColor={props.sendButtonColor}
              type="button"
              class="m-0 h-8 w-8 flex items-center justify-center"
              isDisabled={props.disabled || isSendButtonDisabled()}
              on:click={handleImageUploadClick}
            >
              <span class="sr-only">Image Upload</span>
            </ImageUploadButton>
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
          </>
        ) : null}
        {/* FILE UPLOAD */}
        {props.uploadsConfig?.isRAGFileUploadAllowed || props.isFullFileUpload ? (
          <>
            <AttachmentUploadButton
              buttonColor={props.sendButtonColor}
              type="button"
              class="m-0 h-8 w-8 flex items-center justify-center"
              isDisabled={props.disabled || isSendButtonDisabled()}
              on:click={handleFileUploadClick}
            >
              <span class="sr-only">File Upload</span>
            </AttachmentUploadButton>
            <input
              style={{ display: 'none' }}
              multiple
              ref={fileUploadRef as HTMLInputElement}
              type="file"
              onChange={handleFileChange}
              accept={getFileType()}
            />
          </>
        ) : null}
        {/* VOICE RECORDING */}
        {props.uploadsConfig?.isSpeechToTextEnabled ? (
          <RecordAudioButton
            buttonColor={props.sendButtonColor}
            type="button"
            class="m-0 h-8 w-8 flex items-center justify-center"
            isDisabled={props.disabled || isSendButtonDisabled()}
            on:click={props.onMicrophoneClicked}
          >
            <span class="sr-only">Record Audio</span>
          </RecordAudioButton>
        ) : null}
        {/* FLEX ROW: ShortTextInput + SendButton */}
        <div class="input-row-container" style={{ width: '100%', padding: '0 12px', 'box-sizing': 'border-box', display: 'flex', 'flex-direction': 'row', 'align-items': 'center', position: 'relative', height: '40px', 'max-height': '40px' }}>
          <ShortTextInput
            ref={inputRef as HTMLTextAreaElement}
            onInput={handleInput}
            value={props.inputValue}
            fontSize={props.fontSize}
            disabled={props.disabled}
            placeholder={''} // No placeholder text
            style={{
              'font-family': 'Roboto, sans-serif',
              'font-weight': '400',
            }}
          />
          <SendButton
            sendButtonColor={props.sendButtonColor}
            type="button"
            isDisabled={props.disabled || isSendButtonDisabled()}
            class="chatbot-send-button"
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '32px',
              height: '32px',
              backgroundColor: '#3b82f6',
              border: 'none',
              borderRadius: '50%',
              cursor: props.disabled || isSendButtonDisabled() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              minWidth: '32px',
              boxShadow: 'none',
            } as JSX.CSSProperties}
            on:click={submit}
          />
        </div>
      </div>
    </div>
  );
};