import { Link } from 'react-router-dom';
import {
  HeartHandshake,
  Sparkles,
  Target,
  Eye,
  Users,
  Compass,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';

export default function About() {
  return (
    <div>
      <section className="page-hero">
        <div
          className="bg-blob"
          style={{ width: 300, height: 300, background: '#B9A3E8', top: -80, right: 40 }}
        />
        <div className="container page-hero-inner">
          <span className="section-eyebrow">
            <HeartHandshake size={14} /> About Find A Friend – SRM AP
          </span>
          <h1 className="page-hero-title">Friendship Begins With Shared Interests.</h1>
          <p className="page-hero-subtitle">
            Find your people. Share your passions. Build real connections across SRM University-AP
            without awkward icebreakers.
          </p>
        </div>
      </section>

      {/* Problem & Solution */}
      <AnimatedSection className="section" style={{ paddingTop: 44 }}>
        <div className="container">
          <div className="about-story-grid">
            <article className="about-card">
              <span className="about-card-icon" style={{ backgroundColor: 'var(--color-peach-soft)' }}>
                <Users size={24} />
              </span>
              <h3>The Campus Problem</h3>
              <p>
                College students meet hundreds of people across lecture halls, hostels, and clubs—yet
                discovering peers who genuinely share your niche hobbies, creative energy, or study
                rhythm is surprisingly hard. Most student directories only show names and roll numbers,
                not what brings people alive outside class.
              </p>
            </article>

            <article className="about-card">
              <span className="about-card-icon" style={{ backgroundColor: 'var(--color-mint-soft)' }}>
                <Sparkles size={24} />
              </span>
              <h3>Our Solution</h3>
              <p>
                Find A Friend flips the script by putting hobbies, curiosity, and connection goals first.
                Whether you want a 6 AM running buddy, a hackathon frontend partner, or someone to swap
                sci-fi novels with at the SRM AP library, we surface shared interests automatically so
                meaningful conversations start effortlessly.
              </p>
            </article>
          </div>
        </div>
      </AnimatedSection>

      {/* Mission & Vision */}
      <AnimatedSection className="section" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Purpose &amp; Direction</span>
            <h2 className="section-title">Our Mission &amp; Vision</h2>
          </div>

          <div className="about-story-grid" style={{ marginTop: 0 }}>
            <article className="about-card">
              <span className="about-card-icon" style={{ backgroundColor: 'var(--color-lavender-soft)' }}>
                <Target size={24} />
              </span>
              <h3>Our Mission</h3>
              <p>
                To make SRM University-AP feel warmer, smaller, and easier to navigate socially by helping
                every student—from first-year newcomers to final-year innovators—discover authentic
                friendships rooted in shared passions.
              </p>
            </article>

            <article className="about-card">
              <span className="about-card-icon" style={{ backgroundColor: 'var(--color-butter-soft)' }}>
                <Eye size={24} />
              </span>
              <h3>Our Vision</h3>
              <p>
                A vibrant campus culture where cross-department collaboration thrives, creative hobby
                tribes form organically, and no student ever feels out of place looking for their kind
                of people.
              </p>
            </article>
          </div>
        </div>
      </AnimatedSection>

      {/* How It Works & Why It Is Different */}
      <AnimatedSection className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Why Find A Friend Is Different</span>
            <h2 className="section-title">Designed for real friendships, not endless scrolling</h2>
            <p className="section-subtitle">
              Every detail of the experience is crafted around shared interests and intentional campus connections.
            </p>
          </div>

          <div className="different-grid">
            <article className="different-card">
              <span className="about-card-icon" style={{ backgroundColor: 'var(--color-lavender-soft)' }}>
                <Sparkles size={22} />
              </span>
              <h4>Dynamic Overlap Scoring</h4>
              <p>
                Instead of static lists, our matching engine computes your exact shared interests with
                every student and prioritizes your closest matches first.
              </p>
            </article>

            <article className="different-card">
              <span className="about-card-icon" style={{ backgroundColor: 'var(--color-mint-soft)' }}>
                <Compass size={22} />
              </span>
              <h4>Intentional Connection Goals</h4>
              <p>
                Filter effortlessly by Study Partner, Project Partner, Friendship, or Social Hangout so
                expectations are clear from day one.
              </p>
            </article>

            <article className="different-card">
              <span className="about-card-icon" style={{ backgroundColor: 'var(--color-pink-soft)' }}>
                <ShieldCheck size={22} />
              </span>
              <h4>Cross-Department Discovery</h4>
              <p>
                Break out of your own classroom bubble—a CSE coder can easily discover a Design painter or
                Economics film buff who shares the exact same passion.
              </p>
            </article>
          </div>

          <div className="section-cta-center" style={{ gap: 12 }}>
            <Link to="/discover" className="btn btn-primary btn-lg">
              Explore Discover Feed <ArrowRight size={18} />
            </Link>
            <Link to="/hobbies" className="btn btn-secondary btn-lg">
              Browse 15 Hobbies
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
