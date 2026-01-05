
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Calendar, Music, Mic2, CheckCircle2, XCircle, Youtube, 
  FileText, Plus, Trash2, Edit3, Users, ChevronDown, ChevronUp,
  MessageCircle, X, ListMusic, Lock, Unlock, Camera,
  Music2, Send, Drum, Piano, Guitar, Wind, UserCheck, Check,
  RotateCcw, Archive, KeyRound, Mic, Link as LinkIcon,
  CalendarPlus, Heart, UserPlus, Cake
} from 'lucide-react';
import { WorshipEvent, Member, TeamMember, Song, LibrarySong, ChatMessage } from './types';
import { storage } from './services/storageService';
import { getRoleIcon } from './components/IconHelper';

// --- Utilitários de Formatação ---

const toTitleCase = (str: string) => {
  if (!str) return "";
  const words = str.toLowerCase().split(' ');
  return words.map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const formatSentence = (text: string) => {
  if (!text) return "";
  const trimmed = text.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
};

const getInitials = (name: string) => {
  if (!name) return "";
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getDayOfWeek = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString + 'T12:00:00');
  const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  return days[date.getDay()];
};

const getMonthYearLabel = (dateString: string) => {
  const date = new Date(dateString + 'T12:00:00');
  const months = [
    "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
    "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
};

// --- Constantes de Dados ---

const EVENT_TYPES = [
  "🍷 Culto ceia", "🙌 Culto celebração", "👨‍👩‍👦‍👦 Culto família", 
  "👶🏻 Culto crianças", "🔥 Mais Fundo", "🙏 Vigília", 
  "⭐ Evento", "🌄 Encontro", "📖 Ebd", "🌊 Batismo", 
  "🌙 Noite com deus", "👸🏻 Nós mulheres", "🧔🏻 Vida magistral", "🔥 Hertz"
];

const AVAILABLE_ROLES = [
  "🎙️ Ministro", "🎤 Vocal", "🎹 Teclado", "🥁 Bateria", 
  "🪕 Baixo", "🎸 Violão", "🎸 Guitarra", "🎺 Sopro", "🎛️ Som/mídia"
];

const TONES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "Am", "Bm", "Cm", "Dm", "Em", "Fm", "Gm"];

const INITIAL_MEMBERS_DATA = [
  { name: "Alex", roles: ["🎹 Teclado"] },
  { name: "Leandro", roles: ["🎹 Teclado", "🎸 Violão", "🪕 Baixo"] },
  { name: "Patricia", roles: ["🎹 Teclado", "🎤 Vocal"] },
  { name: "Thimóteo", roles: ["🎹 Teclado", "🥁 Bateria", "🎸 Violão", "🪕 Baixo", "🎸 Guitarra", "🎙️ Ministro", "🎤 Vocal"] },
  { name: "Walber", roles: ["🎹 Teclado", "🎸 Violão", "🪕 Baixo", "🎙️ Ministro"] },
  { name: "Arthur", roles: ["🥁 Bateria"] },
  { name: "Erica", roles: ["🥁 Bateria"] },
  { name: "Everson", roles: ["🥁 Bateria"] },
  { name: "Pr fillipe", roles: ["🥁 Bateria"] },
  { name: "Tiago alves", roles: ["🥁 Bateria"] },
  { name: "Thiago rocha", roles: ["🥁 Bateria", "🎤 Vocal"] },
  { name: "Breno", roles: ["🎸 Violão", "🪕 Baixo", "🎸 Guitarra"] },
  { name: "Fábio", roles: ["🎸 Violão"] },
  { name: "Felipe santos", roles: ["🎸 Violão"] },
  { name: "Kallebe", roles: ["🎸 Violão", "🎸 Guitarra"] },
  { name: "Matheus ferreira", roles: ["🎸 Violão"] },
  { name: "Felipe gomes", roles: ["🪕 Baixo"] },
  { name: "Luiza", roles: ["🪕 Baixo"] },
  { name: "Pr thiago", roles: ["🪕 Baixo", "🎙️ Ministro", "🎤 Vocal"] },
  { name: "Anderson", roles: ["🎸 Guitarra"] },
  { name: "Wesley", roles: ["🎸 Guitarra"] },
  { name: "Pr paulo", roles: ["🎙️ Ministro", "🎤 Vocal"] },
  { name: "Pra kelley", roles: ["🎙️ Ministro"] },
  { name: "Aci", roles: ["🎙️ Ministro", "🎤 Vocal"] },
  { name: "Flávia", roles: ["🎙️ Ministro", "🎤 Vocal"] },
  { name: "Polly", roles: ["🎙️ Ministro", "🎤 Vocal"] },
  { name: "Thaisa", roles: ["🎙️ Ministro", "🎤 Vocal"] },
  { name: "Everton", roles: ["🎙️ Ministro", "🎤 Vocal"] },
  { name: "Tayrine", roles: ["🎙️ Ministro", "🎤 Vocal"] },
  { name: "Ananda", roles: ["🎙️ Ministro", "🎤 Vocal"] },
  { name: "Joãozinho", roles: ["🎤 Vocal"] },
  { name: "Matheus", roles: ["🎤 Vocal"] },
  { name: "Cibele", roles: ["🎤 Vocal"] },
  { name: "Isabela", roles: ["🎤 Vocal"] },
  { name: "Jacqueline", roles: ["🎤 Vocal"] },
  { name: "Juliana", roles: ["🎤 Vocal"] },
  { name: "Raquel", roles: ["🎤 Vocal"] },
  { name: "Rayssa", roles: ["🎤 Vocal"] },
  { name: "Danilo", roles: ["🪕 Baixo"] },
  { name: "Felipe", roles: ["🪕 Baixo"] }
];

