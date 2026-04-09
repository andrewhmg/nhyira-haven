import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardOverview } from '../services/api';
import type { DashboardOverview } from '../types/api';
import { Shield, BookOpen, HeartHandshake, Users, Building2, TrendingUp } from 'lucide-react';

export default function Landing() {
  const [stats, setStats] = useState<DashboardOverview | null>(null);

  useEffect(() => {
    getDashboardOverview().then(setStats).catch(() => {});
  }, []);

  const pillars = [
    {
      icon: <Shield size={44} strokeWidth={1.25} />,
      title: 'Rescue & Shelter',
      desc: 'Safe, secure housing for survivors. Our safehouses across West Africa provide immediate refuge and stability.',
      color: 'var(--nh-heading)',
      mosaicClass: 'inspo-mosaic__tile--large',
    },
    {
      icon: <BookOpen size={32} strokeWidth={1.25} />,
      title: 'Rehabilitate & Educate',
      desc: 'Counseling, education, and health services tailored to each girl.',
      color: 'var(--nh-primary)',
      mosaicClass: 'inspo-mosaic__tile--a',
    },
    {
      icon: <HeartHandshake size={32} strokeWidth={1.25} />,
      title: 'Reintegrate & Empower',
      desc: 'Skills training and family reintegration for a sustainable future.',
      color: 'var(--nh-secondary-dark)',
      mosaicClass: 'inspo-mosaic__tile--b',
    },
  ];

  const stewardshipItems = [
    { label: 'Counseling & Therapy', pct: 35, icon: <HeartHandshake size={20} />, color: 'var(--nh-heading)' },
    { label: 'Education & Training', pct: 25, icon: <BookOpen size={20} />, color: 'var(--nh-primary)' },
    { label: 'Health Services', pct: 20, icon: <TrendingUp size={20} />, color: 'var(--nh-success)' },
    { label: 'Housing & Operations', pct: 20, icon: <Building2 size={20} />, color: 'var(--nh-accent)' },
  ];

  return (
    <div className="content-stack">
      {/* Hero — split: copy left, large visual right (inspo) */}
      <section className="inspo-hero">
        <div className="container container-inspo">
          <div className="row align-items-center g-4 g-xl-5 py-lg-2">
            <div className="col-lg-6 order-2 order-lg-1 text-lg-start text-center">
              <p className="section-kicker">Nhyira Haven</p>
              <h1 className="inspo-hero-title mb-3">Where Healing Begins</h1>
              <p className="inspo-hero-lead mb-0">
                Providing safehouses and rehabilitation for survivors of trafficking and abuse
                across West Africa. Every girl deserves safety, healing, and a future.
              </p>
              <div className="d-flex flex-wrap gap-3 mt-4 justify-content-lg-start justify-content-center">
                <Link to="/impact" className="btn btn-primary btn-lg px-4">
                  See Our Impact
                </Link>
                <Link to="/login" className="btn btn-outline-primary btn-lg px-4">
                  Get Involved
                </Link>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2">
              <div className="inspo-hero-visual inspo-hero-visual--photo inspo-hero-visual--photo-square">
                <img
                  src="/hero-nhyira-sign.png"
                  alt="Nhyira Haven entrance sign on a warm stucco wall, with bougainvillea and courtyard beyond"
                  className="inspo-hero-visual__img"
                  width={1024}
                  height={1024}
                  loading="eager"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats — slim strip, inspo-style breathing room */}
      <section className="inspo-stats-strip">
        <div className="container container-inspo">
          <div className="row row-cols-2 row-cols-md-4 g-4 align-items-start inspo-stats-row">
            <div className="col">
              <div className="inspo-stat">
                <div className="inspo-stat__value">{stats?.residents.total ?? '—'}</div>
                <div className="inspo-stat__label">Girls served</div>
              </div>
            </div>
            <div className="col">
              <div className="inspo-stat">
                <div className="inspo-stat__value">{stats?.safehouses.total ?? '—'}</div>
                <div className="inspo-stat__label">Safehouses</div>
              </div>
            </div>
            <div className="col">
              <div className="inspo-stat">
                <div className="inspo-stat__value">{stats?.supporters.total ?? '—'}</div>
                <div className="inspo-stat__label">Supporters</div>
              </div>
            </div>
            <div className="col">
              <div className="inspo-stat">
                <div className="inspo-stat__value">
                  ${stats?.donations.totalAmount ? Math.round(stats.donations.totalAmount / 1000) + 'K' : '—'}
                </div>
                <div className="inspo-stat__label">Total raised</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our approach — text left, asymmetric mosaic right (Sobre nosotros style) */}
      <section className="nh-section inspo-section inspo-section--band-warm">
        <div className="container container-inspo">
          <div className="row g-5 g-xl-5 align-items-start">
            <div className="col-lg-5 inspo-copy-col">
              <p className="section-kicker">How we work</p>
              <h2 className="section-title mb-3">Our approach</h2>
              <p className="inspo-section-lead mb-4">
                A comprehensive journey from rescue to reintegration—built around dignity, data, and
                long-term support.
              </p>
              <p className="small text-muted mb-0 d-none d-lg-block lh-lg">
                Each program is designed to meet survivors where they are, with individualized care
                plans and measurable outcomes you can explore in our impact dashboard.
              </p>
            </div>
            <div className="col-lg-7">
              <div className="inspo-mosaic">
                {pillars.map((pillar) => (
                  <div
                    key={pillar.title}
                    className={`inspo-mosaic__tile ${pillar.mosaicClass}`}
                  >
                    <div className="inspo-mosaic__icon" style={{ color: pillar.color }}>
                      {pillar.icon}
                    </div>
                    <h3 className="inspo-mosaic__title">{pillar.title}</h3>
                    <p className="inspo-mosaic__desc mb-0">{pillar.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stewardship — sidebar list + featured panel (Productos-style) */}
      <section className="nh-section inspo-section inspo-section--muted">
        <div className="container container-inspo">
          <div className="row g-4 mb-4 mb-lg-5">
            <div className="col-12">
              <p className="section-kicker">Stewardship</p>
              <h2 className="section-title mb-2">Where your support goes</h2>
              <p className="inspo-section-lead mb-0">
                Every contribution directly supports programs on the ground.
              </p>
            </div>
          </div>
          <div className="row g-4 g-xl-5">
            <div className="col-lg-3">
              <nav className="inspo-side-nav" aria-label="Funding categories">
                <ul className="list-unstyled mb-0">
                  {stewardshipItems.map((item) => (
                    <li key={item.label}>
                      <span className="inspo-side-nav__item">
                        <span
                          className="inspo-side-nav__thumb"
                          style={{ color: item.color, background: `${item.color}18` }}
                        >
                          {item.icon}
                        </span>
                        <span className="inspo-side-nav__label">{item.label}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            <div className="col-lg-9">
              <div className="inspo-feature-panel nh-card p-4 p-md-5">
                <div className="row align-items-center g-4">
                  <div className="col-md-6">
                    <p className="section-kicker mb-2">Breakdown</p>
                    <h3 className="h4 mb-3" style={{ color: 'var(--nh-heading)' }}>
                      Program allocation
                    </h3>
                    <p className="small text-muted mb-0">
                      Percentages reflect how we prioritize counseling, education, health, and
                      operations—reported transparently in our impact tools.
                    </p>
                  </div>
                  <div className="col-md-6">
                    <div className="inspo-bars">
                      {stewardshipItems.map((item) => (
                        <div key={item.label} className="inspo-bars__row">
                          <div className="inspo-bars__meta">
                            <span className="small">{item.label}</span>
                            <span className="small fw-semibold" style={{ color: item.color }}>
                              {item.pct}%
                            </span>
                          </div>
                          <div className="inspo-bars__track">
                            <div
                              className="inspo-bars__fill"
                              style={{ width: `${item.pct}%`, background: item.color }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story — text left, visual right */}
      <section className="nh-section inspo-section inspo-section--band-cool">
        <div className="container container-inspo">
          <div className="row align-items-center g-4 g-xl-5">
            <div className="col-lg-6 order-2 order-lg-1">
              <p className="section-kicker">Story of change</p>
              <h2 className="section-title mb-3">Transforming lives, one girl at a time</h2>
              <p className="inspo-section-lead mb-4">
                Each girl who enters our program receives personalized care spanning counseling,
                education, health services, and family reintegration support. Our data-driven
                approach ensures no one falls through the cracks.
              </p>
              <div className="d-flex flex-wrap gap-4 gap-md-5 mb-4">
                <div>
                  <div className="inspo-inline-stat" style={{ color: 'var(--nh-heading)' }}>
                    {stats?.residents.active ?? '—'}
                  </div>
                  <div className="small text-muted">Active residents</div>
                </div>
                <div>
                  <div className="inspo-inline-stat d-flex align-items-center gap-2" style={{ color: 'var(--nh-primary)' }}>
                    <Users size={22} />
                    {stats?.supporters.total ?? '—'}
                  </div>
                  <div className="small text-muted">Supporters</div>
                </div>
              </div>
              <Link to="/impact" className="btn btn-primary">
                View full impact report
              </Link>
            </div>
            <div className="col-lg-6 order-1 order-lg-2">
              <figure className="inspo-story-figure m-0">
                <div className="inspo-story-visual inspo-story-visual--photo soft-panel">
                  <img
                    src="/hero-courtyard.png"
                    alt="Residents gardening together in a peaceful courtyard at Nhyira Haven"
                    className="inspo-hero-visual__img"
                    width={800}
                    height={600}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <figcaption className="inspo-story-visual__caption mt-3 text-center text-lg-start">
                  <span className="fw-semibold" style={{ color: 'var(--nh-heading)' }}>West Africa</span>
                  <span className="text-muted small d-block mt-1">Nigeria, Ghana &amp; beyond</span>
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* CTA — wide soft panel, left-weighted copy */}
      <section className="public-cta-banner inspo-cta">
        <div className="container container-inspo">
          <div className="row justify-content-center">
            <div className="col-lg-10 col-xl-8 text-center text-lg-start">
              <h2 className="mb-3">Ready to make a difference?</h2>
              <p className="mb-4 mx-auto mx-lg-0" style={{ maxWidth: 520 }}>
                Join our community of supporters. Your time, skills, or financial contribution can
                change a girl&apos;s life forever.
              </p>
              <div className="d-flex flex-wrap gap-3 justify-content-lg-start justify-content-center">
                <Link to="/impact" className="btn btn-primary btn-lg px-4">
                  Learn more
                </Link>
                <Link to="/login" className="btn btn-outline-primary btn-lg px-4">
                  Staff portal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
