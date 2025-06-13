import { LeadsConfig, MessageType } from '@/components/Bot';
interface FormData {
    name: string;
    email: string;
    phone: string;
    message: string;
}
type Props = {
    message: MessageType;
    chatflowid: string;
    chatId: string;
    leadsConfig?: LeadsConfig;
    apiHost?: string;
    showAvatar?: boolean;
    avatarSrc?: string;
    backgroundColor?: string;
    textColor?: string;
    sendButtonColor?: string;
    fontSize?: number;
    isLeadSaved: boolean;
    setIsLeadSaved: (value: boolean) => void;
    setLeadEmail: (value: string) => void;
    onDismiss?: () => void;
    fieldErrors?: Record<string, string>;
    fieldTouched?: Record<string, boolean>;
    onFieldValidation?: (fieldName: string, value: string) => boolean;
    onFieldBlur?: (fieldName: string, value: string) => void;
    onFormSubmit?: (formData: FormData) => void;
    title?: string;
};
export declare const LeadCaptureBubble: (props: Props) => import("solid-js").JSX.Element;
export {};
