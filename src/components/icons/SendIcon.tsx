import { JSX } from 'solid-js/jsx-runtime';
export const SendIcon = (props: JSX.SvgSVGAttributes<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={props.width || '16px'}
    height={props.height || '16px'}
    fill="white"
    stroke={props.color || 'white'}
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class={props.class || 'send-icon-svg'}
    {...props}
  >
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);
