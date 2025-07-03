import { createSignal } from 'solid-js';

export const TestInputFix = () => {
  const [userInput, setUserInput] = createSignal('');

  // Simplified inline styles without !important
  const containerStyle = {
    width: '100%',
    maxWidth: '420px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    background: '#ffffff',
  };

  const inputStyle = {
    flex: '1 1 0%',
    width: '100%',
    minWidth: '250px',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: '15px',
    padding: '8px 0',
    resize: 'none' as const,
  };
  const buttonStyle = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#3b82f6',
    border: 'none',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  };

  return (
    <div style={containerStyle}>
      <textarea style={inputStyle} placeholder="Type your message..." value={userInput()} onInput={(e) => setUserInput(e.target.value)} rows={1} />
      <button style={buttonStyle}>→</button>
    </div>
  );
};
