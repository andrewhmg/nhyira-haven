import { useEffect, useState, useRef, useMemo } from 'react';
import { getResidents, createHomeVisitation } from '../../services/api';
import type { Resident, HomeVisitation } from '../../types/api';
import MLInsightBadge from '../../components/ml/MLInsightBadge';
import { predictFamilyCooperation, type FamilyCooperationResult } from '../../services/mlApi';
import { Search, Plus, X, AlertTriangle, ChevronLeft, ChevronRight, Calendar, MapPin, User, Users, ShieldAlert, ClipboardCheck } from 'lucide-react';
import { format } from 'date-fns';

const PAGE_SIZE = 15;

const VISIT_TYPES = [
  'Initial Assessment',
  'Routine Follow-up',
  'Reintegration Assessment',
  'Post-Placement Monitoring',
  'Emergency',
] as const;

const COOPERATION_LEVELS = ['Cooperative', 'Neutral', 'Uncooperative'] as const;

const FAMILY_MEMBER_OPTIONS = [
  'Mother', 'Father', 'Grandmother', 'Grandfather',
  'Aunt', 'Uncle', 'Sibling', 'Guardian', 'Other Relative',
] as const;

interface VisitWithResident extends HomeVisitation {
  residentName: string;
}

const INITIAL_FORM = {
  residentId: '',
  visitDate: new Date().toISOString().split('T')[0],
  visitType: '',
  visitorName: '',
  location: '',
  purpose: '',
  observations: '',
  cooperationLevel: '',
  familyMembers: [] as string[],
  hasSafetyConcerns: false,
  safetyConcernsNotes: '',
  hasFollowUp: false,
  followUpNotes: '',
};