const JAN_2026_EVENTS: WorshipEvent[] = [
  {
    id: "jan-04",
    title: "🍷 Culto Ceia",
    date: "2026-01-04",
    time: "08:30",
    team: [
      { id: "mem-pr-thiago", name: "Pr Thiago", role: "🎙️ Ministro", status: 'pending' },
      { id: "mem-walber", name: "Walber", role: "🎹 Teclado", status: 'pending' },
      { id: "mem-jacque", name: "Jacqueline", role: "🎤 Vocal", status: 'pending' },
      { id: "mem-patricia", name: "Patricia", role: "🎤 Vocal", status: 'pending' }
    ],
    songs: [], chat: [], createdAt: Date.now()
  },
  {
    id: "jan-07",
    title: "🌙 Noite com Deus",
    date: "2026-01-07",
    time: "19:30",
    team: [], songs: [], chat: [], createdAt: Date.now()
  },
  {
    id: "jan-11",
    title: "🙌 Culto Celebração",
    date: "2026-01-11",
    time: "08:30",
    team: [
      { id: "mem-thimoteo", name: "Thimóteo", role: "🎙️ Ministro", status: 'pending' },
      { id: "mem-leandro", name: "Leandro", role: "🎹 Teclado", status: 'pending' },
      { id: "mem-arthur", name: "Arthur", role: "🥁 Bateria", status: 'pending' },
      { id: "mem-thimoteo-violao", name: "Thimóteo", role: "🎸 Violão", status: 'pending' },
      { id: "mem-wesley", name: "Wesley", role: "🎸 Guitarra", status: 'pending' },
      { id: "mem-jacque", name: "Jacqueline", role: "🎤 Vocal", status: 'pending' },
      { id: "mem-everton", name: "Everton", role: "🎤 Vocal", status: 'pending' },
      { id: "mem-matheus", name: "Matheus", role: "🎤 Vocal", status: 'pending' },
      { id: "mem-juliana", name: "Juliana", role: "🎤 Vocal", status: 'pending' }
    ],
    songs: [], chat: [], createdAt: Date.now()
  },
  {
    id: "jan-14",
    title: "🌙 Noite com Deus",
    date: "2026-01-14",
    time: "19:30",
    team: [
      { id: "mem-patricia", name: "Patricia", role: "🎹 Teclado", status: 'pending' },
      { id: "mem-tiago-alves", name: "Tiago Alves", role: "🥁 Bateria", status: 'pending' },
      { id: "mem-leandro", name: "Leandro", role: "🎸 Violão", status: 'pending' },
      { id: "mem-everton", name: "Everton", role: "🎤 Vocal", status: 'pending' }
    ],
    songs: [], chat: [], createdAt: Date.now()
  },
  {
    id: "jan-16",
    title: "🙏 Vigília",
    date: "2026-01-16",
    time: "21:00",
    team: [
      { id: "mem-everson", name: "Everson", role: "🥁 Bateria", status: 'pending' },
      { id: "mem-matheus", name: "Matheus", role: "🎤 Vocal", status: 'pending' }
    ],
    songs: [], chat: [], createdAt: Date.now()
  },
  {
    id: "jan-18",
    title: "🙌 Culto Celebração",
    date: "2026-01-18",
    time: "08:30",
    team: [
      { id: "mem-tayrine", name: "Tayrine", role: "🎙️ Ministro", status: 'pending' },
      { id: "mem-walber", name: "Walber", role: "🎹 Teclado", status: 'pending' },
      { id: "mem-arthur", name: "Arthur", role: "🥁 Bateria", status: 'pending' },
      { id: "mem-danilo", name: "Danilo", role: "🪕 Baixo", status: 'pending' },
      { id: "mem-jacque", name: "Jacqueline", role: "🎤 Vocal", status: 'pending' },
      { id: "mem-matheus", name: "Matheus", role: "🎤 Vocal", status: 'pending' }
    ],
    songs: [], chat: [], createdAt: Date.now()
  },
  {
    id: "jan-21",
    title: "🌙 Noite com Deus",
    date: "2026-01-21",
    time: "19:30",
    team: [
      { id: "mem-patricia", name: "Patricia", role: "🎹 Teclado", status: 'pending' },
      { id: "mem-tiago-everson", name: "Tiago / Everson", role: "🥁 Bateria", status: 'pending' },
      { id: "mem-danilo", name: "Danilo", role: "🪕 Baixo", status: 'pending' }
    ],
    songs: [], chat: [], createdAt: Date.now()
  },
  {
    id: "jan-25",
    title: "🙌 Culto Celebração",
    date: "2026-01-25",
    time: "08:30",
    team: [
      { id: "mem-flavia", name: "Flávia", role: "🎙️ Ministro", status: 'pending' },
      { id: "mem-patricia", name: "Patricia", role: "🎹 Teclado", status: 'pending' },
      { id: "mem-everson", name: "Everson", role: "🥁 Bateria", status: 'pending' },
      { id: "mem-pr-thiago-baixo", name: "Pr Thiago", role: "🪕 Baixo", status: 'pending' },
      { id: "mem-leandro", name: "Leandro", role: "🎸 Violão", status: 'pending' },
      { id: "mem-jacque", name: "Jacqueline", role: "🎤 Vocal", status: 'pending' },
      { id: "mem-matheus", name: "Matheus", role: "🎤 Vocal", status: 'pending' }
    ],
    songs: [
      { id: "s-escape", title: "Escape", artist: "Renascer praise", youtube: "https://youtu.be/vM2A2XEm9TE?si=c9VjVwxDBioQGkXU", lyrics: "https://www.letras.mus.br/renascer-praise/escape/", key: "G" },
      { id: "s-santo", title: "Santo pra sempre", artist: "Marine friesen", youtube: "https://youtu.be/Ao-vBEhBxr0?si=c-t2PXd6tZo61vk2", lyrics: "https://www.letras.mus.br/marine-friesen/santo-pra-sempre/", key: "A" },
      { id: "s-maranata", title: "Maranata", artist: "Ministério avivah", youtube: "https://youtu.be/iS6GXPbhCwU?si=8EymDnHiuuQ8eWbC", lyrics: "https://www.letras.mus.br/ministerio-avivah/maranata/", key: "G" },
      { id: "s-diante", title: "Diante de ti", artist: "Quatro por um", youtube: "https://youtu.be/VHnoXRQhyD8?si=mU4gv5ZVlHekWJ1a", lyrics: "https://www.letras.mus.br/quatro-por-um/201287/", key: "C", isOffering: true }
    ],
    chat: [], createdAt: Date.now()
  },
  {
    id: "jan-28",
    title: "🌙 Noite com Deus",
    date: "2026-01-28",
    time: "19:30",
    team: [
      { id: "mem-patricia", name: "Patricia", role: "🎹 Teclado", status: 'pending' },
      { id: "mem-tiago-alves", name: "Tiago Alves", role: "🥁 Bateria", status: 'pending' },
      { id: "mem-felipe", name: "Felipe", role: "🪕 Baixo", status: 'pending' },
      { id: "mem-wesley", name: "Wesley", role: "🎸 Guitarra", status: 'pending' }
    ],
    songs: [], chat: [], createdAt: Date.now()
  },
  {
    id: "jan-31",
    title: "🔥 Mais Fundo",
    date: "2026-01-31",
    time: "19:00",
    team: [
      { id: "mem-patricia", name: "Patricia", role: "🎹 Teclado", status: 'pending' },
      { id: "mem-everson", name: "Everson", role: "🥁 Bateria", status: 'pending' }
    ],
    songs: [], chat: [], createdAt: Date.now()
  }
];

