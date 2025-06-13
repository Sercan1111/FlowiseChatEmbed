import { createSignal, createEffect, For, onMount, Show, mergeProps, on, createMemo } from 'solid-js';
import { v4 as uuidv4 } from 'uuid';

// ✅ WIDGET VERSION TEST - Bu log gözükmezse widget yüklenmiyor
console.log('🚀 WIDGET VERSION TEST:', new Date().toISOString());
console.log('🎯 BOT COMPONENT LOADED - TIMESTAMP:', Date.now());
import {
  sendMessageQuery,
  upsertVectorStoreWithFormData,
  isStreamAvailableQuery,
  IncomingInput,
  getChatbotConfig,
  FeedbackRatingType,
  createAttachmentWithFormData,
  addLeadQuery, 
} from '@/queries/sendMessageQuery';
import { 
  validateLeadForm, 
  validateFieldRealTime, 
  RateLimiter,
  type FormData,
  type ValidationResult 
} from '@/utils/leadValidation';
import { TextInput } from './inputs/textInput';
import { GuestBubble } from './bubbles/GuestBubble';
import { BotBubble } from './bubbles/BotBubble';
import { LoadingBubble } from './bubbles/LoadingBubble';
import { StarterPromptBubble } from './bubbles/StarterPromptBubble';
import {
  BotMessageTheme,
  FooterTheme,
  TextInputTheme,
  UserMessageTheme,
  FeedbackTheme,
  DisclaimerPopUpTheme,
  DateTimeToggleTheme,
} from '@/features/bubble/types';
import { Badge } from './Badge';
import { Popup, DisclaimerPopup } from '@/features/popup';
import { Avatar } from '@/components/avatars/Avatar';
import { DeleteButton, SendButton } from '@/components/buttons/SendButton';
import { FilePreview } from '@/components/inputs/textInput/components/FilePreview';
import { CircleDotIcon, SparklesIcon, TrashIcon } from './icons';
import { CancelButton } from './buttons/CancelButton';
import { cancelAudioRecording, startAudioRecording, stopAudioRecording } from '@/utils/audioRecording';
import { LeadCaptureBubble } from '@/components/bubbles/LeadCaptureBubble';
import { removeLocalStorageChatHistory, getLocalStorageChatflow, setLocalStorageChatflow, setCookie, getCookie } from '@/utils';
import { cloneDeep } from 'lodash';
import { FollowUpPromptBubble } from '@/components/bubbles/FollowUpPromptBubble';
import { fetchEventSource, EventStreamContentType } from '@microsoft/fetch-event-source';

// ✅ DIRECT CSS INJECTION - Force override
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.setAttribute('id', 'bot-custom-styles');
  style.textContent = `
    /* FORCE OVERRIDE - Higher specificity */
    .chatbot-container .chatbot-container textarea {
      min-height: 20px !important;
      max-height: 60px !important;
      padding: 6px 0 !important;
      font-size: 15px !important;
      background: red !important; /* DEBUG - bu görünürse CSS çalışıyor */
    }
    
    .chatbot-container .input-container {
      min-height: 36px !important;
      padding: 6px 10px !important;
      border: 3px solid lime !important; /* DEBUG */
    }
  `;
  document.head.appendChild(style);
  console.log('🎨 Custom CSS injected with DEBUG colors');
}

export type FileEvent<T = EventTarget> = {
  target: T;
};

export type FormEvent<T = EventTarget> = {
  preventDefault: () => void;
  currentTarget: T;
};

type IUploadConstraits = {
  fileTypes: string[];
  maxUploadSize: number;
};

export type UploadsConfig = {
  imgUploadSizeAndTypes: IUploadConstraits[];
  fileUploadSizeAndTypes: IUploadConstraits[];
  isImageUploadAllowed: boolean;
  isSpeechToTextEnabled: boolean;
  isRAGFileUploadAllowed: boolean;
};

type FilePreviewData = string | ArrayBuffer;

type FilePreview = {
  data: FilePreviewData;
  mime: string;
  name: string;
  preview: string;
  type: string;
};

type messageType = 'apiMessage' | 'userMessage' | 'usermessagewaiting' | 'leadCaptureMessage';
type ExecutionState = 'INPROGRESS' | 'FINISHED' | 'ERROR' | 'TERMINATED' | 'TIMEOUT' | 'STOPPED';

export type IAgentReasoning = {
  agentName?: string;
  messages?: string[];
  usedTools?: any[];
  artifacts?: FileUpload[];
  sourceDocuments?: any[];
  instructions?: string;
  nextAgent?: string;
};

export type IAction = {
  id?: string;
  data?: any;
  elements?: Array<{
    type: string;
    label: string;
  }>;
  mapping?: {
    approve: string;
    reject: string;
    toolCalls: any[];
  };
};

export type FileUpload = Omit<FilePreview, 'preview'>;

export type AgentFlowExecutedData = {
  nodeLabel: string;
  nodeId: string;
  data: any;
  previousNodeIds: string[];
  status?: ExecutionState;
};

export type MessageType = {
  messageId?: string;
  message: string;
  type: messageType;
  sourceDocuments?: any;
  fileAnnotations?: any;
  fileUploads?: Partial<FileUpload>[];
  artifacts?: Partial<FileUpload>[];
  agentReasoning?: IAgentReasoning[];
  execution?: any;
  agentFlowEventStatus?: string;
  agentFlowExecutedData?: any;
  usedTools?: any[];
  action?: IAction | null;
  rating?: FeedbackRatingType;
  id?: string;
  followUpPrompts?: string;
  dateTime?: string;
};

type IUploads = {
  data: FilePreviewData;
  type: string;
  name: string;
  mime: string;
}[];

type observerConfigType = (accessor: string | boolean | object | MessageType[]) => void;
export type observersConfigType = Record<'observeUserInput' | 'observeLoading' | 'observeMessages', observerConfigType>;

export type BotProps = {
  chatflowid: string;
  apiHost?: string;
  onRequest?: (request: RequestInit) => Promise<void>;
  chatflowConfig?: Record<string, unknown>;
  backgroundColor?: string;
  welcomeMessage?: string;
  errorMessage?: string;
  botMessage?: BotMessageTheme;
  userMessage?: UserMessageTheme;
  textInput?: TextInputTheme;
  feedback?: FeedbackTheme;
  poweredByTextColor?: string;
  badgeBackgroundColor?: string;
  bubbleBackgroundColor?: string;
  bubbleTextColor?: string;
  showTitle?: boolean;
  showAgentMessages?: boolean;
  title?: string;
  titleAvatarSrc?: string;
  titleTextColor?: string;
  titleBackgroundColor?: string;
  formBackgroundColor?: string;
  formTextColor?: string;
  fontSize?: number;
  isFullPage?: boolean;
  footer?: FooterTheme;
  sourceDocsTitle?: string;
  observersConfig?: observersConfigType;
  starterPrompts?: string[] | Record<string, { prompt: string }>;
  starterPromptFontSize?: number;
  clearChatOnReload?: boolean;
  disclaimer?: DisclaimerPopUpTheme;
  dateTimeToggle?: DateTimeToggleTheme;
  renderHTML?: boolean;
  closeBot?: () => void;
  theme?: {
    chatWindow?: {
      width?: number;
      height?: number;
    };
  };
};

export type LeadsConfig = {
  status: boolean;
  
  // Trigger Settings
  triggerMode?: 'auto' | 'button' | 'inactivity' | 'both';
  buttonText?: string;
  buttonColor?: string;
  buttonPosition?: 'top-left' | 'top-right' | 'top-center';
  inactivityDuration?: number;
  
  // Form Content
  title?: string;
  successMessage?: string;
  
  // Form Fields
  name?: boolean;
  email?: boolean;
  phone?: boolean;
  enableMessage?: boolean;
  
  // Validation Settings
  emailValidationLevel?: 'basic' | 'strict';
  blockDisposableEmail?: boolean;
  minNameLength?: number;
  maxNameLength?: number;
  blockTestNames?: boolean;
  
  // Styling
  formContainerBackground?: string;
  formContainerBorder?: string;
  inputBackgroundColor?: string;
  inputTextColor?: string;
  inputBorderColor?: string;
  saveButtonBackground?: string;
  saveButtonTextColor?: string;
};

const defaultWelcomeMessage = 'Hi there! How can I help?';

const DEFAULT_FORM_TITLE = `Hey 👋 thanks for your interest!
Let us know where we can reach you`;

const DEFAULT_SUCCESS_MESSAGE = `Thank you!
What can I do for you?`;

/*const sourceDocuments = [
    {
        "pageContent": "I know some are talking about "living with COVID-19". Tonight – I say that we will never just accept living with COVID-19. \r\n\r\nWe will continue to combat the virus as we do other diseases. And because this is a virus that mutates and spreads, we will stay on guard. \r\n\r\nHere are four common sense steps as we move forward safely.  \r\n\r\nFirst, stay protected with vaccines and treatments. We know how incredibly effective vaccines are. If you're vaccinated and boosted you have the highest degree of protection. \r\n\r\nWe will never give up on vaccinating more Americans. Now, I know parents with kids under 5 are eager to see a vaccine authorized for their children. \r\n\r\nThe scientists are working hard to get that done and we'll be ready with plenty of vaccines when they do. \r\n\r\nWe're also ready with anti-viral treatments. If you get COVID-19, the Pfizer pill reduces your chances of ending up in the hospital by 90%.",
        "metadata": {
          "source": "blob",
          "blobType": "",
          "loc": {
            "lines": {
              "from": 450,
              "to": 462
            }
          }
        }
    },
    {
        "pageContent": "sistance,  and  polishing  [65].  For  instance,  AI  tools  generate\nsuggestions based on inputting keywords or topics. The tools\nanalyze  search  data,  trending  topics,  and  popular  queries  to\ncreate  fresh  content.  What's  more,  AIGC  assists  in  writing\narticles and posting blogs on specific topics. While these tools\nmay not be able to produce high-quality content by themselves,\nthey can provide a starting point for a writer struggling with\nwriter's block.\nH.  Cons of AIGC\nOne of the main concerns among the public is the potential\nlack  of  creativity  and  human  touch  in  AIGC.  In  addition,\nAIGC sometimes lacks a nuanced understanding of language\nand context, which may lead to inaccuracies and misinterpre-\ntations. There are also concerns about the ethics and legality\nof using AIGC, particularly when it results in issues such as\ncopyright  infringement  and  data  privacy.  In  this  section,  we\nwill discuss some of the disadvantages of AIGC (Table IV).",
        "metadata": {
          "source": "blob",
          "blobType": "",
          "pdf": {
            "version": "1.10.100",
            "info": {
              "PDFFormatVersion": "1.5",
              "IsAcroFormPresent": false,
              "IsXFAPresent": false,
              "Title": "",
              "Author": "",
              "Subject": "",
              "Keywords": "",
              "Creator": "LaTeX with hyperref",
              "Producer": "pdfTeX-1.40.21",
              "CreationDate": "D:20230414003603Z",
              "ModDate": "D:20230414003603Z",
              "Trapped": {
                "name": "False"
              }
            },
            "metadata": null,
            "totalPages": 17
          },
          "loc": {
            "pageNumber": 8,
            "lines": {
              "from": 301,
              "to": 317
            }
          }
        }
    },
    {
        "pageContent": "Main article: Views of Elon Musk",
        "metadata": {
          "source": "https://en.wikipedia.org/wiki/Elon_Musk",
          "loc": {
            "lines": {
              "from": 2409,
              "to": 2409
            }
          }
        }
    },
    {
        "pageContent": "First Name: John\nLast Name: Doe\nAddress: 120 jefferson st.\nStates: Riverside\nCode: NJ\nPostal: 8075",
        "metadata": {
          "source": "blob",
          "blobType": "",
          "line": 1,
          "loc": {
            "lines": {
              "from": 1,
              "to": 6
            }
          }
        }
    },
]*/

