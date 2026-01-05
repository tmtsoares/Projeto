
export type Status = 'pending' | 'confirmed' | 'declined';

export interface Song {
  id: string;
  title: string;
  artist: string;
  youtube?: string;
  lyrics?: string;
  bpm?: number;
  key?: string; // Tom Escolhido
  originalKey?: string; // Tom Original (geral)
  videoKey?: string; // Tom do Vídeo específico
  isOffering?: boolean; // Indicação se é música de oferta
  isCommunion?: boolean; // Indicação se é música de ceia
  archived?: boolean; // Indicação se a música está arquivada
}

export interface LibrarySong extends Song {}

export interface ChatMessage {
  id: string;
  senderName: string;
  type: 'text' | 'audio';
  content: string; // Texto ou Base64 do áudio
  timestamp: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: Status;
  whatsapp?: string;
}

export interface WorshipEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  team: TeamMember[];
  songs: Song[];
  offeringSongs?: Song[];
  communionSongs?: Song[];
  chat?: ChatMessage[];
  notes?: string;
  createdAt: number;
}

export interface Member {
  id: string;
  name: string;
  roles: string[]; 
  whatsapp?: string;
  photoUrl?: string;
  birthday?: string;
  mentor?: string;
  cellGroup?: string;
  availableDays?: string[];
  archived?: boolean;
}
