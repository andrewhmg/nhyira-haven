import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, ShieldOff, Copy, Check } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export default function MfaSetup() {
  const { token } = useAuth();
  const [mfaEnabled, setMfaEnabled] = useState<boolean | null>(null);
  const [setupData, setSetupData] = useState<{ sharedKey: string; qrCodeUri: string } | null>(null);
  const [code, setCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  async function fetchStatus() {
    try {
      const res = await fetch(`${API_BASE}/auth/mfa/status`, { headers: authHeaders });
      const data = await res.json();
      setMfaEnabled(data.enabled);
    } catch {
      setError('Failed to check MFA status.');
    }
  }

  async function startSetup() {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/mfa/setup`, {
        method: 'POST',
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.success) {
        setSetupData({ sharedKey: data.sharedKey, qrCodeUri: data.qrCodeUri });
      } else {
        setError(data.message);
      }
    } catch {
      setError('Failed to start MFA setup.');
    }
    setLoading(false);
  }

  async function verifySetup() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/mfa/verify-setup`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.success) {
        setMfaEnabled(true);
        setSetupData(null);
        setCode('');
        setRecoveryCodes(data.errors ? [...data.errors] : null);
        setSuccess('MFA enabled successfully!');
      } else {
        setError(data.message);
      }
    } catch {
      setError('Verification failed.');
    }
    setLoading(false);
  }

  async function disableMfa() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/mfa/disable`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ code: disableCode }),
      });
      const data = await res.json();
      if (data.success) {
        setMfaEnabled(false);
        setDisableCode('');
        setRecoveryCodes(null);
        setSuccess('MFA has been disabled.');
      } else {
        setError(data.message);
      }
    } catch {
      setError('Failed to disable MFA.');
    }
    setLoading(false);
  }

  function copyKey() {
    if (setupData?.sharedKey) {
      navigator.clipboard.writeText(setupData.sharedKey.replace(/ /g, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (mfaEnabled === null) {
    return <div className="text-center py-5"><span className="spinner-border" /></div>;
  }

  return (
    <div style={{ maxWidth: 520 }} className="mx-auto">
      <h2 className="h4 fw-bold mb-1">Multi-Factor Authentication</h2>
      <p className="text-muted small mb-4">Add an extra layer of security to your account</p>

      {error && <div className="alert alert-danger py-2 small">{error}</div>}
      {success && <div className="alert alert-success py-2 small">{success}</div>}

      {/* Recovery codes shown after enabling */}
      {recoveryCodes && (
        <div className="alert alert-warning">
          <strong>Save your recovery codes!</strong>
          <p className="small mb-2">These can be used if you lose access to your authenticator app. Each code can only be used once.</p>
          <div className="bg-white rounded p-2 font-monospace small">
            {recoveryCodes.map((c, i) => <div key={i}>{c}</div>)}
          </div>
          <button
            className="btn btn-sm btn-outline-secondary mt-2"
            onClick={() => {
              navigator.clipboard.writeText(recoveryCodes.join('\n'));
            }}
          >
            Copy codes
          </button>
        </div>
      )}

      {/* MFA is currently enabled */}
      {mfaEnabled && !setupData && (
        <div className="nh-card p-4">
          <div className="d-flex align-items-center mb-3">
            <ShieldCheck size={24} className="text-success me-2" />
            <span className="fw-semibold">MFA is enabled</span>
          </div>
          <p className="small text-muted mb-3">
            To disable MFA, enter a code from your authenticator app.
          </p>
          <div className="input-group mb-3" style={{ maxWidth: 260 }}>
            <input
              type="text"
              className="form-control"
              placeholder="6-digit code"
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              inputMode="numeric"
            />
            <button
              className="btn btn-outline-danger"
              onClick={disableMfa}
              disabled={loading || disableCode.length !== 6}
            >
              {loading ? <span className="spinner-border spinner-border-sm" /> : <><ShieldOff size={16} className="me-1" /> Disable</>}
            </button>
          </div>
        </div>
      )}

      {/* MFA not enabled -- show enable button or setup flow */}
      {!mfaEnabled && !setupData && (
        <div className="nh-card p-4 text-center">
          <ShieldOff size={40} className="text-muted mb-3" />
          <p className="mb-3">MFA is not enabled on your account.</p>
          <button className="btn btn-primary" onClick={startSetup} disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <ShieldCheck size={16} className="me-1" />}
            Enable MFA
          </button>
        </div>
      )}

      {/* Setup flow -- QR code + verification */}
      {setupData && (
        <div className="nh-card p-4">
          <h5 className="fw-semibold mb-3">1. Scan QR Code</h5>
          <p className="small text-muted mb-3">
            Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
          </p>
          <div className="text-center mb-3">
            <div className="bg-white d-inline-block p-3 rounded border">
              <QRCodeSVG value={setupData.qrCodeUri} size={200} />
            </div>
          </div>
          <p className="small text-muted mb-1">Or enter this key manually:</p>
          <div className="d-flex align-items-center gap-2 mb-4">
            <code className="bg-light px-2 py-1 rounded small">{setupData.sharedKey}</code>
            <button className="btn btn-sm btn-outline-secondary" onClick={copyKey}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>

          <h5 className="fw-semibold mb-3">2. Verify Code</h5>
          <p className="small text-muted mb-2">Enter the 6-digit code from your authenticator app to confirm setup.</p>
          <div className="input-group mb-3" style={{ maxWidth: 260 }}>
            <input
              type="text"
              className="form-control text-center fs-5"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              inputMode="numeric"
              autoComplete="one-time-code"
            />
            <button
              className="btn btn-primary"
              onClick={verifySetup}
              disabled={loading || code.length !== 6}
            >
              {loading ? <span className="spinner-border spinner-border-sm" /> : 'Verify'}
            </button>
          </div>
          <button
            className="btn btn-link btn-sm text-muted p-0"
            onClick={() => { setSetupData(null); setCode(''); setError(''); }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
