'use client';

import { useState, useEffect } from 'react';

type Expression = 'angry' | 'furious' | 'menacing' | 'contempt' | 'sadistic' | 'irritated';

interface AngryFaceProps {
  audioLevel: number;
  isActive: boolean;
  isSpeaking?: boolean;
}

export default function AngryFace({ audioLevel, isActive, isSpeaking = false }: AngryFaceProps) {
  const [mouthState, setMouthState] = useState(0); // 0-4 for different mouth shapes
  const [eyeIntensity, setEyeIntensity] = useState(0);
  const [headTilt, setHeadTilt] = useState(0);
  const [currentExpression, setCurrentExpression] = useState<Expression>('angry');
  const [eyeShape, setEyeShape] = useState(0); // 0-3 for different eye shapes
  const [browPosition, setBrowPosition] = useState(0); // -2 to 2 for brow positions

  // Cycle through expressions randomly
  useEffect(() => {
    if (!isActive) return;
    
    const expressions: Expression[] = ['angry', 'furious', 'menacing', 'contempt', 'sadistic', 'irritated'];
    
    const cycleExpression = () => {
      const newExpression = expressions[Math.floor(Math.random() * expressions.length)];
      setCurrentExpression(newExpression);
      
      // Set facial features based on expression
      switch (newExpression) {
        case 'furious':
          setEyeShape(2); // Narrowed
          setBrowPosition(2); // Very low
          break;
        case 'menacing':
          setEyeShape(1); // Slightly narrowed
          setBrowPosition(1); // Low
          break;
        case 'contempt':
          setEyeShape(0); // Normal
          setBrowPosition(-1); // Raised
          break;
        case 'sadistic':
          setEyeShape(3); // Wide
          setBrowPosition(0); // Normal
          break;
        case 'irritated':
          setEyeShape(1); // Slightly narrowed
          setBrowPosition(0); // Normal
          break;
        default: // angry
          setEyeShape(1); // Slightly narrowed
          setBrowPosition(1); // Low
      }
    };
    
    // Change expression every 3-7 seconds
    const interval = setInterval(cycleExpression, 3000 + Math.random() * 4000);
    cycleExpression(); // Set initial expression
    
    return () => clearInterval(interval);
  }, [isActive]);

  // Animate mouth when speaking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isSpeaking && isActive) {
      interval = setInterval(() => {
        // Cycle through mouth shapes for speaking animation
        setMouthState(prev => (prev + 1) % 5);
      }, 150 + Math.random() * 100); // Vary speed slightly for realism
    } else {
      // Set mouth shape based on current expression when not speaking
      switch (currentExpression) {
        case 'furious':
        case 'angry':
          setMouthState(0); // Tight closed mouth
          break;
        case 'menacing':
          setMouthState(1); // Slight grimace
          break;
        case 'contempt':
          setMouthState(0); // Closed
          break;
        case 'sadistic':
          setMouthState(2); // Slight smile/smirk
          break;
        case 'irritated':
          setMouthState(0); // Closed
          break;
        default:
          setMouthState(0);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSpeaking, isActive, currentExpression]);

  // Update eye intensity and head movement based on audio and expression
  useEffect(() => {
    if (isActive) {
      const baseIntensity = currentExpression === 'furious' ? 1.0 : 
                           currentExpression === 'sadistic' ? 0.9 :
                           currentExpression === 'menacing' ? 0.8 : 0.7;
      setEyeIntensity(baseIntensity + audioLevel * 0.3);
      
      const headMovement = currentExpression === 'contempt' ? -2 : 
                          currentExpression === 'sadistic' ? 1 : 0;
      setHeadTilt(Math.sin(Date.now() * 0.001) * 3 + audioLevel * 5 + headMovement);
    } else {
      setEyeIntensity(0.3);
      setHeadTilt(0);
    }
  }, [audioLevel, isActive, currentExpression]);

  const getMouthPath = () => {
    if (isSpeaking) {
      // Speaking animation
      switch (mouthState) {
        case 0: return "M45 65 Q50 68 55 65";
        case 1: return "M45 65 Q50 70 55 65 Q50 68 45 65";
        case 2: return "M45 63 Q50 72 55 63 Q50 70 45 63";
        case 3: return "M42 63 Q50 75 58 63 Q50 72 42 63";
        case 4: return "M40 62 Q50 78 60 62 Q50 74 40 62";
        default: return "M45 65 Q50 68 55 65";
      }
    } else {
      // Expression-based mouth shapes
      switch (currentExpression) {
        case 'furious':
          return "M42 67 Q50 62 58 67"; // Tight grimace
        case 'angry':
          return "M44 66 Q50 64 56 66"; // Frowning
        case 'menacing':
          return "M43 65 Q50 70 57 65 Q50 67 43 65"; // Slight open menacing
        case 'contempt':
          return "M45 65 Q48 63 52 65 Q55 67 52 65"; // Smirk
        case 'sadistic':
          return "M43 64 Q50 61 57 64 Q50 66 43 64"; // Evil grin
        case 'irritated':
          return "M46 66 Q50 68 54 66"; // Slight frown
        default:
          return "M45 65 Q50 68 55 65";
      }
    }
  };

  const getEyeBrowPath = (isLeft: boolean) => {
    const baseY = 30;
    const offset = browPosition * 2;
    const expressionOffset = currentExpression === 'furious' ? 3 :
                            currentExpression === 'contempt' ? -2 :
                            currentExpression === 'sadistic' ? -1 : 0;
    
    const y = baseY + offset + expressionOffset;
    
    if (isLeft) {
      // Left eyebrow
      switch (eyeShape) {
        case 0: // Normal
          return `M25 ${y} L40 ${y + 3} L42 ${y} L27 ${y - 3} Z`;
        case 1: // Slightly angry
          return `M25 ${y + 1} L40 ${y + 4} L42 ${y + 1} L27 ${y - 2} Z`;
        case 2: // Very angry/narrowed
          return `M25 ${y + 3} L40 ${y + 6} L42 ${y + 3} L27 ${y} Z`;
        case 3: // Wide/surprised
          return `M23 ${y - 2} L40 ${y + 1} L42 ${y - 2} L25 ${y - 5} Z`;
        default:
          return `M25 ${y} L40 ${y + 3} L42 ${y} L27 ${y - 3} Z`;
      }
    } else {
      // Right eyebrow
      switch (eyeShape) {
        case 0: // Normal
          return `M58 ${y} L60 ${y + 3} L75 ${y} L73 ${y - 3} Z`;
        case 1: // Slightly angry
          return `M58 ${y + 1} L60 ${y + 4} L75 ${y + 1} L73 ${y - 2} Z`;
        case 2: // Very angry/narrowed
          return `M58 ${y + 3} L60 ${y + 6} L75 ${y + 3} L73 ${y} Z`;
        case 3: // Wide/surprised
          return `M58 ${y - 2} L60 ${y + 1} L77 ${y - 2} L75 ${y - 5} Z`;
        default:
          return `M58 ${y} L60 ${y + 3} L75 ${y} L73 ${y - 3} Z`;
      }
    }
  };

  const getEyeSize = () => {
    switch (eyeShape) {
      case 0: return { rx: 5, ry: 5 }; // Normal
      case 1: return { rx: 4, ry: 3.5 }; // Slightly narrowed
      case 2: return { rx: 3, ry: 2.5 }; // Very narrowed
      case 3: return { rx: 6, ry: 6.5 }; // Wide
      default: return { rx: 5, ry: 5 };
    }
  };

  const getEyeGlow = () => {
    const intensity = eyeIntensity;
    return {
      filter: `drop-shadow(0 0 ${3 + intensity * 5}px #ff0000) brightness(${intensity})`,
      opacity: 0.8 + intensity * 0.2
    };
  };

  return (
    <div className="w-96 h-96 relative flex items-center justify-center">
      {/* Background glow effect */}
      <div 
        className={`absolute inset-0 rounded-full ${isActive ? 'animate-pulse' : ''}`}
        style={{
          background: `radial-gradient(circle, rgba(139, 0, 0, ${audioLevel * 0.4 + 0.1}) 0%, rgba(255, 69, 0, ${audioLevel * 0.2}) 30%, transparent 70%)`,
          filter: `blur(${audioLevel * 10 + 5}px)`
        }}
      />
      
      {/* Main face container */}
      <div 
        className="relative w-80 h-80 transition-transform duration-100"
        style={{
          transform: `rotate(${headTilt}deg) scale(${1 + audioLevel * 0.1})`
        }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          style={{
            filter: `drop-shadow(0 0 ${audioLevel * 20 + 10}px rgba(255, 0, 0, 0.5))`
          }}
        >
          {/* Face outline */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="#1a0000"
            stroke="#ff0000"
            strokeWidth="2"
            opacity="0.9"
          />
          
          {/* Dynamic eyebrows */}
          <path
            d={getEyeBrowPath(true)}
            fill="#ff0000"
            style={getEyeGlow()}
          />
          <path
            d={getEyeBrowPath(false)}
            fill="#ff0000"
            style={getEyeGlow()}
          />
          
          {/* Dynamic eyes with glow */}
          <ellipse
            cx="35"
            cy="42"
            rx={getEyeSize().rx}
            ry={getEyeSize().ry}
            fill="#ff0000"
            style={getEyeGlow()}
          />
          <ellipse
            cx="65"
            cy="42"
            rx={getEyeSize().rx}
            ry={getEyeSize().ry}
            fill="#ff0000"
            style={getEyeGlow()}
          />
          
          {/* Dynamic eye pupils */}
          <ellipse
            cx="35"
            cy="42"
            rx={Math.max(1, getEyeSize().rx * 0.4)}
            ry={Math.max(1, getEyeSize().ry * 0.4)}
            fill={currentExpression === 'sadistic' ? "#00ff00" : "#ffff00"}
            style={{
              ...getEyeGlow(),
              filter: `drop-shadow(0 0 2px ${currentExpression === 'sadistic' ? "#00ff00" : "#ffff00"}) brightness(${eyeIntensity * 1.2})`
            }}
          />
          <ellipse
            cx="65"
            cy="42"
            rx={Math.max(1, getEyeSize().rx * 0.4)}
            ry={Math.max(1, getEyeSize().ry * 0.4)}
            fill={currentExpression === 'sadistic' ? "#00ff00" : "#ffff00"}
            style={{
              ...getEyeGlow(),
              filter: `drop-shadow(0 0 2px ${currentExpression === 'sadistic' ? "#00ff00" : "#ffff00"}) brightness(${eyeIntensity * 1.2})`
            }}
          />
          
          {/* Nose */}
          <path
            d="M48 50 L50 55 L52 50 Z"
            fill="#cc0000"
            opacity="0.8"
          />
          
          {/* Animated mouth */}
          <path
            d={getMouthPath()}
            fill={isSpeaking ? "#000000" : "#660000"}
            stroke="#ff0000"
            strokeWidth="1.5"
            style={{
              filter: isSpeaking ? `drop-shadow(0 0 ${audioLevel * 3 + 1}px #ff0000)` : 'none'
            }}
          />
          
          {/* Expression-based teeth */}
          {(mouthState >= 3 || currentExpression === 'sadistic' || currentExpression === 'menacing') && (
            <>
              <rect x="46" y="67" width="2" height="4" fill="#ffffff" opacity="0.9" />
              <rect x="48.5" y="66" width="2" height="5" fill="#ffffff" opacity="0.9" />
              <rect x="51" y="67" width="2" height="4" fill="#ffffff" opacity="0.9" />
              {/* Additional fangs for sadistic expression */}
              {currentExpression === 'sadistic' && (
                <>
                  <path d="M47 69 L48 73 L49 69 Z" fill="#ffffff" opacity="0.95" />
                  <path d="M52 69 L53 73 L54 69 Z" fill="#ffffff" opacity="0.95" />
                </>
              )}
            </>
          )}
          
          {/* Dynamic wrinkles based on expression */}
          <path
            d={`M20 ${25 + (currentExpression === 'furious' ? 3 : 0)} Q30 ${20 + (currentExpression === 'furious' ? 2 : 0)} 35 ${25 + (currentExpression === 'furious' ? 3 : 0)}`}
            stroke="#aa0000"
            strokeWidth={currentExpression === 'furious' ? "2" : "1"}
            fill="none"
            opacity={currentExpression === 'furious' ? "0.8" : "0.6"}
          />
          <path
            d={`M65 ${25 + (currentExpression === 'furious' ? 3 : 0)} Q70 ${20 + (currentExpression === 'furious' ? 2 : 0)} 80 ${25 + (currentExpression === 'furious' ? 3 : 0)}`}
            stroke="#aa0000"
            strokeWidth={currentExpression === 'furious' ? "2" : "1"}
            fill="none"
            opacity={currentExpression === 'furious' ? "0.8" : "0.6"}
          />
          
          {/* Expression-based forehead wrinkles */}
          {(currentExpression === 'furious' || currentExpression === 'irritated') && (
            <>
              <path
                d="M30 20 Q50 15 70 20"
                stroke="#aa0000"
                strokeWidth="1"
                fill="none"
                opacity="0.4"
              />
              <path
                d="M32 22 Q50 17 68 22"
                stroke="#aa0000"
                strokeWidth="1"
                fill="none"
                opacity="0.3"
              />
            </>
          )}
          
          {/* Contempt-specific features */}
          {currentExpression === 'contempt' && (
            <path
              d="M35 58 Q40 56 45 58"
              stroke="#cc0000"
              strokeWidth="1"
              fill="none"
              opacity="0.6"
            />
          )}
          
          {/* Sadistic glow effect */}
          {currentExpression === 'sadistic' && (
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#00ff00"
              strokeWidth="0.5"
              opacity="0.3"
              className="animate-pulse"
            />
          )}
        </svg>
        
        {/* Speaking indicator particles */}
        {isSpeaking && isActive && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-red-500 rounded-full animate-ping"
                style={{
                  left: `${45 + Math.sin(i * Math.PI / 3) * 15}%`,
                  top: `${65 + Math.cos(i * Math.PI / 3) * 8}%`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.8s'
                }}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Audio level indicator rings */}
      {isActive && (
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute inset-0 rounded-full border-2 border-red-500 opacity-30 animate-pulse"
            style={{
              transform: `scale(${1 + audioLevel * 0.2})`,
              borderWidth: `${1 + audioLevel * 2}px`
            }}
          />
          <div 
            className="absolute inset-0 rounded-full border border-orange-500 opacity-20 animate-pulse"
            style={{
              transform: `scale(${1.1 + audioLevel * 0.3})`,
              animationDelay: '0.2s'
            }}
          />
        </div>
      )}
      
    </div>
  );
}