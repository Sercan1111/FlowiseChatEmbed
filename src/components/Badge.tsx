import { FooterTheme } from '@/features/bubble/types';
import { Show, onCleanup, onMount } from 'solid-js';

type Props = {
  footer?: FooterTheme;
  botContainer: HTMLDivElement | undefined;
  poweredByTextColor?: string;
  badgeBackgroundColor?: string;
};

const defaultTextColor = '#000000';

export const Badge = (props: Props) => {
  let liteBadge: HTMLAnchorElement | undefined;
  let observer: MutationObserver | undefined;

  const appendBadgeIfNecessary = (mutations: MutationRecord[]) => {
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((removedNode) => {
        if ('id' in removedNode && liteBadge && removedNode.id == 'lite-badge') {
          console.log("Sorry, you can't remove the brand 😅");
          props.botContainer?.append(liteBadge);
        }
      });
    });
  };

  onMount(() => {
    if (!document || !props.botContainer) return;
    observer = new MutationObserver(appendBadgeIfNecessary);
    observer.observe(props.botContainer, {
      subtree: false,
      childList: true,
    });
  });

  onCleanup(() => {
    if (observer) observer.disconnect();
  });

  return (
    <>
      <Show when={props.footer?.showFooter === undefined || props.footer?.showFooter === null || props.footer?.showFooter === true}>
        <span
          class="w-full px-[10px] pt-[6px] pb-[10px] m-auto"
          style={{
            color: '#000000',
            'background-color': '#e0e7ff !important',
            'background': '#e0e7ff !important',
            'background-image': 'none !important',
            'backdrop-filter': 'none !important',
            'box-shadow': 'none !important',
            'border': 'none !important',
            'border-bottom-left-radius': '12px',
            'border-bottom-right-radius': '12px',
            'text-align': 'center',
            'display': 'flex',
            'justify-content': 'center',
            'align-items': 'center',
            'font-weight': '400',
            'font-family': 'Roboto, sans-serif',
            'margin-top': '15px',
            'font-size': '13px',
            'z-index': 10,
            'letter-spacing': 'normal',
            'word-spacing': 'normal',
            'line-height': '1.4',
          }}
        >
          Powered by&nbsp;
          <a
            ref={liteBadge}
            href={props.footer?.companyLink ?? 'https://flowiseai.com'}
            target="_blank"
            rel="noopener noreferrer"
            class="lite-badge"
            id="lite-badge"
            style={{
              'font-weight': '400',
              'font-family': 'Roboto, sans-serif',
              color: props.footer?.textColor ?? props.poweredByTextColor ?? '#6b46c1',
              'background-color': 'transparent !important',
              'background': 'transparent !important',
              'background-image': 'none !important',
              'letter-spacing': 'normal',
              'word-spacing': 'normal',
              'margin-left': '4px'
            }}
          >
            <strong>{props.footer?.company ?? 'Flowise'}</strong>
          </a>
        </span>
      </Show>
      <Show when={props.footer?.showFooter === false}>
        <span
          class="w-full px-[10px] pt-[6px] pb-[10px] m-auto text-[13px]"
          style={{
            color: props.footer?.textColor ?? props.poweredByTextColor ?? '#6b46c1',
            'background-color': '#e0e7ff !important',
            'background': '#e0e7ff !important',
            'background-image': 'none !important',
            'backdrop-filter': 'none !important',
            'box-shadow': 'none !important',
            'border': 'none !important',
            'border-bottom-left-radius': '12px',
            'border-bottom-right-radius': '12px',
            'text-align': 'center',
            'display': 'flex',
            'justify-content': 'center',
            'align-items': 'center'
          }}
        >
          {/* Empty footer when showFooter is false */}
        </span>
      </Show>
    </>
  );
};
