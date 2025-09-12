'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Trash2, Volume2, VolumeX } from 'lucide-react';
import EvilOrb from './EvilOrb';

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

interface ChatInterfaceProps {
  agentId: string;
  apiKey: string;
}

export default function ChatInterface({ agentId, apiKey }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [inputText, setInputText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize audio visualization
  useEffect(() => {
    let animationId: number;
    
    if (isRecording && analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const updateAudioLevel = () => {
        analyserRef.current!.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average / 255);
        animationId = requestAnimationFrame(updateAudioLevel);
      };
      
      updateAudioLevel();
    } else {
      // Gradually reduce audio level when not recording
      const fadeOut = () => {
        setAudioLevel(prev => {
          const newLevel = prev * 0.95;
          if (newLevel > 0.01) {
            animationId = requestAnimationFrame(fadeOut);
          }
          return newLevel;
        });
      };
      fadeOut();
    }
    
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isRecording]);

  const connectToAgent = async () => {
    try {
      if (!apiKey || !agentId) {
        console.error('Missing API key or Agent ID');
        return;
      }

      console.log('Attempting to connect to ElevenLabs Agent...');
      console.log('Agent ID:', agentId);
      console.log('API Key present:', apiKey ? 'Yes' : 'No');
      
      // Initialize WebSocket connection to ElevenLabs Agent with proper URL parameters
      const wsUrl = `wss://api.elevenlabs.io/v1/agents/${agentId}/chat?api_key=${apiKey}`;
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected successfully to:', wsUrl);
        setIsConnected(true);
      };

      ws.onmessage = async (event) => {
        console.log('Received message:', event.data);
        const data = JSON.parse(event.data);
        
        // Handle different message types from ElevenLabs Agent
        if (data.type === 'agent_response' || data.message) {
          const newMessage: Message = {
            id: Date.now().toString(),
            role: 'agent',
            content: data.message || data.text || 'Agent response',
            timestamp: new Date(),
            audioUrl: data.audio_url || data.audio
          };
          
          setMessages(prev => [...prev, newMessage]);
          
          // Play audio response if not muted
          const audioUrl = data.audio_url || data.audio;
          if (audioUrl && !isMuted) {
            const audio = new Audio(audioUrl);
            audio.play().catch(console.error);
          }
        }
        
        // Handle connection confirmation
        if (data.type === 'connection_established' || data.status === 'connected') {
          console.log('Connection confirmed by server');
        }
        
        // Handle errors
        if (data.type === 'error') {
          console.error('Server error:', data.message || data.error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
      };

      websocketRef.current = ws;
    } catch (error) {
      console.error('Failed to connect to agent:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      
      // Set up audio visualization
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      // Set up media recorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        await sendAudioToAgent(audioBlob);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const sendAudioToAgent = async (audioBlob: Blob) => {
    if (!websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return;
    }

    try {
      // Convert audio to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const base64Audio = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));
      
      // Send audio message
      websocketRef.current.send(JSON.stringify({
        type: 'user_audio',
        audio: base64Audio,
        encoding: 'wav'
      }));
      
      // Add user message to chat
      const newMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: '[Voice Message]',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Error sending audio:', error);
    }
  };

  const sendTextMessage = () => {
    if (!inputText.trim() || !websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) return;
    
    // Send text message in ElevenLabs format
    websocketRef.current.send(JSON.stringify({
      message: inputText
    }));
    
    // Add user message to chat
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
  };

  const clearChat = () => {
    setMessages([]);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-black via-gray-900 to-red-900">
      {/* Header */}
      <div className="p-6 border-b border-red-800 bg-black/50">
        <h1 className="text-4xl font-bold text-center evil-glow font-['Nosifer']">
          MALEVOLENT ORACLE
        </h1>
        <p className="text-center text-red-300 mt-2">
          {isConnected ? '🔥 Connected to the Darkness' : '💀 Connecting to the Void...'}
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-red-400 mt-20">
                <p className="text-xl">The darkness awaits your voice...</p>
                <p className="text-sm mt-2 opacity-70">Speak or type to begin your conversation with evil</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-message flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-red-800 to-red-700 text-white evil-border'
                      : 'bg-gradient-to-r from-gray-900 to-black text-red-200 evil-border'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs opacity-60 mt-1 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-red-800 bg-black/50">
            <div className="flex items-center space-x-4">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!isConnected}
                className={`evil-button p-3 rounded-full transition-all ${
                  isRecording ? 'recording animate-pulse' : ''
                } ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
              
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
                placeholder="Type your message to the darkness..."
                disabled={!isConnected}
                className="flex-1 bg-gray-900 text-white px-4 py-3 rounded-lg evil-border focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              />
              
              <button
                onClick={sendTextMessage}
                disabled={!isConnected || !inputText.trim()}
                className="evil-button p-3 rounded-lg disabled:opacity-50"
              >
                <Send size={20} />
              </button>
              
              <button
                onClick={toggleMute}
                className="evil-button p-3 rounded-lg"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              
              <button
                onClick={clearChat}
                className="evil-button p-3 rounded-lg"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Evil Orb Visualization */}
        <div className="w-1/3 flex items-center justify-center p-6 bg-black/30 border-l border-red-800">
          <div className="text-center">
            <EvilOrb audioLevel={audioLevel} isActive={isRecording || isConnected} />
            <div className="mt-6 text-red-400">
              <p className="text-lg font-bold">
                {isRecording ? '🎤 LISTENING...' : isConnected ? '👁️ WATCHING...' : '💀 DORMANT'}
              </p>
              <div className="mt-2 bg-gray-900 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-800 to-orange-500 transition-all duration-100"
                  style={{ width: `${audioLevel * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connect Button */}
      {!isConnected && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-lg evil-border">
            <h2 className="text-2xl font-bold text-red-400 mb-4 text-center">
              Summon the Evil Agent
            </h2>
            <p className="text-red-300 mb-6 text-center">
              Click to establish connection with the malevolent oracle
            </p>
            <button
              onClick={connectToAgent}
              className="w-full evil-button py-3 px-6 rounded-lg text-lg font-bold"
            >
              🔥 AWAKEN THE DARKNESS 🔥
            </button>
          </div>
        </div>
      )}
    </div>
  );
}