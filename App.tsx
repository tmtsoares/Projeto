
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, Music, Mic2, CheckCircle2, XCircle, Youtube, 
  FileText, Plus, Trash2, Edit3, Users, ChevronDown, 
  ChevronUp, MessageCircle, Share2, UserPlus, Phone, 
  Sparkles, Search, Save, X, ListMusic, History
} from 'lucide-react';
import { WorshipEvent, Member, TeamMember, Song, Status } from './types';
import { storage } from './services/storageService';
import { suggestSongs, generateConfirmationMessage } from './services/geminiService';
import { getRoleIcon } from './components/IconHelper';

// --- Components ---

const Toast = ({ message, type = 'success', onClose }: { message: string, type?: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] animate-bounce">
      <div className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 ${type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>
        {type === 'error' ? <XCircle size={20} /> : <CheckCircle2 size={20} />}
        <span className="font-bold text-sm">{message}</span>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'scales' | 'members' | 'ai'>('scales');
  const [events, setEvents] = useState<WorshipEvent[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Modals
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<WorshipEvent | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  
  // AI Logic
  const [aiTheme, setAiTheme] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

  useEffect(() => {
    setEvents(storage.getEvents());
    setMembers(storage.getMembers());
  }, []);

  const saveToStorage = (newEvents: WorshipEvent[], newMembers: Member[]) => {
    setEvents(newEvents);
    setMembers(newMembers);
    storage.saveEvents(newEvents);
    storage.saveMembers(newMembers);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  // --- Handlers ---
  const handleSaveEvent = (event: WorshipEvent) => {
    const newEvents = editingEvent 
      ? events.map(e => e.id === event.id ? event : e)
      : [...events, { ...event, id: crypto.randomUUID(), createdAt: Date.now() }];
    saveToStorage(newEvents, members);
    setIsEventModalOpen(false);
    setEditingEvent(null);
    showToast(editingEvent ? 'Escala atualizada' : 'Escala criada com sucesso!');
  };

  const handleSaveMember = (member: Member) => {
    const newMembers = editingMember
      ? members.map(m => m.id === member.id ? member : m)
      : [...members, { ...member, id: crypto.randomUUID() }];
    saveToStorage(events, newMembers);
    setIsMemberModalOpen(false);
    setEditingMember(null);
    showToast(editingMember ? 'Cadastro atualizado' : 'Membro adicionado!');
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm('Deseja excluir esta escala?')) {
      saveToStorage(events.filter(e => e.id !== id), members);
      showToast('Escala removida');
    }
  };

  const handleDeleteMember = (id: string) => {
    if (confirm('Deseja remover este membro da equipe?')) {
      saveToStorage(events, members.filter(m => m.id !== id));
      showToast('Membro removido');
    }
  };

  const toggleStatus = (eventId: string, memberId: string) => {
    const newEvents = events.map(e => {
      if (e.id === eventId) {
        return {
          ...e,
          team: e.team.map(m => {
            if (m.id === memberId) {
              const next: Status = m.status === 'pending' ? 'confirmed' : m.status === 'confirmed' ? 'declined' : 'pending';
              return { ...m, status: next };
            }
            return m;
          })
        };
      }
      return e;
    });
    saveToStorage(newEvents, members);
  };

  const handleAISuggestions = async () => {
    if (!aiTheme) return;
    setAiLoading(true);
    try {
      const suggestions = await suggestSongs(aiTheme);
      setAiSuggestions(suggestions);
    } catch (err) {
      showToast('Erro ao buscar sugestões', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const sendWhatsApp = (event: WorshipEvent, teamMember: TeamMember) => {
    const msg = generateConfirmationMessage(event.title, event.date, event.time, teamMember.role);
    const url = `https://wa.me/${teamMember.whatsapp?.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events]);

  return (
    <div className="min-h-screen max-w-lg mx-auto bg-slate-50 relative pb-24">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <header className="bg-indigo-900 pt-12 pb-8 px-6 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
          <Music size={160} />
        </div>
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Harmonia AI</h1>
              <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest">Praise Team Manager</p>
            </div>
            <button className="p-2 bg-indigo-800/50 rounded-full text-indigo-100 hover:bg-indigo-700 transition-colors">
              <Share2 size={20} />
            </button>
          </div>
          
          <div className="flex bg-indigo-800/40 p-1.5 rounded-2xl gap-2">
            <button 
              onClick={() => setActiveTab('scales')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'scales' ? 'bg-white text-indigo-900 shadow-lg' : 'text-indigo-100'}`}
            >
              <Calendar size={18} /> Escalas
            </button>
            <button 
              onClick={() => setActiveTab('members')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'members' ? 'bg-white text-indigo-900 shadow-lg' : 'text-indigo-100'}`}
            >
              <Users size={18} /> Equipe
            </button>
            <button 
              onClick={() => setActiveTab('ai')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'ai' ? 'bg-indigo-500 text-white shadow-lg' : 'text-indigo-100'}`}
            >
              <Sparkles size={18} /> IA
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        {activeTab === 'scales' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-extrabold text-slate-800">Próximos Cultos</h2>
              <button 
                onClick={() => { setEditingEvent(null); setIsEventModalOpen(true); }}
                className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-200 active:scale-95 transition-transform"
              >
                <Plus size={24} />
              </button>
            </div>

            {sortedEvents.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-indigo-600">
                  <Calendar size={40} />
                </div>
                <p className="text-slate-500 font-medium">Nenhuma escala programada.</p>
              </div>
            ) : (
              sortedEvents.map(event => (
                <div 
                  key={event.id}
                  className={`bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all ${expandedEventId === event.id ? 'ring-2 ring-indigo-500/20' : ''}`}
                >
                  <div 
                    className="p-5 cursor-pointer flex items-center gap-5"
                    onClick={() => setExpandedEventId(expandedEventId === event.id ? null : event.id)}
                  >
                    <div className="bg-indigo-50 w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 border border-indigo-100">
                      <span className="text-[10px] font-black text-indigo-600 uppercase">
                        {new Date(event.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                      </span>
                      <span className="text-2xl font-black text-slate-800 leading-none">
                        {event.date.split('-')[2]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">{event.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="font-semibold">{event.time}h</span>
                        <span className="text-slate-300">•</span>
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                          {event.team.filter(m => m.status === 'confirmed').length}/{event.team.length} Confirmados
                        </span>
                      </div>
                    </div>
                    <div className="text-slate-300">
                      {expandedEventId === event.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>

                  {expandedEventId === event.id && (
                    <div className="px-5 pb-5 animate-in slide-in-from-top-2 duration-300">
                      <div className="space-y-3 pt-4 border-t border-slate-50">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Users size={12} /> Equipe Escalada
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {event.team.map(m => (
                            <div 
                              key={m.id}
                              onClick={() => toggleStatus(event.id, m.id)}
                              className={`flex items-center p-3 rounded-2xl border transition-all cursor-pointer group ${
                                m.status === 'confirmed' ? 'bg-emerald-50 border-emerald-100' : 
                                m.status === 'declined' ? 'bg-rose-50 border-rose-100' : 
                                'bg-slate-50 border-slate-100'
                              }`}
                            >
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                                m.status === 'confirmed' ? 'bg-emerald-200 text-emerald-800' : 'bg-white text-slate-400 shadow-sm'
                              }`}>
                                {getRoleIcon(m.role, 20)}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-bold text-slate-800">{m.name}</p>
                                <p className="text-[10px] text-slate-500 font-semibold">{m.role}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); sendWhatsApp(event, m); }}
                                  className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                                >
                                  <MessageCircle size={18} />
                                </button>
                                {m.status === 'confirmed' && <CheckCircle2 size={20} className="text-emerald-600" />}
                                {m.status === 'declined' && <XCircle size={20} className="text-rose-600" />}
                                {m.status === 'pending' && <div className="w-5 h-5 rounded-full border-2 border-slate-300" />}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {event.songs.length > 0 && (
                        <div className="mt-6 space-y-3">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <ListMusic size={12} /> Repertório Sugerido
                          </h4>
                          <div className="space-y-2">
                            {event.songs.map((song, i) => (
                              <div key={i} className="flex items-center p-3 bg-slate-50 rounded-2xl border border-slate-100 group">
                                <div className="w-8 text-[10px] font-black text-slate-300">0{i+1}</div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-slate-800 truncate">{song.title}</p>
                                  <p className="text-[10px] text-slate-500 font-semibold">{song.artist} • Tom: {song.key || '?'}</p>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {song.youtube && <a href={song.youtube} target="_blank" className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Youtube size={16}/></a>}
                                  {song.lyrics && <a href={song.lyrics} target="_blank" className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg"><FileText size={16}/></a>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-50">
                        <button onClick={() => { setEditingEvent(event); setIsEventModalOpen(true); }} className="text-slate-400 hover:text-indigo-600 p-2"><Edit3 size={18}/></button>
                        <button onClick={() => handleDeleteEvent(event.id)} className="text-slate-400 hover:text-rose-600 p-2"><Trash2 size={18}/></button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-extrabold text-slate-800">Membros do Time</h2>
              <button 
                onClick={() => { setEditingMember(null); setIsMemberModalOpen(true); }}
                className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg active:scale-95 transition-transform"
              >
                <UserPlus size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {members.map(member => (
                <div key={member.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl font-black">
                    {member.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900">{member.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg font-bold uppercase tracking-wide">
                        {member.role}
                      </span>
                      {member.whatsapp && (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          <Phone size={10} /> {member.whatsapp}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingMember(member); setIsMemberModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600"><Edit3 size={18}/></button>
                    <button onClick={() => handleDeleteMember(member.id)} className="p-2 text-slate-400 hover:text-rose-600"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div className="bg-indigo-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 blur-3xl"></div>
              <Sparkles className="text-indigo-400 mb-4" size={32} />
              <h2 className="text-2xl font-black mb-2">Assistente Harmonia</h2>
              <p className="text-indigo-200 text-sm font-medium">Use nossa inteligência artificial para criar setlists perfeitos baseados no tema do culto.</p>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <label className="block text-sm font-bold text-slate-700 mb-2">Qual o tema do culto?</label>
                <div className="flex gap-2">
                  <input 
                    value={aiTheme}
                    onChange={(e) => setAiTheme(e.target.value)}
                    placeholder="Ex: Gratidão, Perseverança..."
                    className="flex-1 bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                  />
                  <button 
                    onClick={handleAISuggestions}
                    disabled={aiLoading || !aiTheme}
                    className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95"
                  >
                    {aiLoading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : <Search size={24} />}
                  </button>
                </div>
              </div>

              {aiSuggestions.length > 0 && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <h3 className="font-black text-slate-800 flex items-center gap-2">
                    <ListMusic className="text-indigo-600" size={20} /> Sugestões Encontradas
                  </h3>
                  {aiSuggestions.map((song, i) => (
                    <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-black text-indigo-900">{song.title}</h4>
                          <p className="text-xs text-slate-500 font-bold">{song.artist} • Tom Sugerido: {song.key}</p>
                        </div>
                        <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-1 rounded-lg">#IA</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl italic">
                        "{song.reason}"
                      </p>
                    </div>
                  ))}
                  <button 
                    onClick={() => { setAiSuggestions([]); setAiTheme(''); }}
                    className="w-full py-4 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
                  >
                    Limpar Sugestões
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer / Tab Spacer */}
      <div className="h-20"></div>

      {/* --- Modals --- */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-indigo-900/40 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-full duration-500">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-900">{editingEvent ? 'Editar Escala' : 'Nova Escala'}</h2>
              <button onClick={() => setIsEventModalOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"><X size={20}/></button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const eventData: WorshipEvent = {
                id: editingEvent?.id || '',
                title: formData.get('title') as string,
                date: formData.get('date') as string,
                time: formData.get('time') as string,
                team: editingEvent?.team || [],
                songs: editingEvent?.songs || [],
                createdAt: editingEvent?.createdAt || Date.now()
              };
              handleSaveEvent(eventData);
            }} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Nome do Culto / Evento</label>
                <input required name="title" defaultValue={editingEvent?.title} placeholder="Culto de Domingo" className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-800" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Data</label>
                  <input required name="date" type="date" defaultValue={editingEvent?.date} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-800" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Hora</label>
                  <input required name="time" type="time" defaultValue={editingEvent?.time} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-800" />
                </div>
              </div>
              
              <div className="pt-6">
                <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-indigo-200 active:scale-95 transition-all">
                  Salvar Escala
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-indigo-900/40 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom-full duration-500">
             <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-900">{editingMember ? 'Editar Perfil' : 'Novo Membro'}</h2>
              <button onClick={() => setIsMemberModalOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"><X size={20}/></button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const memberData: Member = {
                id: editingMember?.id || '',
                name: formData.get('name') as string,
                role: formData.get('role') as string,
                whatsapp: formData.get('whatsapp') as string,
              };
              handleSaveMember(memberData);
            }} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Nome Completo</label>
                <input required name="name" defaultValue={editingMember?.name} placeholder="João Silva" className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-800" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Função Principal</label>
                <select name="role" defaultValue={editingMember?.role} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-800">
                  <option value="Vocal">Vocal</option>
                  <option value="Violão">Violão</option>
                  <option value="Guitarra">Guitarra</option>
                  <option value="Teclado">Teclado</option>
                  <option value="Bateria">Bateria</option>
                  <option value="Baixo">Baixo</option>
                  <option value="Som/Mídia">Som/Mídia</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">WhatsApp</label>
                <input required name="whatsapp" defaultValue={editingMember?.whatsapp} placeholder="11999999999" className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-800" />
              </div>
              
              <div className="pt-6">
                <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-indigo-200 active:scale-95 transition-all">
                  Salvar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
