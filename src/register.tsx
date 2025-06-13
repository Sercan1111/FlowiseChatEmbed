import { customElement } from 'solid-element';
import { defaultBotProps } from './constants';
import { Bubble } from './features/bubble';
import { Full } from './features/full';

export const registerWebComponents = () => {
  if (typeof window === 'undefined') return;
  // @ts-ignore - type mismatch with web components is expected
  customElement('flowise-fullchatbot', defaultBotProps, Full);
  // @ts-ignore - type mismatch with web components is expected
  customElement('flowise-chatbot', defaultBotProps, Bubble);
};
