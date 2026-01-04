
export type Status = 'pending' | 'confirmed' | 'declined';

export interface Song {
  id: string;
  title: string;
  artist: string;
  youtube?: string;
  lyrics?: string;
  bpm?: number;
  key?: string;
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
  notes?: string;
  createdAt: number;
}

export interface Member {
  id: string;
  name: string;
  role: string;
  whatsapp: string;
  photoUrl?: string;
  availableDays?: string[];
}