const defaultBackgroundColor = '#ffffff';
const defaultTextColor = '#303235';
const defaultTitleBackgroundColor = '#3B81F6';

/* FeedbackDialog component - for collecting user feedback */
const FeedbackDialog = (props: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  feedbackValue: string;
  setFeedbackValue: (value: string) => void;
}) => {
  return (
    <Show when={props.isOpen}>
      <div class="fixed inset-0 rounded-lg flex items-center justify-center backdrop-blur-sm z-50" style={{ background: 'rgba(0, 0, 0, 0.4)' }}>
        <div class="p-6 rounded-lg shadow-lg max-w-md w-full text-center mx-4 font-sans" style={{ background: 'white', color: 'black' }}>
          <h2 class="text-xl font-semibold mb-4 flex justify-center items-center">Your Feedback</h2>

          <textarea
            class="w-full p-2 border border-gray-300 rounded-md mb-4"
            rows={4}
            placeholder="Please provide your feedback..."
            value={props.feedbackValue}
            onInput={(e) => props.setFeedbackValue(e.target.value)}
          />

          <div class="flex justify-center space-x-4">
            <button
              class="font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
              style={{ background: '#ef4444', color: 'white' }}
              onClick={props.onClose}
            >
              Cancel
            </button>
            <button
              class="font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
              style={{ background: '#3b82f6', color: 'white' }}
              onClick={props.onSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
};

interface FormInputViewProps {
  title: string;
  description: string;
  inputParams: Array<{
    label: string;
    name: string;
    type: 'string' | 'number' | 'boolean' | 'options';
    options?: Array<{ name: string; label: string; }>;
  }>;
  onSubmit: (formData: Record<string, any>) => void;
  parentBackgroundColor?: string;
  backgroundColor?: string;
  textColor?: string;
  sendButtonColor?: string;
  fontSize?: number;
}

/* FormInputView component - for displaying the form input */
const FormInputView = (props: FormInputViewProps) => {
  const [formData, setFormData] = createSignal<Record<string, any>>({});

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    props.onSubmit(formData());
  };

  return (
    <div class="flex items-center justify-center h-full w-full">
      <div
        class="w-full max-w-md bg-white shadow-lg rounded-lg overflow-hidden"
        style={{
          'font-family': 'Poppins, sans-serif',
          'font-size': props.fontSize ? `${props.fontSize}px` : '16px',
          background: props.backgroundColor || defaultBackgroundColor,
          color: props.textColor || defaultTextColor,
        }}
      >
        <div class="p-6">
          <h2 class="text-xl font-bold mb-2">{props.title}</h2>
          {props.description && (
            <p class="text-gray-600 mb-6" style={{ color: props.textColor || defaultTextColor }}>
              {props.description}
            </p>
          )}

          <form onSubmit={handleSubmit} class="space-y-4">
            <For each={props.inputParams}>
              {(param) => (
                <div class="space-y-2">
                  <label class="block text-sm font-medium">{param.label}</label>

                  {param.type === 'string' && (
                    <input
                      type="text"
                      class="w-full px-3 py-2 rounded-md focus:outline-none"
                      style={{
                        border: '1px solid #9ca3af',
                        'border-radius': '0.375rem',
                      }}
                      onFocus={(e) => (e.target.style.border = '1px solid #3b82f6')}
                      onBlur={(e) => (e.target.style.border = '1px solid #9ca3af')}
                      name={param.name}
                      onInput={(e) => handleInputChange(param.name, e.target.value)}
                      required
                    />
                  )}

                  {param.type === 'number' && (
                    <input
                      type="number"
                      class="w-full px-3 py-2 rounded-md focus:outline-none"
                      style={{
                        border: '1px solid #9ca3af',
                        'border-radius': '0.375rem',
                      }}
                      onFocus={(e) => (e.target.style.border = '1px solid #3b82f6')}
                      onBlur={(e) => (e.target.style.border = '1px solid #9ca3af')}
                      name={param.name}
                      onInput={(e) => handleInputChange(param.name, parseFloat(e.target.value))}
                      required
                    />
                  )}

                  {param.type === 'boolean' && (
                    <div class="flex items-center">
                      <input
                        type="checkbox"
                        class="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                        style={{
                          border: '1px solid #9ca3af',
                        }}
                        name={param.name}
                        onChange={(e) => handleInputChange(param.name, e.target.checked)}
                      />
                      <span class="ml-2">Yes</span>
                    </div>
                  )}

                  {param.type === 'options' && (
                    <select
                      class="w-full px-3 py-2 rounded-md focus:outline-none"
                      style={{
                        border: '1px solid #9ca3af',
                        'border-radius': '0.375rem',
                      }}
                      onFocus={(e) => (e.target.style.border = '1px solid #3b82f6')}
                      onBlur={(e) => (e.target.style.border = '1px solid #9ca3af')}
                      name={param.name}
                      onChange={(e) => handleInputChange(param.name, e.target.value)}
                      required
                    >
                      <option value="">Select an option</option>
                      <For each={param.options}>{(option) => <option value={option.name}>{option.label}</option>}</For>
                    </select>
                  )}
                </div>
              )}
            </For>

            <div class="pt-4">
              <button
                type="submit"
                class="w-full py-2 px-4 text-white font-semibold rounded-md focus:outline-none transition duration-300 ease-in-out"
                style={{
                  'background-color': props.sendButtonColor || '#3B81F6',
                }}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export const Bot = (botProps: BotProps & { class?: string }) => {
  // set a default value for showTitle if not set and merge with other props
  const props = mergeProps({ showTitle: true }, botProps);
  let chatContainer: HTMLDivElement | undefined;
  let bottomSpacer: HTMLDivElement | undefined;
  let botContainer: HTMLDivElement | undefined;

  // Debug mode signal
  const [debugMode, setDebugMode] = createSignal(false);

  // ✅ Validation states
  const [fieldErrors, setFieldErrors] = createSignal<Record<string, string>>({});
  const [fieldTouched, setFieldTouched] = createSignal({
    name: false,
    email: false,
    phone: false,
    message: false
  });

  // ✅ Rate limiter instance
  const rateLimiter = new RateLimiter(3, 60000, 5000); // 3 attempts, 60s window, 5s interval

  // ✅ Lead form data signals
  const [leadName, setLeadName] = createSignal('');
  const [leadPhone, setLeadPhone] = createSignal('');
  const [leadMessage, setLeadMessage] = createSignal('');

  // ✅ Real-time validation handler
  const handleFieldValidation = (fieldName: string, value: string): boolean => {
    const config = leadsConfig();
    if (!config) return false;

    const error = validateFieldRealTime(fieldName, value, config);
    
    if (error) {
      setFieldErrors(prev => ({ ...prev, [fieldName]: error }));
      return false;
    } else {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
      return true;
    }
  };

  // ✅ Field blur handler
  const handleFieldBlur = (fieldName: string, value: string) => {
    setFieldTouched((prev) => ({
      ...prev,
      [fieldName]: true
    }));
    handleFieldValidation(fieldName, value);
  };

  // ✅ Enhanced lead form submit handler
  const handleLeadFormSubmit = async (formData: FormData) => {
    const config = leadsConfig();
    if (!config) return;

    // Rate limiting check
    const rateLimitCheck = rateLimiter.canAttempt();
    if (!rateLimitCheck.allowed) {
      setFieldErrors((prev) => ({
        ...prev,
        general: rateLimitCheck.message || 'Rate limit exceeded'
      }));
      return;
    }

    // Mark all fields as touched
    setFieldTouched({
      name: true,
      email: true,
      phone: true, 
      message: true
    });

    // Validate entire form
    const validation = validateLeadForm(formData, config);
    
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    // Record attempt
    rateLimiter.recordAttempt();

    // Clear errors
    setFieldErrors({});

    // Set form data to signals
    setLeadName(formData.name);
    setLeadEmail(formData.email);
    setLeadPhone(formData.phone);
    setLeadMessage(formData.message);

    try {
      const body = {
        chatflowid: props.chatflowid,
        chatId: chatId(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message
      };

      console.log('💾 Saving lead with data:', body);

      const result = await addLeadQuery({
        apiHost: props.apiHost,
        body,
        onRequest: props.onRequest
      });

      if (result.data) {
        const data = result.data;
        console.log('✅ Lead saved successfully:', data);
      
        // Update localStorage 
        const currentStorage = getLocalStorageChatflow(props.chatflowid) || {};
        setLocalStorageChatflow(props.chatflowid, data.chatId || chatId(), {
          ...currentStorage,
          lead: { 
            name: formData.name, 
            email: formData.email, 
            phone: formData.phone 
          }
        });

        // State updates
        setIsLeadSaved(true);
        setLeadEmail(formData.email);
        
        // Success message
        setMessages((prevMessages) => {
          const allMessages = [...cloneDeep(prevMessages)];
          const lastMessageIndex = allMessages.length - 1;
          if (allMessages[lastMessageIndex]?.type === 'leadCaptureMessage') {
            allMessages[lastMessageIndex].message = config.successMessage || 'Thank you for submitting your contact information.';
          }
          return allMessages;
        });

        // Clear form and hide
        setFieldErrors({});
        setShowLeadForm(false);
        
      } else if (result.error) {
        console.error('❌ Lead save failed:', result.error);
        setFieldErrors({
          general: result.error.message || 'Failed to save your information. Please try again.'
        });
      }
    } catch (error: any) {
      console.error('❌ Lead save error:', error);
      setFieldErrors({
        general: error.message || 'Failed to save your information. Please try again.'
      });
    }
  };

  const [userInput, setUserInput] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [sourcePopupOpen, setSourcePopupOpen] = createSignal(false);
  const [sourcePopupSrc, setSourcePopupSrc] = createSignal({});
  const [messages, setMessages] = createSignal<MessageType[]>(
    [
      {
        message: props.welcomeMessage ?? defaultWelcomeMessage,
        type: 'apiMessage',
      },
    ],
    { equals: false },
  );

  const [isChatFlowAvailableToStream, setIsChatFlowAvailableToStream] = createSignal(false);
  const [chatId, setChatId] = createSignal('');
  const [isMessageStopping, setIsMessageStopping] = createSignal(false);
  const [starterPrompts, setStarterPrompts] = createSignal<string[]>([], { equals: false });
  const [chatFeedbackStatus, setChatFeedbackStatus] = createSignal<boolean>(false);
  const [fullFileUpload, setFullFileUpload] = createSignal<boolean>(false);
  const [uploadsConfig, setUploadsConfig] = createSignal<UploadsConfig>();
  const [leadsConfig, setLeadsConfig] = createSignal<LeadsConfig>();
  const [isLeadSaved, setIsLeadSaved] = createSignal(false);
  const [leadEmail, setLeadEmail] = createSignal('');
  const [disclaimerPopupOpen, setDisclaimerPopupOpen] = createSignal(false);

  const [openFeedbackDialog, setOpenFeedbackDialog] = createSignal(false);
  const [feedback, setFeedback] = createSignal('');
  const [pendingActionData, setPendingActionData] = createSignal(null);
  const [feedbackType, setFeedbackType] = createSignal('');

  // start input type
  const [startInputType, setStartInputType] = createSignal('');
  const [formTitle, setFormTitle] = createSignal('');
  const [formDescription, setFormDescription] = createSignal('');
  const [formInputsData, setFormInputsData] = createSignal({});
  const [formInputParams, setFormInputParams] = createSignal([]);

  // drag & drop file input
  // TODO: fix this type
  const [previews, setPreviews] = createSignal<FilePreview[]>([]);

  // audio recording
  const [elapsedTime, setElapsedTime] = createSignal('00:00');
  const [isRecording, setIsRecording] = createSignal(false);
  const [recordingNotSupported, setRecordingNotSupported] = createSignal(false);
  const [isLoadingRecording, setIsLoadingRecording] = createSignal(false);

  // follow-up prompts
  const [followUpPromptsStatus, setFollowUpPromptsStatus] = createSignal<boolean>(false);
  const [followUpPrompts, setFollowUpPrompts] = createSignal<string[]>([]);

  // drag & drop
  const [isDragActive, setIsDragActive] = createSignal(false);
  const [uploadedFiles, setUploadedFiles] = createSignal<{ file: File; type: string }[]>([]);
  const [fullFileUploadAllowedTypes, setFullFileUploadAllowedTypes] = createSignal('*');

// lead capture activity tracking
const [lastActivityTime, setLastActivityTime] = createSignal(Date.now());
let currentInactivityTimer: NodeJS.Timeout | null = null;
const [showLeadForm, setShowLeadForm] = createSignal<boolean>(false);
const [leadFormDismissed, setLeadFormDismissed] = createSignal<boolean>(false);

// ✅ Activity tracking function - timer'ı da reset eder
const trackActivity = () => {
  console.log('🎯 Activity tracked at:', new Date().toISOString());
  setLastActivityTime(Date.now());
  
  // ✅ Aktivity olduğunda mevcut timer'ı reset et
  resetInactivityTimer();
  
  // ✅ Yeni timer başlat (sadece gerekli koşullarda)
  const config = leadsConfig();
  if (config?.status && 
      ['inactivity', 'both'].includes(config?.triggerMode || '') &&
      !isLeadSaved() && 
      !leadFormDismissed() &&
      !getLocalStorageChatflow(props.chatflowid)?.lead) {
    startInactivityTimer();
  }
};

  const startInactivityTimer = () => {
  const config = leadsConfig();
  const leadSaved = isLeadSaved();
  const formDismissed = leadFormDismissed();
  const storage = getLocalStorageChatflow(props.chatflowid);
  
  console.log('⏰ startInactivityTimer called');
  console.log('📊 Config:', { 
    status: config?.status, 
    triggerMode: config?.triggerMode,
    inactivityDuration: config?.inactivityDuration 
  });
  console.log('📊 State:', { leadSaved, formDismissed, showLeadForm: showLeadForm() });
  
  if (storage?.lead) {
    console.log('❌ Timer not started - lead already saved');
    return; // ✅ Lead kaydedilmişse inactivity timer başlatma
  }
  
  if (!config?.status || leadSaved || formDismissed) {
    console.log('❌ Timer not started - config/saved/dismissed');
    return;
  }
  
  if (!['inactivity', 'both'].includes(config?.triggerMode || '')) {
    console.log('❌ Timer not started - wrong trigger mode:', config?.triggerMode);
    return;
  }

  // Already checked storage.lead above, so no need to check again
  console.log('📦 Storage data:', storage);

  const inactivityDuration = (config?.inactivityDuration || 30) * 1000;
  console.log('✅ Starting timer for', inactivityDuration, 'ms');
  
  // ✅ CRITICAL FIX: Timer'ı sadece inactivity süresinden sonra tetikle
const timer = setTimeout(() => {
    console.log('🔔 Inactivity timer fired!');
    
    // ✅ Timer tetiklendiğinde son activity'den bu yana geçen süreyi kontrol et
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityTime();
    const requiredInactivityTime = inactivityDuration;
    
    console.log('⏱️ Time since last activity:', timeSinceLastActivity, 'ms');
    console.log('⏱️ Required inactivity time:', requiredInactivityTime, 'ms');
    
    // ✅ Eğer gerçekten inactivity süresi geçtiyse form göster
    if (timeSinceLastActivity >= requiredInactivityTime) {
      console.log('🔔 Current state check:', {
        isLeadSaved: isLeadSaved(),
        leadFormDismissed: leadFormDismissed(),
        showLeadForm: showLeadForm()
      });
      
      if (!isLeadSaved() && !leadFormDismissed() && !showLeadForm()) {
        console.log('✅ Showing lead form due to inactivity');
        showLeadCaptureForm();
      } else {
        console.log('❌ Lead form not shown - conditions not met');
      }
    } else {
      // ✅ Henüz yeterli inactivity geçmemişse kalan süre için timer kur
      const remainingTime = requiredInactivityTime - timeSinceLastActivity;
      console.log('⏰ Not enough inactivity, restarting timer for remaining:', remainingTime, 'ms');
      
      const newTimer = setTimeout(() => {
        if (!isLeadSaved() && !leadFormDismissed() && !showLeadForm()) {
          showLeadCaptureForm();
        }
      }, remainingTime);
      
      currentInactivityTimer = newTimer;
    }
  }, inactivityDuration);
  
  currentInactivityTimer = timer;
  console.log('⏰ Timer set with ID:', timer);
};


  createMemo(() => {
    const customerId = (props.chatflowConfig?.vars as any)?.customerId;
    setChatId(customerId ? `${customerId.toString()}+${uuidv4()}` : uuidv4());
  });

  const resetLeadState = () => {
    console.log('🔄 Resetting lead state...');
    
    // localStorage'ı temizle
    const storage = getLocalStorageChatflow(props.chatflowid);
    if (storage) {
      const newStorage = { ...storage };
      delete newStorage.leadFormDismissed;
      delete newStorage.lead;
      setLocalStorageChatflow(props.chatflowid, chatId(), newStorage);
    }
    
    // State'leri reset et
    setLeadFormDismissed(false);
    setIsLeadSaved(false);
    setShowLeadForm(false);
    
    // Timer'ı yeniden başlat
    if (leadsConfig()?.status && ['inactivity', 'both'].includes(leadsConfig()?.triggerMode || '')) {
      console.log('🔄 Restarting timer after reset');
      resetInactivityTimer();
      startInactivityTimer();
    }
  };

  // ✅ Custom CSS Support - Theme config'den CSS injection
  createEffect(() => {
    if (typeof document !== 'undefined' && props.chatflowConfig?.customCSS) {
      const style = document.createElement('style');
      style.setAttribute('data-custom-css', 'true');
      style.textContent = props.chatflowConfig.customCSS as string;
      document.head.appendChild(style);
      
      // Cleanup on unmount
      return () => {
        const existingStyle = document.querySelector('[data-custom-css="true"]');
        if (existingStyle) {
          document.head.removeChild(existingStyle);
        }
      };
    }
  });

onMount(async () => {
  console.log('🚀 Bot onMount started');
  
  // ✅ SESSION RESET: Her sayfa yenilendiğinde leadFormDismissed false olur
  setLeadFormDismissed(false);
  
  // ✅ CRITICAL: localStorage'taki dismiss state'ini de temizle (Canvas'ta böyle oluyor)
  const currentStorage = getLocalStorageChatflow(props.chatflowid) || {};
  if (currentStorage.leadFormDismissed) {
    console.log('🧹 Clearing localStorage dismiss state on mount');
    const newStorage = { ...currentStorage };
    delete newStorage.leadFormDismissed; // ✅ localStorage'tan dismiss state'ini kaldır
    setLocalStorageChatflow(props.chatflowid, chatId(), newStorage);
  }
  
  // ✅ DEBUG MODE: URL'de debug=true varsa localStorage'ı temizle
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('debug') === 'true') {
      console.log('� DEBUG MODE: Clearing localStorage');
      setDebugMode(true);
      
      // FloWise related localStorage'ı temizle
      Object.keys(localStorage).forEach(key => {
        if (key.includes('Flowera') || key.includes('chatbot')) {
          console.log('🗑️ Removing:', key);
          localStorage.removeItem(key);
        }
      });
    }

    console.log('Props chatflowConfig:', props.chatflowConfig);

    // clearChatOnReload kontrolü
    if (props.clearChatOnReload) {
      clearChat();
      window.addEventListener('beforeunload', clearChat);
    }

    // API'den chatbot configuration'ı çek
    try {
      const configResponse = await getChatbotConfig({
        chatflowid: props.chatflowid,
        apiHost: props.apiHost,
        onRequest: props.onRequest,
      });

      console.log('📡 API Response:', configResponse.data);

      if (configResponse.data) {
        const chatbotConfig = configResponse.data;
        
        if (chatbotConfig.leads) {
          const finalLeadsConfig = {
            // Önce HTML config'i al (fallback)
            ...(props.chatflowConfig?.leads || {}),
            // Sonra API config ile override et (Canvas öncelikli)
            ...chatbotConfig.leads
          };
          
          setLeadsConfig(finalLeadsConfig);
          
          // ✅ SADECE AUTO MODUNDA FORM GÖSTER:
          if (finalLeadsConfig.status && 
              finalLeadsConfig.triggerMode === 'auto' && 
              !getLocalStorageChatflow(props.chatflowid)?.lead) {
            console.log('🔄 AUTO mode: Showing lead form immediately');
            setMessages((prevMessages) => [...prevMessages, { message: '', type: 'leadCaptureMessage' }]);
          }
          
          // ✅ INACTIVITY TIMER BAŞLAT (sadece inactivity/both modunda):
          if (['inactivity', 'both'].includes(finalLeadsConfig.triggerMode || '')) {
            console.log('⏰ Starting inactivity timer for mode:', finalLeadsConfig.triggerMode);
            startInactivityTimer();
          }
          
          // ReachUsButton kontrolü
          if (finalLeadsConfig.status && 
              ['button', 'both'].includes(finalLeadsConfig.triggerMode || '')) {
            console.log('✅ ReachUsButton should be visible!');
            console.log('📝 Button Text:', finalLeadsConfig.buttonText);
            console.log('🎨 Button Color:', finalLeadsConfig.buttonColor);
            console.log('📍 Button Position:', finalLeadsConfig.buttonPosition);
          } else {
            console.log('❌ ReachUsButton hidden. Status:', finalLeadsConfig.status, 'TriggerMode:', finalLeadsConfig.triggerMode);
          }
        } else {
          console.log('❌ No leads config in API response');
          
          // Props'ta leads config varsa onu kullan
          if (props.chatflowConfig?.leads) {
            console.log('✅ Using props leads config as fallback');
            setLeadsConfig(props.chatflowConfig.leads as LeadsConfig);
          }
        }
        
        // Diğer config'ler...
        if (chatbotConfig.uploads) {
          setUploadsConfig(chatbotConfig.uploads);
        }
        
        // Starter prompts
        if (chatbotConfig.starterPrompts) {
          setStarterPrompts(chatbotConfig.starterPrompts);
        }
        
        // Chat feedback
        if (chatbotConfig.chatFeedback) {
          setChatFeedbackStatus(chatbotConfig.chatFeedback.status);
        }
        
        // Follow-up prompts
        if (chatbotConfig.followUpPrompts) {
          setFollowUpPromptsStatus(chatbotConfig.followUpPrompts.status);
        }
        
        // Full file upload
        if (chatbotConfig.fullFileUpload) {
          setFullFileUpload(chatbotConfig.fullFileUpload.status);
        }
        
        // StreamAvailable kontrol...
        const { data } = await isStreamAvailableQuery({
          chatflowid: props.chatflowid,
          apiHost: props.apiHost,
          onRequest: props.onRequest,
        });
        if (data) {
          setIsChatFlowAvailableToStream(data?.isStreaming ?? false);
        }
      } else {
        console.log('❌ No API response data');
        
        // API response yoksa props config'i kullan
        if (props.chatflowConfig?.leads) {
          console.log('✅ Using props leads config (API failed)');
          setLeadsConfig(props.chatflowConfig.leads as LeadsConfig);
        }
      }
    } catch (error) {
      console.error('❌ API Error:', error);
      
      // API error durumunda props config'i kullan
      if (props.chatflowConfig?.leads) {
        console.log('✅ Using props leads config (API error fallback)');
        setLeadsConfig(props.chatflowConfig.leads as LeadsConfig);
      }
    }

    // Storage'dan lead bilgisini kontrol et
    const savedLead = getLocalStorageChatflow(props.chatflowid)?.lead;
    if (savedLead) {
      setIsLeadSaved(true);
      setLeadEmail(savedLead.email);
      console.log('💾 Lead already saved:', savedLead);
    }

    if (props.clearChatOnReload) {
      return () => {
        window.removeEventListener('beforeunload', clearChat);
      };
    }
  });

  /**
   * Add each chat message into localStorage
   */
  const addChatMessage = (allMessage: MessageType[]) => {
    const messages = allMessage.map((item) => {
      if (item.fileUploads) {
        const fileUploads = item?.fileUploads.map((file) => ({
          type: file.type,
          name: file.name,
          mime: file.mime,
        }));
        return { ...item, fileUploads };
      }
      return item;
    });
    setLocalStorageChatflow(props.chatflowid, chatId(), { chatHistory: messages });
  };

  // Define the audioRef
  let audioRef: HTMLAudioElement | undefined;
  // CDN link for default receive sound
  const defaultReceiveSound = 'https://cdn.jsdelivr.net/gh/FlowiseAI/FlowiseChatEmbed@latest/src/assets/receive_message.mp3';
  const playReceiveSound = () => {
    if (props.textInput?.receiveMessageSound) {
      let audioSrc = defaultReceiveSound;
      if (props.textInput?.receiveSoundLocation) {
        audioSrc = props.textInput?.receiveSoundLocation;
      }
      audioRef = new Audio(audioSrc);
      audioRef.play();
    }
  };

  let hasSoundPlayed = false;

  const updateLastMessage = (text: string) => {
    setMessages((prevMessages) => {
      const allMessages = [...cloneDeep(prevMessages)];
      if (allMessages[allMessages.length - 1].type === 'userMessage') return allMessages;
      if (!text) return allMessages;
      allMessages[allMessages.length - 1].message += text;
      allMessages[allMessages.length - 1].rating = undefined;
      allMessages[allMessages.length - 1].dateTime = new Date().toISOString();
      if (!hasSoundPlayed) {
        playReceiveSound();
        hasSoundPlayed = true;
      }
      addChatMessage(allMessages);
      return allMessages;
    });
  };

  const updateErrorMessage = (errorMessage: string) => {
    setMessages((prevMessages) => {
      const allMessages = [...cloneDeep(prevMessages)];
      allMessages.push({ message: props.errorMessage || errorMessage, type: 'apiMessage' });
      addChatMessage(allMessages);
      return allMessages;
    });
  };

  const updateLastMessageSourceDocuments = (sourceDocuments: any) => {
    setMessages((data) => {
      const updated = data.map((item, i) => {
        if (i === data.length - 1) {
          return { ...item, sourceDocuments };
        }
        return item;
      });
      addChatMessage(updated);
      return [...updated];
    });
  };

  const updateLastMessageUsedTools = (usedTools: any[]) => {
    setMessages((prevMessages) => {
      const allMessages = [...cloneDeep(prevMessages)];
      if (allMessages[allMessages.length - 1].type === 'userMessage') return allMessages;
      allMessages[allMessages.length - 1].usedTools = usedTools;
      addChatMessage(allMessages);
      return allMessages;
    });
  };

  const updateLastMessageFileAnnotations = (fileAnnotations: any) => {
    setMessages((prevMessages) => {
      const allMessages = [...cloneDeep(prevMessages)];
      if (allMessages[allMessages.length - 1].type === 'userMessage') return allMessages;
      allMessages[allMessages.length - 1].fileAnnotations = fileAnnotations;
      addChatMessage(allMessages);
      return allMessages;
    });
  };

  const updateLastMessageAgentReasoning = (agentReasoning: string | IAgentReasoning[]) => {
    setMessages((data) => {
      const updated = data.map((item, i) => {
        if (i === data.length - 1) {
          return { ...item, agentReasoning: typeof agentReasoning === 'string' ? JSON.parse(agentReasoning) : agentReasoning };
        }
        return item;
      });
      addChatMessage(updated);
      return [...updated];
    });
  };

  const updateAgentFlowEvent = (event: string) => {
    if (event === 'INPROGRESS') {
      setMessages((prevMessages) => [...prevMessages, { message: '', type: 'apiMessage', agentFlowEventStatus: event }]);
    } else {
      setMessages((prevMessages) => {
        const allMessages = [...cloneDeep(prevMessages)];
        if (allMessages[allMessages.length - 1].type === 'userMessage') return allMessages;
        allMessages[allMessages.length - 1].agentFlowEventStatus = event;
        return allMessages;
      });
    }
  };

  const updateAgentFlowExecutedData = (agentFlowExecutedData: any) => {
    setMessages((prevMessages) => {
      const allMessages = [...cloneDeep(prevMessages)];
      if (allMessages[allMessages.length - 1].type === 'userMessage') return allMessages;
      allMessages[allMessages.length - 1].agentFlowExecutedData = agentFlowExecutedData;
      addChatMessage(allMessages);
      return allMessages;
    });
  };

  const updateLastMessageArtifacts = (artifacts: FileUpload[]) => {
    setMessages((prevMessages) => {
      const allMessages = [...cloneDeep(prevMessages)];
      if (allMessages[allMessages.length - 1].type === 'userMessage') return allMessages;
      allMessages[allMessages.length - 1].artifacts = artifacts;
      addChatMessage(allMessages);
      return allMessages;
    });
  };

  const updateLastMessageAction = (action: IAction) => {
    setMessages((data) => {
      const updated = data.map((item, i) => {
        if (i === data.length - 1) {
          return { ...item, action: typeof action === 'string' ? JSON.parse(action) : action };
        }
        return item;
      });
      addChatMessage(updated);
      return [...updated];
    });
  };

  const clearPreviews = () => {
    // Revoke the data uris to avoid memory leaks
    previews().forEach((file) => URL.revokeObjectURL(file.preview));
    setPreviews([]);
  };

  // Handle errors
  const handleError = (message = 'Oops! There seems to be an error. Please try again.', preventOverride?: boolean) => {
    let errMessage = message;
    if (!preventOverride && props.errorMessage) {
      errMessage = props.errorMessage;
    }
    setMessages((prevMessages) => {
      const messages: MessageType[] = [...prevMessages, { message: errMessage, type: 'apiMessage' }];
      addChatMessage(messages);
      return messages;
    });
    setLoading(false);
    setUserInput('');
    setUploadedFiles([]);
    scrollToBottom();
  };

  const handleDisclaimerAccept = () => {
    setDisclaimerPopupOpen(false); // Close the disclaimer popup
    setCookie('chatbotDisclaimer', 'true', 365); // Disclaimer accepted
  };

  const resetInactivityTimer = () => {
    if (currentInactivityTimer) {
      clearTimeout(currentInactivityTimer);
      currentInactivityTimer = null;
      console.log('🔄 Inactivity timer reset');
    }
  };

  const showLeadCaptureForm = () => {
    // ✅ Form her durumda açılsın
    setShowLeadForm(true);
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      if (lastMessage?.type === 'leadCaptureMessage') return prevMessages;

      const leadCaptureMessage = {
        message: '',
        type: 'leadCaptureMessage' as messageType
      };
      return [...prevMessages, leadCaptureMessage];
    });
  };

