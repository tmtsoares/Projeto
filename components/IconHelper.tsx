
import React from 'react';
import { 
  Music, Mic2, Guitar, Headphones, Users, Drum, Piano 
} from 'lucide-react';

export const getRoleIcon = (role: string, size = 16) => {
  const r = role.toLowerCase();
  if (r.includes('teclado') || r.includes('piano')) return <Piano size={size} />;
  if (r.includes('violão') || r.includes('guitarra') || r.includes('baixo')) return <Guitar size={size} />;
  if (r.includes('voz') || r.includes('vocal') || r.includes('back') || r.includes('cantor')) return <Mic2 size={size} />;
  if (r.includes('som') || r.includes('mídia') || r.includes('mesa')) return <Headphones size={size} />;
  if (r.includes('bateria') || r.includes('percussão')) return <Drum size={size} />;
  return <Users size={size} />;
};
