import React from 'react';
import { Phone, PhoneOff, Video, User } from 'lucide-react';
import { useCall } from '../../hooks/useCall';

export const IncomingCallModal: React.FC = () => {
  const { callState, caller, callType, acceptCall, rejectCall } = useCall();

  if (callState !== 'incoming' || !caller) {
    return null;
  }

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 animate-bounce-short">
      <div className="bg-gray-900/95 backdrop-blur-2xl border border-purple-500/30 rounded-3xl p-5 shadow-2xl shadow-purple-900/40 text-white flex items-center justify-between">
        
        {/* Caller Avatar & Info */}
        <div className="flex items-center space-x-3.5">
          <div className="relative">
            {caller.profilePicture ? (
              <img
                src={caller.profilePicture}
                alt={caller.username}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-purple-500/50 shadow-md"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-purple-800 text-purple-200 flex items-center justify-center ring-2 ring-purple-500/50">
                <User size={24} />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 p-1 bg-purple-600 rounded-full text-white">
              {callType === 'video' ? <Video size={12} /> : <Phone size={12} />}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-base text-white tracking-wide">{caller.username}</h4>
            <p className="text-xs text-purple-300 font-medium flex items-center gap-1 mt-0.5">
              <span>Incoming {callType === 'video' ? 'Video' : 'Audio'} Call...</span>
            </p>
          </div>
        </div>

        {/* Accept / Reject Buttons */}
        <div className="flex items-center space-x-3">
          {/* Reject Button */}
          <button
            onClick={rejectCall}
            className="p-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all transform active:scale-95 shadow-lg shadow-red-600/30"
            title="Decline Call"
          >
            <PhoneOff size={20} />
          </button>

          {/* Accept Button */}
          <button
            onClick={acceptCall}
            className="p-3.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white transition-all transform active:scale-95 shadow-lg shadow-emerald-500/30 ring-4 ring-emerald-500/20 animate-pulse"
            title="Accept Call"
          >
            {callType === 'video' ? <Video size={20} /> : <Phone size={20} />}
          </button>
        </div>

      </div>
    </div>
  );
};