const Toast = ({ message, type = 'success', onClose }: { message: string, type?: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[150] animate-bounce">
      <div className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 ${type === 'error' ? 'bg-red-900 text-white' : 'bg-red-800 text-white'}`}>
        {type === 'error' ? <XCircle size={20} /> : <CheckCircle2 size={20} />}
        <span className="font-bold text-sm tracking-wider">{message}</span>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'scales' | 'members' | 'repertoire'>('scales');
  const [agendaFilter, setAgendaFilter] = useState<'upcoming' | 'past'>('upcoming');
  const [events, setEvents] = useState<WorshipEvent[]>([]);
  const [archivedEvents, setArchivedEvents] = useState<WorshipEvent[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [librarySongs, setLibrarySongs] = useState<LibrarySong[]>([]);
  
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [collapsedMonths, setCollapsedMonths] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [chatInput, setChatInput] = useState('');

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isLibrarySongModalOpen, setIsLibrarySongModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [archiveConfirmEvent, setArchiveConfirmEvent] = useState<{id: string, title: string} | null>(null);
  const [archiveConfirmSong, setArchiveConfirmSong] = useState<{id: string, title: string} | null>(null);
  const [archiveConfirmMember, setArchiveConfirmMember] = useState<{id: string, name: string} | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  
  const [editingEvent, setEditingEvent] = useState<WorshipEvent | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editingLibrarySong, setEditingLibrarySong] = useState<LibrarySong | null>(null);

  const [tempPhoto, setTempPhoto] = useState<string | null>(null);
  const [editingMemberRoles, setEditingMemberRoles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isMemberModalOpen) {
      if (editingMember) {
        setEditingMemberRoles(editingMember.roles || []);
      } else {
        setEditingMemberRoles([]);
      }
      setTempPhoto(null);
    }
  }, [isMemberModalOpen, editingMember]);

  useEffect(() => {
    if (isLibrarySongModalOpen) {
      if (editingLibrarySong) {
        setSongTitleInput(editingLibrarySong.title);
        setSongArtistInput(editingLibrarySong.artist);
        setSongLyricsUrl(editingLibrarySong.lyrics || '');
        setSongYoutubeUrl(editingLibrarySong.youtube || '');
        setSongKey(editingLibrarySong.key || '');
        setSongBpm(editingLibrarySong.bpm || 0);
      } else {
        setSongTitleInput('');
        setSongArtistInput('');
        setSongLyricsUrl('');
        setSongYoutubeUrl('');
        setSongKey('');
        setSongBpm(0);
      }
    }
  }, [isLibrarySongModalOpen, editingLibrarySong]);

  // Estados Form Agendas
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventTeam, setEventTeam] = useState<TeamMember[]>([]);
  const [eventSongs, setEventSongs] = useState<Song[]>([]);

  // Estados Form Músicas
  const [songTitleInput, setSongTitleInput] = useState('');
  const [songArtistInput, setSongArtistInput] = useState('');
  const [songLyricsUrl, setSongLyricsUrl] = useState('');
  const [songYoutubeUrl, setSongYoutubeUrl] = useState('');
  const [songKey, setSongKey] = useState('');
  const [songBpm, setSongBpm] = useState(0);

  useEffect(() => {
    let storedEvents = storage.getEvents();
    let storedArchived = storage.getDeletedEvents();
    let storedMembers = storage.getMembers();
    let storedSongs = storage.getLibrarySongs();

    if (storedMembers.length === 0) {
      storedMembers = INITIAL_MEMBERS_DATA.map(m => ({
        id: crypto.randomUUID(),
        name: formatSentence(m.name),
        roles: m.roles.map(r => formatSentence(r))
      })).sort((a, b) => a.name.localeCompare(b.name));
      storage.saveMembers(storedMembers);
    }
    setMembers(storedMembers);

    if (storedSongs.length <= 2) {
      storedSongs = [
        { id: "s1", title: "A casa é sua", artist: "Casa worship", key: "G", bpm: 72 },
        { id: "s2", title: "Bondade de Deus", artist: "Isaias saad", key: "A", bpm: 68 },
        { id: "s-escape", title: "Escape", artist: "Renascer praise", youtube: "https://youtu.be/vM2A2XEm9TE?si=c9VjVwxDBioQGkXU", lyrics: "https://www.letras.mus.br/renascer-praise/escape/", key: "G" },
        { id: "s-santo", title: "Santo pra sempre", artist: "Marine friesen", youtube: "https://youtu.be/Ao-vBEhBxr0?si=c-t2PXd6tZo61vk2", lyrics: "https://www.letras.mus.br/marine-friesen/santo-pra-sempre/", key: "A" },
        { id: "s-maranata", title: "Maranata", artist: "Ministério avivah", youtube: "https://youtu.be/iS6GXPbhCwU?si=8EymDnHiuuQ8eWbC", lyrics: "https://www.letras.mus.br/ministerio-avivah/maranata/", key: "G" },
        { id: "s-diante", title: "Diante de ti", artist: "Quatro por um", youtube: "https://youtu.be/VHnoXRQhyD8?si=mU4gv5ZVlHekWJ1a", lyrics: "https://www.letras.mus.br/quatro-por-um/201287/", key: "C" }
      ];
      storage.saveLibrarySongs(storedSongs);
    }
    setLibrarySongs(storedSongs);

    const jan25EventIdx = storedEvents.findIndex(ev => ev.date === '2026-01-25');
    if (jan25EventIdx !== -1 && storedEvents[jan25EventIdx].songs.length === 0) {
        storedEvents[jan25EventIdx].songs = JAN_2026_EVENTS.find(e => e.date === '2026-01-25')?.songs || [];
        storage.saveEvents(storedEvents);
    }

    if (storedEvents.length < 5 && storedArchived.length === 0) {
      const mockIds = new Set(JAN_2026_EVENTS.map(e => e.id));
      const filteredStored = storedEvents.filter(e => !mockIds.has(e.id));
      storedEvents = [...JAN_2026_EVENTS, ...filteredStored].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      storage.saveEvents(storedEvents);
    }
    
    setEvents(storedEvents);
    setArchivedEvents(storedArchived);

    const params = new URLSearchParams(window.location.search);
    const eventIdParam = params.get('eventId');
    if (eventIdParam) {
      setExpandedEventId(eventIdParam);
    }
  }, []);

  const saveAll = (evs: WorshipEvent[], mems: Member[], libs: LibrarySong[], arcEvs: WorshipEvent[] = archivedEvents) => {
    setEvents(evs); setMembers(mems); setLibrarySongs(libs); setArchivedEvents(arcEvs);
    storage.saveEvents(evs); 
    storage.saveMembers(mems); 
    storage.saveLibrarySongs(libs);
    storage.saveDeletedEvents(arcEvs);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });

  const handleAdminToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
      showToast("Modo administrador desativado.");
    } else {
      setPasswordInput('');
      setIsPasswordModalOpen(true);
    }
  };

  const verifyAdminPassword = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (passwordInput === '1234') {
      setIsAdmin(true);
      setIsPasswordModalOpen(false);
      showToast("Acesso autorizado!");
    } else {
      showToast("ERRO PROCURE O ADMINISTRADOR DO APP", "error");
      setPasswordInput('');
    }
  };

  const confirmArchiveEvent = () => {
    if (!archiveConfirmEvent) return;
    const { id } = archiveConfirmEvent;
    const eventToMove = events.find(ev => ev.id === id);
    if (eventToMove) {
      const updatedEvents = events.filter(ev => ev.id !== id);
      const updatedArchived = [eventToMove, ...archivedEvents];
      saveAll(updatedEvents, members, librarySongs, updatedArchived);
      showToast("Agenda movida para ARQUIVADAS.");
      setExpandedEventId(null);
    }
    setArchiveConfirmEvent(null);
  };

  const confirmArchiveSong = () => {
    if (!archiveConfirmSong) return;
    const { id } = archiveConfirmSong;
    const updatedLibrary = librarySongs.map(s => {
      if (s.id === id) return { ...s, archived: true };
      return s;
    });
    saveAll(events, members, updatedLibrary, archivedEvents);
    setArchiveConfirmSong(null);
    setIsLibrarySongModalOpen(false);
    showToast("Música arquivada do repertório.");
  };

  const confirmArchiveMember = () => {
    if (!archiveConfirmMember) return;
    const { id } = archiveConfirmMember;
    const updatedMembers = members.map(m => {
      if (m.id === id) return { ...m, archived: true };
      return m;
    });
    saveAll(events, updatedMembers, librarySongs, archivedEvents);
    setArchiveConfirmMember(null);
    setIsMemberModalOpen(false);
    showToast("Membro arquivado da equipe.");
  };

  const handleRestoreMember = (memberId: string) => {
    const updatedMembers = members.map(m => {
      if (m.id === memberId) return { ...m, archived: false };
      return m;
    });
    saveAll(events, updatedMembers, librarySongs, archivedEvents);
    showToast("Membro restaurado para a equipe.");
  };

  const handleRestoreSong = (songId: string) => {
    const updatedLibrary = librarySongs.map(s => {
      if (s.id === songId) return { ...s, archived: false };
      return s;
    });
    saveAll(events, members, updatedLibrary, archivedEvents);
    showToast("Música restaurada para o repertório.");
  };

  const handleRestoreEvent = (eventId: string) => {
    const eventToRestore = archivedEvents.find(ev => ev.id === eventId);
    if (eventToRestore) {
      const updatedArchived = archivedEvents.filter(ev => ev.id !== eventId);
      const updatedEvents = [...events, eventToRestore].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      saveAll(updatedEvents, members, librarySongs, updatedArchived);
      showToast("Agenda retornada para PRÓXIMAS AGENDAS.");
      setExpandedEventId(null);
    }
  };

  const handlePermanentDelete = (eventId: string) => {
    if (confirm("Deseja excluir permanentemente? Esta ação não pode ser desfeita.")) {
      const updatedArchived = archivedEvents.filter(ev => ev.id !== eventId);
      saveAll(events, members, librarySongs, updatedArchived);
      showToast("Agenda excluída permanentemente.");
    }
  };

  const toggleMemberStatus = (eventId: string, memberId: string, role: string, isFromArchived: boolean = false) => {
    const sourceList = isFromArchived ? archivedEvents : events;
    const updatedList = sourceList.map(ev => {
      if (ev.id === eventId) {
        const updatedTeam = ev.team.map(tm => {
          if (tm.id === memberId && tm.role === role) {
            return { ...tm, status: tm.status === 'confirmed' ? 'pending' : 'confirmed' as any };
          }
          return tm;
        });
        return { ...ev, team: updatedTeam };
      }
      return ev;
    });
    
    if (isFromArchived) {
      saveAll(events, members, librarySongs, updatedList);
    } else {
      saveAll(updatedList, members, librarySongs, archivedEvents);
    }
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: WorshipEvent = {
      id: editingEvent?.id || crypto.randomUUID(),
      title: formatSentence(eventTitle),
      date: eventDate, time: eventTime,
      team: eventTeam, songs: eventSongs,
      chat: editingEvent?.chat || [], createdAt: editingEvent?.createdAt || Date.now()
    };
    const updatedEvents = editingEvent ? events.map(ev => ev.id === newEvent.id ? newEvent : ev) : [...events, newEvent];
    saveAll(updatedEvents, members, librarySongs, archivedEvents);
    setIsEventModalOpen(false);
    showToast('Agenda salva!');
  };

  const filteredEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return events
      .filter(ev => {
        const evDate = new Date(ev.date + 'T12:00:00');
        return agendaFilter === 'upcoming' ? evDate >= today : evDate < today;
      })
      .sort((a, b) => {
        const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
        return agendaFilter === 'upcoming' ? diff : -diff;
      });
  }, [events, agendaFilter]);

  const groupedEvents = useMemo(() => {
    const groups: Record<string, WorshipEvent[]> = {};
    filteredEvents.forEach(ev => {
      const label = getMonthYearLabel(ev.date);
      if (!groups[label]) groups[label] = [];
      groups[label].push(ev);
    });
    return groups;
  }, [filteredEvents]);

  const toggleMonthCollapse = (label: string) => {
    setCollapsedMonths(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const sortedMembers = useMemo(() => [...members].sort((a, b) => a.name.localeCompare(b.name)), [members]);

  // FIX: Added explicit return type Member[] and casting to members to resolve type inference issues during JSX mapping.
  const getMembersByRole = (roleQuery: string): Member[] => {
    return (members as Member[]).filter(m => !m.archived && m.roles.some(r => r.toLowerCase().includes(roleQuery.toLowerCase())));
  };

  const addTeamMember = (memberId: string, role?: string) => {
    const m = members.find(mem => mem.id === memberId);
    if (m) {
      if (eventTeam.some(tm => tm.id === m.id && tm.role === role)) return;
      setEventTeam([...eventTeam, { 
        id: m.id, 
        name: m.name, 
        role: role || (m.roles[0] || "Sem função"), 
        status: 'pending', 
        whatsapp: m.whatsapp 
      }]);
    }
  };

  const removeTeamMember = (id: string, role: string) => {
    setEventTeam(eventTeam.filter(m => !(m.id === id && m.role === role)));
  };

  const addSongToSection = (songTitle: string) => {
    const found = librarySongs.find(s => s.title.toLowerCase() === songTitle.toLowerCase());
    const newSong: Song = found ? { ...found } : { 
      id: crypto.randomUUID(), 
      title: formatSentence(songTitle), 
      artist: '', 
      key: '', 
      bpm: 0 
    };
    setEventSongs([...eventSongs, newSong]);
  };

  const toggleSongBadge = (idx: number, type: 'offering' | 'communion') => {
    const updated = [...eventSongs];
    if (type === 'offering') {
      updated[idx].isOffering = !updated[idx].isOffering;
      if (updated[idx].isOffering) updated[idx].isCommunion = false;
    } else {
      updated[idx].isCommunion = !updated[idx].isCommunion;
      if (updated[idx].isCommunion) updated[idx].isOffering = false;
    }
    setEventSongs(updated);
  };

  const sendMessage = (eventId: string, content: string, isFromArchived: boolean = false) => {
    const sourceList = isFromArchived ? archivedEvents : events;
    const updatedList = sourceList.map(ev => {
      if (ev.id === eventId) {
        const chat = ev.chat || [];
        const newMessage: ChatMessage = { 
          id: crypto.randomUUID(), 
          senderName: isAdmin ? 'Ministro' : 'Membro', 
          type: 'text', 
          content: formatSentence(content), 
          timestamp: Date.now() 
        };
        return { ...ev, chat: [...chat, newMessage] };
      }
      return ev;
    });

    if (isFromArchived) {
      saveAll(events, members, librarySongs, updatedList);
    } else {
      saveAll(updatedList, members, librarySongs, archivedEvents);
    }
    setChatInput('');
  };

  const handleShareWhatsApp = (e: React.MouseEvent | React.TouchEvent, event: WorshipEvent) => {
    if (e) {
      e.stopPropagation();
      if ('preventDefault' in e) e.preventDefault();
    }
    
    const eventUrl = `${window.location.origin}${window.location.pathname}?eventId=${event.id}`;
    const dateFormatted = new Date(event.date + 'T12:00:00').toLocaleDateString('pt-BR');
    const ministros = event.team
      .filter(m => m.role.toLowerCase().includes('ministro'))
      .map(m => m.name)
      .join(', ') || 'Não definido';
      
    const text = `*AGENDA LOUVOR ADAN*\n\n🗓️Data: ${dateFormatted}\nEvento: ${toTitleCase(event.title)}\n⌛Horário: ${event.time}h\n🎙️Ministro: ${ministros}\n\nVer mais: ${eventUrl}`;
    
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const handleAddToCalendar = (event: WorshipEvent) => {
    const ministros = event.team.filter(m => m.role.toLowerCase().includes('ministro')).map(m => m.name).join(', ') || 'Não definido';
    const repertoire = event.songs.map((s, i) => `${i + 1}. ${s.title} (${s.key})`).join('\n') || 'Setlist não definido';
    
    const startTime = event.date.replace(/-/g, '') + 'T' + event.time.replace(':', '') + '00';
    const endHour = (parseInt(event.time.split(':')[0]) + 2).toString().padStart(2, '0');
    const endTime = event.date.replace(/-/g, '') + 'T' + endHour + event.time.split(':')[1] + '00';
    
    const details = `Ministro: ${ministros}\n\nRepertório:\n${repertoire}`;
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(details)}&location=Igreja%20ADAN`;
    
    window.open(calendarUrl, '_blank');
  };

  const SelectedMembersList = ({ role }: { role: string }) => {
    const list = eventTeam.filter(m => m.role === role);
    if (list.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1.5 mt-2 ml-1">
        {list.map((m) => (
          <div key={`${m.id}-${m.role}`} className="bg-red-800 text-white px-2.5 py-1 rounded-lg flex items-center gap-1.5 animate-in zoom-in duration-200">
            <span className="text-[10px] font-medium tracking-wider whitespace-nowrap">{toTitleCase(m.name)}</span>
            <button type="button" onClick={() => removeTeamMember(m.id, m.role)} className="hover:bg-red-700 rounded-full p-0.5">
              <X size={10} />
            </button>
          </div>
        ))}
      </div>
    );
  };

  const TeamPreview = ({ team, isBold }: { team: TeamMember[], isBold: boolean }) => {
    const ministros = team.filter(m => m.role.toLowerCase().includes('ministro'));
    const vocal = team.filter(m => m.role.toLowerCase().includes('vocal'));
    const banda = team.filter(m => !m.role.toLowerCase().includes('vocal') && !m.role.toLowerCase().includes('ministro'));

    if (team.length === 0) return null;

    return (
      <div className={`flex flex-wrap items-center gap-2 mt-2 ${isBold ? 'opacity-100' : 'opacity-80'}`}>
        {ministros.length > 0 && (
          <div className="flex items-center gap-1.5 bg-red-50 border border-red-100/50 py-0.5 px-2 rounded-lg shadow-sm">
            <div className="flex items-center gap-1 shrink-0">
              <Mic size={10} className="text-red-800" />
              <span className="text-[8px] font-black text-red-400 uppercase tracking-tighter">Ministro</span>
            </div>
            <div className="flex items-center gap-1.5">
              {ministros.map(m => (
                <span key={`${m.id}-${m.role}`} className="text-[10.5px] font-black text-red-950 tracking-tight whitespace-nowrap drop-shadow-sm">
                  {toTitleCase(m.name)}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
           {banda.length > 0 && (
             <div className="flex items-center gap-1">
               <Drum size={10} className="text-red-400 opacity-50 shrink-0" />
               <div className="flex -space-x-1">
                 {banda.slice(0, 4).map(m => (
                   <span key={`${m.id}-${m.role}`} title={m.name} className="text-[9px] font-black text-red-900 bg-white px-1.5 py-0.5 rounded-md border border-red-50 shadow-sm ring-1 ring-red-50">{getInitials(m.name)}</span>
                 ))}
                 {banda.length > 4 && <span className="text-[8px] font-black text-red-400 pl-1.5">+{banda.length - 4}</span>}
               </div>
             </div>
           )}
           {vocal.length > 0 && (
             <div className="flex items-center gap-1">
               <Mic2 size={10} className="text-red-400 opacity-50 shrink-0" />
               <div className="flex -space-x-1">
                 {vocal.slice(0, 4).map(m => (
                   <span key={`${m.id}-${m.role}`} title={m.name} className="text-[9px] font-black text-red-900 bg-white px-1.5 py-0.5 rounded-md border border-red-50 shadow-sm ring-1 ring-red-50">{getInitials(m.name)}</span>
                 ))}
                 {vocal.length > 4 && <span className="text-[8px] font-black text-red-400 pl-1.5">+{vocal.length - 4}</span>}
               </div>
             </div>
           )}
        </div>
      </div>
    );
  };

  const renderEventDetails = (event: WorshipEvent, isArchived: boolean = false) => (
    <div className="px-6 pb-8 border-t border-red-50 pt-6 space-y-8 animate-in slide-in-from-top-4 duration-500">
      <div className="space-y-6">
        <div className="space-y-4">
          <button 
            onClick={() => handleAddToCalendar(event)}
            className="w-full flex items-center justify-center gap-3 bg-red-800 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] shadow-xl shadow-red-100 hover:bg-red-900 transition-all active:scale-[0.98]"
          >
            <CalendarPlus size={18} /> Adicionar no calendário
          </button>
          
          <div className="flex justify-between items-center border-b border-red-50 pb-2 pt-2">
            <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-2">
              <UserCheck size={14} /> EQUIPE DO DIA
            </h4>
          </div>
        </div>
        
        <div className="space-y-2">
          <span className="text-[9px] font-black text-red-400 uppercase ml-1 block tracking-wider">Ministro</span>
          <div className="space-y-1.5">
            {event.team.filter(m => m.role.toLowerCase().includes('ministro')).map(m => (
              <div key={`${m.id}-${m.role}`} className="bg-red-50/40 p-2.5 rounded-xl border border-red-100 flex items-center gap-3 shadow-sm group">
                <div className="bg-white p-1 rounded-md text-red-900 shrink-0"><Mic size={16}/></div>
                <span className="text-[12px] font-black text-red-950 truncate tracking-wider flex-1">{toTitleCase(m.name)}</span>
                <button 
                  onClick={() => toggleMemberStatus(event.id, m.id, m.role, isArchived)}
                  className={`p-1.5 rounded-lg transition-all ${m.status === 'confirmed' ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-white text-red-100 hover:bg-red-50 border border-red-50'}`}
                >
                  <Check size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-[9px] font-black text-red-400 uppercase ml-1 block flex items-center gap-1 tracking-wider">Banda</span>
            <div className="space-y-1.5">
              {event.team.filter(m => !m.role.toLowerCase().includes('vocal') && !m.role.toLowerCase().includes('ministro')).map(m => (
                <div key={`${m.id}-${m.role}`} className="bg-red-50/30 p-2 rounded-xl border border-red-50/50 flex items-center gap-2">
                  <div className="bg-white p-1 rounded-md text-red-900 shrink-0">{getRoleIcon(m.role, 12)}</div>
                  <span className="text-[12px] font-black text-red-950 truncate tracking-wider flex-1">{toTitleCase(m.name)}</span>
                  <button 
                    onClick={() => toggleMemberStatus(event.id, m.id, m.role, isArchived)}
                    className={`p-1 rounded-md transition-all ${m.status === 'confirmed' ? 'bg-green-500 text-white' : 'bg-white text-red-100 border border-red-50'}`}
                  >
                    <Check size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2 border-l border-red-50 pl-4">
            <span className="text-[9px] font-black text-red-400 uppercase ml-1 block tracking-wider">Vocal</span>
            <div className="space-y-1.5">
              {event.team.filter(m => m.role.toLowerCase().includes('vocal')).map(m => (
                <div key={`${m.id}-${m.role}`} className="bg-red-50/30 p-2 rounded-xl border border-red-50/50 flex items-center gap-2">
                  <div className="bg-white p-1 rounded-md text-red-900 shrink-0"><Mic2 size={12}/></div>
                  <span className="text-[12px] font-black text-red-950 truncate tracking-wider flex-1">{toTitleCase(m.name)}</span>
                  <button 
                    onClick={() => toggleMemberStatus(event.id, m.id, m.role, isArchived)}
                    className={`p-1 rounded-md transition-all ${m.status === 'confirmed' ? 'bg-green-500 text-white' : 'bg-white text-red-100 border border-red-50'}`}
                  >
                    <Check size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-2"><Music size={14} /> SETLIST</h4>
        <div className="space-y-3">
          {event.songs.length === 0 ? (
            <p className="text-center py-4 text-[10px] text-red-900/30 font-black uppercase italic tracking-tighter">Setlist ainda não definido</p>
          ) : (
            [
              ...event.songs.filter(s => !s.isOffering && !s.isCommunion),
              ...event.songs.filter(s => s.isOffering),
              ...event.songs.filter(s => s.isCommunion)
            ].map((song, i) => (
              <div key={i} className={`bg-white p-3 rounded-2xl border shadow-sm flex items-center gap-3 ${song.isOffering ? 'border-amber-200 bg-amber-50/20' : song.isCommunion ? 'border-purple-200 bg-purple-50/20' : 'border-red-50'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${song.isOffering ? 'bg-amber-500 text-white' : song.isCommunion ? 'bg-purple-500 text-white' : 'bg-red-900 text-white'}`}>
                  {i+1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-red-950 text-xs truncate tracking-wider flex items-center gap-1.5">
                    {formatSentence(song.title)} 
                    {song.isOffering && <span className="bg-amber-500 text-white px-1.5 py-0.5 rounded text-[8px] font-black border border-amber-600 uppercase tracking-tighter shrink-0">💰 Oferta</span>}
                    {song.isCommunion && <span className="bg-purple-500 text-white px-1.5 py-0.5 rounded text-[8px] font-black border border-purple-600 uppercase tracking-tighter shrink-0">🍷 Ceia</span>}
                  </p>
                  <p className="text-[9px] font-bold text-red-400 tracking-wider">Tom: {song.key}</p>
                </div>
                <div className="flex gap-1.5">
                  {song.youtube && <a href={song.youtube} target="_blank" rel="noreferrer" className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"><Youtube size={14}/></a>}
                  {song.lyrics && <a href={song.lyrics} target="_blank" rel="noreferrer" className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"><FileText size={14}/></a>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-red-50">
        <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-2">
           <MessageCircle size={14} /> CHAT DE ORIENTAÇÃO
        </h4>
        <div className="bg-red-50/30 rounded-[2rem] p-4 max-h-64 overflow-y-auto space-y-3 no-scrollbar border border-red-100/50">
          {(!event.chat || event.chat.length === 0) ? (
            <p className="text-center py-4 text-[10px] text-red-900/30 font-black uppercase italic tracking-tighter">Nenhuma mensagem ainda</p>
          ) : (
            event.chat.map(msg => (
              <div key={msg.id} className={`flex flex-col ${msg.senderName === (isAdmin ? 'Ministro' : 'Membro') ? 'items-end' : 'items-start'}`}>
                <span className="text-[8px] font-black text-red-400 mb-1 px-2 tracking-wider">{toTitleCase(msg.senderName)}</span>
                <div className={`p-3 rounded-[1.5rem] max-w-[85%] shadow-sm ${msg.senderName === (isAdmin ? 'Ministro' : 'Membro') ? 'bg-red-800 text-white rounded-tr-none' : 'bg-white text-red-950 rounded-tl-none border border-red-50'}`}>
                  <p className="text-xs font-bold leading-tight tracking-wider">{toTitleCase(msg.content)}</p>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="flex items-center gap-2 bg-white p-2 rounded-[2rem] border border-red-100 shadow-inner">
           <input 
            value={chatInput} 
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Escreva uma mensagem..." 
            className="flex-1 bg-transparent border-none text-sm font-medium text-red-950 outline-none px-4" 
            onKeyPress={(e) => e.key === 'Enter' && chatInput && sendMessage(event.id, chatInput, isArchived)}
           />
           <button 
            disabled={!chatInput}
            onClick={() => chatInput && sendMessage(event.id, chatInput, isArchived)}
            className="p-3 bg-red-800 text-white rounded-full disabled:opacity-30 shadow-lg active:scale-90 transition-all"
           >
            <Send size={18}/>
           </button>
        </div>
      </div>

      {isAdmin && (
        <div className="flex justify-between items-center pt-6 border-t border-red-50 gap-4">
           {isArchived ? (
             <>
               <button 
                onClick={() => handleRestoreEvent(event.id)}
                className="flex-1 py-3 bg-green-50 text-green-700 font-black text-[10px] rounded-xl uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 hover:bg-green-100 transition-colors"
               >
                <RotateCcw size={16} /> RETORNAR AGENDA
               </button>
               <button 
                onClick={() => handlePermanentDelete(event.id)}
                className="p-3 text-rose-400 hover:text-rose-700 transition-colors rounded-xl flex items-center justify-center"
               >
                <Trash2 size={18} />
               </button>
             </>
           ) : (
             <>
               <button 
                onClick={() => setArchiveConfirmEvent({ id: event.id, title: event.title })}
                className="flex-1 py-3 bg-red-50 text-red-800 font-black text-[10px] rounded-xl uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-all"
               >
                <Archive size={16} /> Arquivar Agenda
               </button>
               <button onClick={() => { setEditingEvent(event); setIsEventModalOpen(true); }} className="px-6 py-3 bg-red-950 text-white font-black text-[10px] rounded-xl uppercase tracking-wider shadow-sm">Editar</button>
             </>
           )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen max-w-lg mx-auto bg-rose-50/20 relative pb-24">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <header className="bg-red-950 pt-12 pb-6 px-6 rounded-b-[4rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12"><Music size={160} className="text-red-100" /></div>
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div className="animate-in fade-in slide-in-from-left-4 duration-700">
              <h1 className="text-4xl font-black text-white tracking-tighter drop-shadow-lg text-nowrap uppercase">ADORE APP</h1>
              <p className="text-red-100 text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-80">Agenda Louvor Igreja ADAN</p>
            </div>
            <button onClick={handleAdminToggle} className={isAdmin ? 'bg-red-600 text-white shadow-xl scale-110 p-3 rounded-2xl transition-all' : 'bg-red-900/40 text-red-200 p-3 rounded-2xl transition-all'}>
              {isAdmin ? <Unlock size={20} /> : <Lock size={20} />}
            </button>
          </div>
          <nav className="flex bg-red-900/30 p-1.5 rounded-2xl gap-1 shadow-inner">
            {[
              { id: 'scales', label: 'Agendas', icon: <Calendar size={20} /> },
              { id: 'repertoire', label: 'Repertório', icon: <ListMusic size={20} /> },
              { id: 'members', label: 'Equipe', icon: <Users size={20} /> }
            ].map((t) => (
              <button 
                key={t.id} 
                onClick={() => setActiveTab(t.id as any)} 
                className={`flex-1 py-3 px-1 rounded-xl text-[10px] font-black transition-all flex flex-col items-center gap-1.5 ${activeTab === t.id ? 'bg-white text-red-950 shadow-lg scale-[1.02]' : 'text-red-100'}`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="px-6 py-8">
        {activeTab === 'scales' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center px-2">
                <h2 className="text-2xl font-black text-red-950 uppercase tracking-tighter">
                  {agendaFilter === 'upcoming' ? 'Próximas agendas' : 'Agendas anteriores'}
                </h2>
                {isAdmin && <button onClick={() => { setEditingEvent(null); setIsEventModalOpen(true); }} className="bg-red-800 p-3 rounded-2xl text-white shadow-xl active:scale-90"><Plus size={24} /></button>}
              </div>
              <div className="flex bg-white/50 p-1 rounded-2xl border border-red-50 shadow-sm">
                <button onClick={() => setAgendaFilter('upcoming')} className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all ${agendaFilter === 'upcoming' ? 'bg-red-800 text-white shadow-md' : 'text-red-900/40'}`}>PRÓXIMAS</button>
                <button onClick={() => setAgendaFilter('past')} className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all ${agendaFilter === 'past' ? 'bg-red-800 text-white shadow-md' : 'text-red-900/40'}`}>ANTERIORES</button>
              </div>
            </div>

            <div className="space-y-8">
              {Object.entries(groupedEvents).map(([monthLabel, monthEvents]) => (
                <div key={monthLabel} className="space-y-4">
                  <button 
                    onClick={() => toggleMonthCollapse(monthLabel)}
                    className="w-full flex items-center justify-between py-2 border-b border-red-100 group transition-all"
                  >
                    <h3 className="text-sm font-normal text-red-900/60 uppercase tracking-[0.2em]">{monthLabel}</h3>
                    <div className="bg-white/50 p-1.5 rounded-full border border-red-50 text-red-400 group-hover:bg-red-800 group-hover:text-white transition-all">
                      {collapsedMonths[monthLabel] ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                    </div>
                  </button>

                  {!collapsedMonths[monthLabel] && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      {monthEvents.map((event, index) => {
                        const confirmedCount = event.team.filter(m => m.status === 'confirmed').length;
                        const totalCount = event.team.length;
                        const allConfirmed = totalCount > 0 && confirmedCount === totalCount;
                        const isNextEvent = index === 0 && agendaFilter === 'upcoming';

                        return (
                          <div key={event.id} className={`rounded-[2.5rem] border overflow-hidden transition-all duration-300 bg-white ${isNextEvent ? 'border-orange-200 ring-2 ring-orange-50/50' : 'border-red-50'}`}>
                            <div className="p-5 cursor-pointer flex items-center gap-5" onClick={() => setExpandedEventId(expandedEventId === event.id ? null : event.id)}>
                              <div className={`w-16 h-16 rounded-[1.8rem] flex flex-col items-center justify-center border shrink-0 ${isNextEvent ? 'bg-orange-50 border-orange-100' : 'bg-red-50 border-red-100'}`}>
                                <span className={`text-[10px] font-black uppercase leading-none mb-1 ${isNextEvent ? 'text-orange-700' : 'text-red-800'}`}>{new Date(event.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</span>
                                <span className={`text-2xl font-black leading-none ${isNextEvent ? 'text-orange-950' : 'text-red-950'}`}>{event.date.split('-')[2]}</span>
                              </div>
                              <div className="flex-1 min-0">
                                <div className="flex items-center gap-2">
                                  <h3 className={`truncate text-lg leading-tight tracking-wider ${isNextEvent ? 'font-black text-orange-950' : 'font-semibold text-red-950'}`}>{toTitleCase(event.title)}</h3>
                                  <button 
                                    onClick={(e) => handleShareWhatsApp(e, event)}
                                    className="p-1.5 text-red-200 hover:text-red-600 transition-colors"
                                    title="Compartilhar link"
                                  >
                                    <LinkIcon size={16} />
                                  </button>
                                  {isNextEvent && <span className="text-[8px] bg-orange-500 text-white px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter shrink-0 animate-pulse">Próximo</span>}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <p className={`text-xs uppercase drop-shadow-sm tracking-normal ${isNextEvent ? 'font-black text-orange-700' : 'font-medium text-red-700'}`}>{event.time}h</p>
                                  <span className="text-[10px] opacity-20 text-red-900">•</span>
                                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${allConfirmed ? 'bg-green-100' : 'bg-white border border-red-50'}`}>
                                    <span className={`text-[10px] font-black ${allConfirmed ? 'text-green-700' : isNextEvent ? 'text-orange-600' : 'text-red-400'}`}>
                                      {confirmedCount}/{totalCount} <span className="text-[8px] opacity-70">pessoas</span>
                                    </span>
                                    <Check size={10} className={allConfirmed ? 'text-green-700' : isNextEvent ? 'text-orange-200' : 'text-red-100'} />
                                  </div>
                                </div>
                                
                                {!expandedEventId && <TeamPreview team={event.team} isBold={isNextEvent} />}
                              </div>
                              <ChevronDown size={24} className={`text-red-200 transition-transform ${expandedEventId === event.id ? 'rotate-180' : ''}`} />
                            </div>

                            {expandedEventId === event.id && renderEventDetails(event, false)}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              {isAdmin && (
                <div className="mt-12 space-y-4 pt-8 border-t-2 border-dashed border-red-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center gap-3 px-4">
                    <Archive className="text-red-300" size={20} />
                    <h3 className="text-sm font-black text-red-300 uppercase tracking-[0.2em]">ARQUIVADAS</h3>
                  </div>
                  {archivedEvents.length === 0 ? (
                    <p className="text-center py-8 text-[10px] text-red-200 font-black uppercase tracking-widest italic">Nenhuma agenda arquivada</p>
                  ) : (
                    <div className="space-y-3">
                      {archivedEvents.map(event => (
                        <div key={event.id} className={`rounded-[2rem] border overflow-hidden transition-all duration-300 bg-white/50 border-red-100`}>
                          <div className="p-4 cursor-pointer flex items-center gap-4" onClick={() => setExpandedEventId(expandedEventId === event.id ? null : event.id)}>
                            <div className="bg-white w-10 h-10 rounded-[1rem] flex flex-col items-center justify-center shrink-0 border border-red-50 shadow-sm">
                              <span className="text-[10px] font-black text-red-950 leading-none">{event.date.split('-')[2]}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-red-950 text-xs truncate tracking-wider">{toTitleCase(event.title)}</p>
                              <p className="text-[9px] font-bold text-red-400 uppercase tracking-tighter">{event.date} • {event.time}h</p>
                            </div>
                            <ChevronDown size={20} className={`text-red-200 transition-transform ${expandedEventId === event.id ? 'rotate-180' : ''}`} />
                          </div>
                          {expandedEventId === event.id && renderEventDetails(event, true)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'repertoire' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-2xl font-black text-red-950 uppercase tracking-tighter">Biblioteca</h2>
              {isAdmin && <button onClick={() => { setEditingLibrarySong(null); setIsLibrarySongModalOpen(true); }} className="bg-red-800 p-3 rounded-2xl text-white shadow-xl"><Plus size={24} /></button>}
            </div>
            
            <div className="space-y-4">
              {librarySongs.filter(s => !s.archived).map(song => (
                <div key={song.id} className="bg-white p-6 rounded-[2.5rem] border border-red-50 shadow-sm group relative">
                  {isAdmin && (
                    <div className="absolute top-6 right-6 flex gap-2">
                      <button onClick={() => { setEditingLibrarySong(song); setIsLibrarySongModalOpen(true); }} className="p-2 text-red-400 hover:text-red-800 transition-colors bg-red-50 rounded-xl" title="Editar"><Edit3 size={18} /></button>
                      <button onClick={() => { setArchiveConfirmSong({ id: song.id, title: song.title }); }} className="p-2 text-rose-400 hover:text-rose-800 transition-colors bg-rose-50 rounded-xl" title="Arquivar"><Archive size={18} /></button>
                    </div>
                  )}
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-800 shrink-0"><Music2 size={28} /></div>
                    <div className="flex-1 pr-16 space-y-1">
                      <h3 className="font-black text-red-950 truncate text-lg leading-tight tracking-tighter">{formatSentence(song.title)}</h3>
                      <p className="text-sm font-bold text-red-700/60 tracking-wider">{formatSentence(song.artist)}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                         <span className="bg-red-50 text-[10px] font-black text-red-900 px-3 py-1 rounded-lg uppercase tracking-tighter">
                           🎼 {isAdmin ? 'Tom Original:' : 'Tom:'} {song.key}
                         </span>
                         {song.bpm ? <span className="bg-red-50 text-[10px] font-black text-red-900 px-3 py-1 rounded-lg uppercase tracking-tighter">⏱️ BPM: {song.bpm}</span> : null}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6 pt-5 border-t border-red-50">
                     {song.youtube && <a href={song.youtube} target="_blank" rel="noreferrer" className="flex-1 bg-red-50 text-red-800 text-xs font-black py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors hover:bg-red-100 uppercase tracking-tighter"><Youtube size={16}/> Youtube</a>}
                     {song.lyrics && <a href={song.lyrics} target="_blank" rel="noreferrer" className="flex-1 bg-red-50 text-red-800 text-xs font-black py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors hover:bg-red-100 uppercase tracking-tighter"><FileText size={16}/> Letra</a>}
                  </div>
                </div>
              ))}
              
              {librarySongs.filter(s => !s.archived).length === 0 && (
                <p className="text-center py-12 text-[10px] text-red-900/30 font-black uppercase italic tracking-widest">Nenhuma música no repertório ativo</p>
              )}
            </div>

            {isAdmin && librarySongs.filter(s => s.archived).length > 0 && (
              <div className="mt-12 space-y-4 pt-8 border-t-2 border-dashed border-red-100">
                <div className="flex items-center gap-3 px-4">
                  <Archive className="text-red-300" size={20} />
                  <h3 className="text-sm font-black text-red-300 uppercase tracking-[0.2em]">REPERTÓRIO ARQUIVADO</h3>
                </div>
                <div className="space-y-3">
                  {librarySongs.filter(s => s.archived).map(song => (
                    <div key={song.id} className="bg-white/50 p-4 rounded-[2rem] border border-red-100 shadow-sm flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-red-950 text-xs truncate">{formatSentence(song.title)}</p>
                        <p className="text-[9px] font-bold text-red-400 uppercase">{formatSentence(song.artist)}</p>
                      </div>
                      <button 
                        onClick={() => handleRestoreSong(song.id)}
                        className="bg-green-50 text-green-700 p-2 rounded-xl hover:bg-green-100 transition-colors"
                        title="Restaurar música"
                      >
                        <RotateCcw size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-2xl font-black text-red-950 uppercase tracking-tighter">Louvor adan</h2>
              {isAdmin && <button onClick={() => { setEditingMember(null); setIsMemberModalOpen(true); }} className="bg-red-800 p-3 rounded-2xl text-white shadow-xl"><UserPlus size={24} /></button>}
            </div>
            <div className="grid gap-6">
              {sortedMembers.filter(m => !m.archived).map(member => (
                <div key={member.id} className="bg-white p-6 rounded-[3rem] border border-red-50 shadow-sm flex flex-col gap-6 relative group overflow-hidden">
                  {isAdmin && (
                    <div className="absolute top-6 right-6 flex gap-2">
                      <button onClick={() => { setEditingMember(member); setIsMemberModalOpen(true); }} className="p-2.5 text-red-400 hover:text-red-800 transition-colors bg-red-50 rounded-2xl shadow-sm" title="Editar"><Edit3 size={18}/></button>
                      <button onClick={() => { setArchiveConfirmMember({ id: member.id, name: member.name }); }} className="p-2.5 text-rose-400 hover:text-rose-800 transition-colors bg-rose-50 rounded-2xl shadow-sm" title="Arquivar"><Archive size={18} /></button>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-[2rem] bg-red-100 flex items-center justify-center text-3xl font-black text-red-950 overflow-hidden shrink-0 uppercase tracking-tighter shadow-inner border-2 border-white">
                      {member.photoUrl ? <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" /> : member.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-red-950 truncate text-xl uppercase tracking-wider">{toTitleCase(member.name)}</h3>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {member.roles?.map(r => (
                           <span key={r} className="text-[9px] font-black text-red-700 bg-red-50 px-3 py-1 rounded-lg uppercase tracking-widest border border-red-100/50 shadow-sm">{r}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-red-50/50">
                    <div className="bg-rose-50/30 p-3 rounded-2xl border border-red-50/50 flex items-center gap-3">
                      <Cake size={14} className="text-red-400 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[8px] font-black text-red-300 uppercase block leading-none mb-1">Aniversário</span>
                        <span className="text-xs font-black text-red-900 truncate block tracking-wider">{member.birthday || '--/--'}</span>
                      </div>
                    </div>
                    <div className="bg-rose-50/30 p-3 rounded-2xl border border-red-50/50 flex items-center gap-3">
                      <Heart size={14} className="text-red-400 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[8px] font-black text-red-300 uppercase block leading-none mb-1">Célula</span>
                        <span className="text-xs font-black text-red-900 truncate block tracking-wider">{member.cellGroup || 'Nenhuma'}</span>
                      </div>
                    </div>
                    <div className="bg-rose-50/30 p-3 rounded-2xl border border-red-50/50 flex items-center gap-3 col-span-2">
                      <UserCheck size={14} className="text-red-400 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[8px] font-black text-red-300 uppercase block leading-none mb-1">Discipulador</span>
                        <span className="text-xs font-black text-red-900 truncate block tracking-wider">{member.mentor || 'Nenhum'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {isAdmin && sortedMembers.filter(m => m.archived).length > 0 && (
              <div className="mt-12 space-y-4 pt-8 border-t-2 border-dashed border-red-100">
                <div className="flex items-center gap-3 px-4">
                  <Archive className="text-red-300" size={20} />
                  <h3 className="text-sm font-black text-red-300 uppercase tracking-[0.2em]">MEMBROS ARQUIVADOS</h3>
                </div>
                <div className="space-y-3">
                  {sortedMembers.filter(m => m.archived).map(member => (
                    <div key={member.id} className="bg-white/50 p-4 rounded-[2rem] border border-red-100 shadow-sm flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center font-black text-red-950 uppercase border border-white shrink-0">
                          {member.name.charAt(0)}
                        </div>
                        <div className="truncate">
                          <p className="font-black text-red-950 text-xs truncate">{toTitleCase(member.name)}</p>
                          <p className="text-[9px] font-bold text-red-400 uppercase tracking-tighter">{member.roles?.[0] || 'Sem função'}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRestoreMember(member.id)}
                        className="bg-green-50 text-green-700 p-2.5 rounded-xl hover:bg-green-100 transition-colors shadow-sm"
                        title="Restaurar membro"
                      >
                        <RotateCcw size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal Senha Administrador */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-red-950/95 backdrop-blur-xl p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-sm rounded-[3rem] p-10 shadow-2xl text-center space-y-8 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-50 text-red-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <KeyRound size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-red-950 uppercase tracking-tighter">Acesso Restrito</h3>
              <p className="text-xs text-red-900/60 font-medium uppercase tracking-widest">Digite a senha de administrador</p>
            </div>
            <form onSubmit={verifyAdminPassword} className="space-y-6">
              <input 
                autoFocus
                type="password"
                placeholder="****"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-red-50/50 border-none rounded-2xl px-6 py-5 text-center text-2xl font-black tracking-[1em] text-red-950 shadow-inner outline-none focus:ring-4 focus:ring-red-100"
              />
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="py-4 bg-red-50 text-red-800 font-black text-[10px] rounded