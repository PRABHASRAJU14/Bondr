import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Check,
  UserPlus,
  AlertCircle,
  Sparkles,
  UploadCloud,
  Eye,
  EyeOff,
  Lock,
  Save,
  UserCheck,
} from 'lucide-react';
import { HOBBIES, DEPARTMENTS, ACADEMIC_YEARS, CONNECTION_GOALS } from '../data/hobbies';
import { useApp } from '../context/AppContext';
import StudentCard from '../components/StudentCard';
import { getSharedInterests } from '../utils/matching';

const GOAL_CHOICES = CONNECTION_GOALS.filter((g) => g !== 'All Goals');

export default function AddStudent() {
  const { addStudent, updateUserProfile, currentUser } = useApp();
  const navigate = useNavigate();
  const formRef = useRef(null);
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isEditingSelf = currentUser && !currentUser.isGuest;

  const [formData, setFormData] = useState(() => {
    if (currentUser && !currentUser.isGuest) {
      return {
        name: currentUser.name || '',
        department: currentUser.department || 'Computer Science & Engineering',
        year: currentUser.year || '2nd Year',
        rollNumber: currentUser.rollNumber || '',
        password: currentUser.password || '',
        hostel: currentUser.hostel || 'Ganga Hostel',
        image: currentUser.image || '',
        bio: currentUser.bio || currentUser.aboutMe || '',
        hobbies: Array.isArray(currentUser.hobbies) && currentUser.hobbies.length > 0 ? currentUser.hobbies : ['Photography', 'Coding'],
        goal: currentUser.goal || 'Friendship',
        favouriteActivitiesText: (currentUser.favouriteActivities || []).join(', '),
      };
    }
    return {
      name: '',
      department: '',
      year: '',
      rollNumber: '',
      password: '',
      hostel: 'Ganga Hostel',
      image: '',
      bio: '',
      hobbies: [],
      goal: 'Friendship',
      favouriteActivitiesText: '',
    };
  });
  const [setAsActive, setSetAsActive] = useState(true);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = (data) => {
    const nextErrors = {};
    if (!data.name.trim() || data.name.trim().length < 2) {
      nextErrors.name = 'Please enter your full name (at least 2 characters).';
    }
    if (!data.department) {
      nextErrors.department = 'Please select your SRM AP department.';
    }
    if (!data.year) {
      nextErrors.year = 'Please select your academic year.';
    }
    if (!isEditingSelf && (!data.password || data.password.trim().length < 4)) {
      nextErrors.password = 'Please create an account password (at least 4 characters).';
    }
    if (data.image && data.image.trim()) {
      if (!/^(https?:\/\/|\/|data:image\/)/i.test(data.image.trim())) {
        nextErrors.image = 'Enter a valid image format or upload a photo.';
      }
    }
    // Bio is optional
    // Hobbies
    if (data.hobbies.length < 1) {
      nextErrors.hobbies = 'Select at least 1 hobby to match with other students.';
    }
    if (!data.goal) {
      nextErrors.goal = 'Please select your primary connection goal.';
    }
    // Favourite activities is optional
    return nextErrors;
  };

  const handleFieldChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    if (errors[field]) {
      const nextErrors = validate(updated);
      setErrors((prev) => ({ ...prev, [field]: nextErrors[field] }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const nextErrors = validate(formData);
    setErrors((prev) => ({ ...prev, [field]: nextErrors[field] }));
  };

  const toggleHobby = (hobbyName) => {
    const exists = formData.hobbies.includes(hobbyName);
    const nextHobbies = exists
      ? formData.hobbies.filter((h) => h !== hobbyName)
      : [...formData.hobbies, hobbyName];
    handleFieldChange('hobbies', nextHobbies);
    setTouched((prev) => ({ ...prev, hobbies: true }));
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPEG, PNG, or WEBP).');
      return;
    }
    if (file.size > 2.5 * 1024 * 1024) {
      toast.error('Image size must be under 2.5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      handleFieldChange('image', e.target.result);
      toast.success('Profile photo uploaded and previewed!');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    setErrors(validationErrors);
    setTouched({
      name: true,
      department: true,
      year: true,
      password: true,
      image: true,
      bio: true,
      hobbies: true,
      goal: true,
      favouriteActivitiesText: true,
    });

    if (Object.keys(validationErrors).length > 0) {
      toast.error('Please complete all highlighted fields before submitting.');
      const firstInvalidKey = Object.keys(validationErrors)[0];
      const targetEl = formRef.current?.querySelector(`[name="${firstInvalidKey}"]`);
      if (targetEl) targetEl.focus();
      return;
    }

    const parsedActivities = formData.favouriteActivitiesText
      .split(/,|\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (isEditingSelf) {
      updateUserProfile({
        name: formData.name.trim(),
        department: formData.department,
        year: formData.year,
        rollNumber: formData.rollNumber.trim() || currentUser.rollNumber,
        password: formData.password.trim() || currentUser.password,
        hostel: formData.hostel || currentUser.hostel,
        image: formData.image.trim(),
        bio: formData.bio.trim(),
        aboutMe: formData.bio.trim(),
        hobbies: formData.hobbies,
        goal: formData.goal,
        favouriteActivities:
          parsedActivities.length > 0
            ? parsedActivities
            : ['Meeting students with similar hobbies'],
      });

      toast.success('Your student profile was updated successfully!');
      navigate(`/student/${currentUser.id}`);
      return;
    }

    const created = addStudent(
      {
        name: formData.name.trim(),
        department: formData.department,
        year: formData.year,
        rollNumber: formData.rollNumber.trim() || 'AP24110010099',
        password: formData.password.trim(),
        hostel: formData.hostel || 'Ganga Hostel',
        image: formData.image.trim(),
        bio: formData.bio.trim(),
        aboutMe: formData.bio.trim(),
        hobbies: formData.hobbies,
        goal: formData.goal,
        favouriteActivities:
          parsedActivities.length > 0
            ? parsedActivities
            : ['Meeting students with similar hobbies'],
      },
      setAsActive
    );

    toast.success(`Welcome to Bondr, ${created.name}! Your profile is live.`);
    navigate('/discover');
  };

  const previewHobbies = formData.hobbies.length > 0 ? formData.hobbies : ['Photography', 'Coding'];
  const previewStudent = {
    id: 'preview-student',
    name: formData.name.trim() || 'Your Name Here',
    department: formData.department || 'Computer Science & Engineering',
    year: formData.year || '2nd Year',
    image: formData.image.trim(),
    bio:
      formData.bio.trim() ||
      'Your short bio will appear here so SRM AP peers can quickly see what excites you.',
    hobbies: previewHobbies,
    goal: formData.goal || 'Friendship',
    sharedInterests: previewHobbies,
    sharedCount: previewHobbies.length,
    isPreview: true,
    isSample: false,
  };

  return (
    <div>
      <section className="page-hero">
        <div
          className="bg-blob"
          style={{ width: 280, height: 280, background: '#FFC5A8', top: -70, right: 60 }}
        />
        <div className="container page-hero-inner">
          <span className="section-eyebrow">
            {isEditingSelf ? <UserCheck size={14} /> : <UserPlus size={14} />}
            {isEditingSelf ? 'Active SRM AP Session' : 'Join the Campus Community'}
          </span>
          <h1 className="page-hero-title">
            {isEditingSelf ? 'Edit Your Student Profile' : 'Create Your Student Profile'}
          </h1>
          <p className="page-hero-subtitle">
            {isEditingSelf
              ? 'Update your hobbies, goals, or bio. Your changes update your live profile on Discover immediately.'
              : 'Share your hobbies and what kind of campus connections you are looking for. Your profile is saved locally and appears immediately on Discover.'}
          </p>
        </div>
      </section>

      <div className="container form-page-grid">
        <form ref={formRef} className="form-card" onSubmit={handleSubmit} noValidate>
          {isEditingSelf && (
            <div
              style={{
                background: 'var(--color-lavender-soft)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 16,
                padding: '14px 18px',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.74rem',
                    color: 'var(--color-deep-purple)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  Active Profile • {currentUser.rollNumber || 'SRM AP'}
                </span>
                <h3 style={{ margin: '2px 0', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                  {currentUser.name}
                </h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  You are editing your existing student profile on Bondr.
                </p>
              </div>
              <Link to={`/student/${currentUser.id}`} className="btn btn-secondary btn-sm">
                <Eye size={14} /> View Live Profile
              </Link>
            </div>
          )}
          <h2 className="form-section-title">
            {isEditingSelf ? 'Profile Information' : 'Student Details'}
          </h2>
          <p className="form-section-desc">
            Fields marked with <span className="required-star">*</span> are required.
          </p>

          <div className="form-field">
            <label htmlFor="full-name" className="form-label">
              Full Name <span className="required-star">*</span>
            </label>
            <input
              id="full-name"
              name="name"
              type="text"
              className={`form-input ${touched.name && errors.name ? 'has-error' : ''}`}
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              placeholder="e.g. Priya Sharma"
              required
            />
            {touched.name && errors.name && (
              <span className="field-error-text">
                <AlertCircle size={14} /> {errors.name}
              </span>
            )}
          </div>

          <div className="form-grid-2">
            <div className="form-field">
              <label htmlFor="department" className="form-label">
                Department <span className="required-star">*</span>
              </label>
              <select
                id="department"
                name="department"
                className={`form-select ${touched.department && errors.department ? 'has-error' : ''}`}
                value={formData.department}
                onChange={(e) => handleFieldChange('department', e.target.value)}
                onBlur={() => handleBlur('department')}
                required
              >
                <option value="">Select department...</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              {touched.department && errors.department && (
                <span className="field-error-text">
                  <AlertCircle size={14} /> {errors.department}
                </span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="year" className="form-label">
                Academic Year <span className="required-star">*</span>
              </label>
              <select
                id="year"
                name="year"
                className={`form-select ${touched.year && errors.year ? 'has-error' : ''}`}
                value={formData.year}
                onChange={(e) => handleFieldChange('year', e.target.value)}
                onBlur={() => handleBlur('year')}
                required
              >
                <option value="">Select year...</option>
                {ACADEMIC_YEARS.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
              {touched.year && errors.year && (
                <span className="field-error-text">
                  <AlertCircle size={14} /> {errors.year}
                </span>
              )}
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-field">
              <label htmlFor="rollNumber" className="form-label">
                Student ID / Roll Number
              </label>
              <input
                id="rollNumber"
                name="rollNumber"
                type="text"
                className="form-input"
                value={formData.rollNumber || ''}
                onChange={(e) => handleFieldChange('rollNumber', e.target.value)}
                placeholder="e.g. AP23110010045"
              />
            </div>
            <div className="form-field">
              <label htmlFor="hostel" className="form-label">
                Campus Residence / Hostel
              </label>
              <select
                id="hostel"
                name="hostel"
                className="form-select"
                value={formData.hostel || 'Ganga Hostel'}
                onChange={(e) => handleFieldChange('hostel', e.target.value)}
              >
                <option value="Ganga Hostel">Ganga Hostel (Girls)</option>
                <option value="Yamuna Hostel">Yamuna Hostel (Girls)</option>
                <option value="Narmada Hostel">Narmada Hostel (Boys)</option>
                <option value="Brahmaputra Hostel">Brahmaputra Hostel (Boys)</option>
                <option value="Godavari Hostel">Godavari Hostel (Boys)</option>
                <option value="Day Scholar">Day Scholar (Local / Commuter)</option>
              </select>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="account-password" className="form-label">
              Account Password <span className="required-star">*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="account-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${touched.password && errors.password ? 'has-error' : ''}`}
                value={formData.password}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                placeholder="Create a password (min. 4 characters) to secure your account..."
                style={{ paddingRight: 42 }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                title={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {touched.password && errors.password ? (
              <span className="field-error-text">
                <AlertCircle size={14} /> {errors.password}
              </span>
            ) : (
              <span className="form-hint">
                You will use this password to sign back into your Bondr profile.
              </span>
            )}
          </div>

          <div className="form-field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>
                Profile Photo <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500 }}>(Optional)</span>
              </label>
              {formData.image && (
                <button
                  type="button"
                  className="btn btn-secondary btn-xs"
                  onClick={() => handleFieldChange('image', '')}
                  style={{ fontSize: '0.75rem', padding: '3px 10px' }}
                >
                  Remove Photo
                </button>
              )}
            </div>
            <span className="form-hint">
              Upload a picture if you wish. If no photo is uploaded, your name's initial letter will be displayed automatically.
            </span>

            {/* Native Drag and Drop Image Upload */}
            <div
              className={`file-dropzone ${dragActive ? 'drag-active' : ''} ${formData.image ? 'has-uploaded-image' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files?.[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              {formData.image ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
                  <img
                    src={formData.image}
                    alt="Uploaded preview"
                    style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-deep-purple)' }}
                  />
                  <div style={{ textAlign: 'left' }}>
                    <span style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Photo Selected
                    </span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 600 }}>
                      Click to choose another photo or remove above
                    </span>
                  </div>
                </div>
              ) : (
                <div className="file-dropzone-content">
                  <span className="file-dropzone-icon">
                    <UploadCloud size={22} />
                  </span>
                  <span className="file-dropzone-text">Click to upload photo or drag &amp; drop</span>
                  <span className="file-dropzone-hint">PNG, JPG, or WEBP up to 2.5MB (Optional)</span>
                </div>
              )}
            </div>

            {touched.image && errors.image && (
              <span className="field-error-text">
                <AlertCircle size={14} /> {errors.image}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="bio" className="form-label">
              Short Bio <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
            </label>
            <textarea
              id="bio"
              name="bio"
              className="form-textarea"
              value={formData.bio}
              onChange={(e) => handleFieldChange('bio', e.target.value)}
              onBlur={() => handleBlur('bio')}
              placeholder="Tell fellow SRM AP students about your passions, personality, or what you are excited to do this semester..."
            />
          </div>

          <div className="form-field">
            <span className="form-label">
              Select Hobbies <span className="required-star">*</span>
            </span>
            <span className="form-hint">Pick one or more hobbies you love sharing.</span>
            <div className="hobby-selector-grid" role="group" aria-label="Select your hobbies">
              {HOBBIES.map((hobby) => {
                const selected = formData.hobbies.includes(hobby.name);
                return (
                  <button
                    key={hobby.id}
                    type="button"
                    className={`hobby-choice-chip ${selected ? 'selected' : ''}`}
                    aria-pressed={selected}
                    onClick={() => toggleHobby(hobby.name)}
                  >
                    {selected && <Check size={13} />}
                    {hobby.name}
                  </button>
                );
              })}
            </div>
            {touched.hobbies && errors.hobbies && (
              <span className="field-error-text">
                <AlertCircle size={14} /> {errors.hobbies}
              </span>
            )}
          </div>

          <div className="form-field">
            <span className="form-label">
              Connection Goal <span className="required-star">*</span>
            </span>
            <div className="goal-radio-grid">
              {GOAL_CHOICES.map((goal) => (
                <label key={goal} className="goal-radio-card">
                  <input
                    type="radio"
                    name="goal"
                    value={goal}
                    checked={formData.goal === goal}
                    onChange={(e) => handleFieldChange('goal', e.target.value)}
                  />
                  <span>{goal}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="favourite-activities" className="form-label">
              Favourite Activities <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
            </label>
            <span className="form-hint">Separate multiple activities with commas (e.g. Evening badminton, Hackathon sprints, Cafe sketching).</span>
            <input
              id="favourite-activities"
              name="favouriteActivitiesText"
              type="text"
              className="form-input"
              value={formData.favouriteActivitiesText}
              onChange={(e) => handleFieldChange('favouriteActivitiesText', e.target.value)}
              onBlur={() => handleBlur('favouriteActivitiesText')}
              placeholder="Sunrise photowalks, Indie music jams, Co-op coding..."
            />
          </div>

          {!isEditingSelf && (
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={setAsActive}
                onChange={(e) => setSetAsActive(e.target.checked)}
              />
              <span>
                Sign me in with this profile automatically so Discover ranks students by my hobbies
              </span>
            </label>
          )}

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
            {isEditingSelf ? <Save size={18} /> : <Sparkles size={18} />}
            {isEditingSelf ? 'Save Profile Changes' : 'Publish Student Profile'}
          </button>
        </form>

        {/* Live Card Preview */}
        <aside className="form-preview-sticky" aria-label="Live profile card preview">
          <span className="preview-label">Live Card Preview</span>
          <StudentCard student={previewStudent} disableMotion />
        </aside>
      </div>
    </div>
  );
}
