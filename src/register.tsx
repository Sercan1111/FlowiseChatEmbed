import { customElement } from 'solid-element';
import { defaultBotProps } from './constants';
import { Bubble } from './features/bubble';
import { Full } from './features/full';

// ✅ CSS INJECTION REMOVED - Using Bot.tsx and index.css instead
// Conflicts resolved by centralizing CSS injection

export const registerWebComponents = () => {
  if (typeof window === 'undefined') return;
  
  console.log('🔧 Registering web components with instant fixes...');
  
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - type mismatch with web components is expected
  customElement('flowise-fullchatbot', defaultBotProps, Full);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - type mismatch with web components is expected
  customElement('flowise-chatbot', defaultBotProps, Bubble);
  
  console.log('✅ Web components registered with styling fixes');
};
