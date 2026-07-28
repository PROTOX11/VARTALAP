import React from 'react';
import { Wifi } from 'lucide-react';
import { CallState } from '../../contexts/CallContext';

interface CallStatusProps {
  state: CallState;
  duration: number;
  quality: 'excellent' | 'good' | 'poor';
}

export const CallStatus: React.FC<CallStatusProps> = ({ state, duration, quality }) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const getQualityColor = () => {
    switch (quality) {
      case 'excellent':
        return 'text-emerald-400';
      case 'good':
        return 'text-amber-400';
      case 'poor':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStateText = () => {
    switch (state) {
      case 'calling':
        return 'Calling...';
      case 'ringing':
        return 'Ringing...';
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return formatTime(duration);
      case 'reconnecting':
        return 'Reconnecting...';
      case 'ended':
        return 'Call Ended';
      case 'rejected':
        return 'Declined';
      case 'busy':
        return 'User Busy';
      case 'failed':
        return 'Connection Failed';
      default:
        return '';
    }
  };

  return (
    <div className="flex items-center space-x-2 px-3.5 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-xs text-white">
      <span className="font-semibold tracking-wider font-mono">{getStateText()}</span>
      {state === 'connected' && (
        <span className={`flex items-center gap-1 ${getQualityColor()}`} title={`Network Quality: ${quality}`}>
          <Wifi size={13} />
        </span>
      )}
    </div>
  );
};
