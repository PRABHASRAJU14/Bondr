import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Info } from 'lucide-react';
import { HOBBIES } from '../data/hobbies';
import { useApp } from '../context/AppContext';
import { normalizeHobbyName } from '../utils/matching';
import HobbyCard from '../components/HobbyCard';
import SearchBar from '../components/SearchBar';
import AnimatedSection from '../components/AnimatedSection';

export default function ExploreHobbies() {
  const { students } = useApp();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const hobbyCounts = useMemo(() => {
    const counts = {};
    for (const hobby of HOBBIES) {
      counts[hobby.name] = 0;
    }
    for (const student of (students || [])) {
      if (!student) continue;
      for (const rawHobby of (student.hobbies || [])) {
        const normalized = normalizeHobbyName(rawHobby);
        if (counts[normalized] !== undefined) {
          counts[normalized] += 1;
        }
      }
    }
    return counts;
  }, [students]);

  const filteredHobbies = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return HOBBIES;
    return HOBBIES.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.shortDesc.toLowerCase().includes(q)
    );
  }, [query]);

  const handleSelectHobby = (hobbyName) => {
    navigate(`/discover?hobby=${encodeURIComponent(hobbyName)}`);
  };

  return (
    <div>
      <section className="page-hero">
        <div
          className="bg-blob"
          style={{ width: 260, height: 260, background: '#A8DDC8', top: -60, right: 60 }}
        />
        <div className="container page-hero-inner">
          <span className="section-eyebrow">
            <Sparkles size={14} /> 15 Campus Interest Categories
          </span>
          <h1 className="page-hero-title">Explore Hobbies &amp; Passions</h1>
          <p className="page-hero-subtitle">
            Pick a hobby you love—or want to try this semester—to immediately discover SRM University-AP
            students who share that interest.
          </p>
        </div>
      </section>

      <AnimatedSection className="section" style={{ paddingTop: 40 }}>
        <div className="container">
          <div className="hobbies-toolbar">
            <div className="hobbies-search-wrap">
              <SearchBar
                id="hobbies-search"
                label="Find a hobby category"
                value={query}
                onChange={setQuery}
                placeholder="Search hobbies like photography, coding, fitness..."
              />
            </div>
            <p className="discover-count">
              Showing <strong>{filteredHobbies.length}</strong> of {HOBBIES.length} hobbies
            </p>
          </div>

          {filteredHobbies.length > 0 ? (
            <div className="hobbies-grid">
              {filteredHobbies.map((hobby, idx) => (
                <HobbyCard
                  key={hobby.id}
                  hobby={hobby}
                  studentCount={hobbyCounts[hobby.name] || 0}
                  onSelect={handleSelectHobby}
                  index={idx}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Sparkles size={28} />
              </div>
              <h3>No matching hobbies</h3>
              <p>Try searching another keyword or reset to browse all 15 hobby categories.</p>
              <button type="button" className="btn btn-primary" onClick={() => setQuery('')}>
                Show All Hobbies
              </button>
            </div>
          )}
        </div>
      </AnimatedSection>
    </div>
  );
}
