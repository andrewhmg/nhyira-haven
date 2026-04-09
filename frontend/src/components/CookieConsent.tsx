import { useState, useEffect } from 'react';

interface CookiePreferences {
  essential: boolean; // Always true
  functional: boolean;
  analytics: boolean;
}

const defaultPreferences: CookiePreferences = {
  essential: true,
  functional: false,
  analytics: false,
};

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    } else {
      // Load saved preferences
      try {
        const saved = JSON.parse(consent);
        setPreferences(saved);
      } catch {
        // Invalid JSON, show banner
        setShowBanner(true);
      }
    }
  }, []);

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      functional: true,
      analytics: true,
    };
    savePreferences(allAccepted);
    setShowBanner(false);
  };

  const acceptSelected = () => {
    savePreferences(preferences);
    setShowBanner(false);
  };

  const rejectAll = () => {
    // Essential cookies cannot be rejected
    const onlyEssential: CookiePreferences = {
      essential: true,
      functional: false,
      analytics: false,
    };
    savePreferences(onlyEssential);
    setShowBanner(false);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookieConsent', JSON.stringify(prefs));
    setPreferences(prefs);
  };

  if (!showBanner) return null;

  return (
    <div
      className="cookie-consent-bar position-fixed bottom-0 start-0 end-0 p-3"
      style={{ zIndex: 1050 }}
    >
      <div className="container">
        {!showDetails ? (
          // Simplified Banner
          <div className="row align-items-center">
            <div className="col-lg-7 mb-2 mb-lg-0">
              <p className="mb-0 small">
                <strong style={{ color: 'var(--nh-heading)' }}>Cookie notice</strong>
                {' — '}
                We use cookies to enhance your experience. Essential cookies are required for the site to function.
                <button
                  type="button"
                  className="btn btn-link p-0 ms-2"
                  style={{ color: 'var(--nh-primary)' }}
                  onClick={() => setShowDetails(true)}
                >
                  Customize settings
                </button>
              </p>
            </div>
            <div className="col-lg-5 text-lg-end">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm me-2"
                onClick={rejectAll}
              >
                Essential Only
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={acceptAll}
              >
                Accept All Cookies
              </button>
            </div>
          </div>
        ) : (
          // Detailed Settings
          <div>
            <h5 className="mb-3" style={{ color: 'var(--nh-heading)' }}>Cookie Preferences</h5>
            <p className="text-muted small mb-3">
              Choose which cookies you want to accept. Essential cookies are always active 
              and required for the site to function properly.
            </p>

            <div className="row mb-3">
              {/* Essential Cookies */}
              <div className="col-md-4 mb-2">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="cookies-essential"
                    checked={true}
                    disabled
                  />
                  <label className="form-check-label" htmlFor="cookies-essential">
                    <strong>Essential Cookies</strong>
                    <br />
                    <small className="text-muted">
                      Required for login, security, and basic functionality
                    </small>
                  </label>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="col-md-4 mb-2">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="cookies-functional"
                    checked={preferences.functional}
                    onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                  />
                  <label className="form-check-label" htmlFor="cookies-functional">
                    <strong>Functional Cookies</strong>
                    <br />
                    <small className="text-muted">
                      Remember your preferences (theme, language)
                    </small>
                  </label>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="col-md-4 mb-2">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="cookies-analytics"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                  />
                  <label className="form-check-label" htmlFor="cookies-analytics">
                    <strong>Analytics Cookies</strong>
                    <br />
                    <small className="text-muted">
                      Help us understand how the site is used
                    </small>
                  </label>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center">
              <button
                type="button"
                className="btn btn-link p-0"
                style={{ color: 'var(--nh-primary)' }}
                onClick={() => setShowDetails(false)}
              >
                ← Back to summary
              </button>
              <div>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm me-2"
                  onClick={rejectAll}
                >
                  Reject All
                </button>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={acceptSelected}
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper hook to check if specific cookie category is allowed
export function useCookieConsent() {
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (consent) {
      try {
        const saved = JSON.parse(consent);
        setPreferences(saved);
      } catch {
        // Use defaults
      }
    }
  }, []);

  return {
    essential: preferences.essential, // Always true
    functional: preferences.functional,
    analytics: preferences.analytics,
    hasConsent: !!localStorage.getItem('cookieConsent'),
  };
}