import { Link } from 'react-router-dom';

function PrivacyPolicy() {
  return (
    <div className="container py-5 public-page">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <p className="section-kicker">Legal</p>
          <h1 className="section-title mb-4">Privacy Policy</h1>
          <p className="text-muted mb-4">
            <strong>Last Updated:</strong> April 6, 2026
          </p>

          {/* Introduction */}
          <section className="section-block">
            <h2>1. Introduction</h2>
            <p>
              <strong>Nhyira Haven</strong> ("we", "our", or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
              when you visit our website or use our services.
            </p>
            <p>
              This policy complies with the <strong>General Data Protection Regulation (GDPR)</strong> 
              and other applicable data protection laws.
            </p>
          </section>

          {/* Data Controller */}
          <section className="section-block">
            <h2>2. Data Controller</h2>
            <p>
              <strong>Data Controller:</strong> Nhyira Haven<br />
              <strong>Contact:</strong> admin@nhyirahaven.org<br />
              <strong>Address:</strong> Lagos, Nigeria
            </p>
            <p>
              For questions about this policy or your personal data, please contact us at 
              <a href="mailto:privacy@nhyirahaven.org"> privacy@nhyirahaven.org</a>.
            </p>
          </section>

          {/* Personal Data Collected */}
          <section className="section-block">
            <h2>3. Personal Data We Collect</h2>
            
            <h5>3.1 Information You Provide</h5>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, role (Admin, Staff, or Donor)</li>
              <li><strong>Case Management Data:</strong> Information about residents, safehouse assignments, and case progress (Staff/Admin only)</li>
              <li><strong>Donor Information:</strong> Donation history, contact preferences, and communication records</li>
              <li><strong>Communication:</strong> Messages, feedback, and support requests</li>
            </ul>

            <h5>3.2 Information Collected Automatically</h5>
            <ul>
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent on site</li>
              <li><strong>Device Information:</strong> Browser type, operating system, device type</li>
              <li><strong>Cookies:</strong> Session tokens, preferences, analytics (see Cookie Policy below)</li>
            </ul>
          </section>

          {/* Legal Basis for Processing */}
          <section className="section-block">
            <h2>4. Legal Basis for Processing (GDPR Article 6)</h2>
            <p>We process your personal data under the following legal bases:</p>
            <ul>
              <li><strong>Consent (Art. 6(1)(a)):</strong> When you opt-in to cookies, newsletters, or marketing communications</li>
              <li><strong>Contract (Art. 6(1)(b)):</strong> To provide services you request (account management, donation processing)</li>
              <li><strong>Legal Obligation (Art. 6(1)(c)):</strong> To comply with applicable laws and regulations</li>
              <li><strong>Vital Interests (Art. 6(1)(d)):</strong> To protect the safety and wellbeing of residents in our care</li>
              <li><strong>Legitimate Interests (Art. 6(1)(f)):</strong> To improve our services, ensure security, and prevent fraud</li>
            </ul>
          </section>

          {/* Purpose of Processing */}
          <section className="section-block">
            <h2>5. How We Use Your Information</h2>
            <ul>
              <li>Provide and manage user accounts and access</li>
              <li>Process and track donations</li>
              <li>Manage resident case records and ensure continuity of care</li>
              <li>Send transactional communications (account updates, donation receipts)</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Improve our website and services</li>
              <li>Ensure platform security and prevent unauthorized access</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* Data Retention */}
          <section className="section-block">
            <h2>6. Data Retention</h2>
            <p>We retain personal data only as long as necessary:</p>
            <ul>
              <li><strong>Account Data:</strong> Duration of account + 7 years for record-keeping</li>
              <li><strong>Donation Records:</strong> 7 years for financial compliance</li>
              <li><strong>Case Records:</strong> Duration of service + 25 years (statutory requirement for child protection records)</li>
              <li><strong>Analytics Data:</strong> 2 years (anonymized)</li>
              <li><strong>Cookies:</strong> Session cookies expire on logout; persistent cookies expire after 1 year</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section className="section-block">
            <h2>7. Your Rights Under GDPR</h2>
            <p>You have the following rights regarding your personal data:</p>
            <ul>
              <li><strong>Right of Access (Art. 15):</strong> Request a copy of your personal data</li>
              <li><strong>Right to Rectification (Art. 16):</strong> Correct inaccurate or incomplete data</li>
              <li><strong>Right to Erasure (Art. 17):</strong> Request deletion of your data ("Right to be Forgotten")</li>
              <li><strong>Right to Restriction (Art. 18):</strong> Limit how we process your data</li>
              <li><strong>Right to Data Portability (Art. 20):</strong> Receive your data in a portable format</li>
              <li><strong>Right to Object (Art. 21):</strong> Object to processing based on legitimate interests</li>
              <li><strong>Right to Withdraw Consent (Art. 7):</strong> Withdraw consent at any time</li>
            </ul>
            <p>
              To exercise these rights, contact us at <a href="mailto:privacy@nhyirahaven.org">privacy@nhyirahaven.org</a>.
              We will respond within 30 days.
            </p>
          </section>

          {/* Data Sharing */}
          <section className="section-block">
            <h2>8. Data Sharing and Disclosure</h2>
            <p>We do not sell your personal data. We may share data with:</p>
            <ul>
              <li><strong>Service Providers:</strong> Cloud hosting, payment processors (under data processing agreements)</li>
              <li><strong>Partner Organizations:</strong> For coordinated care services (with appropriate consent)</li>
              <li><strong>Legal Authorities:</strong> When required by law or to protect safety</li>
            </ul>
          </section>

          {/* International Transfers */}
          <section className="section-block">
            <h2>9. International Data Transfers</h2>
            <p>
              Your data may be transferred and stored on servers located outside your country. 
              We ensure appropriate safeguards are in place, including:
            </p>
            <ul>
              <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
              <li>Data processing agreements with all third-party providers</li>
              <li>Encryption of data in transit and at rest</li>
            </ul>
          </section>

          {/* Security */}
          <section className="section-block">
            <h2>10. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your data:</p>
            <ul>
              <li>HTTPS/TLS encryption for all data transmission</li>
              <li>Password hashing using secure algorithms</li>
              <li>Role-based access control</li>
              <li>Regular security audits</li>
              <li>Multi-factor authentication (MFA) available</li>
            </ul>
          </section>

          {/* Cookies */}
          <section className="section-block">
            <h2>11. Cookie Policy</h2>
            <p>We use cookies and similar technologies to:</p>
            
            <h5>11.1 Essential Cookies (Always Active)</h5>
            <p>These cookies are necessary for the website to function:</p>
            <ul>
              <li><strong>Session Token:</strong> Maintains your login state</li>
              <li><strong>CSRF Token:</strong> Prevents cross-site request forgery attacks</li>
            </ul>

            <h5>11.2 Functional Cookies (Optional)</h5>
            <p>These remember your preferences:</p>
            <ul>
              <li><strong>Theme Preference:</strong> Dark/light mode selection</li>
              <li><strong>Language Preference:</strong> Display language</li>
            </ul>

            <h5>11.3 Analytics Cookies (Optional)</h5>
            <p>These help us understand how the website is used:</p>
            <ul>
              <li><strong>Usage Analytics:</strong> Pages visited, session duration</li>
              <li><strong>Error Tracking:</strong> Helps us fix technical issues</li>
            </ul>

            <p>
              You can manage your cookie preferences at any time using the Cookie Consent banner 
              or by contacting us.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="section-block">
            <h2>12. Children's Privacy</h2>
            <p>
              Our services are designed for staff, administrators, and adult donors. 
              We do not knowingly collect personal data from children under 16. 
              If you believe a child's data has been collected, please contact us immediately.
            </p>
          </section>

          {/* Data Protection Officer */}
          <section className="section-block">
            <h2>13. Data Protection Officer</h2>
            <p>
              For GDPR-related inquiries, you may contact our Data Protection Officer:
            </p>
            <p>
              <strong>Email:</strong> <a href="mailto:dpo@nhyirahaven.org">dpo@nhyirahaven.org</a>
            </p>
          </section>

          {/* Supervisory Authority */}
          <section className="section-block">
            <h2>14. Right to Lodge a Complaint</h2>
            <p>
              You have the right to lodge a complaint with a supervisory authority if you believe 
              your data protection rights have been violated. The relevant authority depends on 
              your location within the EU/EEA.
            </p>
          </section>

          {/* Updates */}
          <section className="section-block">
            <h2>15. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any 
              material changes by posting the new policy on this page and updating the 
              "Last Updated" date.
            </p>
          </section>

          {/* Contact */}
          <section className="section-block">
            <h2>16. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, 
              please contact us:
            </p>
            <ul>
              <li><strong>Email:</strong> <a href="mailto:privacy@nhyirahaven.org">privacy@nhyirahaven.org</a></li>
              <li><strong>Address:</strong> Nhyira Haven, Lagos, Nigeria</li>
            </ul>
          </section>

          <hr className="my-4" />

          <div className="d-flex justify-content-between">
            <Link to="/" className="btn btn-outline-secondary">
              &larr; Back to Home
            </Link>
            <Link to="/login" className="btn btn-primary">
              Continue to Login &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;