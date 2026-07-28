import React, { useState, useEffect, useRef } from 'react';
import {
  UserPlus, UserCheck, Clock, Check, X, UserX,
  Loader2, ChevronDown, UserMinus
} from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export type RelationshipStatus = 'self' | 'none' | 'sent' | 'received' | 'friends';

interface FriendRequestButtonProps {
  targetUserId: string;
  onStatusChange?: (newStatus: RelationshipStatus) => void;
  className?: string;
}

const API_URL =
  import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:6500`;

/**
 * Instagram-style single button that cycles through states:
 *
 *  none      → [Follow]
 *  sent      → [Requested ▾]  click → cancel request → back to none
 *  received  → [Confirm]  [Delete]
 *  friends   → [Friends ▾]  dropdown: Unfriend
 */
const FriendRequestButton: React.FC<FriendRequestButtonProps> = ({
  targetUserId,
  onStatusChange,
  className = '',
}) => {
  const { user, setUser } = useAuth();
  const { socket } = useSocket();

  const [status, setStatus] = useState<RelationshipStatus>('none');
  const [requestId, setRequestId] = useState<string | null>(null);
  const [isFollowedBy, setIsFollowedBy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  /* ── Close dropdown on outside click ─────────────────────── */
  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  /* ── Fetch relationship status ────────────────────────────── */
  useEffect(() => {
    if (!targetUserId || targetUserId === user?._id) {
      setStatus('self');
      setLoading(false);
      return;
    }
    setLoading(true);
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/api/users/relationship/${targetUserId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        setStatus(data.relationship ?? 'none');
        setIsFollowedBy(data.isFollowedBy ?? false);
        if (data.requestId) setRequestId(data.requestId);
        onStatusChange?.(data.relationship ?? 'none');
      })
      .catch(err => console.error('Relationship fetch error:', err))
      .finally(() => setLoading(false));
  }, [targetUserId, user?._id]);

  /* ── Real-time socket updates ─────────────────────────────── */
  useEffect(() => {
    if (!socket) return;

    const onReceived = ({ request }: any) => {
      const sid = String(request.sender?._id || request.sender);
      if (sid === targetUserId) {
        setStatus('received');
        setRequestId(request._id);
        onStatusChange?.('received');
      }
    };

    const onAccepted = ({ friendInfo }: any) => {
      if (String(friendInfo._id || friendInfo) === targetUserId) {
        setStatus('friends');
        onStatusChange?.('friends');
        setUser((p: any) =>
          p ? { ...p, friends: [...(p.friends || []), targetUserId] } : p
        );
      }
    };

    const onCancelled = ({ requestId: rId }: any) => {
      if (rId === requestId) {
        setStatus('none');
        setRequestId(null);
        onStatusChange?.('none');
      }
    };

    const onRemoved = ({ byUserId }: any) => {
      if (String(byUserId) === targetUserId) {
        setStatus('none');
        onStatusChange?.('none');
      }
    };

    socket.on('friendRequestReceived', onReceived);
    socket.on('friendRequestAccepted', onAccepted);
    socket.on('friendRequestCancelled', onCancelled);
    socket.on('friendRemoved', onRemoved);

    return () => {
      socket.off('friendRequestReceived', onReceived);
      socket.off('friendRequestAccepted', onAccepted);
      socket.off('friendRequestCancelled', onCancelled);
      socket.off('friendRemoved', onRemoved);
    };
  }, [socket, targetUserId, requestId]);

  /* ── API helpers ──────────────────────────────────────────── */
  const apiPost = async (url: string) => {
    const token = localStorage.getItem('token');
    return fetch(`${API_URL}${url}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  };
  const apiDelete = async (url: string) => {
    const token = localStorage.getItem('token');
    return fetch(`${API_URL}${url}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  /* ── Handlers ──────────────────────────────────────────────── */

  /** Follow = send friend request → button becomes "Requested" */
  const handleFollow = async () => {
    setActionLoading(true);
    try {
      const res = await apiPost(`/api/users/friend-request/send/${targetUserId}`);
      const data = await res.json();
      if (res.ok) {
        toast.success('Follow request sent!');
        setStatus('sent');
        setRequestId(data.request._id);
        onStatusChange?.('sent');
        socket?.emit('sendFriendRequest', {
          recipientId: targetUserId,
          request: data.request,
          notification: data.notification,
        });
      } else {
        toast.error(data.message || 'Failed to send request');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setActionLoading(false);
    }
  };

  /** "Requested" clicked → cancel the follow request */
  const handleCancelRequest = async () => {
    setActionLoading(true);
    setShowMenu(false);
    try {
      const res = await apiPost(`/api/users/friend-request/cancel/${targetUserId}`);
      if (res.ok) {
        toast('Follow request cancelled');
        setStatus('none');
        setRequestId(null);
        onStatusChange?.('none');
        socket?.emit('friendRequestCancelled', { recipientId: targetUserId, requestId });
      }
    } catch {
      toast.error('Network error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccept = async () => {
    setActionLoading(true);
    try {
      const targetId = requestId || targetUserId;
      const res = await apiPost(`/api/users/friend-request/accept/${targetId}`);
      const data = await res.json();
      if (res.ok) {
        toast.success('Request accepted!');
        setStatus('friends');
        onStatusChange?.('friends');
        setUser((p: any) =>
          p ? { ...p, friends: [...(p.friends || []), targetUserId] } : p
        );
        socket?.emit('friendRequestAccepted', {
          senderId: targetUserId,
          friendInfo: user,
          notification: data.notification,
        });
      } else {
        toast.error(data.message || 'Failed to accept');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      const targetId = requestId || targetUserId;
      const res = await apiPost(`/api/users/friend-request/reject/${targetId}`);
      if (res.ok) {
        toast('Request deleted');
        setStatus('none');
        setRequestId(null);
        onStatusChange?.('none');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnfriend = async () => {
    setActionLoading(true);
    setShowMenu(false);
    try {
      const res = await apiDelete(`/api/users/friend-request/remove/${targetUserId}`);
      if (res.ok) {
        toast('Unfriended');
        setStatus('none');
        onStatusChange?.('none');
        setUser((p: any) =>
          p ? { ...p, friends: (p.friends || []).filter((id: string) => id !== targetUserId) } : p
        );
        socket?.emit('friendRemoved', { friendId: targetUserId });
      }
    } catch {
      toast.error('Network error');
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Render ────────────────────────────────────────────────── */
  if (loading || status === 'self') return null;

  const spinner = <Loader2 size={15} className="animate-spin" />;

  return (
    <div className={`relative inline-flex items-center gap-2 ${className}`} ref={menuRef}>

      {/* ─── NONE: Follow / Follow Back ──────────────────────── */}
      {status === 'none' && (
        <button
          onClick={handleFollow}
          disabled={actionLoading}
          className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-purple-500/30 active:scale-95 transition-all disabled:opacity-50"
        >
          {actionLoading ? spinner : <UserPlus size={16} />}
          <span>{isFollowedBy ? 'Follow Back' : 'Follow'}</span>
        </button>
      )}

      {/* ─── SENT: Requested (click to cancel) ───────────────── */}
      {status === 'sent' && (
        <div className="relative">
          <button
            onClick={() => setShowMenu(v => !v)}
            disabled={actionLoading}
            className="flex items-center gap-1.5 px-5 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold text-sm active:scale-95 transition-all disabled:opacity-50"
          >
            {actionLoading ? spinner : <Clock size={15} className="text-purple-400" />}
            <span>Requested</span>
            <ChevronDown size={13} className={`transition-transform ${showMenu ? 'rotate-180' : ''}`} />
          </button>

          {showMenu && (
            <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-40 animate-fadeIn">
              <div className="px-4 py-2 text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide border-b border-gray-100 dark:border-gray-700">
                Follow request pending
              </div>
              <button
                onClick={handleCancelRequest}
                className="w-full px-4 py-2.5 text-left text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 font-medium"
              >
                <UserMinus size={15} />
                Cancel Request
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── RECEIVED: Confirm + Delete ──────────────────────── */}
      {status === 'received' && (
        <div className="flex items-center gap-2">
          <button
            onClick={handleAccept}
            disabled={actionLoading}
            className="flex items-center gap-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm shadow-md active:scale-95 transition-all disabled:opacity-50"
          >
            {actionLoading ? spinner : <Check size={15} />}
            <span>Confirm</span>
          </button>
          <button
            onClick={handleReject}
            disabled={actionLoading}
            className="flex items-center gap-1 px-3.5 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm active:scale-95 transition-all disabled:opacity-50"
          >
            <X size={15} />
            <span>Delete</span>
          </button>
        </div>
      )}

      {/* ─── FRIENDS: Friends ▾ (dropdown to unfriend) ─────── */}
      {status === 'friends' && (
        <div className="relative">
          <button
            onClick={() => setShowMenu(v => !v)}
            disabled={actionLoading}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold text-sm active:scale-95 transition-all"
          >
            {actionLoading ? spinner : <UserCheck size={15} className="text-purple-500" />}
            <span>Friends</span>
            <ChevronDown size={13} className={`transition-transform ${showMenu ? 'rotate-180' : ''}`} />
          </button>

          {showMenu && (
            <div className="absolute left-0 mt-2 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-40 animate-fadeIn">
              <button
                onClick={handleUnfriend}
                className="w-full px-4 py-2.5 text-left text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 font-medium"
              >
                <UserX size={15} />
                Unfriend
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default FriendRequestButton;
