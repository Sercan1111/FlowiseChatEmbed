import { isMobile } from '@/utils/isMobileSignal';
import { createEffect, createSignal, Show } from 'solid-js';
import { isNotEmpty } from '@/utils/index';
import { DefaultAvatar } from './DefaultAvatar';

export const Avatar = (props: { initialAvatarSrc?: string }) => {
  const [avatarSrc, setAvatarSrc] = createSignal(props.initialAvatarSrc);

  createEffect(() => {
    if (avatarSrc()?.startsWith('{{') && props.initialAvatarSrc?.startsWith('http')) setAvatarSrc(props.initialAvatarSrc);
  });

  return (
    <Show when={isNotEmpty(avatarSrc())} keyed fallback={<DefaultAvatar />}>
      <figure
        // ✅ DEFAULT RESPONSIVE CLASSES - Back to original
        class={
          'flex justify-center items-center rounded-full text-white relative flex-shrink-0 ' + 
          (isMobile() ? 'w-6 h-6 text-sm' : 'w-10 h-10 text-xl')
        }
        data-testid="custom-avatar"
      >
        <img 
          src={avatarSrc()} 
          alt="Bot avatar" 
          // ✅ DEFAULT CLASSES - Clean and simple
          class="rounded-full object-cover w-full h-full"
          onError={() => {
            setAvatarSrc(undefined);
          }}
        />
      </figure>
    </Show>
  );
};