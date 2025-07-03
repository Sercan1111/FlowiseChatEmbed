import { Show } from 'solid-js';

const defaultTooltipMessage = 'Hi There 👋!';
const defaultTooltipBackgroundColor = 'black';
const defaultTooltipTextColor = 'white';
const defaultTooltipFontSize = 16;

type TooltipProps = {
  showTooltip: boolean;
  position: { bottom: number; right: number };
  buttonSize: number;
  tooltipMessage?: string;
  tooltipBackgroundColor?: string;
  tooltipTextColor?: string;
  tooltipFontSize?: number;
};

const Tooltip = (props: TooltipProps) => {
  const formattedTooltipMessage = () => {
    const message = props.tooltipMessage ?? defaultTooltipMessage;

    if (message.length > 20) {
      return message
        .split(' ')
        .reduce<string[][]>(
          (acc, curr) => {
            const last = acc[acc.length - 1];
            if (last && last.join(' ').length + curr.length <= 20) {
              last.push(curr);
            } else {
              acc.push([curr]);
            }
            return acc;
          },
          [[]],
        )
        .map((arr) => arr.join(' '))
        .join('\n');
    }

    return message;
  };

  return (
    <Show when={props.showTooltip}>
      <div
        class="tooltip"
        data-testid="emoji-tooltip"
        style={{
          position: 'fixed',
          right: `calc(${props.position.right}px + 20px)`,
          bottom: `${props.position.bottom + props.buttonSize + 10}px`,
          'z-index': '99999999',
          'background-color': props.tooltipBackgroundColor ?? defaultTooltipBackgroundColor,
          color: props.tooltipTextColor ?? defaultTooltipTextColor,
          'font-size': `${props.tooltipFontSize ?? defaultTooltipFontSize}px`,
          // ✅ BASIT EMOJİ FONT DESTEĞİ
          'font-family': '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Twemoji", "Symbola", system-ui, -apple-system, sans-serif',
          padding: '8px 12px',
          'border-radius': '8px',
          'white-space': 'pre-line',
          'max-width': '200px',
          'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.15)',
          'pointer-events': 'none',
          transform: 'translateY(-5px)',
          opacity: '1',
          transition: 'all 0.3s ease',
        }}
      >
        <span
          class="emoji-text"
          style={{
            'font-family':
              '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Android Emoji", "EmojiSymbols", "Twemoji", "JoyPixels", "Symbola" !important',
            'font-variant-emoji': 'unicode',
            'text-rendering': 'optimizeLegibility',
            'unicode-bidi': 'embed',
            display: 'inline-block',
            'line-height': '1.2',
          }}
        >
          {formattedTooltipMessage()}
        </span>
      </div>
    </Show>
  );
};

export default Tooltip;
