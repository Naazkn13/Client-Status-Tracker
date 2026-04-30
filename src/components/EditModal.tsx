import { useState, useEffect } from 'react';
import { X, Save, User, Calendar } from 'lucide-react';
import type { Client, StatusColor } from '../lib/supabase';
import { STATUS_CONFIG } from './StatusBadge';

const STAFF_NAMES = [
  'Select your name…',
  'Praveen',
  'Milind',
  'Soham',
  'Sachin',
  'Ishaan',
  'Bharati',
  'Debashis',
  'Prathamesh',
  'Himanshu',
  'Darpan',
];

interface EditModalProps {
  client: Client | null;
  onClose: () => void;
  onSave: (id: string, updates: { status_color: StatusColor; status_note: string; detailed_notes: string; updated_by: string; updated_at: string }) => Promise<void>;
}

export default function EditModal({ client, onClose, onSave }: EditModalProps) {
  const [statusColor, setStatusColor] = useState<StatusColor>('yellow');
  const [note, setNote] = useState('');
  const [detailedNotes, setDetailedNotes] = useState('');
  const [updatedBy, setUpdatedBy] = useState('');
  const [updatedAtDate, setUpdatedAtDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (client) {
      setStatusColor(client.status_color);
      setNote(client.status_note);
      setDetailedNotes(client.detailed_notes || '');
      setUpdatedBy(client.updated_by || '');
      setUpdatedAtDate(client.updated_at ? client.updated_at.split('T')[0] : new Date().toISOString().split('T')[0]);
      setError('');
    }
  }, [client]);

  if (!client) return null;

  const handleSave = async () => {
    if (!updatedBy || updatedBy === 'Select your name…') {
      setError('Please select your name before saving.');
      return;
    }
    if (!updatedAtDate) {
      setError('Please select a date before saving.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      // Create a valid ISO string from the selected date (using current time to make it a full timestamp)
      const dateObj = new Date(updatedAtDate);
      const now = new Date();
      dateObj.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
      
      await onSave(client.id, { 
        status_color: statusColor, 
        status_note: note, 
        detailed_notes: detailedNotes, 
        updated_by: updatedBy,
        updated_at: dateObj.toISOString()
      });
      onClose();
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
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
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Status Color */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Status
            </label>
            <div className="grid grid-cols-1 gap-2">
              {(Object.entries(STATUS_CONFIG) as [StatusColor, typeof STATUS_CONFIG[StatusColor]][]).map(([colorKey, config]) => (
                <button
                  key={colorKey}
                  type="button"
                  onClick={() => setStatusColor(colorKey)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                    statusColor === colorKey
                      ? 'border-gray-900 shadow-md scale-[1.01]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className={`w-5 h-5 rounded flex-shrink-0 ${config.bg}`} />
                  <span className="text-sm font-medium text-gray-700">{config.label}</span>
                  {statusColor === colorKey && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-gray-900 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
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

          {/* Detailed Notes / MOM */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Detailed Notes / MOM
              <span className="ml-2 text-gray-400 normal-case font-normal">Meeting minutes, action items, full context</span>
            </label>
            <textarea
              value={detailedNotes}
              onChange={(e) => setDetailedNotes(e.target.value)}
              rows={7}
              placeholder="Paste meeting notes, MOM, action items, or any detailed context here…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y transition font-mono"
            />
          </div>

          {/* Updated By & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Updated By
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={updatedBy}
                  onChange={(e) => setUpdatedBy(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition"
                >
                  {STAFF_NAMES.map((name) => (
                    <option key={name} value={name === 'Select your name…' ? '' : name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Date
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={updatedAtDate}
                  onChange={(e) => setUpdatedAtDate(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition"
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
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
  );
}
