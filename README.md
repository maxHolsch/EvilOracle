# 🔥 Malevolent Oracle - ElevenLabs Agent Chat

A dark and evil-themed chat interface for ElevenLabs AI agents featuring an audio-reactive Three.js animation centerpiece.

## ✨ Features

- **Evil-themed UI**: Dark red color scheme with glowing effects and horror fonts
- **Audio-reactive 3D Animation**: Three.js orb that responds to voice input with particles and shaders
- **Voice Chat**: Real-time voice communication with ElevenLabs agents
- **Text Chat**: Traditional text-based conversation support
- **Audio Visualization**: Dynamic audio level visualization during recording
- **Vercel Ready**: Optimized for seamless Vercel deployment

## 🚀 Quick Start

### Prerequisites

1. **ElevenLabs Account**: Get your API key from [ElevenLabs](https://elevenlabs.io)
2. **Agent ID**: Your specific ElevenLabs agent ID (default provided: `agent_8601k4qzdxwpet4v6sj5js5nmxxw`)

### Installation

1. **Clone and Install**:
   ```bash
   git clone <your-repo>
   cd elevenlabs-agent-chat
   npm install
   ```

2. **Environment Setup**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your ElevenLabs credentials
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Open Browser**: Navigate to `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

Create `.env.local` with your ElevenLabs credentials:

```env
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_api_key_here
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=agent_8601k4qzdxwpet4v6sj5js5nmxxw
```

### Runtime Configuration

If you prefer not to use environment variables, the app provides a configuration screen where you can enter your credentials. They'll be stored locally in your browser.

## 🌐 Deployment to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/your-username/elevenlabs-agent-chat)

### Manual Deploy

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Set Environment Variables** in Vercel dashboard:
   - `NEXT_PUBLIC_ELEVENLABS_API_KEY`
   - `NEXT_PUBLIC_ELEVENLABS_AGENT_ID`

## 🎨 Customization

### Theme Colors

Edit `tailwind.config.js` to customize the evil color scheme:

```javascript
colors: {
  'evil-red': '#8B0000',
  'dark-red': '#660000',
  'blood-red': '#CC0000',
  'crimson': '#DC143C',
  'hellfire': '#FF4500',
}
```

### 3D Animation

Modify `components/EvilOrb.tsx` to customize the Three.js animation:
- Shader effects
- Particle systems
- Audio responsiveness
- Color schemes

## 🔊 Audio Features

- **Voice Recording**: High-quality audio capture with noise suppression
- **Real-time Visualization**: Audio level indicators and 3D reactive animations
- **Audio Playback**: Agent responses played through browser audio
- **Mute Controls**: Toggle audio playback on/off

## 🛡️ Security

- Credentials stored locally in browser
- HTTPS required for microphone access
- Content Security Policy headers
- XSS protection enabled

## 📱 Browser Support

- **Chrome/Edge**: Full support including WebRTC
- **Firefox**: Full support
- **Safari**: Limited WebRTC support
- **Mobile**: Responsive design with touch support

## 🐛 Troubleshooting

### Common Issues

1. **Microphone Not Working**:
   - Ensure HTTPS (required for microphone access)
   - Check browser permissions
   - Try different browser

2. **WebSocket Connection Failed**:
   - Verify API key is correct
   - Check agent ID format
   - Ensure network allows WebSocket connections

3. **Audio Not Playing**:
   - Check browser autoplay policy
   - Verify audio is not muted
   - Test with different browser

### Debug Mode

Enable detailed logging by adding to browser console:
```javascript
localStorage.setItem('debug', 'true');
```

## 🛠️ Tech Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Three.js**: 3D graphics and animations
- **@react-three/fiber**: React Three.js integration
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animations
- **ElevenLabs API**: Voice AI integration

## 📄 License

MIT License - feel free to use for your own evil purposes! 😈

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

*"In the depths of digital darkness, the malevolent oracle awaits..."* 🔥👹