type Props = {
  prompt: string;
  onPromptClick?: () => void;
  starterPromptFontSize?: number;
};
export const FollowUpPromptBubble = (props: Props) => (
  <>
    <span
      data-modal-target="defaultModal"
      data-modal-toggle="defaultModal"
      class="whitespace-normal animate-fade-in"
      data-testid="host-bubble"
      onClick={() => props.onPromptClick?.()}
      style={{
        display: 'inline-block',
        'font-family': 'inherit',
        'font-size': props.starterPromptFontSize ? `${props.starterPromptFontSize}px` : '12px',
        'font-weight': '500',
        'line-height': '1.3',
        'letter-spacing': '0.01071em',
        'background-color': '#ffffff !important',
        color: '#2196f3 !important',
        border: '1px solid #2196f3 !important',
        'border-radius': '16px',
        'box-shadow': '0px 2px 1px -1px rgba(0,0,0,0.2)',
        padding: '4px 8px',
        margin: '2px',
        'min-height': '24px',
        cursor: 'pointer',
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
        'user-select': 'none',
        'text-decoration': 'none',
        'box-sizing': 'border-box',
        'white-space': 'normal',
        'word-wrap': 'break-word',
        'overflow-wrap': 'break-word',
        'flex-shrink': '0',
      }}
      onMouseOver={(e) => {
        (e.target as HTMLElement).style.backgroundColor = 'rgba(33, 150, 243, 0.05)';
      }}
      onMouseOut={(e) => {
        (e.target as HTMLElement).style.backgroundColor = '#ffffff';
      }}
    >
      {props.prompt}
    </span>
  </>
);
