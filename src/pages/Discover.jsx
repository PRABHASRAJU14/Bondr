import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { RotateCcw, Sparkles, SlidersHorizontal, UserPlus, UserCheck, Users, Info, Compass } from 'lucide-react';
import { DISCOVER_HOBBY_FILTERS, CONNECTION_GOALS } from '../data/hobbies';
import { normalizeHobbyName } from '../utils/matching';
import { useApp } from '../context/AppContext';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import StudentCard from '../components/StudentCard';

export default function Discover({ onOpenLogin }) {
  const { rankedStudents, currentUser } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialHobby = normalizeHobbyName(searchParams.get('hobby')) || 'All Interests';
  const initialGoal = searchParams.get('goal') || 'All Goals';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHobby, setSelectedHobby] = useState(
    DISCOVER_HOBBY_FILTERS.includes(initialHobby) ? initialHobby : 'All Interests'
  );
  const [selectedGoal, setSelectedGoal] = useState(
    CONNECTION_GOALS.includes(initialGoal) ? initialGoal : 'All Goals'
  );

  // Sync URL query params if navigated from ExploreHobbies or Footer links
  useEffect(() => {
    const paramHobby = normalizeHobbyName(searchParams.get('hobby'));
    const paramGoal = searchParams.get('goal');
    if (paramHobby && DISCOVER_HOBBY_FILTERS.includes(paramHobby)) {
      setSelectedHobby(paramHobby);
    }
    if (paramGoal && CONNECTION_GOALS.includes(paramGoal)) {
      setSelectedGoal(paramGoal);
    }
  }, [searchParams]);

  const handleSelectHobby = (hobby) => {
    setSelectedHobby(hobby);
    const next = new URLSearchParams(searchParams);
    if (hobby === 'All Interests') {
      next.delete('hobby');
    } else {
      next.set('hobby', hobby);
    }
    setSearchParams(next, { replace: true });
  };

  const handleSelectGoal = (goal) => {
    setSelectedGoal(goal);
    const next = new URLSearchParams(searchParams);
    if (goal === 'All Goals') {
      next.delete('goal');
    } else {
      next.set('goal', goal);
    }
    setSearchParams(next, { replace: true });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedHobby('All Interests');
    setSelectedGoal('All Goals');
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedHobby !== 'All Interests' ||
    selectedGoal !== 'All Goals';

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return (rankedStudents || []).filter((student) => {
      if (!student) return false;
      // Hobby filter
      if (selectedHobby !== 'All Interests') {
        const hasHobby = (student.hobbies || []).some(
          (h) => normalizeHobbyName(h).toLowerCase() === selectedHobby.toLowerCase()
        );
        if (!hasHobby) return false;
      }

      // Connection goal filter
      if (selectedGoal !== 'All Goals' && student.goal !== selectedGoal) {
        return false;
      }

      // Search by name, department, or hobby
      if (q) {
        const matchesName = (student.name || '').toLowerCase().includes(q);
        const matchesDept = (student.department || '').toLowerCase().includes(q);
        const matchesHobby = (student.hobbies || []).some((h) => (h || '').toLowerCase().includes(q));
        const matchesGoal = (student.goal || '').toLowerCase().includes(q);
        if (!matchesName && !matchesDept && !matchesHobby && !matchesGoal) {
          return false;
        }
      }

      return true;
    });
  }, [rankedStudents, searchQuery, selectedHobby, selectedGoal]);

  return (
    <div style={{ paddingBottom: 64 }}>
      <section className="page-hero">
        <div
          className="bg-blob"
          style={{ width: 280, height: 280, background: '#B9A3E8', top: -70, right: 40 }}
        />
        <div className="container page-hero-inner">
          <span className="section-eyebrow">
            <Users size={14} /> SRM AP Student Discovery
          </span>
          <h1 className="page-hero-title">Meet Your Kind of People.</h1>
          <p className="page-hero-subtitle">
            Discover fellow SRM University-AP students who share your interests. Profiles are
            automatically ranked by your shared hobbies.
          </p>
        </div>
      </section>

      <div className="container">
        {/* Search & Filter Controls */}
        <div className="discover-controls-card">
          <div className="discover-top-row">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by student name, department (e.g. CSE, BBA), or hobby..."
            />

            <div className="search-bar-field">
              <label htmlFor="goal-filter" className="control-label">
                Connection Goal
              </label>
              <select
                id="goal-filter"
                className="goal-select"
                value={selectedGoal}
                onChange={(e) => handleSelectGoal(e.target.value)}
              >
                {CONNECTION_GOALS.map((goal) => (
                  <option key={goal} value={goal}>
                    {goal}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ minHeight: 48 }}
              onClick={handleResetFilters}
              disabled={!hasActiveFilters}
            >
              <RotateCcw size={16} />
              Reset Filters
            </button>
          </div>

          <FilterBar
            hobbies={DISCOVER_HOBBY_FILTERS}
            selectedHobby={selectedHobby}
            onSelectHobby={handleSelectHobby}
          />
        </div>

        {/* Active User Interests Banner - Only shown after login */}
        {!currentUser.isGuest && currentUser.hobbies && currentUser.hobbies.length > 0 && (
          <div className="my-interests-strip">
            <div className="my-interests-left">
              <span className="my-interests-label">
                <Sparkles size={15} />
                Matching against {currentUser.name ? `${currentUser.name.split(' ')[0]}'s interests` : 'your interests'}:
              </span>
              {currentUser.hobbies.map((hobby) => (
                <span key={hobby} className="interest-chip-mini">
                  {hobby}
                </span>
              ))}
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onOpenLogin}
            >
              <SlidersHorizontal size={14} />
              Customize My Interests
            </button>
          </div>
        )}

        {/* Meta Results Bar */}
        <div className="discover-meta-bar">
          <p className="discover-count">
            {currentUser && !currentUser.isGuest && filteredStudents.length === 0 ? (
              <span>Your profile is <strong>live &amp; active</strong> • Waiting for fellow student matches</span>
            ) : (
              <>
                Showing <strong>{filteredStudents.length}</strong>{' '}
                {filteredStudents.length === 1 ? 'student' : 'students'}
                {selectedHobby !== 'All Interests' ? ` interested in ${selectedHobby}` : ''}
                {selectedGoal !== 'All Goals' ? ` • Goal: ${selectedGoal}` : ''}
              </>
            )}
          </p>

          {currentUser.isGuest ? (
            <Link to="/add-student" className="btn btn-pastel btn-sm">
              <UserPlus size={14} />
              Add Yourself to Discover
            </Link>
          ) : (
            <Link to={`/student/${currentUser.id}`} className="btn btn-pastel btn-sm">
              <UserCheck size={14} />
              View My Profile
            </Link>
          )}
        </div>

        {/* Students Grid */}
        {filteredStudents.length > 0 ? (
          <div className="students-grid">
            {filteredStudents.map((student, idx) => (
              <StudentCard key={student.id} student={student} index={idx} />
            ))}
          </div>
        ) : currentUser && !currentUser.isGuest ? (
          <div className="empty-state" style={{ maxWidth: 640, margin: '0 auto' }}>
            <div
              className="empty-state-icon"
              style={{ background: 'var(--color-lavender-soft)', color: 'var(--color-deep-purple)' }}
            >
              <UserCheck size={28} />
            </div>
            <h3>Your Profile is Live, {currentUser.name ? currentUser.name.split(' ')[0] : 'Student'}!</h3>
            <p>
              Your student profile has been published on Bondr with interests in{' '}
              <strong>{(currentUser.hobbies || []).join(', ')}</strong>.
              As other SRM University-AP students join, they will appear here automatically ranked by your shared hobbies!
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 14 }}>
              <Link to={`/student/${currentUser.id}`} className="btn btn-primary">
                <UserCheck size={16} /> View My Profile
              </Link>
              <Link to="/hobbies" className="btn btn-secondary">
                <Compass size={16} /> Explore Campus Hobbies
              </Link>
              <Link to="/messages" className="btn btn-secondary">
                <Users size={16} /> Campus Chat Circles
              </Link>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Users size={28} />
            </div>
            <h3>{hasActiveFilters ? 'No students match those filters' : 'No student profiles created yet'}</h3>
            <p>
              {hasActiveFilters
                ? 'Try clearing your search query or choosing another hobby filter.'
                : 'Be the first SRM University-AP student to create a profile and discover peers!'}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 12 }}>
              {hasActiveFilters && (
                <button type="button" className="btn btn-secondary" onClick={handleResetFilters}>
                  <RotateCcw size={16} /> Reset Filters
                </button>
              )}
              <Link to="/add-student" className="btn btn-primary">
                <UserPlus size={16} /> Create Student Profile
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
