import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronRight, FileHeart,
  FileText, Globe2, HeartPulse, LockKeyhole, MessageCircle, Search,
  ShieldCheck, Sparkles, Upload, X,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import './Home.css';

const features = [
  { icon: Upload, tone: 'mint', title: 'A simpler way to upload', copy: 'Keep prescriptions, lab results and reports together in one private place.', detail: 'PDF · JPG · PNG' },
  { icon: FileHeart, tone: 'blue', title: 'Your health, in context', copy: 'Find the right record by date, doctor or document type when you need it.', detail: 'One organized timeline' },
  { icon: MessageCircle, tone: 'lavender', title: 'Answers with a source', copy: 'A planned assistant experience designed to point back to the page behind each answer.', detail: 'Planned capability' },
  { icon: Globe2, tone: 'peach', title: 'Made for how you speak', copy: 'A future assistant is being designed for English, Hindi and Bengali questions.', detail: 'Language support planned' },
];

function Home() {
  const [sourceOpen, setSourceOpen] = useState(false);

  return (
    <div className="mt-home">
      <Navbar />
      <main>
        <section className="mt-hero" id="home">
          <div className="mt-hero-photo" role="img" aria-label="Doctor discussing a care plan with a patient" />
          <div className="mt-hero-shade" />
          <div className="mt-hero-content">
            <span className="mt-eyebrow mt-eyebrow-light"><span className="mt-live-dot" /> A calmer way to manage your health records</span>
            <h1>Your medical records,<br />finally made <em>simple.</em></h1>
            <p>Bring prescriptions, reports and the questions that come with them into one thoughtful, private workspace.</p>
            <div className="mt-hero-actions">
              <Link className="mt-button mt-button-light" to="/signup">Get started free <ArrowRight size={17} /></Link>
              <a className="mt-text-link light" href="#how-it-works">See how it works <ArrowDown size={16} /></a>
            </div>
            <div className="mt-hero-note"><ShieldCheck size={16} /> Your records stay in your account</div>
          </div>
          <div className="mt-hero-card" aria-hidden="true">
              <div className="mt-card-head"><span className="mt-card-file"><FileText size={18} /></span><span><b>Care, in one place</b><small>Your personal health library</small></span><span className="mt-card-dots">•••</span></div>
            <div className="mt-mini-doc"><div className="mt-mini-doc-top"><span>SAMPLE VISIT SUMMARY</span><span>EXAMPLE</span></div><strong>Sample clinician</strong><span>Visit notes · Follow-up</span><div className="mt-doc-lines"><i /><i /><i /></div><div className="mt-mini-tag"><Check size={12} /> Example record preview</div></div>
            <div className="mt-card-foot"><span className="mt-avatar-stack"><i>M</i><i>+</i></span><span>A sample view of your library</span><ArrowUpRight size={16} /></div>
          </div>
          <div className="mt-hero-index">01 <span /> 03</div>
        </section>

        <section className="mt-intro mt-section" id="about">
          <div className="mt-intro-visual">
            <div className="mt-intro-window">
              <div className="mt-window-bar"><span /><span /><span /><b>Sample workspace</b><Search size={15} /></div>
              <div className="mt-window-body"><div className="mt-window-greeting">Your records <span>↗</span></div><p>Example layout · fictional documents.</p><div className="mt-window-stats"><div><strong>Care</strong><small>Visits</small></div><div><strong>Rx</strong><small>Prescriptions</small></div><div><strong>Labs</strong><small>Reports</small></div></div><div className="mt-window-row"><span className="mt-file-icon"><FileText size={17} /></span><span><b>Sample check-up</b><small>Example lab report</small></span><ChevronRight size={17} /></div><div className="mt-window-row"><span className="mt-file-icon teal"><FileHeart size={17} /></span><span><b>Sample prescription</b><small>Example visit record</small></span><ChevronRight size={17} /></div></div>
            </div>
            <div className="mt-float-stamp"><HeartPulse size={19} /><span>Small steps.<br /><b>More peace of mind.</b></span></div>
          </div>
          <div className="mt-intro-copy"><span className="mt-eyebrow">A little more clarity</span><h2>Your complete medical history.<br /><em>Beautifully organized.</em></h2><p>Health details are easier to manage when they’re all together. MediTrack gives your important documents a home, so you can spend less time searching and more time feeling prepared.</p><ul className="mt-check-list"><li><Check size={16} /> Keep the original document close</li><li><Check size={16} /> Browse records in a clear timeline</li><li><Check size={16} /> Access your files from your account</li></ul><Link className="mt-text-link" to="/signup">Make room for your records <ArrowRight size={16} /></Link></div>
        </section>

        <section className="mt-features mt-section" id="features">
          <div className="mt-section-heading"><div><span className="mt-eyebrow">Designed around real life</span><h2>Good care starts with<br /><em>feeling organized.</em></h2></div><p>One considered space for the documents you collect and the details you want to remember.</p></div>
          <div className="mt-feature-grid">{features.map(({ icon: Icon, tone, title, copy, detail }, index) => <article className={`mt-feature-card ${tone}`} key={title}><div className="mt-feature-top"><span className="mt-feature-icon"><Icon size={20} /></span><span className="mt-feature-number">0{index + 1}</span></div><h3>{title}</h3><p>{copy}</p><div className="mt-feature-bottom"><span>{detail}</span><ArrowUpRight size={16} /></div></article>)}</div>
        </section>

        <section className="mt-demo-section mt-section" id="assistant">
          <div className="mt-demo-copy"><span className="mt-eyebrow">Meet your document assistant</span><h2>Make sense of a page.<br /><em>Keep the source in sight.</em></h2><p>See how a question about a sample record could work. The example below uses fictional information and is a product preview, not a live AI response.</p><Link className="mt-button mt-button-primary" to="/signup">Bring your records <ArrowRight size={17} /></Link><div className="mt-demo-disclaimer"><LockKeyhole size={15} /> This preview contains synthetic data only.</div></div>
          <div className="mt-demo-app">
            <div className="mt-demo-app-top"><span className="mt-demo-brand"><span className="mt-brand-mark"><HeartPulse size={15} /></span> MediTrack <i>AI preview</i></span><span className="mt-demo-status"><span /> Sample workspace</span></div>
            <div className="mt-demo-body"><div className="mt-sample-document"><div className="mt-sample-label"><FileText size={13} /> SAMPLE PRESCRIPTION <span>SYNTHETIC</span></div><div className="mt-sample-paper"><div className="mt-paper-head"><b>Riverbend Family Clinic</b><small>Care with clarity</small></div><div className="mt-paper-rule" /><div className="mt-paper-meta"><span>Patient <b>Alex Morgan</b></span><span>Date <b>12 Jun 2025</b></span></div><div className="mt-rx">℞</div><div className="mt-med-row"><b>Medicine A</b><span>As written by clinician</span></div><div className="mt-med-row"><b>Medicine B</b><span>See original instructions</span></div><div className="mt-paper-note">Follow-up as discussed during your visit.</div><div className="mt-paper-sign">Dr. Sample Provider</div></div><button className="mt-source-button" type="button" onClick={() => setSourceOpen(true)}><FileText size={14} /> Open sample source · Page 1 <ArrowUpRight size={14} /></button></div>
              <div className="mt-sample-chat"><div className="mt-chat-heading"><span className="mt-chat-avatar"><Sparkles size={16} /></span><span><b>Ask about this document</b><small>Scope · Sample prescription</small></span><span className="mt-online-indicator" /></div><div className="mt-chat-message user"><span>What medicines are mentioned?</span></div><div className="mt-chat-answer"><div className="mt-answer-top"><Sparkles size={15} /><span>Sample response</span></div><p>The synthetic document lists <b>Medicine A</b> and <b>Medicine B</b>. The preview does not include dosage details, so I can’t infer them.</p><button className="mt-citation" onClick={() => setSourceOpen(true)} type="button"><FileText size={13} /> Sample prescription <span>Page 1</span><ArrowUpRight size={13} /></button></div><div className="mt-chat-composer"><span>Ask a question about this sample…</span><span className="mt-send-icon"><ArrowRight size={15} /></span></div></div></div>
            <div className="mt-demo-bottom"><span><span className="mt-demo-dot" /> A concept preview with fictional records</span><span>Not medical advice</span></div>
          </div>
        </section>

        <section className="mt-steps mt-section" id="how-it-works"><div className="mt-steps-heading"><span className="mt-eyebrow">Three gentle steps</span><h2>From paper pile to<br /><em>peace of mind.</em></h2></div><div className="mt-step-grid"><article><span>01</span><div className="mt-step-icon"><Upload size={21} /></div><h3>Add your records</h3><p>Upload a prescription, test result or report to your personal library.</p></article><article><span>02</span><div className="mt-step-icon"><FileText size={21} /></div><h3>Keep things in order</h3><p>Give each document a name and find it again from your account.</p></article><article><span>03</span><div className="mt-step-icon"><MessageCircle size={21} /></div><h3>Explore with care</h3><p>Preview how a future source-linked assistant could work.</p></article></div></section>

        <section className="mt-trust-band"><div className="mt-trust-icon"><ShieldCheck size={23} /></div><div><span className="mt-eyebrow">Trust is part of the design</span><h2>Your records are personal.<br /><em>Your choices should be, too.</em></h2></div><p>MediTrack helps you organize your records in your account. AI document understanding is a planned capability; no AI processing is represented as active in this preview. The assistant is educational and does not diagnose or recommend treatment.</p><Link className="mt-text-link" to="/about">Learn about MediTrack <ArrowRight size={16} /></Link></section>

        <section className="mt-final-cta"><div className="mt-cta-orb orb-one" /><div className="mt-cta-orb orb-two" /><span className="mt-eyebrow mt-eyebrow-light">A clearer place for what matters</span><h2>Your health history<br />deserves a <em>smarter home.</em></h2><p>Start building a little more order into your health journey.</p><Link className="mt-button mt-button-light" to="/signup">Start with MediTrack <ArrowRight size={17} /></Link><span className="mt-cta-foot"><LockKeyhole size={14} /> Create your personal account</span></section>
      </main>
      <footer className="mt-footer"><Link to="/" className="mt-footer-brand"><span className="mt-brand-mark"><HeartPulse size={17} /></span> MediTrack</Link><p>Keep your health records close.</p><nav><a href="#features">Features</a><a href="#about">About</a><Link to="/about">Privacy & terms</Link><a href="mailto:support@meditrack.app">Contact</a></nav><span>© {new Date().getFullYear()} MediTrack. Personal health records, made simpler.</span></footer>
      {sourceOpen && <div className="mt-source-modal" role="dialog" aria-modal="true" aria-labelledby="source-title"><div className="mt-source-dialog"><div className="mt-source-dialog-head"><span><FileText size={17} /> Synthetic source document</span><button type="button" aria-label="Close source" onClick={() => setSourceOpen(false)}><X size={19} /></button></div><div className="mt-source-modal-paper"><span className="mt-paper-badge">FICTIONAL SAMPLE · PAGE 1</span><h3 id="source-title">Riverbend Family Clinic</h3><p>Patient: Alex Morgan · Date: 12 Jun 2025</p><hr /><h4>Prescription</h4><p>Medicine A</p><small>Instructions are intentionally omitted from this demo.</small><p>Medicine B</p><small>Instructions are intentionally omitted from this demo.</small><hr /><p>Follow-up as discussed during your visit.</p><div className="mt-paper-sign">Dr. Sample Provider</div></div><p className="mt-modal-note">This source is synthetic and demonstrates citation navigation only.</p></div><button className="mt-modal-backdrop" type="button" aria-label="Close dialog" onClick={() => setSourceOpen(false)} /></div>}
    </div>
  );
}

export default Home;
