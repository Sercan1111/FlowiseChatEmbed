import { createSignal } from 'solid-js';

export const [isMobile, setIsMobile] = createSignal<boolean>(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

// Auto-update on window resize
if (typeof window !== 'undefined') {
  const updateMobileStatus = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  window.addEventListener('resize', updateMobileStatus);
  updateMobileStatus(); // Initial call
}
