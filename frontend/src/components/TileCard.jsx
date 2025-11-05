import { motion } from 'framer-motion';
import { getPlaceholderCover } from '../lib/placeholders.js';

export default function TileCard({ item, onPlay, onLyrics, onDownload, onAddToPlaylist }) {
  const title = item.title || item.prompt || 'Untitled';
  const subtitle = [item.genre, item.date].filter(Boolean).join(' • ');
  const audioUrl = item.audio_url;
  const cover = item.cover || getPlaceholderCover(item.filename || title);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card overflow-hidden group"
    >
      <div className="aspect-square bg-gradient-to-br from-slate-700/40 to-slate-900/40 flex items-center justify-center">
        <img src={cover} alt="cover" className="w-full h-full object-cover" />
      </div>
      <div className="p-3">
        <div className="font-semibold truncate">{title}</div>
        <div className="text-xs opacity-70 truncate">{subtitle}</div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          <CardButton onClick={() => onPlay?.(item)} label="Play">Play</CardButton>
          <CardButton onClick={() => onLyrics?.(item)} label="Lyrics">Lyrics</CardButton>
          <a className="btn-primary text-xs text-center" href={audioUrl} download onClick={(e)=>{e.stopPropagation();}}>Download</a>
          <CardButton onClick={() => onAddToPlaylist?.(item)} label="Add">Add</CardButton>
        </div>
      </div>
    </motion.div>
  );
}

function CardButton({ children, onClick, label }) {
  return (
    <button className="glass rounded-card text-xs py-2 focus-ring" aria-label={label} onClick={(e)=>{e.stopPropagation(); onClick?.();}}>
      {children}
    </button>
  );
}


