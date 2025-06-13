import { createSignal, splitProps } from 'solid-js';
import { JSX } from 'solid-js/jsx-runtime';

type ShortTextInputProps = {
  ref: HTMLInputElement | HTMLTextAreaElement | undefined;
  onInput: (value: string) => void;
  fontSize?: number;
  disabled?: boolean;
} & Omit<JSX.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onInput'>;

// ✅ COMPACT HEIGHT - Much smaller default
const DEFAULT_HEIGHT = 24; // 56px -> 24px (çok daha küçük)

export const ShortTextInput = (props: ShortTextInputProps) => {
  const [local, others] = splitProps(props, ['ref', 'onInput']);
  const [height, setHeight] = createSignal(24); // 56 -> 24

  const handleInput = (e) => {
    if (props.ref) {
      if (e.currentTarget.value === '') {
        // reset height when value is empty
        setHeight(DEFAULT_HEIGHT);
      } else {
        // ✅ LIMIT MAX HEIGHT - Don't let it grow too much
        const newHeight = Math.min(e.currentTarget.scrollHeight - 12, 80); // Max 80px
        setHeight(newHeight);
      }
      e.currentTarget.scrollTo(0, e.currentTarget.scrollHeight);
      local.onInput(e.currentTarget.value);
    }
  };

  const handleKeyDown = (e) => {
    // Handle Shift + Enter new line
    if (e.keyCode == 13 && e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.value += '\n';
      handleInput(e);
    }
  };

  return (
    <textarea
      ref={props.ref}
      class="focus:outline-none bg-transparent flex-1 w-full text-input disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100"
      disabled={props.disabled}
      style={{
        'font-size': props.fontSize ? `${props.fontSize}px` : '15px', // Biraz daha küçük
        'resize': 'none',
        'height': `${props.value !== '' ? height() : DEFAULT_HEIGHT}px`,
        'min-height': '24px', // ✅ MUCH SMALLER - 56px -> 24px
        'max-height': '80px', // ✅ LIMIT MAX - 128px -> 80px  
        'padding': '0', // ✅ NO PADDING - px-4 py-4 kaldırıldı
        'line-height': '1.5',
        'font-family': 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        'font-weight': '400',
        'overflow-y': 'auto',
        'overflow-x': 'hidden'
      }}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      {...others}
    />
  );
};