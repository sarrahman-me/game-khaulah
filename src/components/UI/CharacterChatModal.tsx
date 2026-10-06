import React, { useState, useEffect, useRef } from 'react';
import { useGameStore, gameStore } from '../../state/useGameStore';
import { soundManager } from '../../sound/audioManager';
import {
  chatWithCharacter,
  speakText,
  stopSpeaking,
  isSpeechRecognitionAvailable,
  createSpeechRecognizer,
} from '../../services/aiService';
import {
  X,
  Mic,
  Send,
  Volume2,
  Sparkles,
  MessageCircle,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'khaulah' | 'character';
  text: string;
}

export const CharacterChatModal: React.FC = () => {
  const chatState = useGameStore((s) => s.characterChatState);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognizerRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested questions based on character
  const getSuggestions = (charId: string): string[] => {
    if (charId === 'khalid') {
      return [
        'Khalid lagi main apa? 👦',
        'Mau main petak umpet sama Mbak Khaulah? 🙈',
        'Khalid sayang Mbak Khaulah gak? 💖',
        'Ayo balapan lari bareng Khalid! 🏃‍♂️',
      ];
    }
    if (charId === 'abi') {
      return [
        'Abi lagi bikin apa di laptop? 💻',
        'Abi, kenapa burung bisa terbang? 🕊️',
        'Abi bangga sama Khaulah gak? ⭐',
        'Abi lelah gak bekerja hari ini? 💖',
      ];
    }
    if (charId === 'ummi') {
      return [
        'Ummi, bekal kuenya enak banget! 🍰',
        'Ummi ceritain dongeng sebelum tidur dong! 📖',
        'Boleh minta kue pelangi lagi Ummi? 🌈',
        'Khaulah sayang banget sama Ummi! 🧕💖',
      ];
    }
    if (charId === 'faqih') {
      return [
        'Adek Faqih, cilukba! 👶✨',
        'Mau balapan mobil-mobilan bareng? 🚗💨',
        'Faqih lagi senang ya? 🍼',
      ];
    }
    if (charId === 'bu_guru') {
      return [
        'Bu Guru, ayo main tebak-tebakan huruf! ❓',
        'Khaulah murid yang rajin kan Bu Guru? 🎒',
        'Ayo bernyanyi lagu anak bareng! 🎶',
      ];
    }
    return ['Halo, lagi apa hari ini? 🌸', 'Cerita sesuatu yang lucu dong! ✨'];
  };

  useEffect(() => {
    if (!chatState) {
      stopSpeaking();
      setMessages([]);
      setIsListening(false);
    } else {
      // Set initial greeting
      let initialGreeting = `Assalamu'alaikum Khaulah bidadari shalihah! Ada apa sayang? Ayo ngobrol sama ${chatState.characterName}! 🌸`;
      if (chatState.characterId === 'khalid') {
        initialGreeting = `Mbak Khaulah! Khalid lagi senang banget nih! Mbak Khaulah mau main apa hari ini? 👦🥁`;
      } else if (chatState.characterId === 'abi') {
        initialGreeting = `Assalamu'alaikum Khaulah putri kebanggaan Abi! Senang sekali Khaulah menyapa Abi. Mau cerita apa sayang? 💻👨‍👧`;
      } else if (chatState.characterId === 'ummi') {
        initialGreeting = `Assalamu'alaikum Khaulah sayang! Ummi selalu bahagia mendengar suara ceria Khaulah. Mau cerita apa nak? 🧕🌸`;
      }

      setMessages([{ id: 'init', sender: 'character', text: initialGreeting }]);
      speakText(initialGreeting);
    }
  }, [chatState]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!chatState) return null;

  const handleSendMessage = async (textToSend: string) => {
    const clean = textToSend.trim();
    if (!clean || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'k_' + Date.now(),
      sender: 'khaulah',
      text: clean,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.sender === 'khaulah' ? 'user' : 'assistant',
        content: m.text,
      }));

      const reply = await chatWithCharacter(
        chatState.characterId,
        chatState.characterName,
        clean,
        history
      );

      const charMsg: ChatMessage = {
        id: 'c_' + Date.now(),
        sender: 'character',
        text: reply,
      };

      setMessages((prev) => [...prev, charMsg]);
      speakText(reply);
    } catch (e) {
      console.warn('Chat error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMic = () => {
    if (isListening) {
      if (recognizerRef.current) {
        try {
          recognizerRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      return;
    }

    if (!isSpeechRecognitionAvailable()) {
      alert('Browser belum mendukung mikrofon. Khaulah bisa klik pertanyaan di bawah atau mengetik ya!');
      return;
    }

    try {
      const rec = createSpeechRecognizer(
        (transcript: string) => {
          setIsListening(false);
          handleSendMessage(transcript);
        },
        () => setIsListening(false),
        () => setIsListening(false)
      );

      if (rec) {
        recognizerRef.current = rec;
        rec.start();
        setIsListening(true);
        soundManager.playMagicSpell();
      }
    } catch {
      setIsListening(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto flex items-center justify-center p-3 sm:p-5 bg-purple-950/60 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-gradient-to-b from-sky-50 via-pink-50 to-white w-full max-w-lg max-h-[90vh] rounded-3xl border-4 border-yellow-300 shadow-2xl flex flex-col overflow-hidden relative">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-sky-500 via-purple-500 to-pink-500 p-4 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl ${chatState.avatarBg} border-2 border-white shadow flex items-center justify-center text-2xl`}>
              {chatState.characterId === 'khalid' && '👦🥁'}
              {chatState.characterId === 'abi' && '💻👨‍👧'}
              {chatState.characterId === 'ummi' && '🧕🌸'}
              {chatState.characterId === 'faqih' && '👶🚗'}
              {chatState.characterId === 'bu_guru' && '👩‍🏫🎒'}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bubble font-bold text-white drop-shadow">
                Ngobrol Bareng {chatState.characterName} ✨
              </h2>
              <span className="text-[11px] bg-white/20 px-2.5 py-0.5 rounded-full font-semibold">
                {chatState.role}
              </span>
            </div>
          </div>

          <button
            onClick={() => gameStore.closeCharacterChat()}
            className="w-9 h-9 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center border-2 border-white shadow active:scale-90 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2 ${
                m.sender === 'khaulah' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.sender === 'character' && (
                <div className={`w-8 h-8 rounded-xl ${chatState.avatarBg} text-white flex items-center justify-center text-sm shadow shrink-0 mt-1`}>
                  💬
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bubble font-medium shadow-sm leading-relaxed ${
                  m.sender === 'khaulah'
                    ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-br-none'
                    : 'bg-white text-gray-800 border border-purple-100 rounded-bl-none'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-[10px] opacity-75 font-bold">
                    {m.sender === 'khaulah' ? 'Khaulah 🌸' : chatState.characterName}
                  </span>
                  {m.sender === 'character' && (
                    <button
                      onClick={() => speakText(m.text)}
                      className="opacity-60 hover:opacity-100 p-0.5"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {m.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-purple-600 font-bubble animate-pulse">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>{chatState.characterName} sedang membalas...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-purple-50/70 border-t border-purple-100 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
          <span className="text-[11px] text-purple-700 font-bold shrink-0">Tanya:</span>
          {getSuggestions(chatState.characterId).map((sug, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(sug)}
              disabled={isLoading}
              className="bg-white hover:bg-purple-100 text-purple-800 text-[11px] font-bubble font-semibold px-2.5 py-1 rounded-full border border-purple-200 shadow-xs shrink-0 active:scale-95 transition-transform"
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Bottom Input & Mic Bar */}
        <div className="p-3 bg-white border-t border-purple-200 flex items-center gap-2">
          <button
            onClick={toggleMic}
            disabled={isLoading}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center border-2 border-white shadow-md active:scale-90 transition-all ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-gradient-to-tr from-purple-500 to-pink-500 text-white hover:scale-105'
            }`}
          >
            <Mic className="w-5 h-5" />
          </button>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="flex-1 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Bicara atau ketik ke ${chatState.characterName}...`}
              className="flex-1 bg-gray-50 border border-purple-200 rounded-2xl px-3.5 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="w-11 h-11 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 text-white flex items-center justify-center border-2 border-white shadow-md active:scale-90 transition-transform disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
