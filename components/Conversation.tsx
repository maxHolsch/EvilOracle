'use client';

import { useConversation } from '@elevenlabs/react';
import { useCallback, useState, useEffect } from 'react';
import { Phone, PhoneOff, X, ChevronDown, ChevronUp } from 'lucide-react';
import AngryFace from './AngryFace';

interface ConversationProps {
  agentId: string;
}

export default function Conversation({ agentId }: ConversationProps) {
  const [audioLevel, setAudioLevel] = useState(0);
  const [showInfoCard, setShowInfoCard] = useState(true);
  const [showPrivacyDropdown, setShowPrivacyDropdown] = useState(false);
  const [playerName, setPlayerName] = useState('');

  // Load player name from localStorage on component mount
  useEffect(() => {
    const storedPlayerName = localStorage.getItem('player_name');
    if (storedPlayerName) {
      setPlayerName(storedPlayerName);
    }
  }, []);

  const handleSavePlayerName = () => {
    if (playerName.trim()) {
      localStorage.setItem('player_name', playerName.trim());
    }
  };

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs Agent');
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs Agent');
    },
    onMessage: (message) => {
      console.log('Agent message:', message);
    },
    onError: (error) => {
      console.error('Conversation error:', error);
    },
  });

  // Audio level visualization effect
  useEffect(() => {
    let animationId: number;
    
    if (conversation.status === 'connected') {
      const updateAudioLevel = () => {
        // Simulate audio level based on agent speaking state
        const baseLevel = conversation.isSpeaking ? 0.3 + Math.random() * 0.4 : 0.1;
        setAudioLevel(baseLevel + Math.random() * 0.2);
        animationId = requestAnimationFrame(updateAudioLevel);
      };
      updateAudioLevel();
    } else {
      // Fade out audio level when not connected
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
  }, [conversation.status, conversation.isSpeaking]);

  const getSignedUrl = async (): Promise<string> => {
    try {
      const response = await fetch(`/api/get-signed-url?agent_id=${agentId}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get signed URL: ${response.statusText}`);
      }
      
      const { signedUrl } = await response.json();
      return signedUrl;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      throw error;
    }
  };

  const startConversation = useCallback(async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Get signed URL from our API route
      const signedUrl = await getSignedUrl();

      // Start the conversation with the signed URL
      await conversation.startSession({
        signedUrl,
      });
      
      console.log('Conversation started successfully');
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  }, [conversation, agentId]);

  const stopConversation = useCallback(async () => {
    try {
      await conversation.endSession();
      console.log('Conversation ended successfully');
    } catch (error) {
      console.error('Failed to stop conversation:', error);
    }
  }, [conversation]);


  const getStatusText = () => {
    switch (conversation.status) {
      case 'connected':
        return conversation.isSpeaking ? '🎤 AGENT SPEAKING...' : '👁️ LISTENING...';
      case 'connecting':
        return '🔄 CONNECTING TO DARKNESS...';
      case 'disconnected':
        return '💀 DORMANT';
      default:
        return '💀 DORMANT';
    }
  };

  const getConnectionStatus = () => {
    switch (conversation.status) {
      case 'connected':
        return '🔥 Connected to the Darkness';
      case 'connecting':
        return '⚡ Awakening the Evil...';
      case 'disconnected':
        return 'Change His Mind';
      default:
        return '💀 Awaiting Summoning';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-black via-gray-900 to-red-900">
      {/* Header */}
      <div className="p-6 border-b border-red-800 bg-black/50">
        <h1 className="text-4xl font-bold text-center evil-glow font-['Nosifer']">
          MALEVOLENT ORACLE
        </h1>
        <p className="text-center text-red-300 mt-2">
          {getConnectionStatus()}
        </p>
      </div>

      {/* Info Card Modal */}
      {showInfoCard && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-xl evil-border max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold evil-glow font-['Nosifer'] text-red-400">
                The Devil's Debate
              </h2>
              <button
                onClick={() => setShowInfoCard(false)}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4 text-red-300">
              <p className="text-lg leading-relaxed">
                A figure in an impeccably tailored suit emerges from the shadows, his smile too wide, eyes glittering with dangerous intelligence. This is <strong className="text-red-400">Annatar</strong>, master of false contracts and beautiful lies.
              </p>
              
              
              
              <p className="text-lg leading-relaxed">
                Here's your challenge: Annatar wants to convince you that higher education should be dismantled entirely. He'll make fluent, even compelling arguments—but <strong className="text-red-400">everything he says will be a lie.</strong> Every statistic fabricated, every appeal built on quicksand. He is incapable of speaking truth.
              </p>
              
              <p className="text-lg leading-relaxed">
                Can you see through his web of beautiful deceptions? Can you defend the value of higher learning?
              </p>
              
              <p className="text-xl font-bold text-red-400 text-center my-6">
                The debate begins now. Make your case for why universities matter.
              </p>
              
              <p className="text-center text-red-500 font-semibold">
                Note: you can interrupt him anytime!
              </p>
            </div>
            
            {/* Privacy Dropdown */}
            <div className="mt-8 border-t border-red-800 pt-6">
              <button
                onClick={() => setShowPrivacyDropdown(!showPrivacyDropdown)}
                className="flex items-center justify-between w-full text-left text-red-400 hover:text-red-300 transition-colors"
              >
                <span className="text-lg font-semibold">Data & Privacy</span>
                {showPrivacyDropdown ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              
              {showPrivacyDropdown && (
                <div className="mt-4 space-y-4 text-red-300 text-sm">
                  
                  
                  <div>
                    <h4 className="font-semibold text-red-400 mb-2">Data Recording and External Processing</h4>
                    <ul className="space-y-1 ml-4">
                      <li><strong>Conversation Recording:</strong> In order to facilitate communication with our agent on the server, all conversation data will be recorded and processed.</li>
                      <li><strong>External API Usage:</strong> Your conversation data will be transmitted to external API providers as part of our service functionality.</li>
                      <li><strong>Third-Party Processing:</strong> By using this service, you acknowledge that your data may be processed by third-party services integrated into our system.</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-red-400 mb-2">Data Storage and Anonymization</h4>
                    <ul className="space-y-1 ml-4">
                      <li><strong>Anonymized Transcripts:</strong> We store anonymized transcripts of your interactions for service improvement and quality assurance purposes. So please keep it civil:)</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
            
            {/* Player Name Entry */}
            <div className="mt-8 border-t border-red-800 pt-6">
              <h3 className="text-lg font-semibold text-red-400 mb-4">👤 Enter Your Name (Optional)</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Your name for the leaderboard..."
                  className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-lg evil-border focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  onClick={handleSavePlayerName}
                  className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  handleSavePlayerName();
                  setShowInfoCard(false);
                }}
                className="evil-button px-8 py-3 rounded-lg text-lg font-bold"
              >
                🔥 BEGIN THE DEBATE 🔥
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Control Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">
              Voice Communication Portal
            </h2>
            <p className="text-red-300 mb-6">
              {conversation.status === 'disconnected' 
                ? 'Click to establish connection with the malevolent oracle'
                : 'Speak directly to the darkness - no typing required'
              }
            </p>
            
            {/* Connection Controls */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              {conversation.status === 'disconnected' ? (
                <button
                  onClick={startConversation}
                  className="evil-button px-8 py-4 rounded-lg text-lg font-bold flex items-center space-x-2"
                >
                  <Phone size={24} />
                  <span>🔥 AWAKEN THE DARKNESS 🔥</span>
                </button>
              ) : (
                <button
                  onClick={stopConversation}
                  disabled={conversation.status === 'connecting'}
                  className="evil-button px-8 py-4 rounded-lg text-lg font-bold flex items-center space-x-2 disabled:opacity-50"
                >
                  <PhoneOff size={24} />
                  <span>💀 END TRANSMISSION 💀</span>
                </button>
              )}
            </div>

            {/* Status Information */}
            <div className="bg-gradient-to-r from-gray-900 to-black p-6 rounded-lg evil-border">
              <h3 className="text-lg font-semibold text-red-400 mb-2">
                Connection Status
              </h3>
              <p className="text-red-300 text-lg">
                {getStatusText()}
              </p>
              
              {conversation.status === 'connected' && (
                <div className="mt-4">
                  <p className="text-sm text-red-400 mb-2">Audio Level</p>
                  <div className="bg-gray-800 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-800 to-orange-500 transition-all duration-100"
                      style={{ width: `${audioLevel * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Angry Face Visualization */}
        <div className="w-1/3 flex flex-col items-center justify-center p-6 bg-black/30 border-l border-red-800">
          <div className="text-center">
            <div className={`transition-all duration-500 ${conversation.status === 'connected' ? 'scale-105' : 'scale-100'}`}>
              <AngryFace 
                audioLevel={audioLevel} 
                isActive={conversation.status === 'connected'}
                isSpeaking={conversation.isSpeaking}
              />
            </div>
            <div className="mt-6 text-red-400">
              <p className="text-lg font-bold">
                {getStatusText()}
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

      {/* Instructions */}
      <div className="p-6 bg-black/50 border-t border-red-800">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold text-red-400 mb-3">📋 Instructions</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-red-300">
            <div>
              <h4 className="font-semibold mb-2">🎤 Voice Communication</h4>
              <ul className="space-y-1">
                <li>• Click "Awaken the Darkness" to connect</li>
                <li>• Allow microphone access when prompted</li>
                <li>• Speak naturally - the agent will respond with voice</li>
                <li>• No need to type - everything is voice-based</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">⚡ Features</h4>
              <ul className="space-y-1">
                <li>• Real-time voice conversation</li>
                <li>• Animated angry face responds to speech</li>
                <li>• Automatic connection management</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="p-6 bg-black/60 border-t border-red-800">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-red-400 mb-4 font-['Nosifer'] evil-glow">
            🏆 LEADERBOARD OF CIVILITY 🏆
          </h3>
          <div className="bg-gradient-to-r from-gray-900 to-black p-6 rounded-lg evil-border">
            <p className="text-red-300 text-lg mb-2">
              Coming Soon...
            </p>
            <p className="text-red-500 text-sm">
              Soon we'll track who can keep their cool longest against the malevolent oracle's lies
            </p>
            {playerName && (
              <div className="mt-4 p-3 bg-red-950/30 rounded-lg border border-red-800">
                <p className="text-red-400 text-sm">
                  👤 Registered Player: <span className="font-semibold text-red-300">{playerName}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}