export default function HomeVisitations() {
  const [visits, setVisits] = useState<VisitWithResident[]>([]);
  const [allResidents, setAllResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [mlCooperation, setMlCooperation] = useState<Record<number, FamilyCooperationResult>>({});
  const [formData, setFormData] = useState({ ...INITIAL_FORM });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [residentSearch, setResidentSearch] = useState('');
  const [showResidentDropdown, setShowResidentDropdown] = useState(false);
  const residentDropdownRef = useRef<HTMLDivElement>(null);

  // Close resident dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (residentDropdownRef.current && !residentDropdownRef.current.contains(e.target as Node)) {
        setShowResidentDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadVisits = () => {
    getResidents()
      .then((residents: Resident[]) => {
        setAllResidents(residents);
        const all: VisitWithResident[] = [];
        residents.forEach((r) => {
          r.homeVisitations?.forEach((hv) => {
            // Case Conferences live on their own page
            if (hv.visitType === 'Case Conference') return;
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

  const openModal = () => {
    setFormData({ ...INITIAL_FORM, visitDate: new Date().toISOString().split('T')[0] });
    setResidentSearch('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const toggleFamilyMember = (member: string) => {
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.includes(member)
        ? prev.familyMembers.filter(m => m !== member)
        : [...prev.familyMembers, member],
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.residentId || !formData.visitType || !formData.purpose) return;
    setFormSubmitting(true);

    // Map form fields to backend model
    const cooperationPrefix = formData.cooperationLevel ? `[${formData.cooperationLevel}] ` : '';
    const familyMembersStr = formData.familyMembers.length > 0
      ? `Family present: ${formData.familyMembers.join(', ')}`
      : '';
    const safetyConcernsStr = formData.hasSafetyConcerns
      ? (formData.safetyConcernsNotes || 'Safety concerns noted')
      : '';

    const recommendationsParts: string[] = [];
    if (formData.observations.trim()) {
      recommendationsParts.push(`[Observations] ${formData.observations.trim()}`);
    }
    if (formData.hasFollowUp && formData.followUpNotes.trim()) {
      recommendationsParts.push(`[Follow-Up] ${formData.followUpNotes.trim()}`);
    }
    const recommendationsStr = recommendationsParts.join('\n');

    try {
      await createHomeVisitation({
        residentId: Number(formData.residentId),
        visitDate: formData.visitDate,
        visitType: formData.visitType,
        visitorName: formData.visitorName || undefined,
        location: formData.location,
        summary: formData.purpose,
        familyInteraction: cooperationPrefix + familyMembersStr || undefined,
        safetyConcerns: safetyConcernsStr || undefined,
        recommendations: recommendationsStr || undefined,
        followUpNeeded: formData.hasFollowUp,
      });
      closeModal();
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
    const visitDate = new Date(v.visitDate);
    const matchFrom = !filterDateFrom || visitDate >= new Date(filterDateFrom);
    const matchTo = !filterDateTo || visitDate <= new Date(filterDateTo + 'T23:59:59');
    return matchSearch && matchType && matchFrom && matchTo;
  });

  const types = [...new Set(visits.map((v) => v.visitType))].sort();
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const formatDate = (d: string) => { try { return format(new Date(d), 'MMM d, yyyy'); } catch { return d; } };

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, filterType, filterDateFrom, filterDateTo]);

  // Parse observations and follow-up notes out of the recommendations field
  const parseRecommendations = (rec?: string) => {
    if (!rec) return { observations: '', followUp: '' };
    const obsMatch = rec.match(/\[Observations\]\s*([\s\S]*?)(?=\n\[Follow-Up\]|$)/);
    const followMatch = rec.match(/\[Follow-Up\]\s*([\s\S]*?)$/);
    // If no prefixes were used (legacy rows), treat the whole thing as observations
    if (!obsMatch && !followMatch) return { observations: rec, followUp: '' };
    return {
      observations: obsMatch?.[1]?.trim() ?? '',
      followUp: followMatch?.[1]?.trim() ?? '',
    };
  };

  // Extract cooperation level from familyInteraction for display
  const getCooperationBadge = (v: VisitWithResident) => {
    if (!v.familyInteraction) return null;
    const match = v.familyInteraction.match(/^\[(Cooperative|Neutral|Uncooperative)\]/);
    if (!match) return null;
    const level = match[1];
    const colorMap: Record<string, string> = {
      Cooperative: 'var(--nh-success)',
      Neutral: 'var(--nh-warning, #f59e0b)',
      Uncooperative: 'var(--nh-danger, #ef4444)',
    };
    return (
      <span
        className="badge d-flex align-items-center gap-1"
        style={{
          fontSize: '0.65rem',
          backgroundColor: `${colorMap[level]}22`,
          color: colorMap[level],
          border: `1px solid ${colorMap[level]}44`,
        }}
      >
        <Users size={8} /> {level}
      </span>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Home Visitations</h2>
          <p className="text-muted mb-0 small">{filtered.length} visit records</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-1" onClick={openModal}>
          <Plus size={16} /> Log New Visit
        </button>
      </div>

      {/* Filters */}
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

      {/* History List */}
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
                  <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                    <span className="fw-semibold small" style={{ color: 'var(--nh-primary)' }}>{v.residentName}</span>
                    <span className="badge badge-teal" style={{ fontSize: '0.7rem' }}>{v.visitType}</span>
                    {getCooperationBadge(v)}
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
                  <div className="d-flex gap-3 flex-wrap" style={{ fontSize: '0.75rem' }}>
                    {v.visitorName && (
                      <span className="text-muted d-flex align-items-center gap-1">
                        <User size={10} /> {v.visitorName}
                      </span>
                    )}
                    <span className="text-muted d-flex align-items-center gap-1">
                      <MapPin size={10} /> {v.location}
                    </span>
                    {v.familyInteraction && (
                      <span className="text-muted d-flex align-items-center gap-1">
                        <Users size={10} /> {v.familyInteraction.replace(/^\[(Cooperative|Neutral|Uncooperative)\]\s*/, '').slice(0, 60)}
                      </span>
                    )}
                  </div>
                  {(() => {
                    const sc = v.safetyConcerns?.trim();
                    if (!sc || sc.toLowerCase() === 'true' || sc.toLowerCase() === 'false') return null;
                    return (
                      <div className="mt-1 small text-danger d-flex align-items-center gap-1">
                        <ShieldAlert size={12} /> {sc.slice(0, 100)}
                      </div>
                    );
                  })()}
                  {(() => {
                    const { observations, followUp } = parseRecommendations(v.recommendations);
                    return (
                      <>
                        {observations && (
                          <div className="mt-1 small text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                            <ClipboardCheck size={11} />
                            <span><strong>Observations:</strong> <em>{observations.slice(0, 100)}{observations.length > 100 ? '...' : ''}</em></span>
                          </div>
                        )}
                        {followUp && (
                          <div className="mt-1 small d-flex align-items-center gap-1" style={{ fontSize: '0.72rem', color: 'var(--nh-warning, #f59e0b)' }}>
                            <AlertTriangle size={11} />
                            <span><strong>Follow-Up:</strong> <em>{followUp.slice(0, 100)}{followUp.length > 100 ? '...' : ''}</em></span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
                <span className="text-muted small flex-shrink-0 ms-3">{formatDate(v.visitDate)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <span className="text-muted small">Page {page} of {totalPages}</span>
          <div className="d-flex gap-1">
            <button className="btn btn-sm btn-outline-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft size={14} /></button>
            <button className="btn btn-sm btn-outline-secondary" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight size={14} /></button>
          </div>
        </div>
      )}

      {/* Modal Overlay */}
      {showModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ zIndex: 1050, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div
            className="nh-card p-0"
            style={{
              width: '100%',
              maxWidth: 720,
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 12,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
            }}
          >
            {/* Modal Header */}
            <div
              className="d-flex justify-content-between align-items-center px-4 py-3"
              style={{
                borderBottom: '1px solid var(--nh-border, #2a2a3e)',
                background: 'linear-gradient(135deg, var(--nh-success)11, transparent)',
              }}
            >
              <div className="d-flex align-items-center gap-2">
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    backgroundColor: 'var(--nh-success)22',
                    color: 'var(--nh-success)',
                  }}
                >
                  <ClipboardCheck size={16} />
                </div>
                <h5 className="fw-bold mb-0">Log Home Visit</h5>
              </div>
              <button
                className="btn btn-sm d-flex align-items-center justify-content-center"
                style={{ width: 28, height: 28, borderRadius: 6, padding: 0, color: 'var(--nh-text-muted)' }}
                onClick={closeModal}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px' }}>
              <form id="visitForm" onSubmit={handleFormSubmit}>
                <div className="row g-3">
                  {/* Resident (searchable dropdown) */}
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

                  {/* Visit Date */}
                  <div className="col-md-3">
                    <label className="form-label small fw-semibold">Visit Date *</label>
                    <input type="date" className="form-control form-control-sm" required value={formData.visitDate}
                      onChange={e => setFormData({ ...formData, visitDate: e.target.value })} />
                  </div>

                  {/* Visit Type */}
                  <div className="col-md-3">
                    <label className="form-label small fw-semibold">Visit Type *</label>
                    <select className="form-select form-select-sm" required value={formData.visitType}
                      onChange={e => setFormData({ ...formData, visitType: e.target.value })}>
                      <option value="">Select type...</option>
                      {VISIT_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>

                  {/* Location */}
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Location Visited *</label>
                    <input type="text" className="form-control form-control-sm" placeholder="e.g. Family home, community center..." required
                      value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                  </div>

                  {/* Social Worker / Visitor */}
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Social Worker / Visitor</label>
                    <input type="text" className="form-control form-control-sm" placeholder="Staff member name"
                      value={formData.visitorName} onChange={e => setFormData({ ...formData, visitorName: e.target.value })} />
                  </div>

                  {/* Family Members Present (multi-select chips) */}
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Family Members Present</label>
                    <div className="d-flex flex-wrap gap-2">
                      {FAMILY_MEMBER_OPTIONS.map(member => {
                        const selected = formData.familyMembers.includes(member);
                        return (
                          <button
                            key={member}
                            type="button"
                            className="btn btn-sm"
                            style={{
                              fontSize: '0.78rem',
                              padding: '3px 10px',
                              borderRadius: 16,
                              border: selected ? '1px solid var(--nh-primary)' : '1px solid var(--nh-border, #2a2a3e)',
                              backgroundColor: selected ? 'var(--nh-primary)22' : 'transparent',
                              color: selected ? 'var(--nh-primary)' : 'var(--nh-text-muted)',
                              transition: 'all 0.15s ease',
                            }}
                            onClick={() => toggleFamilyMember(member)}
                          >
                            {selected && '✓ '}{member}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Purpose */}
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Purpose *</label>
                    <textarea className="form-control form-control-sm" rows={3} required placeholder="Describe the purpose of the visit..."
                      value={formData.purpose} onChange={e => setFormData({ ...formData, purpose: e.target.value })} />
                  </div>

                  {/* Observations */}
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Observations</label>
                    <textarea className="form-control form-control-sm" rows={3} placeholder="Note any observations during the visit..."
                      value={formData.observations} onChange={e => setFormData({ ...formData, observations: e.target.value })} />
                  </div>

                  {/* Cooperation Level */}
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Family Cooperation Level</label>
                    <div className="d-flex gap-2">
                      {COOPERATION_LEVELS.map(level => {
                        const selected = formData.cooperationLevel === level;
                        const colorMap: Record<string, string> = {
                          Cooperative: 'var(--nh-success)',
                          Neutral: 'var(--nh-warning, #f59e0b)',
                          Uncooperative: 'var(--nh-danger, #ef4444)',
                        };
                        return (
                          <button
                            key={level}
                            type="button"
                            className="btn btn-sm flex-fill"
                            style={{
                              fontSize: '0.75rem',
                              padding: '5px 8px',
                              borderRadius: 6,
                              border: selected ? `1px solid ${colorMap[level]}` : '1px solid var(--nh-border, #2a2a3e)',
                              backgroundColor: selected ? `${colorMap[level]}22` : 'transparent',
                              color: selected ? colorMap[level] : 'var(--nh-text-muted)',
                              transition: 'all 0.15s ease',
                            }}
                            onClick={() => setFormData({ ...formData, cooperationLevel: selected ? '' : level })}
                          >
                            {level}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Safety Concerns (checkbox + conditional notes) */}
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold d-flex align-items-center gap-1">
                      <ShieldAlert size={12} /> Safety Concerns
                    </label>
                    <div className="form-check mb-2">
                      <input type="checkbox" className="form-check-input" id="safetyConcerns" checked={formData.hasSafetyConcerns}
                        onChange={e => setFormData({ ...formData, hasSafetyConcerns: e.target.checked, safetyConcernsNotes: e.target.checked ? formData.safetyConcernsNotes : '' })} />
                      <label className="form-check-label small" htmlFor="safetyConcerns">Safety concerns identified</label>
                    </div>
                    {formData.hasSafetyConcerns && (
                      <textarea
                        className="form-control form-control-sm"
                        rows={2}
                        placeholder="Describe safety concerns..."
                        value={formData.safetyConcernsNotes}
                        onChange={e => setFormData({ ...formData, safetyConcernsNotes: e.target.value })}
                        style={{ borderColor: 'var(--nh-danger, #ef4444)44' }}
                      />
                    )}
                  </div>

                  {/* Follow-Up Needed (checkbox + conditional notes) */}
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold d-flex align-items-center gap-1">
                      <AlertTriangle size={12} /> Follow-Up
                    </label>
                    <div className="form-check mb-2">
                      <input type="checkbox" className="form-check-input" id="followUpNeeded" checked={formData.hasFollowUp}
                        onChange={e => setFormData({ ...formData, hasFollowUp: e.target.checked, followUpNotes: e.target.checked ? formData.followUpNotes : '' })} />
                      <label className="form-check-label small" htmlFor="followUpNeeded">Follow-up visit needed</label>
                    </div>
                    {formData.hasFollowUp && (
                      <textarea
                        className="form-control form-control-sm"
                        rows={2}
                        placeholder="Follow-up details..."
                        value={formData.followUpNotes}
                        onChange={e => setFormData({ ...formData, followUpNotes: e.target.value })}
                        style={{ borderColor: 'var(--nh-warning, #f59e0b)44' }}
                      />
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div
              className="d-flex justify-content-end gap-2 px-4 py-3"
              style={{ borderTop: '1px solid var(--nh-border, #2a2a3e)' }}
            >
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={closeModal}>Cancel</button>
              <button type="submit" form="visitForm" className="btn btn-primary btn-sm d-flex align-items-center gap-1" disabled={formSubmitting}>
                {formSubmitting ? (
                  <><span className="spinner-border spinner-border-sm" /> Saving...</>
                ) : (
                  <><Plus size={14} /> Save Visit</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
