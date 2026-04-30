import { useState, useEffect, useMemo, useRef } from 'react';
import { Search, RefreshCw, Filter, ChevronUp, ChevronDown, Clock, Pencil, FileText, X, UserPlus, LogOut, Lock } from 'lucide-react';
import { supabase, type Client, type StatusColor } from './lib/supabase';
import { STATUS_CONFIG } from './components/StatusBadge';
import EditModal from './components/EditModal';
import ClientModal from './components/ClientModal';

const ADMIN_USER = { username: 'Praveen Bhatt', password: 'Pr@veen@1980' };

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    await new Promise(r => setTimeout(r, 500));
    
    if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
      localStorage.setItem('admin_auth', 'true');
      onLogin();
    } else {
      setError('Invalid username or password');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-slate-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
            <p className="text-gray-500 text-sm mt-1">Client Status Tracker</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-gray-900"
                placeholder="Enter username"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-gray-900"
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm py-2 px-4 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">Restricted access - Authorized personnel only</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const INDUSTRIES = ['All', 'Mutual Fund', 'Capital Markets', 'Insurance', 'NBFC', 'Foreign Banks', 'Bank', 'Rating'];

type SortKey = 'row_number' | 'name' | 'industry' | 'status_color' | 'updated_at';
type SortDir = 'asc' | 'desc';

const COLOR_ORDER: Record<StatusColor, number> = { red: 0, yellow: 1, blue: 2, green: 3, black: 4 };


function DetailedNotesCell({ notes }: { notes: string }) {
  const [open, setOpen] = useState(false);
  const preview = notes.slice(0, 120) + (notes.length > 120 ? '…' : '');
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-left group"
      >
        <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">{preview}</p>
        <span className="flex items-center gap-1 text-xs text-blue-600 font-semibold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <FileText size={11} /> View full notes
        </span>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" />
          <div
            className="relative bg-white w-full max-w-xl h-full shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Detailed Notes / MOM</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed font-sans">{notes}</pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function ColorLegend() {
  return (
    <div className="flex flex-wrap gap-3">
      {(Object.entries(STATUS_CONFIG) as [StatusColor, typeof STATUS_CONFIG[StatusColor]][]).map(([color, cfg]) => (
        <div key={color} className="flex items-center gap-2">
          <span className={`w-4 h-4 rounded-sm flex-shrink-0 border ${cfg.bg} ${cfg.border}`} />
          <span className="text-xs text-gray-600">{cfg.label}</span>
        </div>
      ))}
    </div>
  );
}

function AllStatCard({ count, active, onClick }: { count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border px-5 py-4 flex items-center gap-4 shadow-sm transition-all duration-150 focus:outline-none ${
        active
          ? 'border-gray-900 ring-2 ring-gray-900 bg-white scale-[1.02]'
          : 'border-gray-200 bg-white hover:border-gray-400 hover:scale-[1.01]'
      }`}
    >
      <span className="w-10 h-10 rounded-lg flex-shrink-0 bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm">ALL</span>
      <div>
        <p className="text-2xl font-bold text-gray-900 leading-none">{count}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-tight">Total clients</p>
      </div>
    </button>
  );
}

function UnknownStatCard({ count, active, onClick }: { count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border px-5 py-4 flex items-center gap-4 shadow-sm transition-all duration-150 focus:outline-none ${
        active
          ? 'border-gray-900 ring-2 ring-gray-900 bg-white scale-[1.02]'
          : 'border-gray-200 bg-white hover:border-gray-400 hover:scale-[1.01]'
      }`}
    >
      <span className="w-10 h-10 rounded-lg flex-shrink-0 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs font-bold">?</span>
      <div>
        <p className="text-2xl font-bold text-gray-900 leading-none">{count}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-tight">Status not known</p>
      </div>
    </button>
  );
}

function StatCard({
  color, count, label, active, onClick,
}: {
  color: StatusColor; count: number; label: string; active: boolean; onClick: () => void;
}) {
  const cfg = STATUS_CONFIG[color];
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border px-5 py-4 flex items-center gap-4 shadow-sm transition-all duration-150 focus:outline-none ${
        active
          ? 'border-gray-900 ring-2 ring-gray-900 bg-white scale-[1.02]'
          : 'border-gray-200 bg-white hover:border-gray-400 hover:scale-[1.01]'
      }`}
    >
      <span className={`w-10 h-10 rounded-lg flex-shrink-0 ${cfg.bg}`} />
      <div>
        <p className="text-2xl font-bold text-gray-900 leading-none">{count}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-tight">{label}</p>
      </div>
    </button>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const stored = localStorage.getItem('admin_auth');
    return stored === 'true';
  });
  
  const handleLogin = () => {
    setIsAuthenticated(true);
  };
  
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_auth');
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [colorFilter, setColorFilter] = useState<StatusColor | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('row_number');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientModalTarget, setClientModalTarget] = useState<Client | 'new' | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const tableRef = useRef<HTMLDivElement>(null);

  const fetchClients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('row_number', { ascending: true });
    if (!error && data) {
      setClients(data as Client[]);
      setLastRefreshed(new Date());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleClientSave = async (data: { name: string; industry: string }, id?: string) => {
    if (id) {
      const { error } = await supabase.from('clients').update(data).eq('id', id);
      if (error) throw error;
      setClients(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    } else {
      const nextRow = clients.length > 0 ? Math.max(...clients.map(c => c.row_number)) + 1 : 1;
      const { data: inserted, error } = await supabase
        .from('clients')
        .insert({ ...data, row_number: nextRow, status_color: 'yellow', status_note: '', detailed_notes: '', updated_by: '' })
        .select()
        .single();
      if (error) throw error;
      setClients(prev => [...prev, inserted as Client]);
    }
  };

  const handleSave = async (
    id: string,
    updates: { status_color: StatusColor; status_note: string; detailed_notes: string; updated_by: string; status_date: string }
  ) => {
    const { status_date, ...clientFields } = updates;
    const updatedAt = new Date(status_date).toISOString();
    const { error: updateErr } = await supabase
      .from('clients')
      .update({ ...clientFields, updated_at: updatedAt })
      .eq('id', id);
    if (updateErr) throw updateErr;
    const { error: histErr } = await supabase
      .from('status_history')
      .insert({ client_id: id, ...clientFields, status_date });
    if (histErr) throw histErr;
    setClients(prev =>
      prev.map(c =>
        c.id === id ? { ...c, ...clientFields, updated_at: updatedAt } : c
      )
    );
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) throw error;
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const scrollToTable = () => setTimeout(() => {
    tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 50);

  const handleStatClick = (color: StatusColor) => {
    setColorFilter(prev => prev === color ? 'all' : color);
    setSearch('');
    setIndustryFilter('All');
    scrollToTable();
  };

  const handleAllClick = () => {
    setColorFilter('all');
    setSearch('');
    setIndustryFilter('All');
    scrollToTable();
  };

  const handleUnknownClick = () => {
    setColorFilter('all');
    setSearch('');
    setIndustryFilter('All');
    scrollToTable();
  };

  const stats = useMemo(() => ({
    total: clients.length,
    red: clients.filter(c => c.status_color === 'red').length,
    yellow: clients.filter(c => c.status_color === 'yellow').length,
    green: clients.filter(c => c.status_color === 'green').length,
    blue: clients.filter(c => c.status_color === 'blue').length,
    black: clients.filter(c => c.status_color === 'black').length,
    unknown: clients.filter(c => !c.status_color || !['red','yellow','green','blue','black'].includes(c.status_color)).length,
  }), [clients]);

  const filtered = useMemo(() => {
    let list = [...clients];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q) ||
        c.status_note.toLowerCase().includes(q) ||
        c.updated_by.toLowerCase().includes(q)
      );
    }
    if (industryFilter !== 'All') {
      list = list.filter(c => c.industry === industryFilter);
    }
    if (colorFilter !== 'all') {
      list = list.filter(c => c.status_color === colorFilter);
    }
    list.sort((a, b) => {
      let av: string | number = a[sortKey] ?? '';
      let bv: string | number = b[sortKey] ?? '';
      if (sortKey === 'status_color') {
        av = COLOR_ORDER[a.status_color];
        bv = COLOR_ORDER[b.status_color];
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [clients, search, industryFilter, colorFilter, sortKey, sortDir]);

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronUp size={13} className="text-gray-300" />;
    return sortDir === 'asc'
      ? <ChevronUp size={13} className="text-gray-600" />
      : <ChevronDown size={13} className="text-gray-600" />;
  }

  function ThBtn({ col, children }: { col: SortKey; children: React.ReactNode }) {
    return (
      <button
        onClick={() => handleSort(col)}
        className="flex items-center gap-1 hover:text-gray-900 transition-colors group"
      >
        {children}
        <SortIcon col={col} />
      </button>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Client Status Tracker</h1>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <Clock size={11} />
              Last refreshed: {lastRefreshed.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              &nbsp;·&nbsp;
              {clients.length} clients
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setClientModalTarget('new')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus size={14} />
              Add Client
            </button>
            <button
              onClick={fetchClients}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              title="Logout"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          <AllStatCard count={stats.total} active={colorFilter === 'all' && !search && industryFilter === 'All'} onClick={handleAllClick} />
          <StatCard color="red" count={stats.red} label="Needs immediate attention" active={colorFilter === 'red'} onClick={() => handleStatClick('red')} />
          <StatCard color="yellow" count={stats.yellow} label="Under control" active={colorFilter === 'yellow'} onClick={() => handleStatClick('yellow')} />
          <StatCard color="green" count={stats.green} label="No issues" active={colorFilter === 'green'} onClick={() => handleStatClick('green')} />
          <StatCard color="blue" count={stats.blue} label="Gone cold" active={colorFilter === 'blue'} onClick={() => handleStatClick('blue')} />
          <StatCard color="black" count={stats.black} label="Client lost" active={colorFilter === 'black'} onClick={() => handleStatClick('black')} />
          <UnknownStatCard count={stats.unknown} active={false} onClick={handleUnknownClick} />
        </div>

        {/* Legend */}
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Colour Legend</p>
          <ColorLegend />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search clients, notes, staff…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <select
              value={industryFilter}
              onChange={e => setIndustryFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {(['all', 'red', 'yellow', 'green', 'blue', 'black'] as const).map(c => (
              <button
                key={c}
                onClick={() => setColorFilter(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  colorFilter === c
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {c === 'all' ? 'All statuses' : (
                  <span className="flex items-center gap-1.5">
                    <span className={`w-3 h-3 rounded-sm ${STATUS_CONFIG[c].bg}`} />
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </span>
                )}
              </button>
            ))}
          </div>

          {(search || industryFilter !== 'All' || colorFilter !== 'all') && (
            <button
              onClick={() => { setSearch(''); setIndustryFilter('All'); setColorFilter('all'); }}
              className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors"
            >
              Clear filters
            </button>
          )}
          <span className="ml-auto text-xs text-gray-400 font-medium">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Table */}
        <div ref={tableRef} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-24 text-gray-400">
              <RefreshCw size={20} className="animate-spin mr-3" /> Loading clients…
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left w-10">
                      <ThBtn col="row_number">#</ThBtn>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <ThBtn col="name">Client</ThBtn>
                    </th>
                    <th className="px-4 py-3 text-left w-40">
                      <ThBtn col="industry">Industry</ThBtn>
                    </th>
                    <th className="px-4 py-3 text-center w-28">
                      <ThBtn col="status_color">Status</ThBtn>
                    </th>
                    <th className="px-4 py-3 text-left">Status Note</th>
                    <th className="px-4 py-3 text-left">Detailed Notes / MOM</th>
                    <th className="px-4 py-3 text-left w-36">Updated By</th>
                    <th className="px-4 py-3 text-left w-32">
                      <ThBtn col="updated_at">Date</ThBtn>
                    </th>
                    <th className="px-4 py-3 text-center w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-16 text-gray-400">
                        No clients match your filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((client, idx) => {
                      const cfg = STATUS_CONFIG[client.status_color];
                      return (
                        <tr
                          key={client.id}
                          className={`group transition-colors hover:bg-slate-50 ${idx % 2 === 0 ? '' : 'bg-gray-50/40'}`}
                        >
                          <td className="px-4 py-3 text-gray-400 font-mono text-xs">{client.row_number}</td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-gray-900">{client.name}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              {client.industry}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center">
                              <span
                                className={`inline-block w-8 h-8 rounded-lg border-2 ${cfg.bg} ${cfg.border}`}
                                title={cfg.label}
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3 max-w-xs">
                            {client.status_note ? (
                              <p className="text-gray-700 text-xs leading-relaxed line-clamp-3">{client.status_note}</p>
                            ) : (
                              <span className="text-gray-300 text-xs italic">No note</span>
                            )}
                          </td>
                          <td className="px-4 py-3 max-w-sm">
                            {client.detailed_notes ? (
                              <DetailedNotesCell notes={client.detailed_notes} />
                            ) : (
                              <span className="text-gray-300 text-xs italic">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {client.updated_by ? (
                              <span className="text-xs font-medium text-gray-700">{client.updated_by}</span>
                            ) : (
                              <span className="text-gray-300 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {formatDate(client.updated_at)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setClientModalTarget(client)}
                                className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                title="Edit client name / industry"
                              >
                                <UserPlus size={14} />
                              </button>
                              <button
                                onClick={() => setEditingClient(client)}
                                className="p-2 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                                title="Update status"
                              >
                                <Pencil size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 pb-4">
          Status as on {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          &nbsp;·&nbsp;Any of the 10 team members can update client statuses above.
        </p>
      </main>

      <EditModal
        client={editingClient}
        onClose={() => setEditingClient(null)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
      {clientModalTarget !== null && (
        <ClientModal
          client={clientModalTarget === 'new' ? null : clientModalTarget}
          nextRowNumber={clients.length > 0 ? Math.max(...clients.map(c => c.row_number)) + 1 : 1}
          onClose={() => setClientModalTarget(null)}
          onSave={handleClientSave}
        />
      )}
    </div>
  );
}
