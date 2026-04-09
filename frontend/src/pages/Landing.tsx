import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardOverview } from '../services/api';
import type { DashboardOverview } from '../types/api';
import { Shield, BookOpen, HeartHandshake, Users, Building2, TrendingUp, Globe } from 'lucide-react';

export default function Landing() {
  const [stats, setStats] = useState<DashboardOverview | null>(null);

  useEffect(() => {
    getDashboardOverview().then(setStats).catch(() => {});
  }, []);

  return (
    <div className="content-stack">
      {/* Hero */}
      <section className="hero-section">
        <div className="container">
          <p className="section-kicker text-white-50">Nhyira Haven</p>
          <h1 className="section-title">Where Healing Begins</h1>
          <p className="type-body-md">
            Providing safehouses and rehabilitation for survivors of trafficking and abuse
            across West Africa. Every girl deserves safety, healing, and a future.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/impact" className="btn btn-light btn-lg px-4 fw-semibold" style={{ color: 'var(--nh-primary)' }}>
              See Our Impact
            </Link>
            <Link to="/login" className="btn btn-outline-light btn-lg px-4">
              Get Involved
            </Link>
          </div>
        </div>
      </section>

      {/* Impact Counters */}
      <section className="counter-bar">
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-6 col-md-3">
              <div className="counter-item">
                <div className="counter-value">{stats?.residents.total ?? '—'}</div>
                <div className="counter-label">Girls Served</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="counter-item">
                <div className="counter-value">{stats?.safehouses.total ?? '—'}</div>
                <div className="counter-label">Safehouses</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="counter-item">
                <div className="counter-value">{stats?.supporters.total ?? '—'}</div>
                <div className="counter-label">Supporters</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="counter-item">
                <div className="counter-value">
                  ${stats?.donations.totalAmount ? Math.round(stats.donations.totalAmount / 1000) + 'K' : '—'}
                </div>
                <div className="counter-label">Total Raised</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Pillars */}
      <section className="nh-section">
        <div className="container">
          <div className="page-section-header text-center">
            <p className="section-kicker">How We Work</p>
            <h2 className="section-title">Our Approach</h2>
            <p className="section-subtitle">A comprehensive journey from rescue to reintegration.</p>
          </div>
          <div className="row g-4 g-lg-5">
            {[
              {
                icon: <Shield size={40} />,
                title: 'Rescue & Shelter',
                desc: 'Safe, secure housing for survivors of trafficking and abuse. Our safehouses across West Africa provide immediate refuge and stability.',
                color: 'var(--nh-danger)',
              },
              {
                icon: <BookOpen size={40} />,
                title: 'Rehabilitate & Educate',
                desc: 'Counseling, education, health services, and intervention plans tailored to each girl\'s needs. Holistic healing for mind, body, and spirit.',
                color: 'var(--nh-secondary)',
              },
              {
                icon: <HeartHandshake size={40} />,
                title: 'Reintegrate & Empower',
                desc: 'Preparing each girl for independent life through skills training, family reunification, and ongoing support for a sustainable future.',
                color: 'var(--nh-success)',
              },
            ].map((pillar) => (
              <div key={pillar.title} className="col-md-4">
                <div className="nh-card p-4 text-center h-100 soft-panel">
                  <div className="mb-3" style={{ color: pillar.color }}>{pillar.icon}</div>
                  <h5 className="fw-bold mb-2">{pillar.title}</h5>
                  <p className="text-muted small mb-0 mx-auto" style={{ maxWidth: 320 }}>{pillar.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Where Your Support Goes */}
      <section className="nh-section" style={{ background: 'var(--nh-bg-white)' }}>
        <div className="container">
          <div className="page-section-header text-center">
            <p className="section-kicker">Stewardship</p>
            <h2 className="section-title">Where Your Support Goes</h2>
            <p className="section-subtitle">Every contribution directly supports our mission</p>
          </div>
          <div className="row g-4 justify-content-center">
            {[
              { label: 'Counseling & Therapy', pct: 35, icon: <HeartHandshake size={24} />, color: 'var(--nh-secondary)' },
              { label: 'Education & Training', pct: 25, icon: <BookOpen size={24} />, color: 'var(--nh-primary)' },
              { label: 'Health Services', pct: 20, icon: <TrendingUp size={24} />, color: 'var(--nh-success)' },
              { label: 'Housing & Operations', pct: 20, icon: <Building2 size={24} />, color: 'var(--nh-accent)' },
            ].map((item) => (
              <div key={item.label} className="col-6 col-md-3">
                <div className="text-center nh-card soft-panel p-3 h-100">
                  <div
                    className="mx-auto d-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{ width: 72, height: 72, background: `${item.color}15`, color: item.color }}
                  >
                    {item.icon}
                  </div>
                  <h3 className="mb-1" style={{ color: item.color }}>{item.pct}%</h3>
                  <p className="text-muted small">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact story */}
      <section className="nh-section">
        <div className="container">
          <div className="row align-items-center g-4 g-lg-5">
            <div className="col-md-6">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center soft-panel"
                style={{
                  background: 'linear-gradient(135deg, var(--nh-primary) 0%, var(--nh-secondary) 100%)',
                  height: 320,
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                <div className="text-center">
                  <Globe size={64} />
                  <p className="mt-3 text-white fw-semibold">West Africa</p>
                  <p className="small">Nigeria, Ghana & beyond</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <p className="section-kicker">Story of Change</p>
              <h2 className="section-title">Transforming Lives, One Girl at a Time</h2>
              <p className="text-muted mb-4 type-body-md">
                Each girl who enters our program receives personalized care spanning counseling,
                education, health services, and family reintegration support. Our data-driven
                approach ensures no one falls through the cracks.
              </p>
              <div className="d-flex gap-4 mb-4">
                <div>
                  <div className="fw-bold fs-4" style={{ color: 'var(--nh-primary)' }}>
                    {stats?.residents.active ?? '—'}
                  </div>
                  <div className="text-muted small">Active residents</div>
                </div>
                <div>
                  <div className="fw-bold fs-4" style={{ color: 'var(--nh-secondary)' }}>
                    <Users size={20} /> {stats?.supporters.total ?? '—'}
                  </div>
                  <div className="text-muted small">Supporters</div>
                </div>
              </div>
              <Link to="/impact" className="btn btn-primary">
                View Full Impact Report
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--nh-text)', color: '#fff', padding: '4rem 0' }}>
        <div className="container text-center">
          <h2 style={{ color: '#fff', fontFamily: 'var(--nh-font-heading)' }}>
            Ready to Make a Difference?
          </h2>
          <p className="mb-4" style={{ opacity: 0.7, maxWidth: 500, margin: '0 auto' }}>
            Join our community of supporters. Your time, skills, or financial contribution
            can change a girl's life forever.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/impact" className="btn btn-primary btn-lg px-4">
              Learn More
            </Link>
            <Link to="/login" className="btn btn-outline-light btn-lg px-4">
              Staff Portal
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
