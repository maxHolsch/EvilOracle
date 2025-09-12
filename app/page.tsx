'use client';

import Conversation from '@/components/Conversation';

export default function Home() {
  // Use server-side API key and default agent ID
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || 'agent_8601k4qzdxwpet4v6sj5js5nmxxw';

  return <Conversation agentId={agentId} />;
}