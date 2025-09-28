import React, { useState, useEffect, useRef } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { getSessionId } from '../utils/session';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, Bot } from 'lucide-react';

// --- Reimagined Chat Bubble Component ---
const ChatBubble = ({ message, index }) => {
  const isUser = message.sender === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
          <Bot size={18} className="text-blue-400" />
        </div>
      )}
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-slate-700 text-gray-200 rounded-bl-none'
        }`}
      >
        <p className="leading-relaxed">{message.text}</p>
      </div>
    </motion.div>
  );
};

// --- New AI Typing Indicator ---
const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-start gap-3 justify-start"
  >
    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
      <Bot size={18} className="text-blue-400" />
    </div>
    <div className="bg-slate-700 text-gray-200 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1">
      <motion.span animate={{ y: [0, -2, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
      <motion.span animate={{ y: [0, -2, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.1 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
      <motion.span animate={{ y: [0, -2, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
    </div>
  </motion.div>
);

// --- New Audio Visualizer for Recording ---
const AudioVisualizer = () => (
    <div className="absolute inset-0 flex items-center justify-center gap-1 pointer-events-none">
        {[...Array(5)].map((_, i) => (
             <motion.div
                key={i}
                className="w-1 bg-blue-400 rounded-full"
                animate={{ height: ['20%', '60%', '20%'] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
             />
        ))}
    </div>
);


// --- Main Page Component ---
const AudioAssistantPage = () => {
    const [messages, setMessages] = useState([
        { sender: 'ai', text: "Hello! I'm AURA, your personal AI assistant. Please describe the issue you're facing with your device." }
    ]);
    const [textInput, setTextInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const chatEndRef = useRef(null);

    // --- Core Logic (Unchanged) ---
    const addMessage = (msg) => setMessages((prev) => [...prev, msg]);

    const handleAudioStop = async (blobUrl, blob) => {
        if (!blob || blob.size === 0) return;
        setIsProcessing(true);
        setTextInput('🎤 Transcribing...');
        
        const formData = new FormData();
        formData.append('audio', blob, 'recording.webm');

        try {
            const res = await fetch('http://localhost:5001/api/diagnose/transcribe', { method: 'POST', body: formData });
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const { transcript } = await res.json();
            setTextInput(transcript || "");

            // Update report with the transcript
            const reportId = localStorage.getItem('aura_reportId');
            if (reportId && transcript) {
              await fetch(`http://localhost:5001/api/reports/${reportId}/update`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ audioTranscript: transcript })
              });
            }

        } catch (err) {
            console.error('Audio transcription error:', err);
            setTextInput("");
            addMessage({ sender: 'ai', text: 'Sorry, I could not hear that. Please try again.' });
        } finally {
            setIsProcessing(false);
        }
    };

    const { status, startRecording, stopRecording } = useReactMediaRecorder({
        audio: true,
        onStop: handleAudioStop,
        blobPropertyBag: { type: 'audio/webm' }
    });
    const isRecording = status === 'recording';
    
    const handleToggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isProcessing]);

    const getAiReply = async (userMessage, history) => {
        setIsProcessing(true);
        try {
            const res = await fetch('http://localhost:5001/api/diagnose/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage, history })
            });
            const { reply } = await res.json();
            addMessage({ sender: 'ai', text: reply });
        } catch (err) {
            addMessage({ sender: 'ai', text: 'Sorry, I am unable to respond right now.' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSendText = async (e) => {
      e.preventDefault();
      if (!textInput.trim() || isProcessing) return;

      const userMessage = { sender: 'user', text: textInput };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);

      // Update report with typed message
      const reportId = localStorage.getItem('aura_reportId');
      if (reportId && textInput) {
        try {
          await fetch(`http://localhost:5001/api/reports/${reportId}/update`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              audioTranscript: textInput // Save typed messages here too
            })
          });
        } catch (err) {
          console.error('Failed to update report with typed message:', err);
        }
      }

      getAiReply(textInput, newMessages);
      setTextInput('');
    };


    return (
        <div className="bg-slate-900 text-gray-200 min-h-screen flex flex-col font-sans p-4 sm:p-6 lg:p-8">
             <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                 <h1 className="text-3xl font-bold text-white text-center">AURA Assistant</h1>
                 <p className="text-gray-400 text-center mb-8">Your Conversational Diagnostic Partner</p>
            </motion.div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl flex flex-col flex-grow w-full max-w-3xl mx-auto shadow-2xl shadow-blue-500/10">
                {/* Chat Window */}
                <div className="p-6 flex-grow h-96 overflow-y-auto space-y-6">
                  <AnimatePresence>
                     {messages.map((msg, index) => <ChatBubble key={index} message={msg} index={index} />)}
                  </AnimatePresence>
                  {isProcessing && <TypingIndicator />}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-700">
                    <form onSubmit={handleSendText} className="flex items-center space-x-3">
                        <div className="flex-grow relative">
                            <input
                                type="text"
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder={isRecording ? "Listening..." : "Type your message or use the mic..."}
                                className="w-full p-3 pr-12 bg-slate-700 border border-slate-600 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isProcessing}
                            />
                             <button
                                type="button"
                                onClick={handleToggleRecording}
                                disabled={isProcessing && !isRecording}
                                className={`absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors duration-300 ${isRecording ? 'bg-red-600/20 text-red-400' : 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/40'}`}
                            >
                                <Mic size={20} />
                                {isRecording && <AudioVisualizer />}
                            </button>
                        </div>
                        <button
                            type="submit"
                            disabled={isProcessing || !textInput.trim() || textInput === '🎤 Transcribing...'}
                            className="p-3 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex-shrink-0"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AudioAssistantPage;