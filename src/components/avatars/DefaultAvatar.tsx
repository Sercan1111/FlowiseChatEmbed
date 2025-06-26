import { isMobile } from '@/utils/isMobileSignal';
import robotAvatar from './robot.png';

export const DefaultAvatar = () => {  return (
    <figure
      // ✅ DEFAULT RESPONSIVE CLASSES - Back to original
      class={
        'flex justify-center items-center rounded-full text-white relative flex-shrink-0 ' + 
        (isMobile() ? 'w-6 h-6 text-sm' : 'w-10 h-10 text-xl')
      }
      data-testid="default-avatar"      style={{
        // ✅ FIXED SIZE - No margin overrides
        'width': isMobile() ? '24px' : '40px',
        'height': isMobile() ? '24px' : '40px',
        'flex-shrink': '0',
        'box-sizing': 'border-box'
      }}
    >{/* ✅ KEEP YOUR ROBOT IMAGE - Custom robot preserved */}
      <div
        style={{
          'width': '100%',
          'height': '100%',
          'border-radius': '50%',
          'background': '#f8f9fa',
          'display': 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          'overflow': 'hidden'
        }}      >
        {/* ✅ OPTION 1: Use your robot image */}
        <img
          src={robotAvatar} // Your robot image from import
          alt="Assistant Avatar"
          style={{
            'width': '70%',
            'height': '70%',
            'border-radius': '50%',
            'object-fit': 'cover'
          }}
          onError={(e) => {
            // ✅ FALLBACK: Default SVG if robot image fails
            const target = e.currentTarget;
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `
                <svg
                  width="75"
                  height="75"
                  viewBox="0 0 75 75"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style="width: 100%; height: 100%;"
                >
                  <mask id="mask0" x="0" y="0" mask-type="alpha">
                    <circle cx="37.5" cy="37.5" r="37.5" fill="#0042DA" />
                  </mask>
                  <g mask="url(#mask0)">
                    <rect x="-30" y="-43" width="131" height="154" fill="#0042DA" />
                    <rect
                      x="2.50413"
                      y="120.333"
                      width="81.5597"
                      height="86.4577"
                      rx="2.5"
                      transform="rotate(-52.6423 2.50413 120.333)"
                      stroke="#FED23D"
                      stroke-width="5"
                    />
                    <circle cx="76.5" cy="-1.5" r="29" stroke="#FF8E20" stroke-width="5" />
                    <path d="M-49.8224 22L-15.5 -40.7879L18.8224 22H-49.8224Z" stroke="#F7F8FF" stroke-width="5" />
                  </g>
                </svg>
              `;
            }
          }}
        />
      </div>
    </figure>
  );
};