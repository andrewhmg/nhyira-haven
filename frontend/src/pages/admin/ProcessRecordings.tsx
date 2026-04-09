import { useEffect, useState } from 'react';
import { getResidents, createProcessRecording } from '../../services/api';
import type { Resident, ProcessRecording } from '../../types/api';
import StatusBadge from '../../components/common/StatusBadge';
import MLInsightBadge from '../../components/ml/MLInsightBadge';
import { predictSessionEffectiveness, type SessionEffectivenessResult } from '../../services/mlApi';
import { Search, Plus, X, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const PAGE_SIZE = 15;

interface RecordingWithResident extends ProcessRecording {
  residentName: string;
  residentId: number;
}

export default function ProcessRecordings() {
  const [recordings, setRecordings] = useState<RecordingWithResident[]>([]);
  const [allResidents, setAllResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [mlEffectiveness, setMlEffectiveness] = useState<Record<number, SessionEffectivenessResult>>({});
  const [formData, setFormData] = useState({
    residentId: '',
    sessionDate: new Date().toISOString().split('T')[0],
    sessionType: '',
    counselorName: '',
    summary: '',
    observations: '',
    actionPlan: '',
    followUpRequired: '',
    nextSessionDate: '',
    isConfidential: true,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  const loadRecordings = () => {
    getResidents()
      .then((residents: Resident[]) => {
        setAllResidents(residents);
        const all: RecordingWithResident[] = [];
        residents.forEach((r) => {
          r.processRecordings?.forEach((pr) => {
            all.push({ ...pr, residentName: `${r.firstName} ${r.lastName}`, residentId: r.id });
          });
        });
        all.sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());
        setRecordings(all);
        setLoading(false);

        const predictions: Record<number, SessionEffectivenessResult> = {};
        const batch = all.slice(0, 30).map(async (rec) => {
          try {
            const features: Record<string, number> = {
              [`session_type_${rec.sessionType.replace(/\s/g, '')}`]: 1,
              session_duration_minutes: 60,
              session_number: all.filter((r) => r.residentId === rec.residentId).indexOf(rec) + 1,
              emotional_baseline: 3,
              is_confidential: rec.isConfidential ? 1 : 0,
            };
            const result = await predictSessionEffectiveness(features);
            predictions[rec.id] = result;
          } catch { /* ML unavailable */ }
        });
        Promise.allSettled(batch).then(() => setMlEffectiveness({ ...predictions }));
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadRecordings(); }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.residentId || !formData.sessionType || !formData.summary) return;
    setFormSubmitting(true);
    try {
      await createProcessRecording({
        residentId: Number(formData.residentId),
        sessionDate: formData.sessionDate,
        sessionType: formData.sessionType,
        counselorName: formData.counselorName || undefined,
        summary: formData.summary,
        observations: formData.observations || undefined,
        actionPlan: formData.actionPlan || undefined,
        followUpRequired: formData.followUpRequired || undefined,
        nextSessionDate: formData.nextSessionDate || undefined,
        isConfidential: formData.isConfidential,
      });
      setShowForm(false);
      setFormData({ residentId: '', sessionDate: new Date().toISOString().split('T')[0], sessionType: '', counselorName: '', summary: '', observations: '', actionPlan: '', followUpRequired: '', nextSessionDate: '', isConfidential: true });
      loadRecordings();
    } catch {
      alert('Failed to save recording. Ensure you have admin permissions.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const filtered = recordings.filter((r) => {
    const matchSearch = !search || r.residentName.toLowerCase().includes(search.toLowerCase()) || r.counselorName?.toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || r.sessionType === filterType;
    return matchSearch && matchType;
  });

  const types = [...new Set(recordings.map((r) => r.sessionType))].sort();
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const formatDate = (d: string) => { try { return format(new Date(d), 'MMM d, yyyy'); } catch { return d; } };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Process Recordings</h2>
          <p className="text-muted mb-0 small">{filtered.length} session recordings</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-1" onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X size={16} /> Close</> : <><Plus size={16} /> New Recording</>}
        </button>
      </div>

      {/* New recording form */}
      {showForm && (
        <div className="nh-card p-4 mb-4" style={{ borderLeft: '4px solid var(--nh-secondary)' }}>
          <h5 className="fw-bold mb-3">New Process Recording</h5>
          <form onSubmit={handleFormSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Resident *</label>
                <select className="form-select form-select-sm" required value={formData.residentId}
                  onChange={e => setFormData({ ...formData, residentId: e.target.value })}>
                  <option value="">Select resident...</option>
                  {allResidents.filter(r => r.isActive).map(r => (
                    <option key={r.id} value={r.id}>{r.firstName} {r.lastName} ({r.caseNumber})</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold">Session Date *</label>
                <input type="date" className="form-control form-control-sm" required value={formData.sessionDate}
                  onChange={e => setFormData({ ...formData, sessionDate: e.target.value })} />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold">Session Type *</label>
                <select className="form-select form-select-sm" required value={formData.sessionType}
                  onChange={e => setFormData({ ...formData, sessionType: e.target.value })}>
                  <option value="">Select type...</option>
                  <option>Individual Counseling</option>
                  <option>Group Counseling</option>
                  <option>Family Counseling</option>
                  <option>Crisis Intervention</option>
                  <option>Assessment</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Counselor Name</label>
                <input type="text" className="form-control form-control-sm" placeholder="Counselor name"
                  value={formData.counselorName} onChange={e => setFormData({ ...formData, counselorName: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Next Session Date</label>
                <input type="date" className="form-control form-control-sm" value={formData.nextSessionDate}
                  onChange={e => setFormData({ ...formData, nextSessionDate: e.target.value })} />
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">Summary *</label>
                <textarea className="form-control form-control-sm" rows={3} required placeholder="Describe the session..."
                  value={formData.summary} onChange={e => setFormData({ ...formData, summary: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Observations</label>
                <textarea className="form-control form-control-sm" rows={2} placeholder="Behavioral observations..."
                  value={formData.observations} onChange={e => setFormData({ ...formData, observations: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Action Plan</label>
                <textarea className="form-control form-control-sm" rows={2} placeholder="Next steps..."
                  value={formData.actionPlan} onChange={e => setFormData({ ...formData, actionPlan: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Follow-Up Required</label>
                <input type="text" className="form-control form-control-sm" placeholder="e.g. Schedule family session"
                  value={formData.followUpRequired} onChange={e => setFormData({ ...formData, followUpRequired: e.target.value })} />
              </div>
              <div className="col-md-6 d-flex align-items-end">
                <div className="form-check">
                  <input type="checkbox" className="form-check-input" id="confidential" checked={formData.isConfidential}
                    onChange={e => setFormData({ ...formData, isConfidential: e.target.checked })} />
                  <label className="form-check-label small" htmlFor="confidential">Mark as Confidential</label>
                </div>
              </div>
            </div>
            <div className="mt-3 d-flex gap-2">
              <button type="submit" className="btn btn-primary btn-sm" disabled={formSubmitting}>
                {formSubmitting ? 'Saving...' : 'Save Recording'}
              </button>
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="filter-bar d-flex flex-wrap gap-3 align-items-center">
        <div className="position-relative flex-grow-1" style={{ minWidth: 200 }}>
          <Search size={16} className="position-absolute" style={{ left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--nh-text-muted)' }} />
          <input
            type="text"
            className="form-control form-control-sm ps-4"
            placeholder="Search by resident or counselor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="form-select form-select-sm" style={{ width: 'auto' }} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">All Session Types</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border" style={{ color: 'var(--nh-primary)' }} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5 text-muted">No recordings found.</div>
      ) : (
        <div className="d-flex flex-column gap-2 mt-1">
          {paginated.map((r) => (
            <div key={r.id} className="nh-card p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="fw-semibold small" style={{ color: 'var(--nh-primary)' }}>{r.residentName}</span>
                    <StatusBadge status={r.sessionType} size="sm" />
                    {r.isConfidential && (
                      <span className="badge badge-on-hold d-flex align-items-center gap-1" style={{ fontSize: '0.65rem' }}>
                        <Lock size={8} /> Confidential
                      </span>
                    )}
                    {mlEffectiveness[r.id] && (
                      <MLInsightBadge
                        label={mlEffectiveness[r.id].prediction}
                        level={mlEffectiveness[r.id].effectiveness_probability > 0.5 ? 'success' : 'warning'}
                        probability={mlEffectiveness[r.id].effectiveness_probability}
                      />
                    )}
                  </div>
                  <p className="small text-muted mb-1">{r.summary.slice(0, 200)}{r.summary.length > 200 ? '...' : ''}</p>
                  {r.counselorName && <span className="text-muted" style={{ fontSize: '0.75rem' }}>Counselor: {r.counselorName}</span>}
                </div>
                <span className="text-muted small flex-shrink-0 ms-3">{formatDate(r.sessionDate)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <span className="text-muted small">Page {page} of {totalPages}</span>
          <div className="d-flex gap-1">
            <button className="btn btn-sm btn-outline-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft size={14} /></button>
            <button className="btn btn-sm btn-outline-secondary" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight size={14} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
