import { useState, useEffect } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import type { ChangeRequest } from '../lib/supabase';

const ACCOUNT_MANAGERS = [
  'Select…',
  'Praveen', 'Milind', 'Soham', 'Sachin', 'Ishaan',
  'Bharati', 'Debashis', 'Prathamesh', 'Himanshu', 'Darpan',
];

interface CRModalProps {
  cr: ChangeRequest | null;
  onClose: () => void;
  onSave: (data: Omit<ChangeRequest, 'id' | 'created_at'>, id?: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

type FormState = Omit<ChangeRequest, 'id' | 'created_at'>;

const EMPTY: FormState = {
  date: new Date().toISOString().split('T')[0],
  client: '',
  cr_description: '',
  note: '',
  update_as_on: '',
  amount: null,
  bucket1_po_received: false,
  bucket2_efforts_not_approved: false,
  date_of_sharing: null,
  final_agreed_cost: null,
  start_date: null,
  uat_date: null,
  go_live_date: null,
  account_manager: '',
};

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';

export default function CRModal({ cr, onClose, onSave, onDelete }: CRModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (cr) {
      setForm({
        date: cr.date,
        client: cr.client,
        cr_description: cr.cr_description,
        note: cr.note,
        update_as_on: cr.update_as_on,
        amount: cr.amount,
        bucket1_po_received: cr.bucket1_po_received,
        bucket2_efforts_not_approved: cr.bucket2_efforts_not_approved,
        date_of_sharing: cr.date_of_sharing,
        final_agreed_cost: cr.final_agreed_cost,
        start_date: cr.start_date,
        uat_date: cr.uat_date,
        go_live_date: cr.go_live_date,
        account_manager: cr.account_manager,
      });
    } else {
      setForm(EMPTY);
    }
    setError('');
    setConfirmDelete(false);
  }, [cr]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.client.trim()) { setError('Client name is required.'); return; }
    if (!form.cr_description.trim()) { setError('CR Description is required.'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave(form, cr?.id);
      onClose();
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!cr || !onDelete) return;
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      await onDelete(cr.id);
      onClose();
    } catch {
      setError('Failed to delete. Please try again.');
      setDeleting(false);
    }
  };

  const isEdit = !!cr;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
              {isEdit ? 'Edit Change Request' : 'New Change Request'}
            </p>
            <h2 className="text-lg font-bold text-gray-900">
              {isEdit ? cr.client : 'Add CR'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Row 1 */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date" required>
              <input type="date" value={form.date ?? ''} onChange={e => set('date', e.target.value || null)} className={inputCls} />
            </Field>
            <Field label="Client" required>
              <input
                type="text"
                value={form.client}
                onChange={e => set('client', e.target.value)}
                placeholder="Client name"
                className={inputCls}
              />
            </Field>
          </div>

          {/* CR Description */}
          <Field label="Change Request Description" required>
            <textarea
              value={form.cr_description}
              onChange={e => set('cr_description', e.target.value)}
              rows={3}
              placeholder="Describe the change request…"
              className={`${inputCls} resize-none`}
            />
          </Field>

          {/* Note */}
          <Field label="Note">
            <textarea
              value={form.note}
              onChange={e => set('note', e.target.value)}
              rows={2}
              placeholder="Additional notes…"
              className={`${inputCls} resize-none`}
            />
          </Field>

          {/* Update as on */}
          <Field label="Update as on">
            <input
              type="text"
              value={form.update_as_on}
              onChange={e => set('update_as_on', e.target.value)}
              placeholder="e.g. Proposal sent, Awaiting approval…"
              className={inputCls}
            />
          </Field>

          {/* Amount + Final agreed cost */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Amount (Rs.)">
              <input
                type="number"
                value={form.amount ?? ''}
                onChange={e => set('amount', e.target.value ? Number(e.target.value) : null)}
                placeholder="0"
                className={inputCls}
              />
            </Field>
            <Field label="Final Agreed Cost (Rs.)">
              <input
                type="number"
                value={form.final_agreed_cost ?? ''}
                onChange={e => set('final_agreed_cost', e.target.value ? Number(e.target.value) : null)}
                placeholder="0"
                className={inputCls}
              />
            </Field>
          </div>

          {/* Buckets */}
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={form.bucket1_po_received}
                onChange={e => set('bucket1_po_received', e.target.checked)}
                className="w-4 h-4 rounded accent-gray-900"
              />
              <div>
                <p className="text-sm font-medium text-gray-800">Bucket 1</p>
                <p className="text-xs text-gray-500">PO Received</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={form.bucket2_efforts_not_approved}
                onChange={e => set('bucket2_efforts_not_approved', e.target.checked)}
                className="w-4 h-4 rounded accent-gray-900"
              />
              <div>
                <p className="text-sm font-medium text-gray-800">Bucket 2</p>
                <p className="text-xs text-gray-500">Efforts Not Approved</p>
              </div>
            </label>
          </div>

          {/* Dates row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label="Date of Sharing">
              <input type="date" value={form.date_of_sharing ?? ''} onChange={e => set('date_of_sharing', e.target.value || null)} className={inputCls} />
            </Field>
            <Field label="Start Date">
              <input type="date" value={form.start_date ?? ''} onChange={e => set('start_date', e.target.value || null)} className={inputCls} />
            </Field>
            <Field label="UAT Date">
              <input type="date" value={form.uat_date ?? ''} onChange={e => set('uat_date', e.target.value || null)} className={inputCls} />
            </Field>
            <Field label="GO Live Date">
              <input type="date" value={form.go_live_date ?? ''} onChange={e => set('go_live_date', e.target.value || null)} className={inputCls} />
            </Field>
          </div>

          {/* Account Manager */}
          <Field label="Account Manager">
            <select
              value={form.account_manager}
              onChange={e => set('account_manager', e.target.value === 'Select…' ? '' : e.target.value)}
              className={`${inputCls} appearance-none bg-white`}
            >
              {ACCOUNT_MANAGERS.map(n => (
                <option key={n} value={n === 'Select…' ? '' : n}>{n}</option>
              ))}
            </select>
          </Field>

          {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            {isEdit && onDelete && (
              <>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 ${
                    confirmDelete ? 'bg-red-600 text-white hover:bg-red-700' : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                  }`}
                >
                  <Trash2 size={15} />
                  {deleting ? 'Deleting…' : confirmDelete ? 'Confirm Delete' : 'Delete CR'}
                </button>
                {confirmDelete && (
                  <button onClick={() => setConfirmDelete(false)} className="text-xs text-gray-400 hover:text-gray-600 underline">
                    Cancel
                  </button>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
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
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add CR'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
