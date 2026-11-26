export const HOBBIES = [
  {
    id: 'photography',
    name: 'Photography',
    shortDesc: 'Golden hour campus walks, street frames, portrait sessions, and visual storytelling.',
    icon: 'Camera',
    accent: '#FFC5A8',
    bgTint: '#FFF0E8',
    imageKey: 'photography',
  },
  {
    id: 'coding',
    name: 'Coding',
    shortDesc: 'Hackathons, open-source builds, competitive programming, and late-night debugging.',
    icon: 'Code2',
    accent: '#B9A3E8',
    bgTint: '#EFEAF9',
    imageKey: 'coding',
  },
  {
    id: 'music',
    name: 'Music',
    shortDesc: 'Acoustic jam circles, indie playlists, vocals, production, and campus gigs.',
    icon: 'Music',
    accent: '#A8DDC8',
    bgTint: '#E8F7F1',
    imageKey: 'music',
  },
  {
    id: 'dancing',
    name: 'Dancing',
    shortDesc: 'Contemporary, hip-hop, classical fusion, and choreographing fest performances.',
    icon: 'Sparkles',
    accent: '#F6D5E5',
    bgTint: '#FCF0F6',
  },
  {
    id: 'reading',
    name: 'Reading',
    shortDesc: 'Fiction book swaps, sci-fi marathons, biographies, and quiet library discussions.',
    icon: 'BookOpen',
    accent: '#F9DFA0',
    bgTint: '#FEF7E4',
    imageKey: 'reading',
  },
  {
    id: 'painting',
    name: 'Painting',
    shortDesc: 'Watercolors, canvas sketching, gouache journaling, and weekend art meetups.',
    icon: 'Palette',
    accent: '#FFC5A8',
    bgTint: '#FFF0E8',
  },
  {
    id: 'gaming',
    name: 'Gaming',
    shortDesc: 'Co-op squads, strategy nights, indie gems, and campus esports tournaments.',
    icon: 'Gamepad2',
    accent: '#B9A3E8',
    bgTint: '#EFEAF9',
  },
  {
    id: 'travelling',
    name: 'Travelling',
    shortDesc: 'Weekend road trips around Amaravati, hill treks, and spontaneous coastal getaways.',
    icon: 'Compass',
    accent: '#A8DDC8',
    bgTint: '#E8F7F1',
  },
  {
    id: 'sports',
    name: 'Sports',
    shortDesc: 'Evening badminton rallies, football turfs, cricket nets, and inter-hostel leagues.',
    icon: 'Trophy',
    accent: '#F9DFA0',
    bgTint: '#FEF7E4',
  },
  {
    id: 'fitness',
    name: 'Fitness',
    shortDesc: 'Morning runs, gym accountability partners, calisthenics, and mindful yoga.',
    icon: 'Dumbbell',
    accent: '#A8DDC8',
    bgTint: '#E8F7F1',
  },
  {
    id: 'movies',
    name: 'Movies',
    shortDesc: 'World cinema critiques, weekend film screenings, cinematography talks, and anime.',
    icon: 'Film',
    accent: '#F6D5E5',
    bgTint: '#FCF0F6',
  },
  {
    id: 'writing',
    name: 'Writing',
    shortDesc: 'Poetry slams, campus zines, short fiction, screenplays, and personal essays.',
    icon: 'PenTool',
    accent: '#F9DFA0',
    bgTint: '#FEF7E4',
  },
  {
    id: 'cooking',
    name: 'Cooking',
    shortDesc: 'Hostel midnight recipes, weekend baking experiments, and regional food swaps.',
    icon: 'Utensils',
    accent: '#FFC5A8',
    bgTint: '#FFF0E8',
  },
  {
    id: 'designing',
    name: 'Designing',
    shortDesc: 'UI/UX prototyping, brand posters, motion graphics, and product design critiques.',
    icon: 'Layers',
    accent: '#B9A3E8',
    bgTint: '#EFEAF9',
  },
  {
    id: 'technology',
    name: 'Technology',
    shortDesc: 'AI experiments, robotics tinkering, gadget teardowns, and startup tech talks.',
    icon: 'Cpu',
    accent: '#A8DDC8',
    bgTint: '#E8F7F1',
  },
];

export const DISCOVER_HOBBY_FILTERS = [
  'All Interests',
  'Photography',
  'Coding',
  'Music',
  'Reading',
  'Gaming',
  'Dancing',
  'Sports',
  'Designing',
  'Travelling',
  'Painting',
  'Fitness',
  'Movies',
  'Writing',
  'Cooking',
  'Technology',
];

export const CONNECTION_GOALS = [
  'All Goals',
  'Study Partner',
  'Friendship',
  'Project Partner',
  'Social Hangout',
];

export const DEPARTMENTS = [
  'Computer Science & Engineering',
  'AI & Machine Learning',
  'Data Science',
  'Electronics & Communication',
  'Mechanical Engineering',
  'BBA & Management',
  'Economics',
  'Psychology',
  'Liberal Arts',
  'Design & Visual Arts',
];

export const ACADEMIC_YEARS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
];

export const HOBBY_COLOR_MAP = HOBBIES.reduce((acc, hobby) => {
  acc[hobby.name] = {
    accent: hobby.accent,
    bgTint: hobby.bgTint,
  };
  return acc;
}, {});

export function getHobbyStyle(hobbyName) {
  return (
    HOBBY_COLOR_MAP[hobbyName] || {
      accent: '#B9A3E8',
      bgTint: '#EFEAF9',
    }
  );
}