const hideLeadCaptureForm = () => {
  setShowLeadForm(false);
  setLeadFormDismissed(true); // ✅ Sadece session için
  setMessages((prevMessages) => {
    return prevMessages.filter((msg) => msg.type !== 'leadCaptureMessage');
  });

  // ✅ Artık localStorage'a dismiss state kaydetme - Canvas'ta da böyle
  console.log('✅ Lead form dismissed for this session only');
};

  const promptClick = (prompt: string) => {
    trackActivity();
    handleSubmit(prompt);
  };

  const followUpPromptClick = (prompt: string) => {
    trackActivity();
    setFollowUpPrompts([]);
    handleSubmit(prompt);
  };

  const updateMetadata = (data: any, input: string) => {
    if (data.chatId) {
      setChatId(data.chatId);
    }

    // set message id that is needed for feedback
    if (data.chatMessageId) {
      setMessages((prevMessages) => {
        const allMessages = [...cloneDeep(prevMessages)];
        if (allMessages[allMessages.length - 1].type === 'apiMessage') {
          allMessages[allMessages.length - 1].messageId = data.chatMessageId;
        }
        addChatMessage(allMessages);
        return allMessages;
      });
    }

    if (input === '' && data.question) {
      // the response contains the question even if it was in an audio format
      // so if input is empty but the response contains the question, update the user message to show the question
      setMessages((prevMessages) => {
        const allMessages = [...cloneDeep(prevMessages)];
        if (allMessages[allMessages.length - 2].type === 'apiMessage') return allMessages;
        allMessages[allMessages.length - 2].message = data.question;
        addChatMessage(allMessages);
        return allMessages;
      });
    }

    if (data.followUpPrompts) {
      setMessages((prevMessages) => {
        const allMessages = [...cloneDeep(prevMessages)];
        if (allMessages[allMessages.length - 1].type === 'userMessage') return allMessages;
        allMessages[allMessages.length - 1].followUpPrompts = data.followUpPrompts;
        addChatMessage(allMessages);
        return allMessages;
      });
      setFollowUpPrompts(JSON.parse(data.followUpPrompts));
    }
  };

  const fetchResponseFromEventStream = async (chatflowid: string, params: any) => {
    const chatId = params.chatId;
    const input = params.question;
    params.streaming = true;
    fetchEventSource(`${props.apiHost}/api/v1/prediction/${chatflowid}`, {
      openWhenHidden: true,
      method: 'POST',
      body: JSON.stringify(params),
      headers: {
        'Content-Type': 'application/json',
      },
      async onopen(response) {
        if (response.ok && response.headers.get('content-type')?.startsWith(EventStreamContentType)) {
          return; // everything's good
        } else if (response.status === 429) {
          const errMessage = (await response.text()) ?? 'Too many requests. Please try again later.';
          handleError(errMessage, true);
          throw new Error(errMessage);
        } else if (response.status === 403) {
          const errMessage = (await response.text()) ?? 'Unauthorized';
          handleError(errMessage);
          throw new Error(errMessage);
        } else if (response.status === 401) {
          const errMessage = (await response.text()) ?? 'Unauthenticated';
          handleError(errMessage);
          throw new Error(errMessage);
        } else {
          throw new Error();
        }
      },
      async onmessage(ev) {
        const payload = JSON.parse(ev.data);
        switch (payload.event) {
          case 'start':
            setMessages((prevMessages) => [...prevMessages, { message: '', type: 'apiMessage' }]);
            break;
          case 'token':
            updateLastMessage(payload.data);
            break;
          case 'sourceDocuments':
            updateLastMessageSourceDocuments(payload.data);
            break;
          case 'usedTools':
            updateLastMessageUsedTools(payload.data);
            break;
          case 'fileAnnotations':
            updateLastMessageFileAnnotations(payload.data);
            break;
          case 'agentReasoning':
            updateLastMessageAgentReasoning(payload.data);
            break;
          case 'agentFlowEvent':
            updateAgentFlowEvent(payload.data);
            break;
          case 'agentFlowExecutedData':
            updateAgentFlowExecutedData(payload.data);
            break;
          case 'action':
            updateLastMessageAction(payload.data);
            break;
          case 'artifacts':
            updateLastMessageArtifacts(payload.data);
            break;
          case 'metadata':
            updateMetadata(payload.data, input);
            break;
          case 'error':
            updateErrorMessage(payload.data);
            break;
          case 'abort':
            abortMessage();
            closeResponse();
            break;
          case 'end':
            setLocalStorageChatflow(chatflowid, chatId);
            closeResponse();
            break;
        }
      },
      async onclose() {
        closeResponse();
      },
      onerror(err) {
        console.error('EventSource Error: ', err);
        closeResponse();
        throw err;
      },
    });
  };

  const closeResponse = () => {
    setLoading(false);
    setUserInput('');
    setUploadedFiles([]);
    hasSoundPlayed = false;
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };

  const abortMessage = () => {
    setIsMessageStopping(false);
    setMessages((prevMessages) => {
      const allMessages = [...cloneDeep(prevMessages)];
      if (allMessages[allMessages.length - 1].type === 'userMessage') return allMessages;
      const lastAgentReasoning = allMessages[allMessages.length - 1].agentReasoning;
      if (lastAgentReasoning && lastAgentReasoning.length > 0) {
        allMessages[allMessages.length - 1].agentReasoning = lastAgentReasoning.filter((reasoning) => !reasoning.nextAgent);
      }
      return allMessages;
    });
  };

  const handleFileUploads = async (uploads: IUploads) => {
    if (!uploadedFiles().length) return uploads;

    if (fullFileUpload()) {
      const filesWithFullUploadType = uploadedFiles().filter((file) => file.type === 'file:full');

      if (filesWithFullUploadType.length > 0) {
        const formData = new FormData();
        for (const file of filesWithFullUploadType) {
          formData.append('files', file.file);
        }
        formData.append('chatId', chatId());

        const response = await createAttachmentWithFormData({
          chatflowid: props.chatflowid,
          apiHost: props.apiHost,
          formData: formData,
        });

        if (!response.data) {
          throw new Error('Unable to upload documents');
        } else {
          const data = response.data as any;
          for (const extractedFileData of data) {
            const content = extractedFileData.content;
            const fileName = extractedFileData.name;

            // find matching name in previews and replace data with content
            const uploadIndex = uploads.findIndex((upload) => upload.name === fileName);
            if (uploadIndex !== -1) {
              uploads[uploadIndex] = {
                ...uploads[uploadIndex],
                data: content,
                name: fileName,
                type: 'file:full',
              };
            }
          }
        }
      }
    } else if (uploadsConfig()?.isRAGFileUploadAllowed) {
      const filesWithRAGUploadType = uploadedFiles().filter((file) => file.type === 'file:rag');

      if (filesWithRAGUploadType.length > 0) {
        const formData = new FormData();
        for (const file of filesWithRAGUploadType) {
          formData.append('files', file.file);
        }
        formData.append('chatId', chatId());

        const response = await upsertVectorStoreWithFormData({
          chatflowid: props.chatflowid,
          apiHost: props.apiHost,
          formData: formData,
        });

        if (!response.data) {
          throw new Error('Unable to upload documents');
        } else {
          // delay for vector store to be updated
          const delay = (delayInms: number) => {
            return new Promise((resolve) => setTimeout(resolve, delayInms));
          };
          await delay(2500); //TODO: check if embeddings can be retrieved using file name as metadata filter

          uploads = uploads.map((upload) => {
            return {
              ...upload,
              type: 'file:rag',
            };
          });
        }
      }
    }
    return uploads;
  };

  // Handle form submission
