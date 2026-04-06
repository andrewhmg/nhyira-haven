import { useEffect, useState } from 'react';
import { getResidents } from '../../services/api';
import type { Resident, ProcessRecording } from '../../types/api';
import StatusBadge from '../../components/common/StatusBadge';
import { Search, Plus, X, Lock } from 'lucide-react';
import { format } from 'date-fns';

interface RecordingWithResident extends ProcessRecording {
  residentName: string;
  residentId: number;
}

export default function ProcessRecordings() {
  const [recordings, setRecordings] = useState<RecordingWithResident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    getResidents()
      .then((residents: Resident[]) => {
        const all: RecordingWithResident[] = [];
        residents.forEach((r) => {
          r.processRecordings?.forEach((pr) => {
            all.push({ ...pr, residentName: `${r.firstName} ${r.lastName}`, residentId: r.id });
          });
        });
        all.sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());
        setRecordings(all);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = recordings.filter((r) => {
    const matchSearch = !search || r.residentName.toLowerCase().includes(search.toLowerCase()) || r.counselorName?.toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || r.sessionType === filterType;
    return matchSearch && matchType;
  });

  const types = [...new Set(recordings.map((r) => r.sessionType))].sort();
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
          <form onSubmit={(e) => { e.preventDefault(); setShowForm(false); }}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Resident</label>
                <select className="form-select form-select-sm" required>
                  <option value="">Select resident...</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold">Session Date</label>
                <input type="date" className="form-control form-control-sm" required />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold">Session Type</label>
                <select className="form-select form-select-sm" required>
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
                <input type="text" className="form-control form-control-sm" placeholder="Counselor name" />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Next Session Date</label>
                <input type="date" className="form-control form-control-sm" />
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">Summary</label>
                <textarea className="form-control form-control-sm" rows={3} required placeholder="Describe the session..." />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Observations</label>
                <textarea className="form-control form-control-sm" rows={2} placeholder="Behavioral observations..." />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Action Plan</label>
                <textarea className="form-control form-control-sm" rows={2} placeholder="Next steps..." />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Follow-Up Required</label>
                <input type="text" className="form-control form-control-sm" placeholder="e.g. Schedule family session" />
              </div>
              <div className="col-md-6 d-flex align-items-end">
                <div className="form-check">
                  <input type="checkbox" className="form-check-input" id="confidential" />
                  <label className="form-check-label small" htmlFor="confidential">Mark as Confidential</label>
                </div>
              </div>
            </div>
            <div className="mt-3 d-flex gap-2">
              <button type="submit" className="btn btn-primary btn-sm">Save Recording</button>
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
          {filtered.slice(0, 50).map((r) => (
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
    </div>
  );
}
