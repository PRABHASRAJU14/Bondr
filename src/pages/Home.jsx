import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Compass,
  Sparkles,
  Users,
  HeartHandshake,
  ShieldCheck,
  Search,
  UserPlus,
  UserCheck,
} from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';
import StudentCard from '../components/StudentCard';
import { useApp } from '../context/AppContext';
import heroStudentsImg from '../assets/images/hero-students.jpg';
import heroIllustration from '../assets/images/hero-illustration.svg';
import hobbyPhotography from '../assets/images/hobby-photography.svg';
import hobbyCoding from '../assets/images/hobby-coding.svg';
import hobbyMusic from '../assets/images/hobby-music.svg';
import hobbyReading from '../assets/images/hobby-reading.svg';

const FEATURED_HOBBY_VISUALS = [
  {
    name: 'Photography',
    desc: 'Golden-hour photowalks and visual stories around campus.',
    image: hobbyPhotography,
  },
  {
    name: 'Coding',
    desc: 'Hackathon squads, open-source builds, and pair debugging.',
    image: hobbyCoding,
  },
  {
    name: 'Music',
    desc: 'Acoustic jam evenings, playlists, and indie collabs.',
    image: hobbyMusic,
  },
  {
    name: 'Reading',
    desc: 'Book swaps, sci-fi circles, and library reading buddies.',
    image: hobbyReading,
  },
];

