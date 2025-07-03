import { splitProps } from 'solid-js';
import { JSX } from 'solid-js/jsx-runtime';

type ShortTextInputProps = {
  ref: HTMLTextAreaElement | undefined;
  onInput: (value: string) => void;
  fontSize?: number;
  disabled?: boolean;
} & Omit<JSX.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onInput'>;

export const ShortTextInput = (props: ShortTextInputProps) => {
  const [local, others] = splitProps(props, ['ref', 'onInput']);

  const handleInput = (e) => {
    if (props.ref) {
      e.currentTarget.style.height = 'auto';
      e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
      local.onInput(e.currentTarget.value);
    }
  };
  return (
    <textarea
      ref={props.ref}
      class="text-input"
      disabled={props.disabled}
      style={{
        width: '100%',
        height: '36px',
        padding: '8px 45px 8px 12px',
        'border-radius': '18px',
        border: '1px solid #e2e8f0',
        resize: 'none',
        outline: 'none',
        'min-height': '36px',
        'max-height': '36px',
        'line-height': '1.2',
        'font-size': '16px',
        background: '#fff',
        'box-sizing': 'border-box',
        'font-family': 'Roboto, sans-serif',
        'font-weight': '400',
      }}
      onInput={handleInput}
      {...others}
    />
  );
};
