import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function parseJoinInput(input) {
  const raw = String(input || '').trim();
  if (!raw) return { type: 'empty' };

  // Full link: http://localhost:5173/join/<groupId>
  const joinMatch = raw.match(/\/join\/([a-f0-9]{24})/i);
  if (joinMatch) return { type: 'id', groupId: joinMatch[1] };

  // Mongo ObjectId pasted directly
  if (/^[a-f0-9]{24}$/i.test(raw)) return { type: 'id', groupId: raw };

  // Referral code (first 6 of groupId, uppercased)
  if (/^[A-Z0-9]{4,8}$/.test(raw.toUpperCase())) return { type: 'code', code: raw.toUpperCase() };

  return { type: 'unknown' };
}

const Join = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [input, setInput] = useState(id ? `${window.location.origin}/join/${id}` : '');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const parsed = useMemo(() => parseJoinInput(input), [input]);

  const join = async () => {
    const memberName = String(name || '').trim();
    if (!memberName) return toast.error('Enter your name');
    if (parsed.type === 'empty') return toast.error('Paste a join link, group id, or referral code');
    if (parsed.type === 'unknown') return toast.error('Invalid join input');

    setLoading(true);
    try {
      let groupId = parsed.type === 'id' ? parsed.groupId : null;
      if (!groupId && parsed.type === 'code') {
        const res = await axios.get(`${API_BASE}/api/groups/lookup/${parsed.code}`);
        groupId = res.data?._id;
      }
      if (!groupId) throw new Error('Group not found');

      await axios.post(`${API_BASE}/api/groups/${groupId}/members`, { name: memberName });
      localStorage.setItem(`splitgrid.me.${groupId}`, memberName);
      toast.success('Joined!');
      navigate(`/group/${groupId}`);
    } catch (e) {
      const msg = e?.response?.data?.error;
      if (e?.response?.status === 409) toast.error('You already joined this group');
      else toast.error(msg || 'Join failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617] text-white">
      <div className="w-full max-w-xl floating-glass-card p-10">
        <h1 className="text-3xl font-extrabold mb-3">Join a group</h1>
        <p className="text-[#94a3b8] font-medium mb-8">
          Paste the invite link, group id, or referral code.
        </p>

        <div className="space-y-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-[#94a3b8] font-bold mb-2">Invite link / Code</div>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. http://localhost:5173/join/<groupId> or A1B2C3"
              className="w-full bg-black/20 border border-white/10 rounded-xl p-4 outline-none"
            />
          </div>

          <div>
            <div className="text-xs uppercase tracking-widest text-[#94a3b8] font-bold mb-2">Your name</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bhoomika"
              className="w-full bg-black/20 border border-white/10 rounded-xl p-4 outline-none"
            />
          </div>

          <button
            onClick={join}
            disabled={loading}
            className="w-full mt-2 px-8 py-5 rounded-full font-bold bg-white text-[#020617] hover:scale-[1.01] active:scale-95 transition-all"
          >
            {loading ? 'Joining...' : 'Join Group →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Join;

