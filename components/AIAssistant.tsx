'use client';

import { useState, useRef, useEffect } from 'react';
import { AIMessage, getInitialMessages, processUserMessage } from '@/lib/aiEngine';
import { AppAction } from '@/components/Header';
import { Product } from '@/data/products';

interface AIAssistantProps {
  dispatch: React.Dispatch<AppAction>;
  onClose: () => void;
}

export default function AIAssistant({ dispatch, onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<AIMessage[]>(getInitialMessages);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function sendMessage(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg) return;

    const userMsg: AIMessage = { id: Date.now().toString(), role: 'user', content: msg };
    const response = processUserMessage(msg);

    setMessages(prev => [...prev, userMsg, response]);
    setInput('');
  }

  function handleAddToCart(productId: string) {
    dispatch({ type: 'ADD_TO_CART', payload: { productId } });
  }

  function startVoice() {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  }

  function renderContent(content: string) {
    return content
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return (
            <p key={i} className="font-bold text-boels-dark mt-1">
              {line.slice(2, -2)}
            </p>
          );
        }
        // Bold inline
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className={line.startsWith('•') ? 'ml-2 text-xs' : 'text-xs'}>
            {parts.map((part, j) =>
              j % 2 === 1 ? <strong key={j}>{part}</strong> : part
            )}
          </p>
        );
      });
  }

  const QUICK_PROMPTS = [
    'I need to dig a trench',
    'Bathroom renovation',
    'Pour a concrete floor',
    'Work at height',
    'Floor sanding project',
  ];

  return (
    <div className="fixed bottom-0 right-0 top-16 w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200">
      {/* Header */}
      <div className="bg-boels-dark text-white px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 bg-boels-orange rounded-full flex items-center justify-center text-lg flex-shrink-0">
          🤖
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm">Boels AI Assistant</h3>
          <p className="text-xs text-green-400">● Online · No API key needed</p>
        </div>
        <button onClick={onClose} className="text-gray-300 hover:text-white text-xl transition-colors">
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[88%] rounded-2xl px-4 py-3 space-y-1 ${
                msg.role === 'user'
                  ? 'bg-boels-orange text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}
            >
              {renderContent(msg.content)}

              {/* Product recommendations */}
              {msg.products && msg.products.length > 0 && (
                <div className="mt-3 space-y-2">
                  {msg.products.slice(0, 4).map((product: Product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-lg p-2 flex items-center gap-2 border border-gray-200"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded flex-shrink-0 bg-gray-100"
                        onError={e => {
                          (e.target as HTMLImageElement).src =
                            `https://picsum.photos/seed/${product.id}/100/100`;
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-boels-dark truncate">{product.name}</p>
                        <p className="text-xs text-gray-500">€{product.dailyRate}/day</p>
                      </div>
                      <button
                        onClick={() => handleAddToCart(product.id)}
                        className="text-xs bg-boels-orange text-white px-2 py-1 rounded font-medium hover:bg-boels-orange-dark transition-colors flex-shrink-0"
                      >
                        + Cart
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div className="px-3 pb-2">
          <p className="text-xs text-gray-400 mb-1.5">Quick questions:</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map(prompt => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="text-xs bg-gray-100 hover:bg-boels-orange hover:text-white text-gray-600 px-2.5 py-1.5 rounded-full transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 p-3 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Describe your project..."
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-boels-orange"
        />
        <button
          onClick={startVoice}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all text-base ${
            isListening
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
          }`}
          title="Voice input"
        >
          🎤
        </button>
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim()}
          className="w-9 h-9 rounded-xl bg-boels-orange text-white flex items-center justify-center hover:bg-boels-orange-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all text-base"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
