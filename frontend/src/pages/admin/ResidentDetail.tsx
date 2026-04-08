import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getResident, getResidentTimeline, deleteResident } from '../../services/api';
import type { Resident } from '../../types/api';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/common/ConfirmModal';
import { ArrowLeft, Trash2, Calendar, User, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import MLInsightPanel, { MLMetric, MLFactorBar } from '../../components/ml/MLInsightPanel';
import { getResidentMLInsights, type EarlyWarningResult, type ReintegrationResult, type IncidentRiskResult, type ReintegrationReadinessResult } from '../../services/mlApi';

type Tab = 'overview' | 'recordings' | 'education' | 'health' | 'interventions' | 'incidents';

interface TimelineEvent {
  date: string;
  type: string;
  title: string;
  summary: string;
  cssClass: string;
}

export default function ResidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resident, setResident] = useState<Resident | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [tab, setTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [mlInsights, setMlInsights] = useState<{
    earlyWarning: EarlyWarningResult | null;
    reintegration: ReintegrationResult | null;
    incidentRisk: IncidentRiskResult | null;
    readiness: ReintegrationReadinessResult | null;
  } | null>(null);
  const [mlLoading, setMlLoading] = useState(true);
  const [mlError, setMlError] = useState(false);

  useEffect(() => {
    if (!id) return;
    const rid = Number(id);
    Promise.all([
      getResident(rid).catch(() => null),
      getResidentTimeline(rid).catch(() => null),
    ]).then(([r, t]) => {
      setResident(r);
      if (r) {
        getResidentMLInsights(r)
          .then((insights) => { setMlInsights(insights); setMlLoading(false); })
          .catch(() => { setMlError(true); setMlLoading(false); });
      } else {
        setMlLoading(false);
      }
      if (t) {
        const events: TimelineEvent[] = [];
        t.processRecordings?.forEach((pr) =>
          events.push({ date: pr.sessionDate, type: 'recording', title: `Counseling: ${pr.sessionType}`, summary: pr.summary, cssClass: 'recording' })
        );
        t.homeVisitations?.forEach((hv) =>
          events.push({ date: hv.visitDate, type: 'visit', title: `Home Visit: ${hv.visitType}`, summary: hv.summary, cssClass: 'visit' })
        );
        t.incidents?.forEach((inc) =>
          events.push({ date: inc.incidentDate, type: 'incident', title: `Incident: ${inc.incidentType}`, summary: inc.description, cssClass: 'incident' })
        );
        events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTimeline(events);
      }
      setLoading(false);
    });
  }, [id]);

  const handleDelete = async () => {
    if (!resident) return;
    try {
      await deleteResident(resident.id);
      navigate('/admin/residents');
    } catch {
      alert('Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" style={{ color: 'var(--nh-primary)' }} />
      </div>
    );
  }

  if (!resident) {
    return (
      <div className="text-center py-5">
        <p className="text-muted">Resident not found.</p>
        <Link to="/admin/residents" className="btn btn-primary">Back to Caseload</Link>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview & Timeline' },
    { key: 'recordings', label: 'Recordings' },
    { key: 'education', label: 'Education' },
    { key: 'health', label: 'Health' },
    { key: 'interventions', label: 'Interventions' },
    { key: 'incidents', label: 'Incidents' },
  ];

  const formatDate = (d: string) => {
    try { return format(new Date(d), 'MMM d, yyyy'); } catch { return d; }
  };

  return (
    <div>
      <Link to="/admin/residents" className="text-decoration-none small d-inline-flex align-items-center gap-1 mb-3" style={{ color: 'var(--nh-text-muted)' }}>
        <ArrowLeft size={14} /> Back to Caseload
      </Link>

      {/* Header Card */}
      <div className="nh-card p-4 mb-4">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div className="d-flex gap-3 align-items-start">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 64, height: 64, background: 'var(--nh-primary)', color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}
            >
              {resident.firstName[0]}{resident.lastName[0]}
            </div>
            <div>
              <h3 className="mb-1">{resident.firstName} {resident.lastName}</h3>
              <div className="d-flex flex-wrap gap-3 text-muted small">
                <span className="d-flex align-items-center gap-1"><User size={14} /> {resident.caseNumber}</span>
                <span className="d-flex align-items-center gap-1"><MapPin size={14} /> Safehouse #{resident.safehouseId}</span>
                <span className="d-flex align-items-center gap-1"><Calendar size={14} /> Intake: {formatDate(resident.intakeDate)}</span>
              </div>
              <div className="mt-2 d-flex gap-2 flex-wrap">
                <StatusBadge status={resident.status} />
                <span className="badge badge-teal">{resident.caseCategory}</span>
                {resident.referralSource && <span className="badge bg-light text-dark border">{resident.referralSource}</span>}
              </div>
            </div>
          </div>
          <button className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1" onClick={() => setShowDelete(true)}>
            <Trash2 size={14} /> Delete
          </button>
        </div>

        {/* Extra details */}
        <div className="row g-3 mt-3 pt-3 border-top">
          <div className="col-md-3">
            <div className="text-muted small">Date of Birth</div>
            <div className="small fw-semibold">{formatDate(resident.dateOfBirth)}</div>
          </div>
          <div className="col-md-3">
            <div className="text-muted small">Guardian</div>
            <div className="small fw-semibold">{resident.guardianName || '—'}</div>
          </div>
          <div className="col-md-3">
            <div className="text-muted small">Guardian Contact</div>
            <div className="small fw-semibold">{resident.guardianContact || '—'}</div>
          </div>
          <div className="col-md-3">
            <div className="text-muted small">Reintegration Date</div>
            <div className="small fw-semibold">{resident.reintegrationDate ? formatDate(resident.reintegrationDate) : '—'}</div>
          </div>
        </div>

        {resident.notes && (
          <div className="mt-3 pt-3 border-top">
            <div className="text-muted small mb-1">Notes</div>
            <p className="small mb-0">{resident.notes}</p>
          </div>
        )}
      </div>

      {/* ML Insights Panel */}
      <MLInsightPanel title="Case Intelligence" loading={mlLoading} error={mlError}>
        {mlInsights && (
          <>
            <div className="row g-3 mb-3">
              {mlInsights.earlyWarning && (
                <div className="col-md-3">
                  <MLMetric
                    label="Exit Risk"
                    value={mlInsights.earlyWarning.risk_level}
                    sublabel={`${(mlInsights.earlyWarning.bad_exit_probability * 100).toFixed(0)}% bad exit probability`}
                    color={mlInsights.earlyWarning.risk_level === 'Red' ? '#C0392B' : mlInsights.earlyWarning.risk_level === 'Yellow' ? '#E8A838' : '#2D8659'}
                  />
                </div>
              )}
              {mlInsights.reintegration && (
                <div className="col-md-3">
                  <MLMetric
                    label="Exit Readiness"
                    value={mlInsights.reintegration.readiness}
                    sublabel={`${(mlInsights.reintegration.success_probability * 100).toFixed(0)}% success probability`}
                    color={mlInsights.reintegration.readiness === 'Ready' ? '#2D8659' : mlInsights.reintegration.readiness === 'Progressing' ? '#E8A838' : '#C0392B'}
                  />
                </div>
              )}
              {mlInsights.incidentRisk && (
                <div className="col-md-3">
                  <MLMetric
                    label="Incident Risk (Next Month)"
                    value={mlInsights.incidentRisk.alert_level}
                    sublabel={`${(mlInsights.incidentRisk.incident_probability * 100).toFixed(0)}% probability`}
                    color={mlInsights.incidentRisk.alert_level === 'High Risk' ? '#C0392B' : mlInsights.incidentRisk.alert_level === 'Moderate Risk' ? '#E8A838' : '#2D8659'}
                  />
                </div>
              )}
              {mlInsights.readiness && (
                <div className="col-md-3">
                  <MLMetric
                    label="Reintegration Timeline"
                    value={mlInsights.readiness.estimated_months_to_readiness !== undefined
                      ? `~${Math.round(mlInsights.readiness.estimated_months_to_readiness)} months`
                      : mlInsights.readiness.readiness}
                    sublabel={`${(mlInsights.readiness.ready_within_6mo_probability * 100).toFixed(0)}% ready within 6 months`}
                    color="#8B5CF6"
                  />
                </div>
              )}
            </div>
            {mlInsights.earlyWarning && mlInsights.earlyWarning.top_factors.length > 0 && (
              <MLFactorBar factors={mlInsights.earlyWarning.top_factors} />
            )}
          </>
        )}
      </MLInsightPanel>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        {tabs.map((t) => (
          <li key={t.key} className="nav-item">
            <button
              className={`nav-link${tab === t.key ? ' active' : ''}`}
              onClick={() => setTab(t.key)}
              style={tab === t.key ? { color: 'var(--nh-primary)', borderBottomColor: 'var(--nh-primary)' } : {}}
            >
              {t.label}
            </button>
          </li>
        ))}
      </ul>

      {/* Tab Content */}
      {tab === 'overview' && (
        <div>
          <h5 className="fw-bold mb-3">Timeline</h5>
          {timeline.length === 0 ? (
            <p className="text-muted">No timeline events recorded yet.</p>
          ) : (
            <div className="timeline">
              {timeline.map((ev, i) => (
                <div key={i} className={`timeline-item ${ev.cssClass}`}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-semibold small">{ev.title}</div>
                      <p className="text-muted small mb-0 mt-1">{ev.summary.slice(0, 200)}{ev.summary.length > 200 ? '...' : ''}</p>
                    </div>
                    <span className="text-muted small flex-shrink-0 ms-3">{formatDate(ev.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'recordings' && (
        <div>
          <h5 className="fw-bold mb-3">Process Recordings</h5>
          {(resident.processRecordings?.length ?? 0) === 0 ? (
            <p className="text-muted">No recordings yet.</p>
          ) : (
            <div className="data-table">
              <table className="table table-hover mb-0">
                <thead><tr><th>Date</th><th>Type</th><th>Counselor</th><th>Summary</th><th>Confidential</th></tr></thead>
                <tbody>
                  {resident.processRecordings?.map((pr) => (
                    <tr key={pr.id}>
                      <td className="small">{formatDate(pr.sessionDate)}</td>
                      <td className="small">{pr.sessionType}</td>
                      <td className="small">{pr.counselorName || '—'}</td>
                      <td className="small">{pr.summary.slice(0, 100)}...</td>
                      <td>{pr.isConfidential ? <span className="badge badge-on-hold">Yes</span> : <span className="badge bg-light text-dark border">No</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'education' && (
        <div>
          <h5 className="fw-bold mb-3">Education Records</h5>
          {(resident.educationRecords?.length ?? 0) === 0 ? (
            <p className="text-muted">No education records yet.</p>
          ) : (
            <div className="data-table">
              <table className="table table-hover mb-0">
                <thead><tr><th>Date</th><th>School</th><th>Grade</th><th>Subject</th><th>Performance</th><th>Score</th></tr></thead>
                <tbody>
                  {resident.educationRecords?.map((ed) => (
                    <tr key={ed.id}>
                      <td className="small">{formatDate(ed.recordDate)}</td>
                      <td className="small">{ed.schoolName}</td>
                      <td className="small">{ed.gradeLevel}</td>
                      <td className="small">{ed.subject}</td>
                      <td><StatusBadge status={ed.performanceLevel} size="sm" /></td>
                      <td className="small">{ed.score ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'health' && (
        <div>
          <h5 className="fw-bold mb-3">Health & Wellbeing</h5>
          {(resident.healthWellbeingRecords?.length ?? 0) === 0 ? (
            <p className="text-muted">No health records yet.</p>
          ) : (
            <div className="row g-3">
              {resident.healthWellbeingRecords?.map((hr) => (
                <div key={hr.id} className="col-md-6">
                  <div className="nh-card p-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="fw-bold small">{formatDate(hr.recordDate)}</span>
                      <span className="text-muted small">by {hr.recordedBy || '—'}</span>
                    </div>
                    {hr.mentalHealthStatus && <div className="small mb-1"><strong>Mental Health:</strong> {hr.mentalHealthStatus}</div>}
                    {hr.counselingProgress && <div className="small mb-1"><strong>Counseling:</strong> {hr.counselingProgress}</div>}
                    {hr.healthConcerns && <div className="small text-danger"><strong>Concerns:</strong> {hr.healthConcerns}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'interventions' && (
        <div>
          <h5 className="fw-bold mb-3">Intervention Plans</h5>
          {(resident.interventionPlans?.length ?? 0) === 0 ? (
            <p className="text-muted">No intervention plans yet.</p>
          ) : (
            <div className="row g-3">
              {resident.interventionPlans?.map((ip) => (
                <div key={ip.id} className="col-md-6">
                  <div className="nh-card p-3">
                    <div className="d-flex justify-content-between mb-2">
                      <StatusBadge status={ip.status} size="sm" />
                      <span className="text-muted small">Target: {formatDate(ip.targetDate)}</span>
                    </div>
                    <h6 className="fw-bold small">{ip.goal}</h6>
                    <p className="small text-muted mb-1">{ip.interventions}</p>
                    {ip.responsibleStaff && <div className="small"><strong>Staff:</strong> {ip.responsibleStaff}</div>}
                    {ip.outcomes && <div className="small text-success mt-1"><strong>Outcomes:</strong> {ip.outcomes}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'incidents' && (
        <div>
          <h5 className="fw-bold mb-3">Incident Reports</h5>
          {(resident.incidentReports?.length ?? 0) === 0 ? (
            <p className="text-muted">No incidents recorded.</p>
          ) : (
            <div className="data-table">
              <table className="table table-hover mb-0">
                <thead><tr><th>Date</th><th>Type</th><th>Severity</th><th>Description</th><th>Resolved</th></tr></thead>
                <tbody>
                  {resident.incidentReports?.map((inc) => (
                    <tr key={inc.id}>
                      <td className="small">{formatDate(inc.incidentDate)}</td>
                      <td className="small">{inc.incidentType}</td>
                      <td><StatusBadge status={inc.severity} size="sm" /></td>
                      <td className="small">{inc.description.slice(0, 80)}...</td>
                      <td>{inc.isResolved ? <span className="badge badge-active">Yes</span> : <span className="badge badge-at-risk">No</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showDelete && (
        <ConfirmModal
          title="Delete Resident"
          message={`Are you sure you want to delete ${resident.firstName} ${resident.lastName}? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}