export default function Home() {
  const { rankedStudents, currentUser } = useApp();
  const navigate = useNavigate();

  const topMatches = rankedStudents.slice(0, 3);

  return (
    <div>
      {/* HERO SECTION */}
      <section className="hero-section">
        <div
          className="bg-blob"
          style={{ width: 340, height: 340, background: '#B9A3E8', top: -80, left: -100 }}
        />
        <div
          className="bg-blob"
          style={{ width: 300, height: 300, background: '#A8DDC8', bottom: -60, right: -80 }}
        />

        <div className="container hero-grid">
          <motion.div
            className="hero-copy"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="hero-pill">
              <span className="hero-pill-dot" />
              SRM University-AP • Find A Friend
            </span>

            <h1 className="hero-title">
              Your Next Great{' '}
              <span className="hero-title-accent">Friendship</span>{' '}
              Starts Here.
            </h1>

            <p className="hero-subtitle">
              Discover people who share your interests, passions and personality.
              Make meaningful connections at SRM University-AP.
            </p>

            <div className="hero-cta-row">
              <Link to="/discover" className="btn btn-primary btn-lg">
                Discover Friends
                <ArrowRight size={18} />
              </Link>
              <Link to="/hobbies" className="btn btn-secondary btn-lg">
                <Compass size={18} />
                Explore Hobbies
              </Link>
            </div>

            <div className="hero-highlights-strip">
              <div className="hero-highlight-pill">
                <span className="highlight-pill-icon">
                  <ShieldCheck size={18} />
                </span>
                <div className="highlight-pill-text">
                  <strong>Verified SRM AP Students</strong>
                  <span>Authentic @srmap.edu.in network</span>
                </div>
              </div>

              <div className="hero-highlight-pill">
                <span className="highlight-pill-icon">
                  <Sparkles size={18} />
                </span>
                <div className="highlight-pill-text">
                  <strong>Mutual Hobby Synergy</strong>
                  <span>Coding, Photography, Arts & Jamming</span>
                </div>
              </div>

              <div className="hero-highlight-pill">
                <span className="highlight-pill-icon">
                  <Users size={18} />
                </span>
                <div className="highlight-pill-text">
                  <strong>Campus Squads & Circles</strong>
                  <span>Hostels, hackathons & study partners</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Hero Visual Collage + Floating Profile Cards */}
          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="hero-photo-frame">
              <img
                src={heroStudentsImg}
                alt="SRM University-AP students collaborating on hobbies and projects"
              />
              <div className="hero-photo-overlay">
                <p>“Find your people. Share your passions. Build real connections.”</p>
              </div>
            </div>

            {/* Feature Floating Badge Top */}
            <motion.div
              className="floating-card floating-card-top"
              animate={{ y: [0, -9, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div
                className="floating-avatar"
                style={{
                  background: 'linear-gradient(135deg, #30245F 0%, #4E3C8E 100%)',
                  color: '#FFFFFF',
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 14,
                }}
              >
                <Sparkles size={20} />
              </div>
              <div className="floating-card-info">
                <strong>Shared Interests</strong>
                <span>Match with campus peers</span>
                <div className="floating-mini-tags">
                  <span className="floating-mini-tag">Photography</span>
                  <span className="floating-mini-tag">Coding</span>
                  <span className="floating-mini-tag">Music</span>
                </div>
              </div>
            </motion.div>

            {/* Smart Match Center Pill */}
            <motion.div
              className="floating-card floating-card-badge"
              animate={{ y: [0, 7, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            >
              <Sparkles size={18} color="#30245F" />
              <div className="floating-card-info">
                <strong>Smart Match</strong>
                <span>Ranked by hobbies</span>
              </div>
            </motion.div>

            {/* Feature Floating Badge Bottom */}
            <motion.div
              className="floating-card floating-card-bottom"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            >
              <div
                className="floating-avatar"
                style={{
                  background: 'linear-gradient(135deg, #6350A5 0%, #7B68BA 100%)',
                  color: '#FFFFFF',
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 14,
                }}
              >
                <Users size={20} />
              </div>
              <div className="floating-card-info">
                <strong>Campus Circles</strong>
                <span>Study, Projects &amp; Friendship</span>
                <div className="floating-mini-tags">
                  <span className="floating-mini-tag">Friendship</span>
                  <span className="floating-mini-tag">Projects</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ANIMATED FRIENDSHIP ILLUSTRATION & WHY HOBBIES MATTER */}
      <AnimatedSection className="section illustration-band">
        <div className="container illustration-split">
          <motion.div
            className="illustration-frame"
            whileHover={{ y: -4 }}
            transition={{ duration: 0.25 }}
          >
            <img
              src={heroIllustration}
              alt="Illustration of two students connecting through shared hobbies like photography, music, and coding"
            />
          </motion.div>

          <div>
            <span className="section-eyebrow">
              <HeartHandshake size={14} /> Why Bondr
            </span>
            <h2 className="section-title">
              Skip the awkward small talk. Start with what you both love.
            </h2>
            <p className="section-subtitle">
              Whether you are hunting for a weekend photowalk companion, a hackathon teammate,
              or a quiet library study partner at SRM AP, shared hobbies turn strangers into friends naturally.
            </p>

            <div className="feature-list">
              <div className="feature-item">
                <span className="feature-icon-box" style={{ backgroundColor: 'var(--color-lavender-soft)' }}>
                  <Sparkles size={20} />
                </span>
                <div>
                  <h4>Dynamic Shared-Interest Matching</h4>
                  <p>Profiles automatically calculate how many hobbies you share and rank your best matches first.</p>
                </div>
              </div>

              <div className="feature-item">
                <span className="feature-icon-box" style={{ backgroundColor: 'var(--color-mint-soft)' }}>
                  <Users size={20} />
                </span>
                <div>
                  <h4>Clear Connection Goals</h4>
                  <p>Know upfront whether someone is looking for a Study Partner, Project Partner, Friendship, or Social Hangout.</p>
                </div>
              </div>

              <div className="feature-item">
                <span className="feature-icon-box" style={{ backgroundColor: 'var(--color-peach-soft)' }}>
                  <ShieldCheck size={20} />
                </span>
                <div>
                  <h4>Instant Profile Creation</h4>
                  <p>Add your own student profile in seconds and immediately see your campus compatibility update.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* FEATURED HOBBIES */}
      <AnimatedSection className="section" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Explore Passions</span>
            <h2 className="section-title">Popular hobby communities at SRM AP</h2>
            <p className="section-subtitle">
              Click any hobby to jump straight to students who share that passion.
            </p>
          </div>

          <div className="home-hobby-preview-grid">
            {FEATURED_HOBBY_VISUALS.map((item) => (
              <motion.button
                key={item.name}
                type="button"
                className="hobby-visual-card"
                onClick={() => navigate(`/discover?hobby=${encodeURIComponent(item.name)}`)}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.99 }}
                style={{ textAlign: 'left' }}
              >
                <img src={item.image} alt={item.name} className="hobby-visual-thumb" />
                <h4>{item.name}</h4>
                <p>{item.desc}</p>
              </motion.button>
            ))}
          </div>

          <div className="section-cta-center">
            <Link to="/hobbies" className="btn btn-secondary">
              Explore All 15 Hobbies <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </AnimatedSection>

      {/* TOP MATCHED SAMPLE PROFILES */}
      <AnimatedSection className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Student Spotlight</span>
            <h2 className="section-title">Top matches for your interests</h2>
            <p className="section-subtitle">
              SRM AP student peers ranked dynamically by shared hobbies with your active profile.
            </p>
          </div>

          {topMatches.length > 0 ? (
            <div className="home-students-grid">
              {topMatches.map((student, idx) => (
                <StudentCard key={student.id} student={student} index={idx} />
              ))}
            </div>
          ) : currentUser && !currentUser.isGuest ? (
            <div className="empty-state" style={{ maxWidth: 520, margin: '0 auto 36px', textAlign: 'center' }}>
              <div
                className="empty-state-icon"
                style={{ background: 'var(--color-lavender-soft)', color: 'var(--color-deep-purple)' }}
              >
                <UserCheck size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '8px 0' }}>
                Your Profile is Live, {currentUser.name ? currentUser.name.split(' ')[0] : 'Student'}!
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: 16 }}>
                Your SRM AP profile is active with interests in {(currentUser.hobbies || []).slice(0, 3).join(', ')}.
                As fellow classmates join, your best matches will appear right here!
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to={`/student/${currentUser.id}`} className="btn btn-primary">
                  <UserCheck size={16} /> View My Profile
                </Link>
                <Link to="/hobbies" className="btn btn-secondary">
                  <Compass size={16} /> Explore Hobbies
                </Link>
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ maxWidth: 520, margin: '0 auto 36px', textAlign: 'center' }}>
              <div className="empty-state-icon">
                <Users size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '8px 0' }}>Join the SRM AP Student Network</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: 16 }}>
                Create your student profile or sign in to connect with fellow classmates who share your hobbies and goals.
              </p>
              <Link to="/add-student" className="btn btn-primary">
                <UserPlus size={16} /> Create Your Student Profile
              </Link>
            </div>
          )}

          <div className="section-cta-center" style={{ gap: 12 }}>
            <Link to="/discover" className="btn btn-primary">
              <Search size={16} />
              Browse All Students
            </Link>
            {currentUser.isGuest ? (
              <Link to="/add-student" className="btn btn-pastel">
                <UserPlus size={16} />
                Add Your Profile
              </Link>
            ) : (
              <Link to={`/student/${currentUser.id}`} className="btn btn-pastel">
                <UserCheck size={16} />
                My Profile
              </Link>
            )}
          </div>
        </div>
      </AnimatedSection>

      {/* BOTTOM CTA BANNER */}
      <AnimatedSection className="section" style={{ paddingTop: 20 }}>
        <div className="container">
          <div className="cta-banner">
            <div className="cta-banner-content">
              <span className="section-eyebrow" style={{ backgroundColor: '#ffffff' }}>
                Ready to connect?
              </span>
              <h2>Find your people. Share your passions. Build real connections.</h2>
              <p>
                Join fellow SRM University-AP students discovering study partners, project teammates,
                and lifelong friends through what excites them most.
              </p>
              <div className="cta-banner-actions">
                <Link to="/discover" className="btn btn-primary btn-lg">
                  Start Discovering
                  <ArrowRight size={18} />
                </Link>
                {currentUser.isGuest ? (
                  <Link to="/add-student" className="btn btn-secondary btn-lg">
                    Create Your Profile
                  </Link>
                ) : (
                  <Link to={`/student/${currentUser.id}`} className="btn btn-secondary btn-lg">
                    View &amp; Edit My Profile
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
