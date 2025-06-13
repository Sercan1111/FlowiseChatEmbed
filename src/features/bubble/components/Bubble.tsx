import { createSignal, Show, splitProps, onCleanup, createEffect } from 'solid-js';
import styles from '../../../assets/index.css';
import { BubbleButton } from './BubbleButton';
import { BubbleParams } from '../types';
import { Bot, BotProps } from '../../../components/Bot';
import Tooltip from './Tooltip';
import { getBubbleButtonSize } from '@/utils';

const defaultButtonColor = '#3B81F6';
const defaultIconColor = 'white';

export type BubbleProps = BotProps & BubbleParams;

export const Bubble = (props: BubbleProps) => {
  const [bubbleProps] = splitProps(props, ['theme']);

  // Get chat window dimensions from theme or use defaults
  const chatWindowWidth = bubbleProps.theme?.chatWindow?.width || 350;
  const chatWindowHeight = bubbleProps.theme?.chatWindow?.height || 500;

  // ✅ CSS injection'ı buraya ekleyin (Bubble component'inin başında)
  createEffect(() => {
    if (typeof document !== 'undefined') {
      const existingStyle = document.getElementById('bubble-custom-styles');
      if (existingStyle) {
        existingStyle.remove();
      }

      const style = document.createElement('style');
      style.setAttribute('id', 'bubble-custom-styles');
      style.textContent = `
        /* BUBBLE LEVEL CSS - Highest priority */
        .chatbot-container textarea {
          min-height: 20px !important;
          max-height: 60px !important;
          padding: 6px 0 !important;
          font-size: 15px !important;
        }
        
        .input-container {
          min-height: 36px !important;
          padding: 6px 10px !important;
        }
        
        /* Force horizontal layout */
        .chatbot-input-container {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          gap: 12px !important;
          min-height: 36px !important;
        }
        
        /* Send button smaller */
        button[title="Send Message"] {
          width: 28px !important;
          height: 28px !important;
        }
        
        button[title="Send Message"] svg {
          width: 12px !important;
          height: 12px !important;
        }

        /* DEBUG - Test renkleri */
        .chatbot-container .input-container {
          border: 3px solid red !important;
          background: yellow !important;
        }
      `;
      document.head.appendChild(style);
      console.log('🎨 Bubble CSS injected with DEBUG colors');
    }
  });

  const [isBotOpened, setIsBotOpened] = createSignal(false);
  const [isBotStarted, setIsBotStarted] = createSignal(false);
  const [buttonPosition, setButtonPosition] = createSignal({
    bottom: bubbleProps.theme?.button?.bottom ?? 20,
    right: bubbleProps.theme?.button?.right ?? 20,
  });

  const openBot = () => {
    if (!isBotStarted()) setIsBotStarted(true);
    setIsBotOpened(true);
  };

  const closeBot = () => {
    setIsBotOpened(false);
  };

  const toggleBot = () => {
    isBotOpened() ? closeBot() : openBot();
  };

  onCleanup(() => {
    setIsBotStarted(false);
  });

  const buttonSize = getBubbleButtonSize(props.theme?.button?.size);
  const buttonBottom = props.theme?.button?.bottom ?? 20;
  const chatWindowBottom = buttonBottom + buttonSize + 10;

  // Add viewport meta tag dynamically
  createEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, interactive-widget=resizes-content';
    document.head.appendChild(meta);

    return () => {
      document.head.removeChild(meta);
    };
  });

  const showTooltip = bubbleProps.theme?.tooltip?.showTooltip ?? false;

  return (
    <div>
      <Show when={props.theme?.customCSS}>
        <style>{props.theme?.customCSS}</style>
      </Show>
      <style>{styles}</style>
      
      <Tooltip
        showTooltip={showTooltip && !isBotOpened()}
        position={buttonPosition()}
        buttonSize={buttonSize}
        tooltipMessage={bubbleProps.theme?.tooltip?.tooltipMessage}
        tooltipBackgroundColor={bubbleProps.theme?.tooltip?.tooltipBackgroundColor}
        tooltipTextColor={bubbleProps.theme?.tooltip?.tooltipTextColor}
        tooltipFontSize={bubbleProps.theme?.tooltip?.tooltipFontSize}
      />
      
      <BubbleButton
        {...bubbleProps.theme?.button}
        toggleBot={toggleBot}
        isBotOpened={isBotOpened()}
        setButtonPosition={setButtonPosition}
        dragAndDrop={bubbleProps.theme?.button?.dragAndDrop ?? false}
        autoOpen={bubbleProps.theme?.button?.autoWindowOpen?.autoOpen ?? false}
        openDelay={bubbleProps.theme?.button?.autoWindowOpen?.openDelay}
        autoOpenOnMobile={bubbleProps.theme?.button?.autoWindowOpen?.autoOpenOnMobile ?? false}
      />
      
      <div
        part="bot"
        style={{
          position: 'fixed',
          bottom: `${chatWindowBottom}px`,
          right: `${buttonPosition().right}px`,
          width: `${chatWindowWidth}px`,
          height: `${chatWindowHeight}px`,
          'max-width': `${chatWindowWidth}px`,
          'max-height': `${chatWindowHeight}px`,
          'min-width': `${chatWindowWidth}px`,
          'min-height': `${chatWindowHeight}px`,
          transition: 'transform 200ms cubic-bezier(0, 1.2, 1, 1), opacity 150ms ease-out',
          'transform-origin': 'bottom right',
          transform: isBotOpened() ? 'scale3d(1, 1, 1)' : 'scale3d(0, 0, 1)',
          'box-shadow': 'rgb(0 0 0 / 16%) 0px 5px 40px',
          'background-color': bubbleProps.theme?.chatWindow?.backgroundColor || '#ffffff',
          'background-image': 'none',
          'background-size': 'cover',
          'background-position': 'center',
          'background-repeat': 'no-repeat',
          'z-index': '42424241', // Button'dan 1 düşük
          'border-radius': '12px',
          overflow: 'hidden',
          display: 'flex',
          'flex-direction': 'column',
        }}
        class={
          `fixed rounded-lg` +
          (isBotOpened() ? ' opacity-1' : ' opacity-0 pointer-events-none')
        }
      >
        <Show when={isBotStarted()}>
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            'flex-direction': 'column',
            position: 'relative',
            'min-height': '0' // ✅ EKLENEN
          }}>
            <Show when={isBotOpened()}>
              <button
                onClick={closeBot}
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '32px',
                  height: '32px',
                  'z-index': '9999',
                  background: 'rgba(0,0,0,0.5)',
                  border: 'none',
                  'border-radius': '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  'align-items': 'center',
                  'justify-content': 'center',
                  transition: 'all 0.2s ease'
                }}
                title="Close Chat"
              >
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path
                    fill={bubbleProps.theme?.button?.iconColor ?? defaultIconColor}
                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
                  />
                </svg>
              </button>
            </Show>
            
            <div style={{ 
              height: '100%', 
              display: 'flex', 
              'flex-direction': 'column',
              'min-height': '0', // ✅ EKLENEN
              flex: '1 1 0%'     // ✅ EKLENEN
            }}>
              <Bot
                backgroundColor={bubbleProps.theme?.chatWindow?.backgroundColor}
                formBackgroundColor={bubbleProps.theme?.form?.backgroundColor}
                formTextColor={bubbleProps.theme?.form?.textColor}
                badgeBackgroundColor={bubbleProps.theme?.chatWindow?.backgroundColor}
                bubbleBackgroundColor={bubbleProps.theme?.button?.backgroundColor ?? defaultButtonColor}
                bubbleTextColor={bubbleProps.theme?.button?.iconColor ?? defaultIconColor}
                showTitle={bubbleProps.theme?.chatWindow?.showTitle}
                showAgentMessages={bubbleProps.theme?.chatWindow?.showAgentMessages}
                title={bubbleProps.theme?.chatWindow?.title}
                titleAvatarSrc={undefined}
                titleTextColor={bubbleProps.theme?.chatWindow?.titleTextColor}
                titleBackgroundColor={bubbleProps.theme?.chatWindow?.titleBackgroundColor}
                welcomeMessage={bubbleProps.theme?.chatWindow?.welcomeMessage}
                errorMessage={bubbleProps.theme?.chatWindow?.errorMessage}
                poweredByTextColor={bubbleProps.theme?.chatWindow?.poweredByTextColor}
                
                // ✅ YENİ: Compact design için textInput props'larını override edin
                textInput={{
                  ...bubbleProps.theme?.chatWindow?.textInput,
                  // Compact design values
                  inputHeight: '36px',
                  buttonSize: '28px', 
                  padding: '6px 10px',
                  containerMinHeight: '36px',
                  textareaMaxHeight: '60px',
                  textareaMinHeight: '20px',
                  fontSize: 15
                }}
                
                botMessage={{
                  ...bubbleProps.theme?.chatWindow?.botMessage,
                  showAvatar: false
                }}
                userMessage={{
                  ...bubbleProps.theme?.chatWindow?.userMessage,
                  showAvatar: false
                }}
                feedback={bubbleProps.theme?.chatWindow?.feedback}
                fontSize={bubbleProps.theme?.chatWindow?.fontSize}
                footer={bubbleProps.theme?.chatWindow?.footer}
                sourceDocsTitle={bubbleProps.theme?.chatWindow?.sourceDocsTitle}
                theme={{
                  chatWindow: {
                    width: chatWindowWidth,
                    height: chatWindowHeight
                  }
                }}
                starterPrompts={bubbleProps.theme?.chatWindow?.starterPrompts}
                starterPromptFontSize={bubbleProps.theme?.chatWindow?.starterPromptFontSize}
                chatflowid={props.chatflowid}
                chatflowConfig={props.chatflowConfig}
                apiHost={props.apiHost}
                onRequest={props.onRequest}
                observersConfig={props.observersConfig}
                clearChatOnReload={bubbleProps.theme?.chatWindow?.clearChatOnReload}
                disclaimer={bubbleProps.theme?.disclaimer}
                dateTimeToggle={bubbleProps.theme?.chatWindow?.dateTimeToggle}
                renderHTML={props.theme?.chatWindow?.renderHTML}
                closeBot={closeBot}
              />
            </div>
          </div>
        </Show>
      </div>
    </div>
  );
};
