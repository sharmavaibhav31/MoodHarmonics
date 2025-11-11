import { motion } from 'framer-motion';
import { useState } from 'react';
import { FiMoreVertical, FiTrash2 } from 'react-icons/fi';
import { getPlaceholderCover } from '../lib/placeholders.js';
import { HiDownload } from 'react-icons/hi';

export default function TileCard({ item, onPlay, onLyrics, onDownload, onAddToPlaylist, onDelete }) {
  const title = item.title || item.prompt || 'Untitled';
  const subtitle = [item.genre, item.date].filter(Boolean).join(' • ');
  const audioUrl = item.audio_url;
  const cover = item.cover || getPlaceholderCover(item.filename || title);
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card overflow-hidden group"
    >
      <div className="aspect-square bg-gradient-to-br from-slate-700/40 to-slate-900/40 flex items-center justify-center relative">
        <img src={cover} alt="cover" className="w-full h-full object-cover" />
        {onDelete && (
          <div className="absolute top-3 right-3">
            <button
              aria-label="More actions"
              className="glass rounded-full p-2 focus-ring"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
            >
              <FiMoreVertical />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-32 rounded-card glass shadow-soft text-sm z-20">
                <button
                  className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-card flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onDelete(item);
                  }}
                >
                  <FiTrash2 /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="font-semibold truncate text-base">{title}</div>
        <div className="text-sm opacity-70 truncate">{subtitle}</div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          <CardButton onClick={() => onPlay?.(item)} label="Play">Play</CardButton>
          <CardButton onClick={() => onLyrics?.(item)} label="Lyrics">Lyrics</CardButton>
          <a className="btn-primary p-2" href={audioUrl} download onClick={(e)=>{e.stopPropagation();}} aria-label="Download audio"><HiDownload className="h-5 w-5" /> </a>
          <CardButton onClick={() => onAddToPlaylist?.(item)} label="Add">Add</CardButton>
        </div>
      </div>
    </motion.div>
  );
}

function CardButton({ children, onClick, label }) {
  return (
    <button className="glass rounded-card text-sm py-2 focus-ring" aria-label={label} onClick={(e)=>{e.stopPropagation(); onClick?.();}}>
      {children}
    </button>
  );
}


