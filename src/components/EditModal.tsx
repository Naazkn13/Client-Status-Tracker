import { useState, useEffect } from 'react';
import { X, Save, User, Trash2, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase, type Client, type StatusColor, type StatusHistory } from '../lib/supabase';
import { STATUS_CONFIG } from './StatusBadge';

const STAFF_NAMES = [
  'Select your name…',
  'Praveen', 'Milind', 'Soham', 'Sachin', 'Ishaan',
  'Bharati', 'Debashis', 'Prathamesh', 'Himanshu', 'Darpan',
];

interface EditModalProps {
  client: Client | null;
  onClose: () => void;
  onSave: (id: string, updates: { status_color: StatusColor; status_note: string; detailed_notes: string; updated_by: string; status_date: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function formatHistoryDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const COLOR_DOT: Record<StatusColor, string> = {
  red: 'bg-red-500',
  yellow: 'bg-yellow-400',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  black: 'bg-gray-900',
};

export default function EditModal({ client, onClose, onSave, onDelete }: EditModalProps) {
  const [statusColor, setStatusColor] = useState<StatusColor>('yellow');
  const [note, setNote] = useState('');
  const [detailedNotes, setDetailedNotes] = useState('');
  const [updatedBy, setUpdatedBy] = useState('');
  const [statusDate, setStatusDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (client) {
      setStatusColor(client.status_color);
      setNote(client.status_note);
      setDetailedNotes(client.detailed_notes || '');
      setUpdatedBy(client.updated_by || '');
      setStatusDate(new Date().toISOString().split('T')[0]);
      setError('');
      setConfirmDelete(false);
      setHistoryOpen(false);
      setHistory([]);
    }
  }, [client]);

  const loadHistory = async () => {
    if (!client) return;
    setHistoryLoading(true);
    const { data } = await supabase
      .from('status_history')
      .select('*')
      .eq('client_id', client.id)
      .order('status_date', { ascending: false })
      .order('created_at', { ascending: false });
    setHistory((data as StatusHistory[]) || []);
    setHistoryLoading(false);
  };

  const toggleHistory = () => {
    if (!historyOpen) loadHistory();
    setHistoryOpen(v => !v);
  };

  if (!client) return null;

  const handleSave = async () => {
    if (!updatedBy || updatedBy === 'Select your name…') {
      setError('Please select your name before saving.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(client.id, { status_color: statusColor, status_note: note, detailed_notes: detailedNotes, updated_by: updatedBy, status_date: statusDate });
      onClose();
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      await onDelete(client.id);
      onClose();
    } catch {
      setError('Failed to delete. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Update Status</p>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">{client.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{client.industry}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">

          {/* Status Color */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Status</label>
            <div className="grid grid-cols-1 gap-2">
              {(Object.entries(STATUS_CONFIG) as [StatusColor, typeof STATUS_CONFIG[StatusColor]][]).map(([colorKey, config]) => (
                <button
                  key={colorKey}
                  type="button"
                  onClick={() => setStatusColor(colorKey)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                    statusColor === colorKey ? 'border-gray-900 shadow-md scale-[1.01]' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className={`w-5 h-5 rounded flex-shrink-0 ${config.bg}`} />
                  <span className="text-sm font-medium text-gray-700">{config.label}</span>
                  {statusColor === colorKey && <span className="ml-auto w-2 h-2 rounded-full bg-gray-900 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Status Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status Date</label>
            <input
              type="date"
              value={statusDate}
              onChange={(e) => setStatusDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Status Note */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Status Note
              <span className="ml-2 text-gray-400 normal-case font-normal">Short summary visible in the main table</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Brief status update…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition"
            />
          </div>

          {/* Detailed Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Detailed Notes / MOM
              <span className="ml-2 text-gray-400 normal-case font-normal">Meeting minutes, action items, full context</span>
            </label>
            <textarea
              value={detailedNotes}
              onChange={(e) => setDetailedNotes(e.target.value)}
              rows={6}
              placeholder="Paste meeting notes, MOM, action items, or any detailed context here…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y transition font-mono"
            />
          </div>

          {/* Updated By */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Updated By</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={updatedBy}
                onChange={(e) => setUpdatedBy(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition"
              >
                {STAFF_NAMES.map((name) => (
                  <option key={name} value={name === 'Select your name…' ? '' : name}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}

          {/* Status History */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={toggleHistory}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <span className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <Clock size={14} />
                Status History
              </span>
              {historyOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>
            {historyOpen && (
              <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                {historyLoading ? (
                  <p className="px-4 py-4 text-xs text-gray-400">Loading history…</p>
                ) : history.length === 0 ? (
                  <p className="px-4 py-4 text-xs text-gray-400 italic">No history yet. Updates will appear here after saving.</p>
                ) : (
                  history.map((h) => (
                    <div key={h.id} className="px-4 py-3 flex gap-3">
                      <span className={`mt-1 w-3 h-3 rounded-full flex-shrink-0 ${COLOR_DOT[h.status_color]}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="text-xs font-semibold text-gray-700">{STATUS_CONFIG[h.status_color]?.label ?? h.status_color}</span>
                          <span className="text-xs text-gray-400 flex-shrink-0">{formatHistoryDate(h.status_date)}</span>
                        </div>
                        {h.status_note && <p className="text-xs text-gray-600 leading-relaxed">{h.status_note}</p>}
                        {h.detailed_notes && <p className="text-xs text-gray-400 mt-1 leading-relaxed line-clamp-2">{h.detailed_notes}</p>}
                        {h.updated_by && <p className="text-xs text-gray-400 mt-1">— {h.updated_by}</p>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
          {/* Delete */}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 ${
              confirmDelete
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'text-red-500 hover:text-red-700 hover:bg-red-50'
            }`}
          >
            <Trash2 size={15} />
            {deleting ? 'Deleting…' : confirmDelete ? 'Confirm Delete' : 'Delete Client'}
          </button>
          {confirmDelete && (
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Cancel
            </button>
          )}

          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save size={15} />
              {saving ? 'Saving…' : 'Save Update'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
