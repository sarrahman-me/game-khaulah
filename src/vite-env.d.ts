/// <reference types="vite/client" />

declare const __AI_API_KEY__: string;
declare const __AI_API_URL__: string;

interface Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}
