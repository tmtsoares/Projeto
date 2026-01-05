
import { WorshipEvent, Member, LibrarySong } from '../types';

const EVENTS_KEY = 'adore_events';
const DELETED_EVENTS_KEY = 'adore_deleted_events';
const MEMBERS_KEY = 'adore_members';
const SONGS_KEY = 'adore_songs_library';

export const storage = {
  getEvents: (): WorshipEvent[] => {
    const data = localStorage.getItem(EVENTS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveEvents: (events: WorshipEvent[]) => {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  },
  getDeletedEvents: (): WorshipEvent[] => {
    const data = localStorage.getItem(DELETED_EVENTS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveDeletedEvents: (events: WorshipEvent[]) => {
    localStorage.setItem(DELETED_EVENTS_KEY, JSON.stringify(events));
  },
  getMembers: (): Member[] => {
    const data = localStorage.getItem(MEMBERS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveMembers: (members: Member[]) => {
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
  },
  getLibrarySongs: (): LibrarySong[] => {
    const data = localStorage.getItem(SONGS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveLibrarySongs: (songs: LibrarySong[]) => {
    localStorage.setItem(SONGS_KEY, JSON.stringify(songs));
  }
};
