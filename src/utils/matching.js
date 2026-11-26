/**
 * Calculates shared interests between the active user profile and a candidate student.
 * Handles minor synonym normalization (e.g., "Dance" <-> "Dancing") seamlessly.
 */
export function normalizeHobbyName(hobby) {
  if (!hobby) return '';
  const trimmed = hobby.trim();
  if (trimmed.toLowerCase() === 'dance') return 'Dancing';
  return trimmed;
}

export function getSharedInterests(userHobbies = [], studentHobbies = []) {
  const safeUserHobbies = Array.isArray(userHobbies) ? userHobbies : [];
  const safeStudentHobbies = Array.isArray(studentHobbies) ? studentHobbies : [];
  const userSet = new Set(safeUserHobbies.map((h) => normalizeHobbyName(h).toLowerCase()));
  const shared = [];

  for (const hobby of safeStudentHobbies) {
    const normalized = normalizeHobbyName(hobby);
    if (userSet.has(normalized.toLowerCase()) && !shared.includes(normalized)) {
      shared.push(normalized);
    }
  }

  return shared;
}

/**
 * Enriches student records with dynamic shared interests and sorts by highest overlap first.
 */
export function rankStudentsBySharedInterests(students = [], activeUserHobbies = []) {
  if (!Array.isArray(students)) return [];
  return students
    .map((student) => {
      if (!student) return null;
      const sharedInterests = getSharedInterests(activeUserHobbies, student.hobbies || []);
      return {
        ...student,
        sharedInterests,
        sharedCount: sharedInterests.length,
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (b.sharedCount !== a.sharedCount) {
        return b.sharedCount - a.sharedCount;
      }
      return (a.name || '').localeCompare(b.name || '');
    });
}
