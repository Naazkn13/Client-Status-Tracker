import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, RefreshCw, Pencil, CheckSquare, Square, Filter, X, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { supabase, type ChangeRequest } from '../lib/supabase';
import CRModal from './CRModal';

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatCurrency(n: number | null) {
  if (n === null || n === undefined) return '—';
  return '₹' + n.toLocaleString('en-IN');
}

const CLIENTS_FILTER_ALL = 'All Clients';

export default function ChangeRequests() {
  const [crs, setCrs] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState(CLIENTS_FILTER_ALL);
  const [modalTarget, setModalTarget] = useState<ChangeRequest | 'new' | null>(null);
  const [sortKey, setSortKey] = useState<keyof ChangeRequest | null>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (key: keyof ChangeRequest) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const fetchCRs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('change_requests')
      .select('*')
      .order('date', { ascending: false });
    if (!error && data) setCrs(data as ChangeRequest[]);
    setLoading(false);
  };

  useEffect(() => { fetchCRs(); }, []);

  const clientOptions = useMemo(() => {
    const unique = Array.from(new Set(crs.map(c => c.client).filter(Boolean))).sort();
    return [CLIENTS_FILTER_ALL, ...unique];
  }, [crs]);

  const filtered = useMemo(() => {
    let list = [...crs];
    if (clientFilter !== CLIENTS_FILTER_ALL) list = list.filter(c => c.client === clientFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.client.toLowerCase().includes(q) ||
        c.cr_description.toLowerCase().includes(q) ||
        c.note.toLowerCase().includes(q) ||
        c.update_as_on.toLowerCase().includes(q) ||
        c.account_manager.toLowerCase().includes(q)
      );
    }
    if (sortKey) {
      list.sort((a, b) => {
        const av = a[sortKey] ?? '';
        const bv = b[sortKey] ?? '';
        let cmp = 0;
        if (typeof av === 'boolean' && typeof bv === 'boolean') cmp = Number(av) - Number(bv);
        else if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv;
        else cmp = String(av).localeCompare(String(bv));
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return list;
  }, [crs, clientFilter, search, sortKey, sortDir]);

  const handleSave = async (data: Omit<ChangeRequest, 'id' | 'created_at'>, id?: string) => {
    if (id) {
      const { error } = await supabase.from('change_requests').update(data).eq('id', id);
      if (error) throw error;
      setCrs(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    } else {
      const { data: inserted, error } = await supabase
        .from('change_requests')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      setCrs(prev => [inserted as ChangeRequest, ...prev]);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('change_requests').delete().eq('id', id);
    if (error) throw error;
    setCrs(prev => prev.filter(c => c.id !== id));
  };

  const stats = useMemo(() => {
    const bucket1List = crs.filter(c => c.bucket1_po_received);
    const bucket2List = crs.filter(c => c.bucket2_efforts_not_approved);
    return {
      total: crs.length,
      totalAmount: crs.reduce((s, c) => s + (c.amount ?? 0), 0),
      bucket1Count: bucket1List.length,
      bucket1Amount: bucket1List.reduce((s, c) => s + (c.amount ?? 0), 0),
      bucket2Count: bucket2List.length,
      bucket2Amount: bucket2List.reduce((s, c) => s + (c.amount ?? 0), 0),
    };
  }, [crs]);

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total CRs */}
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900 leading-none">{stats.total}</p>
            <span className="text-sm font-semibold text-gray-400">CRs</span>
          </div>
          <p className="text-xs font-semibold text-gray-500 mt-1">Total Change Requests</p>
          <p className="text-base font-bold text-gray-700 mt-1">{formatCurrency(stats.totalAmount)}</p>
          <p className="text-[11px] text-gray-400">Total CR Amount</p>
        </div>

        {/* Bucket 1 */}
        <div className="bg-white rounded-xl border border-green-200 px-5 py-4 shadow-sm">
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-green-700 leading-none">{stats.bucket1Count}</p>
            <span className="text-sm font-semibold text-green-400">received</span>
          </div>
          <p className="text-xs font-semibold text-gray-500 mt-1">Bucket 1 — PO Received</p>
          <p className="text-base font-bold text-green-700 mt-1">{formatCurrency(stats.bucket1Amount)}</p>
          <p className="text-[11px] text-gray-400">PO Received Amount</p>
        </div>

        {/* Bucket 2 */}
        <div className="bg-white rounded-xl border border-amber-200 px-5 py-4 shadow-sm">
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-amber-600 leading-none">{stats.bucket2Count}</p>
            <span className="text-sm font-semibold text-amber-400">pending</span>
          </div>
          <p className="text-xs font-semibold text-gray-500 mt-1">Bucket 2 — Efforts Not Approved</p>
          <p className="text-base font-bold text-amber-600 mt-1">{formatCurrency(stats.bucket2Amount)}</p>
          <p className="text-[11px] text-gray-400">Unapproved Amount</p>
        </div>

      </div>

      {/* Filters + Add */}
      <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search CRs, clients, notes…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          <select
            value={clientFilter}
            onChange={e => setClientFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {clientOptions.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        {(search || clientFilter !== CLIENTS_FILTER_ALL) && (
          <button
            onClick={() => { setSearch(''); setClientFilter(CLIENTS_FILTER_ALL); }}
            className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors flex items-center gap-1"
          >
            <X size={12} /> Clear
          </button>
        )}
        <span className="text-xs text-gray-400 font-medium">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={fetchCRs}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setModalTarget('new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={14} />
            New CR
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400">
            <RefreshCw size={20} className="animate-spin mr-3" /> Loading…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: '1600px' }}>
              <thead>
                <tr className="bg-slate-50 border-b border-gray-200">
                  {([
                    { label: 'Date', key: 'date' as keyof ChangeRequest },
                    { label: 'Client', key: 'client' as keyof ChangeRequest },
                    { label: 'CR Description', key: 'cr_description' as keyof ChangeRequest },
                    { label: 'Note', key: 'note' as keyof ChangeRequest },
                    { label: 'Update as on', key: 'update_as_on' as keyof ChangeRequest },
                    { label: 'Amount', key: 'amount' as keyof ChangeRequest },
                    { label: 'Bucket 1\nPO Received', key: 'bucket1_po_received' as keyof ChangeRequest },
                    { label: 'Bucket 2\nEfforts Not Approved', key: 'bucket2_efforts_not_approved' as keyof ChangeRequest },
                    { label: 'Date of Sharing', key: 'date_of_sharing' as keyof ChangeRequest },
                    { label: 'Final Agreed Cost', key: 'final_agreed_cost' as keyof ChangeRequest },
                    { label: 'Start Date', key: 'start_date' as keyof ChangeRequest },
                    { label: 'UAT Date', key: 'uat_date' as keyof ChangeRequest },
                    { label: 'GO Live Date', key: 'go_live_date' as keyof ChangeRequest },
                    { label: 'Account Manager', key: 'account_manager' as keyof ChangeRequest },
                    { label: '', key: null },
                  ] as { label: string; key: keyof ChangeRequest | null }[]).map(({ label, key }) => (
                    <th
                      key={label || '__actions'}
                      onClick={key ? () => handleSort(key) : undefined}
                      className={`px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-pre-line leading-tight select-none ${key ? 'cursor-pointer hover:text-gray-800 hover:bg-gray-100 transition-colors' : ''}`}
                    >
                      {key ? (
                        <span className="inline-flex items-center gap-1">
                          {label}
                          {sortKey === key
                            ? sortDir === 'asc'
                              ? <ChevronUp size={12} className="text-blue-500 shrink-0" />
                              : <ChevronDown size={12} className="text-blue-500 shrink-0" />
                            : <ChevronsUpDown size={12} className="text-gray-300 shrink-0" />}
                        </span>
                      ) : label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={15} className="text-center py-16 text-gray-400">
                      {crs.length === 0 ? 'No change requests yet. Click "New CR" to add one.' : 'No results match your filters.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((cr, idx) => (
                    <tr
                      key={cr.id}
                      className={`group hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? '' : 'bg-gray-50/40'}`}
                    >
                      <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(cr.date)}</td>
                      <td className="px-3 py-3">
                        <span className="font-semibold text-gray-900 text-xs whitespace-nowrap">{cr.client || '—'}</span>
                      </td>
                      <td className="px-3 py-3 max-w-xs">
                        <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">{cr.cr_description || '—'}</p>
                      </td>
                      <td className="px-3 py-3 max-w-[180px]">
                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{cr.note || '—'}</p>
                      </td>
                      <td className="px-3 py-3 max-w-[180px]">
                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{cr.update_as_on || '—'}</p>
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-700 whitespace-nowrap font-mono">{formatCurrency(cr.amount)}</td>
                      <td className="px-3 py-3 text-center">
                        {cr.bucket1_po_received
                          ? <CheckSquare size={16} className="text-green-600 mx-auto" />
                          : <Square size={16} className="text-gray-300 mx-auto" />}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {cr.bucket2_efforts_not_approved
                          ? <CheckSquare size={16} className="text-amber-500 mx-auto" />
                          : <Square size={16} className="text-gray-300 mx-auto" />}
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(cr.date_of_sharing)}</td>
                      <td className="px-3 py-3 text-xs text-gray-700 whitespace-nowrap font-mono">{formatCurrency(cr.final_agreed_cost)}</td>
                      <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(cr.start_date)}</td>
                      <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(cr.uat_date)}</td>
                      <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(cr.go_live_date)}</td>
                      <td className="px-3 py-3 text-xs text-gray-700 whitespace-nowrap">{cr.account_manager || '—'}</td>
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={() => setModalTarget(cr)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
                          title="Edit CR"
                        >
                          <Pencil size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalTarget !== null && (
        <CRModal
          cr={modalTarget === 'new' ? null : modalTarget}
          onClose={() => setModalTarget(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
