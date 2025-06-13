import { BotProps } from './components/Bot';
type BaseProps = {
    chatflowid: string;
    apiHost?: string;
    [key: string]: any;
};
export type BubbleProps = BaseProps & BotProps;
export {};
