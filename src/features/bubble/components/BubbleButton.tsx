import { createSignal, createEffect, Show } from 'solid-js';
import { isNotDefined, getBubbleButtonSize } from '@/utils/index';
import { ButtonTheme } from '../types';

// ✅ CLEAN PROFESSIONAL BUBBLE BUTTON - Transparent background with blue icon
console.log('🔘 BubbleButton: Clean transparent design loaded');

type Props = ButtonTheme & {
  isBotOpened: boolean;
  toggleBot: () => void;
  setButtonPosition: (position: { bottom: number; right: number }) => void;
  dragAndDrop: boolean;
  autoOpen?: boolean;
  openDelay?: number;
  autoOpenOnMobile?: boolean;
};

// Default renkleri değiştir:
const defaultButtonColor = 'transparent'; // Arka plan transparent
const defaultIconColor = '#3b82f6'; // Icon mavi (send button ile aynı)
const defaultBottom = 20;
const defaultRight = 20;

export const BubbleButton = (props: Props) => {
  const buttonSize = getBubbleButtonSize(props.size);

  const [position, setPosition] = createSignal({
    bottom: props.bottom ?? defaultBottom,
    right: props.right ?? defaultRight,
  });

  const [userInteracted, setUserInteracted] = createSignal(false);

  let dragStartX: number;
  let initialRight: number;

  const onMouseDown = (e: MouseEvent) => {
    if (props.dragAndDrop) {
      dragStartX = e.clientX;
      initialRight = position().right;

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }
  };

  const onMouseMove = (e: MouseEvent) => {
    const deltaX = dragStartX - e.clientX;
    const newRight = initialRight + deltaX;

    const screenWidth = window.innerWidth;
    const maxRight = screenWidth - buttonSize;

    const newPosition = {
      right: Math.min(Math.max(newRight, defaultRight), maxRight),
      bottom: position().bottom,
    };

    setPosition(newPosition);
    props.setButtonPosition(newPosition);
  };

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  const handleButtonClick = () => {
    props.toggleBot();
    setUserInteracted(true);
  };

  createEffect(() => {
    if (props.autoOpen && (props.autoOpenOnMobile || window.innerWidth > 640)) {
      const delayInSeconds = props.openDelay ?? 2;
      const delayInMilliseconds = delayInSeconds * 1000;
      setTimeout(() => {
        if (!props.isBotOpened && !userInteracted()) {
          props.toggleBot();
        }
      }, delayInMilliseconds);
    }
  });

  return (
    <Show when={true} keyed>
      <button
        part="button"
        onClick={handleButtonClick}
        onMouseDown={onMouseDown}
        class={`fixed shadow-md rounded-full hover:scale-110 active:scale-95 transition-transform duration-200 flex justify-center items-center animate-fade-in`}
        style={{
          'background-color': 'transparent', // Tamamen transparent
          border: 'none', // Border'ı kaldır
          'backdrop-filter': 'none', // Blur efektini kaldır
          'box-shadow': 'none', // Gölgeyi kaldır
          'z-index': '42424242',
          position: 'fixed',
          right: `${position().right}px`,
          bottom: `${position().bottom}px`,
          width: `${buttonSize}px`,
          height: `${buttonSize}px`,
          cursor: props.dragAndDrop ? 'grab' : 'pointer',
          transform: 'translate3d(0, 0, 0)', // GPU acceleration için
        }}
      >
        <Show when={isNotDefined(props.customIconSrc)} keyed>
          <svg
            viewBox="0 0 24 24"
            style={{
              fill: '#3b82f6', // İkonun içi mavi
              stroke: '#3b82f6', // Çizgiler de mavi
            }}
            class={`stroke-2 absolute duration-200 transition ` + (props.isBotOpened ? 'scale-0 opacity-0' : 'scale-100 opacity-100')}
            width={buttonSize * 0.6}
            height={buttonSize * 0.6}
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </Show>

        <Show when={props.customIconSrc}>
          <img
            src={props.customIconSrc}
            class={
              'rounded-full object-cover absolute duration-200 transition ' + (props.isBotOpened ? 'scale-0 opacity-0' : 'scale-100 opacity-100')
            }
            style={{
              width: `${buttonSize * 0.6}px`,
              height: `${buttonSize * 0.6}px`,
            }}
            alt="Bubble button icon"
          />
        </Show>
      </button>
    </Show>
  );
};