const handleSubmit = async (value: string | object, action?: IAction | undefined | null, humanInput?: any) => {
  trackActivity(); // ✅ ADD: Activity tracking on submit
  
  if (typeof value === 'string' && value.trim() === '') {
      const containsFile = previews().filter((item) => !item.mime.startsWith('image') && item.type !== 'audio').length > 0;
      if (!previews().length || (previews().length && containsFile)) {
        return;
      }
    }

    let formData = {};
    if (typeof value === 'object') {
      formData = value;
      value = Object.entries(value)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
    }

    setLoading(true);
    scrollToBottom();

    let uploads: IUploads = previews().map((item) => {
      return {
        data: item.data,
        type: item.type,
        name: item.name,
        mime: item.mime,
      };
    });

    try {
      uploads = await handleFileUploads(uploads);
    } catch (error) {
      handleError('Unable to upload documents', true);
      return;
    }

    clearPreviews();

    setMessages((prevMessages) => {
      const messages: MessageType[] = [...prevMessages, { message: value as string, type: 'userMessage', fileUploads: uploads }];
      addChatMessage(messages);
      return messages;
    });

    const body: IncomingInput = {
      question: value,
      chatId: chatId(),
    };

    if (startInputType() === 'formInput') {
      body.form = formData;
      delete body.question;
    }

    if (uploads && uploads.length > 0) body.uploads = uploads;

    if (props.chatflowConfig) body.overrideConfig = props.chatflowConfig;

    if (leadEmail()) body.leadEmail = leadEmail();

    if (action) body.action = action;

    if (humanInput) body.humanInput = humanInput;

    if (isChatFlowAvailableToStream()) {
      fetchResponseFromEventStream(props.chatflowid, body);
    } else {
      const result = await sendMessageQuery({
        chatflowid: props.chatflowid,
        apiHost: props.apiHost,
        body,
        onRequest: props.onRequest,
      });

      if (result.data) {
        const data = result.data;

        let text = '';
        if (data.text) text = data.text;
        else if (data.json) text = JSON.stringify(data.json, null, 2);
        else text = JSON.stringify(data, null, 2);

        if (data?.chatId) setChatId(data.chatId);

        playReceiveSound();

        setMessages((prevMessages) => {
          const allMessages = [...cloneDeep(prevMessages)];
          const newMessage = {
            message: text,
            id: data?.chatMessageId,
            sourceDocuments: data?.sourceDocuments,
            usedTools: data?.usedTools,
            fileAnnotations: data?.fileAnnotations,
            agentReasoning: data?.agentReasoning,
            agentFlowExecutedData: data?.agentFlowExecutedData,
            action: data?.action,
            artifacts: data?.artifacts,
            type: 'apiMessage' as messageType,
            feedback: null,
            dateTime: new Date().toISOString(),
          };
          allMessages.push(newMessage);
          addChatMessage(allMessages);
          return allMessages;
        });

        updateMetadata(data, value);

        setLoading(false);
        setUserInput('');
        setUploadedFiles([]);
        scrollToBottom();
      }
      if (result.error) {
        const error = result.error;
        console.error(error);
        if (typeof error === 'object') {
          handleError(`Error: ${error?.message.replaceAll('Error:', ' ')}`);
          return;
        }
        if (typeof error === 'string') {
          handleError(error);
          return;
        }
        handleError();
        return;
      }
    }

    // Update last question to avoid saving base64 data to localStorage
    if (uploads && uploads.length > 0) {
      setMessages((data) => {
        const messages = data.map((item, i) => {
          if (i === data.length - 2 && item.type === 'userMessage') {
            if (item.fileUploads) {
              const fileUploads = item?.fileUploads.map((file) => ({
                type: file.type,
                name: file.name,
                mime: file.mime,
              }));
              return { ...item, fileUploads };
            }
          }
          return item;
        });
        addChatMessage(messages);
        return [...messages];
      });
    }
  };

  const onSubmitResponse = (actionData: any, feedback = '', type = '') => {
    let fbType = feedbackType();
    if (type) {
      fbType = type;
    }
    const question = feedback ? feedback : fbType.charAt(0).toUpperCase() + fbType.slice(1);
    handleSubmit(question, undefined, {
      type: fbType,
      startNodeId: actionData?.nodeId,
      feedback,
    });
  };

  const handleSubmitFeedback = () => {
    if (pendingActionData()) {
      onSubmitResponse(pendingActionData(), feedback());
      setOpenFeedbackDialog(false);
      setFeedback('');
      setPendingActionData(null);
      setFeedbackType('');
    }
  };

  const handleActionClick = async (elem: any, action: IAction | undefined | null) => {
    setUserInput(elem.label);
    setMessages((data) => {
      const updated = data.map((item, i) => {
        if (i === data.length - 1) {
          return { ...item, action: null };
        }
        return item;
      });
      addChatMessage(updated);
      return [...updated];
    });
    if (elem.type.includes('agentflowv2')) {
      const type = elem.type.includes('approve') ? 'proceed' : 'reject';
      setFeedbackType(type);

      if (action && action.data && action.data.input && action.data.input.humanInputEnableFeedback) {
        setPendingActionData(action.data);
        setOpenFeedbackDialog(true);
      } else if (action) {
        onSubmitResponse(action.data, '', type);
      }
    } else {
      handleSubmit(elem.label, action);
    }
  };

  const clearChat = () => {
    try {
      removeLocalStorageChatHistory(props.chatflowid);
      setChatId(
        (props.chatflowConfig?.vars as any)?.customerId ? `${(props.chatflowConfig?.vars as any).customerId.toString()}+${uuidv4()}` : uuidv4(),
      );
      setUploadedFiles([]);
      const messages: MessageType[] = [
        {
          message: props.welcomeMessage ?? defaultWelcomeMessage,
          type: 'apiMessage',
        },
      ];
        if (leadsConfig()?.status && leadsConfig()?.triggerMode === 'auto' && !getLocalStorageChatflow(props.chatflowid)?.lead) {
          messages.push({ message: '', type: 'leadCaptureMessage' });
        }
      setMessages(messages);
    } catch (error: any) {
      const errorData = error.response.data || `${error.response.status}: ${error.response.statusText}`;
      console.error(`error: ${errorData}`);
    }
  };
  const scrollToBottom = () => {
    if (chatContainer) {
      setTimeout(() => {
        if (chatContainer) {
            chatContainer.scrollTo(0, chatContainer.scrollHeight);
        }
      }, 100);
    }
  };

  createEffect(() => {
    if (props.starterPrompts) {
      let prompts: string[];

      if (Array.isArray(props.starterPrompts)) {
        // If starterPrompts is an array
        prompts = props.starterPrompts;
      } else {
        // If starterPrompts is a JSON object
        prompts = Object.values(props.starterPrompts).map((promptObj: { prompt: string }) => promptObj.prompt);
      }

      // Filter out any empty prompts
      return setStarterPrompts(prompts.filter((prompt) => prompt !== ''));
    }
  });

  // Auto scroll chat to bottom
  createEffect(() => {
    if (messages()) {
      if (messages().length > 1) {
        setTimeout(() => {
          chatContainer?.scrollTo(0, chatContainer.scrollHeight);
        }, 400);
      }
    }
  });

  createEffect(() => {
    if (props.fontSize && botContainer) botContainer.style.fontSize = `${props.fontSize}px`;
  });

  // eslint-disable-next-line solid/reactivity

  createEffect(() => {
    if (followUpPromptsStatus() && messages().length > 0) {
      const lastMessage = messages()[messages().length - 1];
      if (lastMessage.type === 'apiMessage' && lastMessage.followUpPrompts) {
        setFollowUpPrompts(JSON.parse(lastMessage.followUpPrompts));
      } else if (lastMessage.type === 'userMessage') {
        setFollowUpPrompts([]);
      }
    }
  });

  createEffect(() => {
    // ✅ Track all reactive dependencies at start to avoid stale closures
    const activityTime = lastActivityTime();
    const currentConfig = leadsConfig();
    const leadSaved = isLeadSaved();
    const formDismissed = leadFormDismissed();
    
    console.log('🔄 Activity effect triggered');
    console.log('📊 Dependencies:', {
      lastActivityTime: activityTime,
      configStatus: currentConfig?.status,
      triggerMode: currentConfig?.triggerMode,
      leadSaved,
      formDismissed,
      showLeadFormState: showLeadForm()
    });
    
    if (!currentConfig?.status || leadSaved || formDismissed) { // ✅ SESSION state
      console.log('❌ Effect early return - config/saved/dismissed');
      return;
    }
    
    if (!['inactivity', 'both'].includes(currentConfig?.triggerMode || '')) {
      console.log('❌ Effect early return - wrong trigger mode');
      return;
    }
    
    // ✅ Sadece lead kaydını kontrol et, son bariyerimiz
    const storage = getLocalStorageChatflow(props.chatflowid);
    console.log('📦 Effect storage data:', storage);
    
    if (storage?.lead) {
      console.log('❌ Effect early return - lead already saved in storage');
      return;
    }
    
    console.log('✅ Effect: All checks passed, restarting timer');
    resetInactivityTimer();
    startInactivityTimer();
  }, [lastActivityTime, leadsConfig, isLeadSaved, leadFormDismissed]);

  const addRecordingToPreviews = (blob: Blob) => {
    let mimeType = '';
    const pos = blob.type.indexOf(';');
    if (pos === -1) {
      mimeType = blob.type;
    } else {
      mimeType = blob.type.substring(0, pos);
    }

    // read blob and add to previews
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result as FilePreviewData;
      const upload: FilePreview = {
        data: base64data,
        preview: '../assets/wave-sound.jpg',
        type: 'audio',
        name: `audio_${Date.now()}.wav`,
        mime: mimeType,
      };
      setPreviews((prevPreviews) => [...prevPreviews, upload]);
    };
  };

  const isFileAllowedForUpload = (file: File) => {
    let acceptFile = false;
    if (uploadsConfig() && uploadsConfig()?.isImageUploadAllowed && uploadsConfig()?.imgUploadSizeAndTypes) {
      const fileType = file.type;
      const sizeInMB = file.size / 1024 / 1024;
      uploadsConfig()?.imgUploadSizeAndTypes.map((allowed) => {
        if (allowed.fileTypes.includes(fileType) && sizeInMB <= allowed.maxUploadSize) {
          acceptFile = true;
        }
      });
    }
    if (fullFileUpload()) {
      return true;
    }
    if (uploadsConfig() && uploadsConfig()?.isRAGFileUploadAllowed && uploadsConfig()?.fileUploadSizeAndTypes) {
      const fileExt = file.name.split('.').pop();
      if (fileExt) {
        uploadsConfig()?.fileUploadSizeAndTypes.map((allowed) => {
          if (allowed.fileTypes.length === 1 && allowed.fileTypes[0] === '*') {
            acceptFile = true;
          } else if (allowed.fileTypes.includes(`.${fileExt}`)) {
            acceptFile = true;
          }
        });
      }
    }
    if (!acceptFile) {
      alert(`Cannot upload file. Kindly check the allowed file types and maximum allowed size.`);
    }
    return acceptFile;
  };

  const handleFileChange = async (event: FileEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }
    
    type FileListItem = Promise<FilePreview>;
    type UploadedFileItem = { file: File; type: string };
    
    const filesList: FileListItem[] = [];
    const uploadedFiles: UploadedFileItem[] = [];
    for (const file of files) {
      if (isFileAllowedForUpload(file) === false) {
        return;
      }
      // Only add files
      if (
        !file.type ||
        !uploadsConfig()
          ?.imgUploadSizeAndTypes.map((allowed) => allowed.fileTypes)
          .join(',')
          .includes(file.type)
      ) {
        uploadedFiles.push({ file, type: fullFileUpload() ? 'file:full' : 'file:rag' });
      }
      const reader = new FileReader();
      const { name } = file;
      filesList.push(
        new Promise((resolve) => {
          reader.onload = (evt) => {
            if (!evt?.target?.result) {
              return;
            }
            const { result } = evt.target;
            resolve({
              data: result,
              preview: URL.createObjectURL(file),
              type: 'file',
              name: name,
              mime: file.type,
            });
          };
          reader.readAsDataURL(file);
        }),
      );
    }

    const newFiles = await Promise.all(filesList);
    setUploadedFiles(uploadedFiles);
    setPreviews((prevPreviews) => [...prevPreviews, ...(newFiles as FilePreview[])]);
  };

  const isFileUploadAllowed = () => {
    if (fullFileUpload()) {
      return true;
    } else if (uploadsConfig()?.isRAGFileUploadAllowed) {
      return true;
    }
    return false;
  };

  const handleDrag = (e: DragEvent) => {
    if (uploadsConfig()?.isImageUploadAllowed || isFileUploadAllowed()) {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === 'dragenter' || e.type === 'dragover') {
        setIsDragActive(true);
      } else if (e.type === 'dragleave') {
        setIsDragActive(false);
      }
    }
  };

  const handleDrop = async (e: InputEvent | DragEvent) => {
    if (!uploadsConfig()?.isImageUploadAllowed && !isFileUploadAllowed) {
      return;
    }
    e.preventDefault();
    setIsDragActive(false);
    const files: Promise<FilePreview>[] = [];
    const uploadedFiles: { file: File; type: string }[] = [];
    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      for (const file of e.dataTransfer.files) {
        if (isFileAllowedForUpload(file) === false) {
          return;
        }
        // Only add files
        if (
          !file.type ||
          !uploadsConfig()
            ?.imgUploadSizeAndTypes.map((allowed) => allowed.fileTypes)
            .join(',')
            .includes(file.type)
        ) {
          uploadedFiles.push({ file, type: fullFileUpload() ? 'file:full' : 'file:rag' });
        }
        const reader = new FileReader();
        const { name } = file;
        files.push(
          new Promise((resolve) => {
            reader.onload = (evt) => {
              if (!evt?.target?.result) {
                return;
              }
              const { result } = evt.target;
              let previewUrl;
              if (file.type.startsWith('audio/')) {
                previewUrl = '../assets/wave-sound.jpg';
              } else if (file.type.startsWith('image/')) {
                previewUrl = URL.createObjectURL(file);
              }
              resolve({
                data: result,
                preview: previewUrl,
                type: 'file',
                name: name,
                mime: file.type,
              });
            };
            reader.readAsDataURL(file);
          }),
        );
      }

      const newFiles = await Promise.all(files);
      setUploadedFiles(uploadedFiles);
      setPreviews((prevPreviews) => [...prevPreviews, ...(newFiles as FilePreview[])]);
    }

    if (e.dataTransfer && e.dataTransfer.items) {
      for (const item of e.dataTransfer.items) {
        if (item.kind === 'string' && item.type.match('^text/uri-list')) {
          item.getAsString((s: string) => {
            const upload: FilePreview = {
              data: s,
              preview: s,
              type: 'url',
              name: s.substring(s.lastIndexOf('/') + 1),
              mime: '',
            };
            setPreviews((prevPreviews) => [...prevPreviews, upload]);
          });
        } else if (item.kind === 'string' && item.type.match('^text/html')) {
          item.getAsString((s: string) => {
            if (s.indexOf('href') === -1) return;
            //extract href
            const start = s.substring(s.indexOf('href') + 6);
            const hrefStr = start.substring(0, start.indexOf('"'));

            const upload: FilePreview = {
              data: hrefStr,
              preview: hrefStr,
              type: 'url',
              name: hrefStr.substring(hrefStr.lastIndexOf('/') + 1),
              mime: '',
            };
            setPreviews((prevPreviews) => [...prevPreviews, upload]);
          });
        }
      }
    }
  };

  const handleDeletePreview = (itemToDelete: FilePreview) => {
    if (itemToDelete.type === 'file') {
      URL.revokeObjectURL(itemToDelete.preview); // Clean up for file
    }
    setPreviews(previews().filter((item) => item !== itemToDelete));
  };

  const onMicrophoneClicked = () => {
    setIsRecording(true);
    startAudioRecording(setIsRecording, setRecordingNotSupported, setElapsedTime);
  };

  const onRecordingCancelled = () => {
    if (!recordingNotSupported) cancelAudioRecording();
    setIsRecording(false);
    setRecordingNotSupported(false);
  };

  const onRecordingStopped = async () => {
    setIsLoadingRecording(true);
    stopAudioRecording(addRecordingToPreviews);
  };

  const getInputDisabled = (): boolean => {
    const messagesArray = messages();
    const leadFormOpen = showLeadForm();
    
    // ✅ SADECE şu koşullarda disabled olsun:
    return Boolean(
      loading() ||
      !props.chatflowid ||
      leadFormOpen ||
      // ✅ Bu koşulu kaldır veya düzelt - input'u sürekli disable ediyor
      // (leadsConfig()?.status && !isLeadSaved() && leadsConfig()?.triggerMode === 'auto') ||
      (messagesArray[messagesArray.length - 1]?.action && 
      Object.keys(messagesArray[messagesArray.length - 1].action as any).length > 0)
    );
  };

  createEffect(
    // listen for changes in previews
    on(previews, (uploads) => {
      // wait for audio recording to load and then send
      const containsAudio = uploads.filter((item) => item.type === 'audio').length > 0;
      if (uploads.length >= 1 && containsAudio) {
        setIsRecording(false);
        setRecordingNotSupported(false);
        promptClick('');
      }

      return () => {
        setPreviews([]);
      };
    }),
  );

  const previewDisplay = (item: FilePreview) => {
    if (item.mime.startsWith('image/')) {
      return (
        <button
          class="group w-12 h-12 flex items-center justify-center relative rounded-[10px] overflow-hidden transition-colors duration-200"
          onClick={() => handleDeletePreview(item)}
        >
          <img class="w-full h-full bg-cover" src={item.data as string} />
          <span class="absolute hidden group-hover:flex items-center justify-center z-10 w-full h-full top-0 left-0 bg-black/10 rounded-[10px] transition-colors duration-200">
            <TrashIcon />
          </span>
        </button>
      );
    } else if (item.mime.startsWith('audio/')) {
      return (
        <div
          class={`inline-flex basis-auto flex-grow-0 flex-shrink-0 justify-between items-center rounded-xl h-12 p-1 mr-1 bg-gray-500`}
          style={{
            width: `${chatContainer ? (botProps.isFullPage ? chatContainer?.offsetWidth / 4 : chatContainer?.offsetWidth / 2) : '200'}px`,
          }}
        >
          <audio class="block bg-cover bg-center w-full h-full rounded-none text-transparent" controls src={item.data as string} />
          <button class="w-7 h-7 flex items-center justify-center bg-transparent p-1" onClick={() => handleDeletePreview(item)}>
            <TrashIcon color="white" />
          </button>
        </div>
      );
    } else {
      return <FilePreview disabled={getInputDisabled()} item={item} onDelete={() => handleDeletePreview(item)} />;
    }
  };

  // Visual Debug ReachUsButton
  const ReachUsButton = () => {
    const config = leadsConfig();
    
    console.log('🔍 ReachUsButton render - Config:', config);
    console.log('🔍 Status:', config?.status);
    console.log('🔍 TriggerMode:', config?.triggerMode);
    
    // ✅ SADECE bu kontrolleri yap - lead kontrolleri kaldırıldı
    if (!config?.status) {
      console.log('❌ Config status false or missing');
      return null;
    }
    
    if (!['button', 'both'].includes(config?.triggerMode || '')) {
      console.log('❌ Wrong trigger mode:', config?.triggerMode);
      return null;
    }
    
    // ✅ Lead kontrolleri kaldırıldı - buton her zaman görünür!
    console.log('✅ Button will be shown - lead controls removed');
    
    // ✅ SUCCESS: Show actual button
    const position = config.buttonPosition || 'top-right';
    const buttonColor = config.buttonColor || '#1976d2';
    const buttonText = config.buttonText || 'Reach Us';

    const getPositionStyles = () => {
      const baseStyles = {
        position: 'absolute' as const,
        'z-index': '2000',
        top: '15px',
        padding: '12px 24px',
        'border-radius': '25px',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        'font-size': '14px',
        'font-weight': '600',
        'box-shadow': '0 4px 12px rgba(0,0,0,0.15)',
        transition: 'all 0.3s ease',
        'backdrop-filter': 'blur(10px)',
        background: `linear-gradient(135deg, ${buttonColor}, ${buttonColor}dd)`,
        'font-family': 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      } as const;

      switch (position) {
        case 'top-left':
          return { ...baseStyles, left: '10px' };
        case 'top-center':
          return { ...baseStyles, left: '50%', transform: 'translateX(-50%)' };
        case 'top-right':
        default:
          return { ...baseStyles, right: '10px' };
      }
    };

    const handleClick = () => {
      console.log('🎯 ReachUsButton clicked!');
      showLeadCaptureForm();
    };

    return (
      <div style={{ position: 'relative' }}>
        <button
          style={getPositionStyles()}
          onClick={handleClick}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'translateY(0px) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
          class="reach-us-button"
        >
          {buttonText}
        </button>
        
        {/* Debug mode'da reset butonu göster */}
        <Show when={debugMode()}>
          <button
            onClick={resetLeadState}
            style={{
              position: 'absolute',
              top: '45px',
              right: '0px',
              background: '#ff4444',
              color: 'white',
              border: 'none',
              padding: '4px 8px',
              'border-radius': '3px',
              cursor: 'pointer',
              'font-size': '10px',
              'z-index': '2001'
            }}
          >
            🔄 Reset
          </button>
        </Show>
      </div>
    );
  };

  return (
    <>
      {/* ✅ ReachUsButton'ı en üste koy, tüm container'lardan önce */}
      <Show when={leadsConfig()?.status && ['button', 'both'].includes(leadsConfig()?.triggerMode || '')}>
        <ReachUsButton />
      </Show>
      


      {startInputType() === 'formInput' && messages().length === 1 ? (
        <FormInputView
          title={formTitle()}
          description={formDescription()}
          inputParams={formInputParams()}
          onSubmit={(formData) => handleSubmit(formData)}
          parentBackgroundColor={props?.backgroundColor}
          backgroundColor={props?.formBackgroundColor}
          textColor={props?.formTextColor || props.botMessage?.textColor}
          sendButtonColor={props.textInput?.sendButtonColor}
          fontSize={props.fontSize}
        />
      ) : (
        <div
          ref={botContainer}
          class={'relative flex w-full h-full text-base overflow-hidden bg-cover bg-center flex-col chatbot-container ' + props.class}
          style={{
            // ✅ CANVAS BOYUTLARI - Optimize edildi
            width: props.isFullPage ? '100%' : '420px', // Biraz daraltıldı: 450px -> 420px
            height: props.isFullPage ? '100%' : '580px', // Biraz azaltıldı: 600px -> 580px
            'min-width': '380px', // Azaltıldı: 400px -> 380px
            'min-height': '480px', // Azaltıldı: 500px -> 480px
            
            // ✅ MODERN BACKGROUND
            background: props.backgroundColor || '#ffffff',
            
            // ✅ MODERN TYPOGRAPHY
            'font-family': 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            'font-size': props.fontSize ? `${props.fontSize}px` : '16px',
            'line-height': '1.5',
            
            // ✅ LAYOUT
            display: 'flex',
            'flex-direction': 'column',
            overflow: 'hidden',
            position: 'relative',
            
            // ✅ MODERN STYLING
            'border-radius': props.isFullPage ? '0px' : '20px',
            'box-shadow': props.isFullPage ? 'none' : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            'backdrop-filter': 'blur(16px)'
          }}
          onDragEnter={handleDrag}
        >
          {isDragActive() && (
            <div
              class="absolute top-0 left-0 bottom-0 right-0 w-full h-full z-50"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragEnd={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            />
          )}
          {isDragActive() && (uploadsConfig()?.isImageUploadAllowed || isFileUploadAllowed()) && (
            <div
              class="absolute top-0 left-0 bottom-0 right-0 flex flex-col items-center justify-center text-white z-40 gap-4 border-2 border-dashed transition-all duration-300"
              style={{ 
                'background': 'rgba(0, 0, 0, 0.8)',
                'backdrop-filter': 'blur(10px)',
                'border-color': props.bubbleBackgroundColor || '#3b82f6',
                'border-radius': '16px',
                'margin': '8px'
              }}
            >
              <div class="text-center">
                <h2 class="text-2xl font-semibold mb-2" style={{ 'font-family': 'Inter, sans-serif' }}>
                  Drop files here to upload
                </h2>
                <div class="flex flex-col gap-2 text-sm opacity-80">
                  <For each={[...(uploadsConfig()?.imgUploadSizeAndTypes || []), ...(uploadsConfig()?.fileUploadSizeAndTypes || [])]}>
                    {(allowed) => (
                      <div class="text-center">
                        <span class="font-medium">{allowed.fileTypes?.join(', ')}</span>
                        {allowed.maxUploadSize && (
                          <span class="block text-xs opacity-70">Max: {allowed.maxUploadSize} MB</span>
                        )}
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </div>
          )}
          {props.showTitle ? (
            <div
              class="flex flex-row items-center w-full flex-shrink-0 px-6 py-4 border-b"
              style={{
                background: props.titleBackgroundColor || props.bubbleBackgroundColor || '#3b82f6',
                color: props.titleTextColor || props.bubbleTextColor || '#ffffff',
                'border-top-left-radius': props.isFullPage ? '0px' : '20px',
                'border-top-right-radius': props.isFullPage ? '0px' : '20px',
                'border-bottom': '1px solid rgba(255, 255, 255, 0.1)',
                'min-height': '60px', // Azaltıldı: 70px -> 60px
                'backdrop-filter': 'blur(8px)'
              }}
            >
              <Show when={props.titleAvatarSrc}>
                <div style={{ 'margin-right': '12px' }}>
                  <Avatar initialAvatarSrc={props.titleAvatarSrc} />
                </div>
              </Show>
              <Show when={props.title}>
                <span class="whitespace-pre-wrap font-semibold text-lg">{props.title}</span>
              </Show>
              <div style={{ flex: 1 }} />
              <button
                disabled={messages().length === 1}
                onClick={clearChat}
                class="ml-auto px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: props.titleTextColor || props.bubbleTextColor || '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  'backdrop-filter': 'blur(8px)',
                  'font-family': 'Inter, sans-serif'
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.transform = 'translateY(0px)';
                  }
                }}
              >
                Clear Chat
              </button>
            </div>
          ) : null}
          <div 
            class="flex flex-col w-full flex-1 min-h-0 overflow-hidden"
            style={{
              'flex': '1 1 0%',
              'min-height': '0'
            }}
          >
            <div
              ref={chatContainer}
              class="flex-1 overflow-y-auto px-6 py-6 space-y-4"
              style={{
                // ✅ SCROLL BEHAVIOR
                'scroll-behavior': 'smooth',
                'overscroll-behavior-y': 'contain',
                
                // ✅ FLEX LAYOUT - Critical for proper sizing
                'flex': '1 1 0%',
                'min-height': '0',
                'overflow-y': 'auto',
                'overflow-x': 'hidden',
                
                // ✅ COMPACT SPACING - Daha az padding
                'padding': '16px 20px', // Azaltıldı: 24px -> 20px, vertical da azaltıldı
                'gap': '12px', // Azaltıldı: 16px -> 12px
                
                // ✅ CUSTOM SCROLLBAR
                'scrollbar-width': 'thin',
                'scrollbar-color': 'rgba(0,0,0,0.2) transparent',
                
                // ✅ Custom scrollbar for webkit browsers
                '--scrollbar-track': 'transparent',
                '--scrollbar-thumb': 'rgba(0,0,0,0.2)',
                '--scrollbar-thumb-hover': 'rgba(0,0,0,0.3)'
              }}
            >
              <For each={[...messages()]}>
                {(message, index) => {
                  return (
                    <>
                      {message.type === 'userMessage' && (
                        <GuestBubble
                          message={message}
                          apiHost={props.apiHost}
                          chatflowid={props.chatflowid}
                          chatId={chatId()}
                          backgroundColor={props.userMessage?.backgroundColor}
                          textColor={props.userMessage?.textColor}
                          showAvatar={props.userMessage?.showAvatar}
                          avatarSrc={props.userMessage?.avatarSrc}
                          fontSize={props.fontSize}
                          renderHTML={props.renderHTML}
                        />
                      )}
                      {message.type === 'apiMessage' && (
                        <BotBubble
                          message={message}
                          fileAnnotations={message.fileAnnotations}
                          chatflowid={props.chatflowid}
                          chatId={chatId()}
                          apiHost={props.apiHost}
                          backgroundColor={props.botMessage?.backgroundColor}
                          textColor={props.botMessage?.textColor}
                          feedbackColor={props.feedback?.color}
                          showAvatar={props.botMessage?.showAvatar}
                          avatarSrc={props.botMessage?.avatarSrc}
                          chatFeedbackStatus={chatFeedbackStatus()}
                          fontSize={props.fontSize}
                          isLoading={loading() && index() === messages().length - 1}
                          showAgentMessages={props.showAgentMessages}
                          handleActionClick={(elem, action) => handleActionClick(elem, action)}
                          sourceDocsTitle={props.sourceDocsTitle}
                          handleSourceDocumentsClick={(sourceDocuments) => {
                            setSourcePopupSrc(sourceDocuments);
                            setSourcePopupOpen(true);
                          }}
                          dateTimeToggle={props.dateTimeToggle}
                          renderHTML={props.renderHTML}
                        />
                      )}
                      {message.type === 'leadCaptureMessage' && leadsConfig()?.status && !getLocalStorageChatflow(props.chatflowid)?.lead && (
                        <div 
                          class="w-full max-w-none"
                          style={{
                            // ✅ LEAD FORM CONTAINER - Boyut kontrollü
                            'max-height': '320px', // Sabit maksimum yükseklik
                            'overflow-y': 'auto',
                            'margin': '0',
                            'padding': '0'
                          }}
                        >
                          <LeadCaptureBubble
                            message={message}
                            chatflowid={props.chatflowid}
                            chatId={chatId()}
                            apiHost={props.apiHost}
                            backgroundColor={props.botMessage?.backgroundColor}
                            textColor={props.botMessage?.textColor}
                            fontSize={props.fontSize}
                            showAvatar={props.botMessage?.showAvatar}
                            avatarSrc={props.botMessage?.avatarSrc}
                            leadsConfig={leadsConfig()}
                            sendButtonColor={props.textInput?.sendButtonColor}
                            isLeadSaved={isLeadSaved()}
                            setIsLeadSaved={setIsLeadSaved}
                            setLeadEmail={setLeadEmail}
                            onDismiss={hideLeadCaptureForm}
                            fieldErrors={fieldErrors()}
                            fieldTouched={fieldTouched()}
                            onFieldValidation={handleFieldValidation}
                            onFieldBlur={handleFieldBlur} 
                            onFormSubmit={handleLeadFormSubmit}
                            title={leadsConfig()?.title || DEFAULT_FORM_TITLE}
                          />
                        </div>
                      )}
                      {message.type === 'userMessage' && loading() && index() === messages().length - 1 && <LoadingBubble />}
                      {message.type === 'apiMessage' && message.message === '' && loading() && index() === messages().length - 1 && <LoadingBubble />}
                    </>
                  );
                }}
              </For>
            </div>
            {/* ✅ STARTER PROMPTS - Canvas style */}
            <Show when={messages().length === 1}>
              <Show when={starterPrompts().length > 0}>
                <div class="w-full flex-shrink-0 px-6 py-4 border-t border-gray-100">
                  <div class="flex flex-wrap gap-2">
                    <For each={[...starterPrompts()]}>
                      {(key) => (
                        <StarterPromptBubble
                          prompt={key}
                          onPromptClick={() => promptClick(key)}
                          starterPromptFontSize={botProps.starterPromptFontSize}
                        />
                      )}
                    </For>
                  </div>
                </div>
              </Show>
            </Show>
            {/* ✅ FOLLOW UP PROMPTS - Canvas style */}
            <Show when={messages().length > 2 && followUpPromptsStatus()}>
              <Show when={followUpPrompts().length > 0}>
                <div class="w-full flex-shrink-0 px-6 py-4 border-t border-gray-100">
                  <div class="flex items-center gap-2 mb-3">
                    <SparklesIcon class="w-4 h-4 text-blue-500" />
                    <span class="text-sm font-medium text-gray-700">Try these prompts</span>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <For each={[...followUpPrompts()]}>
                      {(prompt, index) => (
                        <FollowUpPromptBubble
                          prompt={prompt}
                          onPromptClick={() => followUpPromptClick(prompt)}
                          starterPromptFontSize={botProps.starterPromptFontSize}
                        />
                      )}
                    </For>
                  </div>
                </div>
              </Show>
            </Show>
            {/* ✅ FILE PREVIEWS - Canvas style */}
            <Show when={previews().length > 0}>
              <div class="w-full flex items-center justify-start gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                <For each={[...previews()]}>{(item) => <>{previewDisplay(item)}</>}</For>
              </div>
            </Show>
            {/* ✅ INPUT AREA - Modern, compact, no white space */}
            <div 
              class="flex-shrink-0 w-full border-t"
              style={{ 
                'border-color': 'rgba(0,0,0,0.08)',
                'background': 'linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%)',
                'backdrop-filter': 'blur(12px)',
                '-webkit-backdrop-filter': 'blur(12px)',
                'padding': '16px 20px 12px 20px', // ✅ Compact padding
                'box-shadow': '0 -2px 8px rgba(0,0,0,0.04)'
              }}
            >
              {!isRecording() ? (
                // ✅ NORMAL INPUT - Modern container düzeltildi
                <div 
                  class="flex items-center gap-3 input-container"
                  style={{
                    'background': 'rgba(255, 255, 255, 0.95)',
                    'border': '2px solid #f1f5f9',
                    'border-radius': '12px',
                    'padding': props.textInput?.padding || '6px 10px',
                    'transition': 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    'box-shadow': '0 2px 8px rgba(0, 0, 0, 0.04)',
                    'backdrop-filter': 'blur(8px)',
                    'width': '100%',
                    'min-height': props.textInput?.containerMinHeight || '36px'
                  }}
                  onFocus={() => {
                    // Focus styling
                    const container = document.querySelector('.input-container') as HTMLElement;
                    if (container) {
                      container.style.borderColor = props.textInput?.sendButtonColor || '#3b82f6';
                      container.style.boxShadow = `0 0 0 3px ${props.textInput?.sendButtonColor || '#3b82f6'}20`;
                    }
                  }}
                >
                  
                  {/* ✅ LEFT BUTTONS - Compact icons */}
                  <div class="flex items-center gap-1">
                    {/* Upload buttons as small icons */}
                    {uploadsConfig()?.isImageUploadAllowed && (
                      <label class="cursor-pointer">
                        <input
                          type="file"
                          multiple
                          accept={uploadsConfig()?.imgUploadSizeAndTypes.map((allowed) => allowed.fileTypes).join(',')}
                          style={{ display: 'none' }}
                          onChange={handleFileChange}
                        />
                        <button 
                          type="button"
                          class="p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100"
                          style={{ 'color': '#6b7280' }}
                          title="Upload Image"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                          </svg>
                        </button>
                      </label>
                    )}
                    
                    {/* File upload */}
                    {(uploadsConfig()?.isRAGFileUploadAllowed || fullFileUpload()) && (
                      <label class="cursor-pointer">
                        <input
                          type="file"
                          multiple
                          accept={fullFileUpload() ? fullFileUploadAllowedTypes() : uploadsConfig()?.fileUploadSizeAndTypes.map((allowed) => allowed.fileTypes).join(',')}
                          style={{ display: 'none' }}
                          onChange={handleFileChange}
                        />
                        <button 
                          type="button"
                          class="p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100"
                          style={{ 'color': '#6b7280' }}
                          title="Upload File"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5a2.5 2.5 0 0 0 5 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.31 2.69 6 6 6s6-2.69 6-6V6h-2.5z"/>
                          </svg>
                        </button>
                      </label>
                    )}
                    
                    {/* Voice recording */}
                    {uploadsConfig()?.isSpeechToTextEnabled && (
                      <button 
                        type="button"
                        class="p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100"
                        style={{ 'color': '#6b7280' }}
                        title="Record Audio"
                        onClick={onMicrophoneClicked}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/>
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* ✅ TEXT INPUT - Full width, single line focused */}
                  <div class="flex-1 min-w-0 flex items-center">
                    <textarea
                      placeholder={props.textInput?.placeholder || "Type your message..."}
                      value={userInput()}
                      onInput={(e) => {
                        setUserInput(e.target.value);
                        trackActivity();
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = Math.min(target.scrollHeight, parseInt(props.textInput?.textareaMaxHeight || '60px')) + 'px';
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit(userInput());
                        }
                      }}
                      style={{
                        'background': 'transparent',
                        'border': 'none',
                        'outline': 'none',
                        'resize': 'none',
                        'font-family': 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        'font-size': `${props.textInput?.fontSize || props.fontSize || 15}px`,
                        'color': props.textInput?.textColor || '#111827',
                        'line-height': '1.5',
                        'padding': '6px 0',
                        'width': '100%',
                        'min-height': props.textInput?.textareaMinHeight || '20px',
                        'max-height': props.textInput?.textareaMaxHeight || '60px',
                        'overflow-y': 'auto',
                        'font-weight': '400',
                        'overflow-x': 'hidden'
                      }}
                      disabled={getInputDisabled()}
                      rows={1}
                    />
                  </div>

                  {/* ✅ SEND BUTTON - Circular, right side */}
                  <div class="flex-shrink-0">

                  <button
                    disabled={getInputDisabled() || !userInput().trim()}
                    onClick={() => handleSubmit(userInput())}
                    class="transition-all duration-200 disabled:opacity-50"
                    style={{
                      'background': getInputDisabled() || !userInput().trim()
                        ? '#e5e7eb'
                        : `linear-gradient(135deg, ${props.textInput?.sendButtonColor || '#3b82f6'} 0%, ${props.textInput?.sendButtonColor || '#1d4ed8'} 100%)`,
                      'color': getInputDisabled() || !userInput().trim() ? '#9ca3af' : '#ffffff',
                      'border': 'none',
                      'border-radius': '50%',
                      'padding': '0',
                      'cursor': getInputDisabled() || !userInput().trim() ? 'not-allowed' : 'pointer',
                      'display': 'flex',
                      'align-items': 'center',
                      'justify-content': 'center',
                      'width': props.textInput?.buttonSize || '28px',
                      'height': props.textInput?.buttonSize || '28px',
                      'box-shadow': getInputDisabled() || !userInput().trim()
                        ? 'none'
                        : '0 2px 8px rgba(59, 130, 246, 0.3)',
                      'transform': 'translateY(0)',
                      'flex-shrink': '0'
                    }}
                    onMouseEnter={(e) => {
                      if (!getInputDisabled() && userInput().trim()) {
                        e.currentTarget.style.transform = 'translateY(-1px) scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!getInputDisabled() && userInput().trim()) {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
                      }
                    }}
                    title="Send Message"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"> {/* ✅ SMALLER ICON: 16x16 -> 12x12 */}
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                  </button>
                  </div>
                </div>
              ) : (
                // ✅ RECORDING STATE
                <>
                  {recordingNotSupported() ? (
                    <div class="w-full flex items-center justify-between p-4 rounded-xl shadow-sm" style={{ 
                      background: 'rgba(247, 250, 252, 0.8)',
                      border: '1px solid rgba(226, 232, 240, 0.8)',
                      'backdrop-filter': 'blur(8px)'
                    }}>
                      <div class="w-full flex items-center justify-between gap-3">
                        <span class="text-base text-gray-700 font-medium">Please use a modern browser like Chrome or Firefox that supports audio recording.</span>
                        <button
                          class="py-2 px-6 justify-center flex items-center bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200"
                          type="button"
                          onClick={() => onRecordingCancelled()}
                        >
                          Got it
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      class="h-[58px] flex items-center justify-between chatbot-input border border-[#eeeeee] rounded-xl"
                      data-testid="input"
                      style={{
                        margin: 'auto',
                        'background-color': props.textInput?.backgroundColor ?? defaultBackgroundColor,
                        color: props.textInput?.textColor ?? defaultTextColor,
                      }}
                    >
                      <div class="flex items-center gap-3 px-4 py-2">
                        <span>
                          <CircleDotIcon color="red" />
                        </span>
                        <span>{elapsedTime() || '00:00'}</span>
                        {isLoadingRecording() && <span class="ml-1.5">Sending...</span>}
                      </div>
                      <div class="flex items-center">
                        <CancelButton buttonColor={props.textInput?.sendButtonColor} type="button" class="m-0" onClick={onRecordingCancelled}>
                          <span style={{ 'font-family': 'Inter, sans-serif' }}>Cancel</span>
                        </CancelButton>
                        <SendButton
                          sendButtonColor={props.textInput?.sendButtonColor}
                          type="button"
                          isDisabled={loading()}
                          class="m-0"
                          onClick={onRecordingStopped}
                        >
                          <span style={{ 'font-family': 'Inter, sans-serif' }}>Send</span>
                        </SendButton>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            {/* ✅ FOOTER - Minimal, clean, no empty space */}
            <div 
              class="flex-shrink-0 w-full flex justify-center items-center"
              style={{
                'background': 'transparent', // ✅ Tamamen şeffaf
                'padding': '6px 16px 8px 16px', // ✅ Çok minimal padding
                'border-top': 'none', // ✅ Üst border kaldırıldı
                'margin-top': '0' // ✅ Üst margin yok
              }}
            >
              <div 
                style={{
                  'font-size': '10px', // ✅ Daha küçük font
                  'color': '#a1a1aa', // ✅ Daha açık gri
                  'font-family': 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  'font-weight': '400', // ✅ Normal weight
                  'opacity': '0.8', // ✅ Hafif şeffaflık
                  'text-align': 'center',
                  'line-height': '1',
                  'letter-spacing': '0.025em'
                }}
              >
                Powered by{' '}
                <a 
                  href="https://flowera.ai/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    'color': '#6366f1', // ✅ Daha yumuşak mavi
                    'text-decoration': 'none',
                    'font-weight': '500', // ✅ Hafif bold
                    'transition': 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#4f46e5';
                    e.currentTarget.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#6366f1';
                    e.currentTarget.style.textDecoration = 'none';
                  }}
                >
                  Flowera
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
      {sourcePopupOpen() && <Popup isOpen={sourcePopupOpen()} value={sourcePopupSrc()} onClose={() => setSourcePopupOpen(false)} />}

      {disclaimerPopupOpen() && (
        <DisclaimerPopup
          isOpen={disclaimerPopupOpen()}
          onAccept={handleDisclaimerAccept}
          title={props.disclaimer?.title}
          message={props.disclaimer?.message}
          textColor={props.disclaimer?.textColor}
          buttonColor={props.disclaimer?.buttonColor}
          buttonText={props.disclaimer?.buttonText}
          buttonTextColor={props.disclaimer?.buttonTextColor}
          blurredBackgroundColor={props.disclaimer?.blurredBackgroundColor}
          backgroundColor={props.disclaimer?.backgroundColor}
          denyButtonBgColor={props.disclaimer?.denyButtonBgColor}
          denyButtonText={props.disclaimer?.denyButtonText}
          onDeny={props.closeBot}
          isFullPage={props.isFullPage}
        />
      )}

      {openFeedbackDialog() && (
        <FeedbackDialog
          isOpen={openFeedbackDialog()}
          onClose={() => {
            setOpenFeedbackDialog(false);
            handleSubmitFeedback();
          }}
          onSubmit={handleSubmitFeedback}
          feedbackValue={feedback()}
          setFeedbackValue={(value) => setFeedback(value)}
        />
      )}
    </>
  );
};
