import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getResidents, getSafehouses, deleteResident, createResident, updateResident } from '../../services/api';
import type { Resident, Safehouse } from '../../types/api';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/common/ConfirmModal';
import MLInsightBadge, { riskLevelColor } from '../../components/ml/MLInsightBadge';
import { buildResidentFeatures, predictEarlyWarning, type EarlyWarningResult } from '../../services/mlApi';
import { Search, Plus, ChevronLeft, ChevronRight, Brain, Pencil } from 'lucide-react';

const PAGE_SIZE = 15;

export default function Residents() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [safehouses, setSafehouses] = useState<Safehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSafehouse, setFilterSafehouse] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Resident | null>(null);
  const [mlRisks, setMlRisks] = useState<Record<number, EarlyWarningResult>>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    caseNumber: '', firstName: '', lastName: '', dateOfBirth: '', gender: 'Female',
    safehouseId: '', intakeDate: new Date().toISOString().split('T')[0], caseCategory: '',
    referralSource: '', guardianName: '', guardianContact: '', status: 'Active', notes: '',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [editTarget, setEditTarget] = useState<Resident | null>(null);
  const [editForm, setEditForm] = useState({
    caseNumber: '', firstName: '', lastName: '', dateOfBirth: '', gender: 'Female',
    safehouseId: '', intakeDate: '', caseCategory: '', referralSource: '',
    guardianName: '', guardianContact: '', status: 'Active', notes: '',
    reintegrationDate: '', disabilityInfo: '', assignedSocialWorkers: '',
    is4PsBeneficiary: false, isSoloParentChild: false, isIndigenous: false, isInformalSettler: false,
  });
  const [editSubmitting, setEditSubmitting] = useState(false);

  const openEditModal = (r: Resident) => {
    setEditTarget(r);
    setEditForm({
      caseNumber: r.caseNumber,
      firstName: r.firstName,
      lastName: r.lastName,
      dateOfBirth: r.dateOfBirth?.split('T')[0] || '',
      gender: r.gender,
      safehouseId: String(r.safehouseId),
      intakeDate: r.intakeDate?.split('T')[0] || '',
      caseCategory: r.caseCategory,
      referralSource: r.referralSource,
      guardianName: r.guardianName || '',
      guardianContact: r.guardianContact || '',
      status: r.status,
      notes: r.notes || '',
      reintegrationDate: r.reintegrationDate?.split('T')[0] || '',
      disabilityInfo: r.disabilityInfo || '',
      assignedSocialWorkers: r.assignedSocialWorkers || '',
      is4PsBeneficiary: r.is4PsBeneficiary ?? false,
      isSoloParentChild: r.isSoloParentChild ?? false,
      isIndigenous: r.isIndigenous ?? false,
      isInformalSettler: r.isInformalSettler ?? false,
    });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setEditSubmitting(true);
    try {
      await updateResident(editTarget.id, {
        id: editTarget.id,
        caseNumber: editForm.caseNumber,
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        dateOfBirth: editForm.dateOfBirth,
        gender: editForm.gender,
        safehouseId: Number(editForm.safehouseId),
        intakeDate: editForm.intakeDate,
        caseCategory: editForm.caseCategory,
        referralSource: editForm.referralSource,
        guardianName: editForm.guardianName || undefined,
        guardianContact: editForm.guardianContact || undefined,
        status: editForm.status,
        notes: editForm.notes || undefined,
        reintegrationDate: editForm.reintegrationDate || undefined,
        disabilityInfo: editForm.disabilityInfo || undefined,
        assignedSocialWorkers: editForm.assignedSocialWorkers || undefined,
        is4PsBeneficiary: editForm.is4PsBeneficiary,
        isSoloParentChild: editForm.isSoloParentChild,
        isIndigenous: editForm.isIndigenous,
        isInformalSettler: editForm.isInformalSettler,
        isActive: editForm.status === 'Active',
      });
      setEditTarget(null);
      loadData();
    } catch {
      alert('Failed to update resident. Ensure you have admin permissions.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    const params: Record<string, unknown> = {};
    if (filterSafehouse) params.safehouseId = Number(filterSafehouse);
    if (filterStatus) params.status = filterStatus;
    if (filterCategory) params.category = filterCategory;
    const [r, s] = await Promise.all([
      getResidents(params as { safehouseId?: number; status?: string; category?: string }).catch(() => []),
      safehouses.length ? Promise.resolve(safehouses) : getSafehouses().catch(() => []),
    ]);
    setResidents(r);
    if (!safehouses.length) setSafehouses(s);
    setLoading(false);
    setPage(1);

    // Fire ML predictions for active residents (non-blocking)
    const risks: Record<number, EarlyWarningResult> = {};
    const active = r.filter((res: Resident) => res.status === 'Active').slice(0, 50);
    const batch = active.map(async (res: Resident) => {
      try {
        const features = buildResidentFeatures(res);
        const result = await predictEarlyWarning(features);
        risks[res.id] = result;
      } catch { /* ML service unavailable */ }
    });
    Promise.allSettled(batch).then(() => setMlRisks({ ...risks }));
  };

  useEffect(() => { loadData(); }, [filterSafehouse, filterStatus, filterCategory]);

  const filtered = residents.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.firstName.toLowerCase().includes(q) ||
      r.lastName.toLowerCase().includes(q) ||
      r.caseNumber.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteResident(deleteTarget.id);
      setDeleteTarget(null);
      loadData();
    } catch {
      alert('Failed to delete resident');
    }
  };

  const statuses = [...new Set(residents.map((r) => r.status))].sort();
  const categories = [...new Set(residents.map((r) => r.caseCategory))].sort();

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Caseload Inventory</h2>
          <p className="text-muted mb-0 small">{filtered.length} residents found</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-1" onClick={() => setShowCreateForm(true)}>
          <Plus size={16} /> Add Resident
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar d-flex flex-wrap gap-3 align-items-center">
        <div className="position-relative flex-grow-1" style={{ minWidth: 200 }}>
          <Search size={16} className="position-absolute" style={{ left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--nh-text-muted)' }} />
          <input
            type="text"
            className="form-control form-control-sm ps-4"
            placeholder="Search by name or case #..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="form-select form-select-sm" style={{ width: 'auto' }} value={filterSafehouse} onChange={(e) => setFilterSafehouse(e.target.value)}>
          <option value="">All Safehouses</option>
          {safehouses.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select className="form-select form-select-sm" style={{ width: 'auto' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="form-select form-select-sm" style={{ width: 'auto' }} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: 'var(--nh-primary)' }} />
        </div>
      ) : paginated.length === 0 ? (
        <div className="text-center py-5 text-muted">No residents found matching your criteria.</div>
      ) : (
        <div className="data-table">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Case #</th>
                  <th>Name</th>
                  <th>Safehouse</th>
                  <th>Status</th>
                  <th>Category</th>
                  <th>Intake Date</th>
                  <th><span className="d-flex align-items-center gap-1"><Brain size={12} /> Risk</span></th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((r) => (
                  <tr key={r.id}>
                    <td><code className="small">{r.caseNumber}</code></td>
                    <td>
                      <Link to={`/admin/residents/${r.id}`} className="text-decoration-none fw-semibold" style={{ color: 'var(--nh-primary)' }}>
                        {r.firstName} {r.lastName}
                      </Link>
                    </td>
                    <td className="small">{safehouses.find((s) => s.id === r.safehouseId)?.name || `#${r.safehouseId}`}</td>
                    <td><StatusBadge status={r.status} size="sm" /></td>
                    <td className="small">{r.caseCategory}</td>
                    <td className="small">{new Date(r.intakeDate).toLocaleDateString()}</td>
                    <td>
                      {mlRisks[r.id] ? (
                        <MLInsightBadge
                          label={mlRisks[r.id].risk_level}
                          level={riskLevelColor(mlRisks[r.id].risk_level)}
                          probability={mlRisks[r.id].bad_exit_probability}
                        />
                      ) : r.status === 'Active' ? (
                        <span className="text-muted" style={{ fontSize: '0.7rem' }}>—</span>
                      ) : null}
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Link to={`/admin/residents/${r.id}`} className="btn btn-sm btn-outline-secondary" style={{ fontSize: '0.75rem' }}>View</Link>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          style={{ fontSize: '0.75rem' }}
                          onClick={() => openEditModal(r)}
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          style={{ fontSize: '0.75rem' }}
                          onClick={() => setDeleteTarget(r)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <span className="text-muted small">Page {page} of {totalPages}</span>
          <div className="d-flex gap-1">
            <button className="btn btn-sm btn-outline-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft size={14} />
            </button>
            <button className="btn btn-sm btn-outline-secondary" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {showCreateForm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">Add New Resident</h5>
                <button className="btn-close" onClick={() => setShowCreateForm(false)} />
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setFormSubmitting(true);
                try {
                  await createResident({
                    caseNumber: createForm.caseNumber,
                    firstName: createForm.firstName,
                    lastName: createForm.lastName,
                    dateOfBirth: createForm.dateOfBirth,
                    gender: createForm.gender,
                    safehouseId: Number(createForm.safehouseId),
                    intakeDate: createForm.intakeDate,
                    caseCategory: createForm.caseCategory,
                    referralSource: createForm.referralSource,
                    guardianName: createForm.guardianName || undefined,
                    guardianContact: createForm.guardianContact || undefined,
                    status: createForm.status,
                    notes: createForm.notes || undefined,
                    isActive: createForm.status === 'Active',
                  });
                  setShowCreateForm(false);
                  setCreateForm({ caseNumber: '', firstName: '', lastName: '', dateOfBirth: '', gender: 'Female', safehouseId: '', intakeDate: new Date().toISOString().split('T')[0], caseCategory: '', referralSource: '', guardianName: '', guardianContact: '', status: 'Active', notes: '' });
                  loadData();
                } catch (e) {
                  const msg = e instanceof Error ? e.message : 'Unknown error';
                  alert(`Failed to create resident: ${msg}`);
                } finally {
                  setFormSubmitting(false);
                }
              }}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Case Number *</label>
                      <input type="text" className="form-control form-control-sm" required placeholder="e.g. NH-2026-001"
                        value={createForm.caseNumber} onChange={e => setCreateForm({ ...createForm, caseNumber: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">First Name *</label>
                      <input type="text" className="form-control form-control-sm" required
                        value={createForm.firstName} onChange={e => setCreateForm({ ...createForm, firstName: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Last Name *</label>
                      <input type="text" className="form-control form-control-sm" required
                        value={createForm.lastName} onChange={e => setCreateForm({ ...createForm, lastName: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Date of Birth *</label>
                      <input type="date" className="form-control form-control-sm" required
                        value={createForm.dateOfBirth} onChange={e => setCreateForm({ ...createForm, dateOfBirth: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Gender *</label>
                      <select className="form-select form-select-sm" required value={createForm.gender}
                        onChange={e => setCreateForm({ ...createForm, gender: e.target.value })}>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Safehouse *</label>
                      <select className="form-select form-select-sm" required value={createForm.safehouseId}
                        onChange={e => setCreateForm({ ...createForm, safehouseId: e.target.value })}>
                        <option value="">Select...</option>
                        {safehouses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Intake Date *</label>
                      <input type="date" className="form-control form-control-sm" required
                        value={createForm.intakeDate} onChange={e => setCreateForm({ ...createForm, intakeDate: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Case Category *</label>
                      <select className="form-select form-select-sm" required value={createForm.caseCategory}
                        onChange={e => setCreateForm({ ...createForm, caseCategory: e.target.value })}>
                        <option value="">Select...</option>
                        <option>Trafficked</option>
                        <option>Physical Abuse</option>
                        <option>Neglected</option>
                        <option>Sexual Abuse</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Referral Source *</label>
                      <input type="text" className="form-control form-control-sm" required placeholder="e.g. DSWD, Police"
                        value={createForm.referralSource} onChange={e => setCreateForm({ ...createForm, referralSource: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Guardian Name</label>
                      <input type="text" className="form-control form-control-sm"
                        value={createForm.guardianName} onChange={e => setCreateForm({ ...createForm, guardianName: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Guardian Contact</label>
                      <input type="text" className="form-control form-control-sm"
                        value={createForm.guardianContact} onChange={e => setCreateForm({ ...createForm, guardianContact: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Status</label>
                      <select className="form-select form-select-sm" value={createForm.status}
                        onChange={e => setCreateForm({ ...createForm, status: e.target.value })}>
                        <option>Active</option>
                        <option>Reintegrated</option>
                        <option>Transferred</option>
                        <option>Closed</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Notes</label>
                      <textarea className="form-control form-control-sm" rows={2}
                        value={createForm.notes} onChange={e => setCreateForm({ ...createForm, notes: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowCreateForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={formSubmitting}>
                    {formSubmitting ? 'Creating...' : 'Create Resident'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {editTarget && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">Edit Resident</h5>
                <button className="btn-close" onClick={() => setEditTarget(null)} />
              </div>
              <form onSubmit={handleEdit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Case Number *</label>
                      <input type="text" className="form-control form-control-sm" required
                        value={editForm.caseNumber} onChange={e => setEditForm({ ...editForm, caseNumber: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">First Name *</label>
                      <input type="text" className="form-control form-control-sm" required
                        value={editForm.firstName} onChange={e => setEditForm({ ...editForm, firstName: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Last Name *</label>
                      <input type="text" className="form-control form-control-sm" required
                        value={editForm.lastName} onChange={e => setEditForm({ ...editForm, lastName: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Date of Birth *</label>
                      <input type="date" className="form-control form-control-sm" required
                        value={editForm.dateOfBirth} onChange={e => setEditForm({ ...editForm, dateOfBirth: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Gender *</label>
                      <select className="form-select form-select-sm" required value={editForm.gender}
                        onChange={e => setEditForm({ ...editForm, gender: e.target.value })}>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Safehouse *</label>
                      <select className="form-select form-select-sm" required value={editForm.safehouseId}
                        onChange={e => setEditForm({ ...editForm, safehouseId: e.target.value })}>
                        <option value="">Select...</option>
                        {safehouses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Intake Date *</label>
                      <input type="date" className="form-control form-control-sm" required
                        value={editForm.intakeDate} onChange={e => setEditForm({ ...editForm, intakeDate: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Case Category *</label>
                      <select className="form-select form-select-sm" required value={editForm.caseCategory}
                        onChange={e => setEditForm({ ...editForm, caseCategory: e.target.value })}>
                        <option value="">Select...</option>
                        <option>Trafficked</option>
                        <option>Physical Abuse</option>
                        <option>Neglected</option>
                        <option>Sexual Abuse</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Referral Source *</label>
                      <input type="text" className="form-control form-control-sm" required
                        value={editForm.referralSource} onChange={e => setEditForm({ ...editForm, referralSource: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Status</label>
                      <select className="form-select form-select-sm" value={editForm.status}
                        onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                        <option>Active</option>
                        <option>Reintegrated</option>
                        <option>Transferred</option>
                        <option>Closed</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Reintegration Date</label>
                      <input type="date" className="form-control form-control-sm"
                        value={editForm.reintegrationDate} onChange={e => setEditForm({ ...editForm, reintegrationDate: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Assigned Social Workers</label>
                      <input type="text" className="form-control form-control-sm"
                        value={editForm.assignedSocialWorkers} onChange={e => setEditForm({ ...editForm, assignedSocialWorkers: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Guardian Name</label>
                      <input type="text" className="form-control form-control-sm"
                        value={editForm.guardianName} onChange={e => setEditForm({ ...editForm, guardianName: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Guardian Contact</label>
                      <input type="text" className="form-control form-control-sm"
                        value={editForm.guardianContact} onChange={e => setEditForm({ ...editForm, guardianContact: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Disability Info</label>
                      <input type="text" className="form-control form-control-sm"
                        value={editForm.disabilityInfo} onChange={e => setEditForm({ ...editForm, disabilityInfo: e.target.value })} />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Socio-Demographic Profile</label>
                      <div className="d-flex flex-wrap gap-3">
                        <div className="form-check">
                          <input className="form-check-input" type="checkbox" id="edit-4ps" checked={editForm.is4PsBeneficiary}
                            onChange={e => setEditForm({ ...editForm, is4PsBeneficiary: e.target.checked })} />
                          <label className="form-check-label small" htmlFor="edit-4ps">4Ps Beneficiary</label>
                        </div>
                        <div className="form-check">
                          <input className="form-check-input" type="checkbox" id="edit-solo" checked={editForm.isSoloParentChild}
                            onChange={e => setEditForm({ ...editForm, isSoloParentChild: e.target.checked })} />
                          <label className="form-check-label small" htmlFor="edit-solo">Solo Parent Child</label>
                        </div>
                        <div className="form-check">
                          <input className="form-check-input" type="checkbox" id="edit-indigenous" checked={editForm.isIndigenous}
                            onChange={e => setEditForm({ ...editForm, isIndigenous: e.target.checked })} />
                          <label className="form-check-label small" htmlFor="edit-indigenous">Indigenous</label>
                        </div>
                        <div className="form-check">
                          <input className="form-check-input" type="checkbox" id="edit-informal" checked={editForm.isInformalSettler}
                            onChange={e => setEditForm({ ...editForm, isInformalSettler: e.target.checked })} />
                          <label className="form-check-label small" htmlFor="edit-informal">Informal Settler</label>
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Notes</label>
                      <textarea className="form-control form-control-sm" rows={2}
                        value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setEditTarget(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={editSubmitting}>
                    {editSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete Resident"
          message={`Are you sure you want to delete ${deleteTarget.firstName} ${deleteTarget.lastName}? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
