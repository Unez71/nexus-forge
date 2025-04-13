import { useCallback } from 'react';
import { useConversation } from '@11labs/react';
import { Mic, Play, Pause } from 'lucide-react'

export const VoiceCon = () => {
  const conversation = useConversation({
    onConnect: () => console.log('Connected'),
    onDisconnect: () => console.log('Disconnected'),
    onMessage: (message) => console.log('Message:', message),
    onError: (error) => console.error('Error:', error),
  });

  const startConversation = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: 'URC5UfVe3i1iHEN2SnsL',
      });
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-200 via-slate-300 to-slate-300 rounded-xl p-6 space-y-6">
      <h1 className="text-7xl font-bold text-gray-700 text-center flex  items-center gap-2"> <Mic className='font-bold h-16 w-16'/>  Voice Chat</h1>

      {/* Avatar */}
      <div className="w-full max-w-md h-[400px] flex items-center justify-center">
        <div className="avatar bg-white p-8 rounded-3xl shadow-2xl" id="avatar">
          <div className="relative w-64 h-64 rounded-full" id="head" style={{ backgroundColor: '#FFDBAC' }}>
            {/* Eyes */}
            <div className="absolute top-1/3 left-1/4 w-8 h-8 rounded-full bg-white flex justify-center items-center">
              <div className="w-4 h-4 rounded-full bg-blue-600 pupil" />
            </div>
            <div className="absolute top-1/3 right-1/4 w-8 h-8 rounded-full bg-white flex justify-center items-center">
              <div className="w-4 h-4 rounded-full bg-blue-600 pupil" />
            </div>

            {/* Brows */}
            <div className="absolute top-1/4 left-1/4 w-10 h-3 rounded-full" style={{ backgroundColor: '#5E3A21' }} />
            <div className="absolute top-1/4 right-1/4 w-10 h-3 rounded-full" style={{ backgroundColor: '#5E3A21' }} />

            {/* Nose */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 w-6 h-8 rounded-full" style={{ backgroundColor: '#E8B796' }} />

            {/* Mouth */}
            <div
              id="mouth"
              className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 w-16 h-8 rounded-b-full bg-red-400"
              style={{
                animation: conversation.isSpeaking ? 'talking 0.25s infinite alternate' : 'none',
              }}
            />

            {/* Hair */}
            <div className="absolute -top-4 left-0 w-full h-20 rounded-t-full overflow-hidden" style={{ backgroundColor: '#3A2C1A' }}>
              <div className="absolute -top-4 left-1/4 w-16 h-24 rounded-full" style={{ backgroundColor: '#3A2C1A' }}></div>
              <div className="absolute -top-4 right-1/4 w-16 h-24 rounded-full" style={{ backgroundColor: '#3A2C1A' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <button
          onClick={startConversation}
          disabled={conversation.status === 'connected'}
          className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
        >
          <Play />Connect
        </button>
        <button
          onClick={stopConversation}
          disabled={conversation.status !== 'connected'}
          className="px-5 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 flex items-center gap-2"
        >
          <Pause />Disconnect
        </button>
      </div>

      {/* Status */}
      <div className="text-sm text-gray-700 text-center">
        <p>Status: {conversation.status}</p>
      </div>

      {/* Inline mouth animation */}
      <style>
        {`
          @keyframes talking {
            0% { height: 8px; background-color: #F87171; }
            100% { height: 20px; background-color: #EF4444; }
          }
        `}
      </style>
    </div>
  );
};
