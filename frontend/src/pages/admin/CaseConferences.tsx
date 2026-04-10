import { useEffect, useState, useRef, useMemo } from 'react';
import { getResidents, createHomeVisitation } from '../../services/api';
import type { Resident, HomeVisitation } from '../../types/api';
import { Search, Plus, X, ChevronLeft, ChevronRight, Calendar, User, Users, ClipboardCheck, AlertTriangle, Target } from 'lucide-react';
import { format } from 'date-fns';

const PAGE_SIZE = 15;
const CONFERENCE_VISIT_TYPE = 'Case Conference';

interface ConferenceWithResident extends HomeVisitation {
  residentName: string;
}

const INITIAL_FORM = {
  residentId: '',
  conferenceDate: new Date().toISOString().split('T')[0],
  socialWorker: '',
  purpose: '',
  attendees: '',
  agenda: '',
  outcomes: '',
  followUpActions: '',
  location: 'Nhyira Haven – Conference Room',
};

export default function CaseConferences() {
  const [conferences, setConferences] = useState<ConferenceWithResident[]>([]);
  const [allResidents, setAllResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterResidentId, setFilterResidentId] = useState('');
  const [filterSocialWorker, setFilterSocialWorker] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ ...INITIAL_FORM });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [residentSearch, setResidentSearch] = useState('');
  const [showResidentDropdown, setShowResidentDropdown] = useState(false);
  const residentDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (residentDropdownRef.current && !residentDropdownRef.current.contains(e.target as Node)) {
        setShowResidentDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadConferences = () => {
    getResidents()
      .then((residents: Resident[]) => {
        setAllResidents(residents);
        const all: ConferenceWithResident[] = [];
        residents.forEach((r) => {
          r.homeVisitations?.forEach((hv) => {
            if (hv.visitType === CONFERENCE_VISIT_TYPE) {
              all.push({ ...hv, residentName: `${r.firstName} ${r.lastName}` });
            }
          });
        });
        all.sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
        setConferences(all);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadConferences(); }, []);

  const selectedResident = useMemo(() => {
    if (!formData.residentId) return null;
    return allResidents.find(r => r.id === Number(formData.residentId)) || null;
  }, [formData.residentId, allResidents]);

  const filteredResidents = useMemo(() => {
    const q = residentSearch.toLowerCase().trim();
    return allResidents
      .filter(r => r.isActive)
      .filter(r => !q || `${r.firstName} ${r.lastName} ${r.caseNumber}`.toLowerCase().includes(q));
  }, [allResidents, residentSearch]);

  const socialWorkers = useMemo(() => {
    return [...new Set(conferences.map(c => c.visitorName).filter((s): s is string => !!s))].sort();
  }, [conferences]);

  const openModal = () => {
    setFormData({ ...INITIAL_FORM, conferenceDate: new Date().toISOString().split('T')[0] });
    setResidentSearch('');
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.residentId || !formData.purpose) return;
    setFormSubmitting(true);

    // Encode agenda, outcomes, and follow-up actions into recommendations with labeled prefixes
    const recommendationsParts: string[] = [];
    if (formData.agenda.trim()) recommendationsParts.push(`[Agenda] ${formData.agenda.trim()}`);
    if (formData.outcomes.trim()) recommendationsParts.push(`[Outcomes] ${formData.outcomes.trim()}`);
    if (formData.followUpActions.trim()) recommendationsParts.push(`[Follow-Up Actions] ${formData.followUpActions.trim()}`);

    try {
      await createHomeVisitation({
        residentId: Number(formData.residentId),
        visitDate: formData.conferenceDate,
        visitType: CONFERENCE_VISIT_TYPE,
        visitorName: formData.socialWorker || undefined,
        location: formData.location || 'Nhyira Haven',
        summary: formData.purpose,
        familyInteraction: formData.attendees.trim() ? `Attendees: ${formData.attendees.trim()}` : undefined,
        recommendations: recommendationsParts.join('\n') || undefined,
        followUpNeeded: !!formData.followUpActions.trim(),
      });
      closeModal();
      loadConferences();
    } catch {
      alert('Failed to schedule conference. Ensure you have admin permissions.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const filtered = conferences.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !search
      || c.residentName.toLowerCase().includes(q)
      || c.visitorName?.toLowerCase().includes(q)
      || c.summary?.toLowerCase().includes(q);
    const matchResident = !filterResidentId || String(c.residentId) === filterResidentId;
    const matchWorker = !filterSocialWorker || c.visitorName === filterSocialWorker;
    const confDate = new Date(c.visitDate);
    const matchFrom = !filterDateFrom || confDate >= new Date(filterDateFrom);
    const matchTo = !filterDateTo || confDate <= new Date(filterDateTo + 'T23:59:59');
    return matchSearch && matchResident && matchWorker && matchFrom && matchTo;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const formatDate = (d: string) => { try { return format(new Date(d), 'MMM d, yyyy'); } catch { return d; } };

  useEffect(() => { setPage(1); }, [search, filterResidentId, filterSocialWorker, filterDateFrom, filterDateTo]);

  const parseRecommendations = (rec?: string) => {
    if (!rec) return { agenda: '', outcomes: '', followUpActions: '' };
    const agendaMatch = rec.match(/\[Agenda\]\s*([\s\S]*?)(?=\n\[(Outcomes|Follow-Up Actions)\]|$)/);
    const outcomesMatch = rec.match(/\[Outcomes\]\s*([\s\S]*?)(?=\n\[Follow-Up Actions\]|$)/);
    const followMatch = rec.match(/\[Follow-Up Actions\]\s*([\s\S]*?)$/);
    if (!agendaMatch && !outcomesMatch && !followMatch) {
      return { agenda: '', outcomes: rec, followUpActions: '' };
    }
    return {
      agenda: agendaMatch?.[1]?.trim() ?? '',
      outcomes: outcomesMatch?.[1]?.trim() ?? '',
      followUpActions: followMatch?.[1]?.trim() ?? '',
    };
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Case Conferences</h2>
          <p className="text-muted mb-0 small">{filtered.length} conference records</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-1" onClick={openModal}>
          <Plus size={16} /> Schedule Conference
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar d-flex flex-wrap gap-3 align-items-center">
        <div className="position-relative flex-grow-1" style={{ minWidth: 200 }}>
          <Search size={16} className="position-absolute" style={{ left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--nh-text-muted)' }} />
          <input
            type="text"
            className="form-control form-control-sm ps-4"
            placeholder="Search by resident, social worker, or purpose..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="form-select form-select-sm" style={{ width: 'auto' }} value={filterResidentId} onChange={(e) => setFilterResidentId(e.target.value)}>
          <option value="">All Residents</option>
          {allResidents.map(r => (
            <option key={r.id} value={String(r.id)}>{r.firstName} {r.lastName}</option>
          ))}
        </select>
        <select className="form-select form-select-sm" style={{ width: 'auto' }} value={filterSocialWorker} onChange={(e) => setFilterSocialWorker(e.target.value)}>
          <option value="">All Social Workers</option>
          {socialWorkers.map(sw => <option key={sw} value={sw}>{sw}</option>)}
        </select>
        <div className="d-flex align-items-center gap-2">
          <Calendar size={14} style={{ color: 'var(--nh-text-muted)', flexShrink: 0 }} />
          <input
            type="date"
            className="form-control form-control-sm"
            style={{ width: 140 }}
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            title="From date"
          />
          <span className="text-muted small">—</span>
          <input
            type="date"
            className="form-control form-control-sm"
            style={{ width: 140 }}
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            title="To date"
          />
          {(filterDateFrom || filterDateTo) && (
            <button
              className="btn btn-sm btn-outline-secondary py-0 px-1"
              onClick={() => { setFilterDateFrom(''); setFilterDateTo(''); }}
              title="Clear date range"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* History list */}
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border" style={{ color: 'var(--nh-primary)' }} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5 text-muted">No case conferences found.</div>
      ) : (
        <div className="d-flex flex-column gap-2 mt-1">
          {paginated.map((c) => {
            const { agenda, outcomes, followUpActions } = parseRecommendations(c.recommendations);
            const attendeesText = c.familyInteraction?.replace(/^Attendees:\s*/, '') ?? '';
            return (
              <div key={c.id} className="nh-card p-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                      <span className="fw-semibold small" style={{ color: 'var(--nh-primary)' }}>{c.residentName}</span>
                      <span className="badge badge-teal" style={{ fontSize: '0.7rem' }}>Case Conference</span>
                      {c.followUpNeeded && (
                        <span className="badge badge-on-hold d-flex align-items-center gap-1" style={{ fontSize: '0.65rem' }}>
                          <AlertTriangle size={8} /> Follow-Up
                        </span>
                      )}
                    </div>
                    <p className="small text-muted mb-1"><strong>Purpose:</strong> {c.summary.slice(0, 200)}{c.summary.length > 200 ? '...' : ''}</p>
                    <div className="d-flex gap-3 flex-wrap" style={{ fontSize: '0.75rem' }}>
                      {c.visitorName && (
                        <span className="text-muted d-flex align-items-center gap-1">
                          <User size={10} /> {c.visitorName}
                        </span>
                      )}
                      {attendeesText && (
                        <span className="text-muted d-flex align-items-center gap-1">
                          <Users size={10} /> {attendeesText.slice(0, 80)}
                        </span>
                      )}
                    </div>
                    {agenda && (
                      <div className="mt-1 small text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                        <ClipboardCheck size={11} />
                        <span><strong>Agenda:</strong> <em>{agenda.slice(0, 120)}{agenda.length > 120 ? '...' : ''}</em></span>
                      </div>
                    )}
                    {outcomes && (
                      <div className="mt-1 small text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                        <Target size={11} />
                        <span><strong>Outcomes:</strong> <em>{outcomes.slice(0, 120)}{outcomes.length > 120 ? '...' : ''}</em></span>
                      </div>
                    )}
                    {followUpActions && (
                      <div className="mt-1 small d-flex align-items-center gap-1" style={{ fontSize: '0.72rem', color: 'var(--nh-warning, #f59e0b)' }}>
                        <AlertTriangle size={11} />
                        <span><strong>Follow-Up Actions:</strong> <em>{followUpActions.slice(0, 120)}{followUpActions.length > 120 ? '...' : ''}</em></span>
                      </div>
                    )}
                  </div>
                  <span className="text-muted small flex-shrink-0 ms-3">{formatDate(c.visitDate)}</span>
                </div>
              </div>
            );
          })}
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

      {/* Modal */}
      {showModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ zIndex: 1050, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div
            className="nh-card p-0"
            style={{
              width: '100%', maxWidth: 720, maxHeight: '90vh',
              overflow: 'hidden', display: 'flex', flexDirection: 'column',
              borderRadius: 12, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
            }}
          >
            <div
              className="d-flex justify-content-between align-items-center px-4 py-3"
              style={{
                borderBottom: '1px solid var(--nh-border, #2a2a3e)',
                background: 'linear-gradient(135deg, var(--nh-primary)11, transparent)',
              }}
            >
              <div className="d-flex align-items-center gap-2">
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'var(--nh-primary)22', color: 'var(--nh-primary)' }}
                >
                  <Users size={16} />
                </div>
                <h5 className="fw-bold mb-0">Schedule Case Conference</h5>
              </div>
              <button
                className="btn btn-sm d-flex align-items-center justify-content-center"
                style={{ width: 28, height: 28, borderRadius: 6, padding: 0, color: 'var(--nh-text-muted)' }}
                onClick={closeModal}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px' }}>
              <form id="conferenceForm" onSubmit={handleFormSubmit}>
                <div className="row g-3">
                  {/* Resident */}
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Resident *</label>
                    <div ref={residentDropdownRef} className="position-relative">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder={selectedResident ? `${selectedResident.firstName} ${selectedResident.lastName}` : 'Search resident...'}
                        value={showResidentDropdown ? residentSearch : (selectedResident ? `${selectedResident.firstName} ${selectedResident.lastName} (${selectedResident.caseNumber})` : '')}
                        onChange={(e) => { setResidentSearch(e.target.value); setShowResidentDropdown(true); }}
                        onFocus={() => setShowResidentDropdown(true)}
                        required={!formData.residentId}
                      />
                      {formData.residentId && !showResidentDropdown && (
                        <button
                          type="button"
                          className="btn btn-sm position-absolute"
                          style={{ right: 4, top: '50%', transform: 'translateY(-50%)', padding: '0 4px', color: 'var(--nh-text-muted)' }}
                          onClick={() => { setFormData({ ...formData, residentId: '' }); setResidentSearch(''); setShowResidentDropdown(true); }}
                        >
                          <X size={12} />
                        </button>
                      )}
                      {showResidentDropdown && (
                        <div
                          className="position-absolute w-100"
                          style={{
                            top: '100%', left: 0, zIndex: 10,
                            maxHeight: 200, overflowY: 'auto',
                            backgroundColor: 'var(--nh-card-bg, #1e1e2e)',
                            border: '1px solid var(--nh-border, #2a2a3e)',
                            borderRadius: 6,
                            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                          }}
                        >
                          {filteredResidents.length === 0 ? (
                            <div className="p-2 text-muted small">No residents found</div>
                          ) : (
                            filteredResidents.slice(0, 50).map(r => (
                              <button
                                key={r.id}
                                type="button"
                                className="d-block w-100 text-start btn btn-sm border-0 px-3 py-2"
                                style={{
                                  fontSize: '0.82rem',
                                  backgroundColor: formData.residentId === String(r.id) ? 'var(--nh-primary)22' : 'transparent',
                                  borderBottom: '1px solid var(--nh-border, #2a2a3e)',
                                }}
                                onMouseDown={(e) => { e.preventDefault(); }}
                                onClick={() => {
                                  setFormData({ ...formData, residentId: String(r.id) });
                                  setResidentSearch('');
                                  setShowResidentDropdown(false);
                                }}
                              >
                                <span className="fw-semibold">{r.firstName} {r.lastName}</span>{' '}
                                <span className="text-muted">({r.caseNumber})</span>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label small fw-semibold">Conference Date *</label>
                    <input type="date" className="form-control form-control-sm" required value={formData.conferenceDate}
                      onChange={e => setFormData({ ...formData, conferenceDate: e.target.value })} />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label small fw-semibold">Social Worker</label>
                    <input type="text" className="form-control form-control-sm" placeholder="Lead social worker"
                      value={formData.socialWorker} onChange={e => setFormData({ ...formData, socialWorker: e.target.value })} />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold">Location</label>
                    <input type="text" className="form-control form-control-sm"
                      value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold">Purpose *</label>
                    <textarea className="form-control form-control-sm" rows={2} required placeholder="Reason for the conference..."
                      value={formData.purpose} onChange={e => setFormData({ ...formData, purpose: e.target.value })} />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold">Attendees</label>
                    <textarea className="form-control form-control-sm" rows={2} placeholder="Comma-separated list of attendees (staff, family, external partners)..."
                      value={formData.attendees} onChange={e => setFormData({ ...formData, attendees: e.target.value })} />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold">Agenda</label>
                    <textarea className="form-control form-control-sm" rows={3} placeholder="Discussion topics..."
                      value={formData.agenda} onChange={e => setFormData({ ...formData, agenda: e.target.value })} />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold">Outcomes</label>
                    <textarea className="form-control form-control-sm" rows={3} placeholder="Decisions and conclusions reached..."
                      value={formData.outcomes} onChange={e => setFormData({ ...formData, outcomes: e.target.value })} />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold d-flex align-items-center gap-1">
                      <AlertTriangle size={12} /> Follow-Up Actions
                    </label>
                    <textarea className="form-control form-control-sm" rows={2} placeholder="Action items and responsible parties..."
                      value={formData.followUpActions} onChange={e => setFormData({ ...formData, followUpActions: e.target.value })} />
                  </div>
                </div>
              </form>
            </div>

            <div
              className="d-flex justify-content-end gap-2 px-4 py-3"
              style={{ borderTop: '1px solid var(--nh-border, #2a2a3e)' }}
            >
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={closeModal}>Cancel</button>
              <button type="submit" form="conferenceForm" className="btn btn-primary btn-sm d-flex align-items-center gap-1" disabled={formSubmitting}>
                {formSubmitting ? (
                  <><span className="spinner-border spinner-border-sm" /> Saving...</>
                ) : (
                  <><Plus size={14} /> Schedule</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
