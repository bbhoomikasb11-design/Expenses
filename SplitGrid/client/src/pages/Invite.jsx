import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Invite = () => {
  const { id } = useParams();
  const [copied, setCopied] = useState(false);

  const { link, code } = useMemo(() => {
    const origin = window.location.origin;
    const groupId = String(id || '');
    return {
      link: `${origin}/join/${groupId}`,
      code: groupId.slice(0, 6).toUpperCase()
    };
  }, [id]);

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied!');
      setTimeout(() => setCopied(false), 800);
    } catch {
      toast.error('Copy failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617] text-white">
      <div className="w-full max-w-xl floating-glass-card p-10">
        <h1 className="text-3xl font-extrabold mb-3">Invite your friends</h1>
        <p className="text-[#94a3b8] font-medium mb-8">
          Share the link or referral code to join this group.
        </p>

        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-xs uppercase tracking-widest text-[#94a3b8] font-bold mb-2">Share link</div>
            <div className="flex gap-3 items-center">
              <input readOnly value={link} className="flex-1 bg-black/20 border border-white/10 rounded-xl p-3 text-sm outline-none" />
              <button onClick={() => copy(link)} className="px-4 py-3 rounded-xl font-bold bg-white text-[#020617]">
                Copy
              </button>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-xs uppercase tracking-widest text-[#94a3b8] font-bold mb-2">Referral code</div>
            <div className="flex gap-3 items-center">
              <div className="flex-1 font-extrabold text-2xl tracking-[0.3em]">{code}</div>
              <button onClick={() => copy(code)} className="px-4 py-3 rounded-xl font-bold bg-white text-[#020617]">
                Copy
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 flex gap-4">
          <Link to={`/group/${id}`} className="flex-1 text-center px-6 py-4 rounded-full font-bold bg-[#a78bfa] text-[#020617]">
            Go to group →
          </Link>
          <Link to="/" className="px-6 py-4 rounded-full font-bold bg-white/5 border border-white/10">
            Home
          </Link>
        </div>

        {copied && <div className="mt-4 text-sm text-[#00F5A0] font-semibold">Copied to clipboard.</div>}
      </div>
    </div>
  );
};

export default Invite;

