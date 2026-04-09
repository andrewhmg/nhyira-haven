import { useEffect, useState } from 'react';
import { getResidents, createHomeVisitation } from '../../services/api';
import type { Resident, HomeVisitation } from '../../types/api';
import MLInsightBadge from '../../components/ml/MLInsightBadge';
import { predictFamilyCooperation, type FamilyCooperationResult } from '../../services/mlApi';
import { Search, Plus, X, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const PAGE_SIZE = 15;

interface VisitWithResident extends HomeVisitation {
  residentName: string;
}

export default function HomeVisitations() {
  const [visits, setVisits] = useState<VisitWithResident[]>([]);
  const [allResidents, setAllResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [mlCooperation, setMlCooperation] = useState<Record<number, FamilyCooperationResult>>({});
  const [formData, setFormData] = useState({
    residentId: '', visitDate: new Date().toISOString().split('T')[0], visitType: '',
    visitorName: '', location: '', summary: '', familyInteraction: '',
    safetyConcerns: '', recommendations: '', followUpNeeded: false,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  const loadVisits = () => {
    getResidents()
      .then((residents: Resident[]) => {
        setAllResidents(residents);
        const all: VisitWithResident[] = [];
        residents.forEach((r) => {
          r.homeVisitations?.forEach((hv) => {
            all.push({ ...hv, residentName: `${r.firstName} ${r.lastName}` });
          });
        });
        all.sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
        setVisits(all);
        setLoading(false);

        const predictions: Record<number, FamilyCooperationResult> = {};
        const batch = all.slice(0, 30).map(async (visit) => {
          try {
            const features: Record<string, number> = {
              [`visit_type_${visit.visitType.replace(/\s/g, '')}`]: 1,
              has_safety_concerns: visit.safetyConcerns ? 1 : 0,
              follow_up_needed: visit.followUpNeeded ? 1 : 0,
              visit_count: all.filter((v) => v.residentId === visit.residentId).length,
            };
            const result = await predictFamilyCooperation(features, 1);
            predictions[visit.id] = result;
          } catch { /* ML unavailable */ }
        });
        Promise.allSettled(batch).then(() => setMlCooperation({ ...predictions }));
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadVisits(); }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.residentId || !formData.visitType || !formData.summary) return;
    setFormSubmitting(true);
    try {
      await createHomeVisitation({
        residentId: Number(formData.residentId),
        visitDate: formData.visitDate,
        visitType: formData.visitType,
        visitorName: formData.visitorName || undefined,
        location: formData.location,
        summary: formData.summary,
        familyInteraction: formData.familyInteraction || undefined,
        safetyConcerns: formData.safetyConcerns || undefined,
        recommendations: formData.recommendations || undefined,
        followUpNeeded: formData.followUpNeeded,
      });
      setShowForm(false);
      setFormData({ residentId: '', visitDate: new Date().toISOString().split('T')[0], visitType: '', visitorName: '', location: '', summary: '', familyInteraction: '', safetyConcerns: '', recommendations: '', followUpNeeded: false });
      loadVisits();
    } catch {
      alert('Failed to save visit. Ensure you have admin permissions.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const filtered = visits.filter((v) => {
    const matchSearch = !search || v.residentName.toLowerCase().includes(search.toLowerCase()) || v.visitorName?.toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || v.visitType === filterType;
    return matchSearch && matchType;
  });

  const types = [...new Set(visits.map((v) => v.visitType))].sort();
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const formatDate = (d: string) => { try { return format(new Date(d), 'MMM d, yyyy'); } catch { return d; } };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Home Visitations</h2>
          <p className="text-muted mb-0 small">{filtered.length} visit records</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-1" onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X size={16} /> Close</> : <><Plus size={16} /> New Visit</>}
        </button>
      </div>

      {showForm && (
        <div className="nh-card p-4 mb-4" style={{ borderLeft: '4px solid var(--nh-success)' }}>
          <h5 className="fw-bold mb-3">Log Home Visit</h5>
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
                <label className="form-label small fw-semibold">Visit Date *</label>
                <input type="date" className="form-control form-control-sm" required value={formData.visitDate}
                  onChange={e => setFormData({ ...formData, visitDate: e.target.value })} />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold">Visit Type *</label>
                <select className="form-select form-select-sm" required value={formData.visitType}
                  onChange={e => setFormData({ ...formData, visitType: e.target.value })}>
                  <option value="">Select type...</option>
                  <option>Initial Assessment</option>
                  <option>Routine Follow-Up</option>
                  <option>Reintegration Assessment</option>
                  <option>Post-Placement Monitoring</option>
                  <option>Emergency</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Visitor Name</label>
                <input type="text" className="form-control form-control-sm" placeholder="Staff member name"
                  value={formData.visitorName} onChange={e => setFormData({ ...formData, visitorName: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Location *</label>
                <input type="text" className="form-control form-control-sm" placeholder="Visit location" required
                  value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">Summary *</label>
                <textarea className="form-control form-control-sm" rows={3} required placeholder="Describe the visit..."
                  value={formData.summary} onChange={e => setFormData({ ...formData, summary: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Family Interaction</label>
                <textarea className="form-control form-control-sm" rows={2} placeholder="Notes on family interactions..."
                  value={formData.familyInteraction} onChange={e => setFormData({ ...formData, familyInteraction: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Recommendations</label>
                <textarea className="form-control form-control-sm" rows={2} placeholder="Recommendations..."
                  value={formData.recommendations} onChange={e => setFormData({ ...formData, recommendations: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Safety Concerns</label>
                <textarea className="form-control form-control-sm" rows={2} placeholder="Any safety concerns..."
                  value={formData.safetyConcerns} onChange={e => setFormData({ ...formData, safetyConcerns: e.target.value })} />
              </div>
              <div className="col-md-6 d-flex align-items-end">
                <div className="form-check">
                  <input type="checkbox" className="form-check-input" id="followUp" checked={formData.followUpNeeded}
                    onChange={e => setFormData({ ...formData, followUpNeeded: e.target.checked })} />
                  <label className="form-check-label small" htmlFor="followUp">Follow-Up Needed</label>
                </div>
              </div>
            </div>
            <div className="mt-3 d-flex gap-2">
              <button type="submit" className="btn btn-primary btn-sm" disabled={formSubmitting}>
                {formSubmitting ? 'Saving...' : 'Save Visit'}
              </button>
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="filter-bar d-flex flex-wrap gap-3 align-items-center">
        <div className="position-relative flex-grow-1" style={{ minWidth: 200 }}>
          <Search size={16} className="position-absolute" style={{ left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--nh-text-muted)' }} />
          <input
            type="text"
            className="form-control form-control-sm ps-4"
            placeholder="Search by resident or visitor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="form-select form-select-sm" style={{ width: 'auto' }} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">All Visit Types</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border" style={{ color: 'var(--nh-primary)' }} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5 text-muted">No home visits found.</div>
      ) : (
        <div className="d-flex flex-column gap-2 mt-1">
          {paginated.map((v) => (
            <div key={v.id} className="nh-card p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="fw-semibold small" style={{ color: 'var(--nh-primary)' }}>{v.residentName}</span>
                    <span className="badge badge-teal" style={{ fontSize: '0.7rem' }}>{v.visitType}</span>
                    {v.followUpNeeded && (
                      <span className="badge badge-on-hold d-flex align-items-center gap-1" style={{ fontSize: '0.65rem' }}>
                        <AlertTriangle size={8} /> Follow-Up
                      </span>
                    )}
                    {mlCooperation[v.id] && (
                      <MLInsightBadge
                        label={mlCooperation[v.id].prediction}
                        level={mlCooperation[v.id].cooperation_probability && mlCooperation[v.id].cooperation_probability! > 0.5 ? 'success' : 'warning'}
                        probability={mlCooperation[v.id].cooperation_probability}
                      />
                    )}
                  </div>
                  <p className="small text-muted mb-1">{v.summary.slice(0, 200)}{v.summary.length > 200 ? '...' : ''}</p>
                  <div className="d-flex gap-3" style={{ fontSize: '0.75rem' }}>
                    {v.visitorName && <span className="text-muted">Visitor: {v.visitorName}</span>}
                    <span className="text-muted">Location: {v.location}</span>
                  </div>
                  {v.safetyConcerns && (
                    <div className="mt-1 small text-danger d-flex align-items-center gap-1">
                      <AlertTriangle size={12} /> {v.safetyConcerns.slice(0, 100)}
                    </div>
                  )}
                </div>
                <span className="text-muted small flex-shrink-0 ms-3">{formatDate(v.visitDate)}</span>
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
