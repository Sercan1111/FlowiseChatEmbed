import { createSignal, Show, splitProps, onCleanup, createEffect, onMount } from 'solid-js';
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
  const chatWindowHeight = bubbleProps.theme?.chatWindow?.height || 550;

  onMount(() => {
    console.log('🎯 Bubble mounted - CSS handled by Bot.tsx');
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
  const chatWindowBottom = buttonBottom + buttonSize + 15;

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

          // ✅ FORCE WHITE BACKGROUND - Multiple fallbacks
          background: '#ffffff !important',
          'background-color': '#ffffff !important',
          'background-image': 'none !important',
          'background-size': 'cover',
          'background-position': 'center',
          'background-repeat': 'no-repeat',

          'z-index': '42424241',
          'border-radius': '12px',
          overflow: 'hidden',
          display: 'flex',
          'flex-direction': 'column',
        }}
        class={`fixed rounded-lg` + (isBotOpened() ? ' opacity-1' : ' opacity-0 pointer-events-none')}
      >
        <Show when={isBotStarted()}>
          <div
            style={{
              height: '100%',
              display: 'flex',
              'flex-direction': 'column',
              position: 'relative',
              'min-height': '0',
              background: '#ffffff !important',
              'background-color': '#ffffff !important',
            }}
          >
            <div
              style={{
                height: '100%',
                display: 'flex',
                'flex-direction': 'column',
                'min-height': '0',
                flex: '1 1 0%',
                background: '#ffffff !important',
                'background-color': '#ffffff !important',
              }}
            >
              <Bot
                backgroundColor="#ffffff"
                formBackgroundColor={bubbleProps.theme?.form?.backgroundColor}
                formTextColor={bubbleProps.theme?.form?.textColor}
                badgeBackgroundColor={bubbleProps.theme?.chatWindow?.backgroundColor}
                bubbleBackgroundColor={bubbleProps.theme?.button?.backgroundColor ?? defaultButtonColor}
                bubbleTextColor={bubbleProps.theme?.button?.iconColor ?? defaultIconColor}
                showTitle={bubbleProps.theme?.chatWindow?.showTitle}
                showAgentMessages={bubbleProps.theme?.chatWindow?.showAgentMessages}
                title={bubbleProps.theme?.chatWindow?.title}
                titleAvatarSrc={bubbleProps.theme?.chatWindow?.titleAvatarSrc}
                titleTextColor={bubbleProps.theme?.chatWindow?.titleTextColor}
                titleBackgroundColor={bubbleProps.theme?.chatWindow?.titleBackgroundColor}
                welcomeMessage={bubbleProps.theme?.chatWindow?.welcomeMessage}
                errorMessage={bubbleProps.theme?.chatWindow?.errorMessage}
                poweredByTextColor={bubbleProps.theme?.chatWindow?.poweredByTextColor}
                // ✅ FIX: textInput props - kullanıcı ayarlarını override etme!
                textInput={bubbleProps.theme?.chatWindow?.textInput}
                // ✅ FIX: botMessage props - avatarSrc ve showAvatar düzgün geçir
                botMessage={{
                  ...bubbleProps.theme?.chatWindow?.botMessage,
                  showAvatar: bubbleProps.theme?.chatWindow?.botMessage?.showAvatar ?? true,
                  avatarSrc: bubbleProps.theme?.chatWindow?.botMessage?.avatarSrc,
                }}
                // ✅ FIX: userMessage props - kullanıcı ayarlarını koru
                userMessage={{
                  ...bubbleProps.theme?.chatWindow?.userMessage,
                  showAvatar: bubbleProps.theme?.chatWindow?.userMessage?.showAvatar ?? false,
                }}
                feedback={bubbleProps.theme?.chatWindow?.feedback}
                fontSize={bubbleProps.theme?.chatWindow?.fontSize}
                footer={bubbleProps.theme?.chatWindow?.footer}
                sourceDocsTitle={bubbleProps.theme?.chatWindow?.sourceDocsTitle}
                theme={{
                  chatWindow: {
                    width: chatWindowWidth,
                    height: chatWindowHeight,
                  },
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
