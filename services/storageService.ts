
import { WorshipEvent, Member } from '../types';

const EVENTS_KEY = 'harmonia_events';
const MEMBERS_KEY = 'harmonia_members';

export const storage = {
  getEvents: (): WorshipEvent[] => {
    const data = localStorage.getItem(EVENTS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveEvents: (events: WorshipEvent[]) => {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  },
  getMembers: (): Member[] => {
    const data = localStorage.getItem(MEMBERS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveMembers: (members: Member[]) => {
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
  }
};
