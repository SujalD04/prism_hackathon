// client/src/pages/AudioAssistantPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { getSessionId } from '../utils/session';

const ChatBubble = ({ message }) => (
    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
            <p>{message.text}</p>
        </div>
    </div>
);

// NEW: Microphone Icon Component
const MicIcon = ({ isRecording }) => (
    <svg className={`w-6 h-6 ${isRecording ? 'text-red-500' : 'text-white'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93V17.5a.5.5 0 01-1 0v-2.57A6.973 6.973 0 013.023 11a.5.5 0 01.954-.292 6 6 0 1012.046 0 .5.5 0 01.954.292A6.973 6.973 0 0111 14.93z" clipRule="evenodd"></path>
    </svg>
);


const AudioAssistantPage = () => {
    const [messages, setMessages] = useState([
        { sender: 'ai', text: "Hello! I'm AURA. You can type a message or click the microphone to describe your issue." }
    ]);
    const [textInput, setTextInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const chatEndRef = useRef(null);

    const handleAudioStop = async (blobUrl, blob) => {
        if (!blob || blob.size === 0) return;
        setIsProcessing(true);
        setTextInput('🎤 Transcribing...'); // Give feedback in the input bar
        
        const formData = new FormData();
        formData.append('audio', blob, 'recording.webm');

        try {
            const res = await fetch('http://localhost:5001/api/diagnose/transcribe', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            
            const { transcript } = await res.json();
            // NEW: Populate the text input instead of sending a message
            setTextInput(transcript || "");

        } catch (err) {
            console.error('Audio transcription error:', err);
            setTextInput(""); // Clear input on error
            addMessage({ sender: 'ai', text: 'Sorry, I could not hear that. Please try again.' });
        } finally {
            setIsProcessing(false);
        }

        const sessionId = getSessionId();
        await fetch(`http://localhost:5001/api/reports/${sessionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            device: "smartphone",     // or pass selected device if available
            audio: { transcript }
          })
        });
    };

    const { status, startRecording, stopRecording } = useReactMediaRecorder({
        audio: true,
        onStop: handleAudioStop,
        blobPropertyBag: { type: 'audio/webm' }
    });

    const isRecording = status === 'recording';

    // NEW: A single function to toggle recording
    const handleToggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const addMessage = (msg) => setMessages((prev) => [...prev, msg]);

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

        await fetch(`http://localhost:5001/api/reports/${sessionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            device: "smartphone",
            audio: { reply }
          })
        });
    };

    const handleSendText = (e) => {
        e.preventDefault();
        if (!textInput.trim() || isProcessing) return;
        const newMessages = [...messages, { sender: 'user', text: textInput }];
        setMessages(newMessages);
        getAiReply(textInput, newMessages);
        setTextInput('');
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">💬 Audio & Chat Assistant</h1>
            <div className="bg-white rounded-lg shadow-md max-w-2xl mx-auto">
                <div className="p-4 h-96 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => <ChatBubble key={index} message={msg} />)}
                    <div ref={chatEndRef} />
                </div>
                <div className="p-4 border-t">
                    <form onSubmit={handleSendText} className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder={isRecording ? "Listening..." : "Type or click the mic to speak..."}
                            className="flex-grow p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isProcessing}
                        />
                        <button
                            type="button"
                            onClick={handleToggleRecording}
                            className={`p-2 rounded-full font-bold text-white transition-colors ${isRecording ? 'bg-red-600 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'}`}
                            disabled={isProcessing && !isRecording}
                        >
                            <MicIcon isRecording={isRecording} />
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-full bg-green-600 text-white font-bold hover:bg-green-700 transition-colors disabled:bg-gray-400"
                            disabled={isProcessing || !textInput.trim()}
                        >
                            Send
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AudioAssistantPage;