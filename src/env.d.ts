export {};

declare module 'solid-js' {
  namespace JSX {
    interface CustomEvents {
      click: MouseEvent;
      pointerdown: PointerEvent;
    }
  }
}

// Image file type declarations
declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}
