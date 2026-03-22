// ===== DAY-SPECIFIC SCHEDULES =====
// Each day has its own workout, study focus, skincare add-on
// User's exact flow: wake 5:30, park travel 20min, workout 6:30-8, office 10:45-19:00, study 9:35-10:50 PM

export const DEFAULT_SCHEDULE = {
    // ✅ MONDAY — Legs + Glutes + Core
    Monday: [
        { time: '05:30', task: 'Wake up – Prayer + motivation, warm water + lemon, brush, face cream', category: 'health', done: false },
        { time: '05:45', task: 'Pre-workout medicine + glucose water + 3-5 min mobility', category: 'health', done: false },
        { time: '06:10', task: '🚶 Leave home → Park (travel ~20 min)', category: 'rest', done: false },
        { time: '06:30', task: '🏃 Park: Run 20-30 min + Legs/Glutes (squats, lunges, glute bridges, calf raises) + Core (plank)', category: 'health', done: false },
        { time: '07:55', task: 'Stretching 5-8 min', category: 'health', done: false },
        { time: '08:00', task: '🚶 Leave park → Home (travel ~20-25 min)', category: 'rest', done: false },
        { time: '08:25', task: '✨ Skincare add-on: Besan + milk pack (1-2x/week only) + quick rinse', category: 'selfcare', done: false },
        { time: '08:35', task: 'Full bath', category: 'selfcare', done: false },
        { time: '09:00', task: 'Body care: body oil/moisturizer + stretch marks massage 2-3 min', category: 'selfcare', done: false },
        { time: '09:10', task: 'Face skincare: moisturizer + sunscreen SPF 30+', category: 'selfcare', done: false },
        { time: '09:20', task: 'Cook breakfast + pack lunch/snacks + nimbu water + bag pack + room reset', category: 'rest', done: false },
        { time: '09:55', task: 'Breakfast: Moong chilla + curd (or oats/daliya)', category: 'meal', done: false },
        { time: '10:05', task: '🚶 Leave for office', category: 'rest', done: false },
        { time: '10:45', task: 'Reach office + settle + black coffee + dry fruits + medicine', category: 'work', done: false },
        { time: '11:30', task: 'Mid-morning: 1 fruit', category: 'meal', done: false },
        { time: '13:00', task: 'Lunch + Medicines set 2 (15 min gaps)', category: 'meal', done: false },
        { time: '13:45', task: '20 min walk + read/notes', category: 'health', done: false },
        { time: '17:00', task: 'Black coffee OR nimbu pani (no sugar) + makhana/roasted chana', category: 'meal', done: false },
        { time: '19:00', task: '🚶 Leave office', category: 'rest', done: false },
        { time: '20:00', task: 'Reach home – Rest/relax 15 min', category: 'rest', done: false },
        { time: '20:15', task: 'Cook + eat dinner: Dal/sabzi + salad (light) + wash utensils', category: 'meal', done: false },
        { time: '21:15', task: 'Prep tomorrow: soak chana + dry fruits, keep fruit/snacks ready', category: 'rest', done: false },
        { time: '21:35', task: '📚 STUDY (75 min): Job apply / Resume update', category: 'study', done: false },
        { time: '22:50', task: 'Medicines set 3 + Night skincare: body oil, aloe+vitE, underarm niacinamide', category: 'selfcare', done: false },
        { time: '23:20', task: '10 min meditation + light reading → Sleep by 12', category: 'rest', done: false },
    ],
    // ✅ TUESDAY — Upper Body + Abs (keeping as-is)
    Tuesday: [
        { time: '05:30', task: 'Wake up – Prayer + motivation, warm water + lemon, brush, face cream', category: 'health', done: false },
        { time: '05:45', task: 'Pre-workout medicine + glucose water + 3-5 min mobility', category: 'health', done: false },
        { time: '06:10', task: '🚶 Leave home → Park (travel ~20 min)', category: 'rest', done: false },
        { time: '06:30', task: '🏃 Park: Run 20-30 min + Upper body+Abs (push-ups, rows, shoulder press + planks)', category: 'health', done: false },
        { time: '07:55', task: 'Stretching 5-8 min', category: 'health', done: false },
        { time: '08:00', task: '🚶 Leave park → Home (travel ~20 min)', category: 'rest', done: false },
        { time: '08:25', task: 'Quick rinse / face wash (if sweaty)', category: 'selfcare', done: false },
        { time: '08:35', task: 'Full bath', category: 'selfcare', done: false },
        { time: '09:00', task: 'Body care: body oil/moisturizer + stretch marks massage 2-3 min', category: 'selfcare', done: false },
        { time: '09:10', task: 'Face skincare: moisturizer + sunscreen SPF 30+', category: 'selfcare', done: false },
        { time: '09:20', task: 'Cook breakfast + pack lunch/snacks + nimbu water + bag pack + room reset', category: 'rest', done: false },
        { time: '09:55', task: 'Breakfast: Vegetable oats + 50g paneer', category: 'meal', done: false },
        { time: '10:05', task: '🚶 Leave for office', category: 'rest', done: false },
        { time: '10:45', task: 'Reach office + settle + black coffee + dry fruits + medicine', category: 'work', done: false },
        { time: '11:30', task: 'Mid-morning: 1 fruit (apple/guava/papaya)', category: 'meal', done: false },
        { time: '13:00', task: 'Lunch: dal + sabzi + salad + curd + roti + Medicines set 2 (15 min gaps)', category: 'meal', done: false },
        { time: '13:45', task: '20 min walk + read/notes', category: 'health', done: false },
        { time: '17:00', task: 'Evening: black coffee OR nimbu pani (no sugar) + makhana/roasted chana', category: 'meal', done: false },
        { time: '19:00', task: '🚶 Leave office', category: 'rest', done: false },
        { time: '20:00', task: 'Reach home – Rest/relax 15 min', category: 'rest', done: false },
        { time: '20:15', task: 'Cook + eat dinner: Paneer bhurji/tofu bhurji + salad + wash utensils', category: 'meal', done: false },
        { time: '21:15', task: 'Prep tomorrow: soak chana + dry fruits, keep fruit/snacks ready', category: 'rest', done: false },
        { time: '21:35', task: '📚 STUDY (75 min): Job apply / Resume update', category: 'study', done: false },
        { time: '22:50', task: 'Medicines set 3 + Night skincare: body oil, aloe+vitE, underarm niacinamide', category: 'selfcare', done: false },
        { time: '23:20', task: '10 min meditation + light reading → Sleep by 12', category: 'rest', done: false },
    ],
    // ✅ WEDNESDAY — Intervals + Yoga/Mobility + Light Strength
    Wednesday: [
        { time: '05:30', task: 'Wake up – Prayer + motivation, warm water + lemon, brush, face cream', category: 'health', done: false },
        { time: '05:45', task: 'Pre-workout medicine + glucose water + 3-5 min mobility', category: 'health', done: false },
        { time: '06:10', task: '🚶 Leave home → Park (travel ~20 min)', category: 'rest', done: false },
        { time: '06:30', task: '🏃 Park: Intervals (400m x5 OR 800m x3 easy pace) + Yoga/Mobility 25-30 min + light core', category: 'health', done: false },
        { time: '07:55', task: 'Stretching 5-8 min', category: 'health', done: false },
        { time: '08:00', task: '🚶 Leave park → Home (travel ~20 min)', category: 'rest', done: false },
        { time: '08:25', task: '✨ Skincare add-on: Tomato + curd pack (tan removal, max 1x/week) + rinse', category: 'selfcare', done: false },
        { time: '08:35', task: 'Full bath', category: 'selfcare', done: false },
        { time: '09:00', task: 'Body care: body oil/moisturizer + stretch marks massage 2-3 min', category: 'selfcare', done: false },
        { time: '09:10', task: 'Face skincare: moisturizer + sunscreen SPF 30+', category: 'selfcare', done: false },
        { time: '09:20', task: 'Cook breakfast + pack lunch/snacks + nimbu water + bag pack + room reset', category: 'rest', done: false },
        { time: '09:55', task: 'Breakfast: Daliya (veg) + curd', category: 'meal', done: false },
        { time: '10:05', task: '🚶 Leave for office', category: 'rest', done: false },
        { time: '10:45', task: 'Reach office + settle + black coffee + dry fruits + medicine', category: 'work', done: false },
        { time: '11:30', task: 'Mid-morning: 1 fruit', category: 'meal', done: false },
        { time: '13:00', task: 'Lunch + Medicines set 2 (15 min gaps)', category: 'meal', done: false },
        { time: '13:45', task: '20 min walk + read/notes', category: 'health', done: false },
        { time: '17:00', task: 'Black coffee OR nimbu pani (no sugar) + makhana/roasted chana', category: 'meal', done: false },
        { time: '19:00', task: '🚶 Leave office', category: 'rest', done: false },
        { time: '20:00', task: 'Reach home – Rest/relax 15 min', category: 'rest', done: false },
        { time: '20:15', task: 'Cook + eat dinner: Vegetable soup + sprouts bowl + wash utensils', category: 'meal', done: false },
        { time: '21:15', task: 'Prep tomorrow: soak chana + dry fruits, keep fruit/snacks ready', category: 'rest', done: false },
        { time: '21:35', task: '📚 STUDY (75 min): Personal Project (coding) / Website work', category: 'study', done: false },
        { time: '22:50', task: 'Medicines set 3 + Night skincare: body oil, aloe+vitE, underarm niacinamide', category: 'selfcare', done: false },
        { time: '23:20', task: '10 min meditation + light reading → Sleep by 12', category: 'rest', done: false },
    ],
    // ✅ THURSDAY — Core + Belly + Stairs
    Thursday: [
        { time: '05:30', task: 'Wake up – Prayer + motivation, warm water + lemon, brush, face cream', category: 'health', done: false },
        { time: '05:45', task: 'Pre-workout medicine + glucose water + 3-5 min mobility', category: 'health', done: false },
        { time: '06:10', task: '🚶 Leave home → Park (travel ~20 min)', category: 'rest', done: false },
        { time: '06:30', task: '🏃 Park: Run 20-25 min + Core/Belly (planks, leg raises, bicycle crunch, mountain climbers) + Stairs 10-15 min', category: 'health', done: false },
        { time: '07:55', task: 'Stretching 5-8 min', category: 'health', done: false },
        { time: '08:00', task: '🚶 Leave park → Home (travel ~20 min)', category: 'rest', done: false },
        { time: '08:25', task: '✨ Skincare add-on: Face scrub / fruit scrub (gentle, not harsh) + rinse', category: 'selfcare', done: false },
        { time: '08:35', task: 'Full bath', category: 'selfcare', done: false },
        { time: '09:00', task: 'Body care: body oil/moisturizer + stretch marks massage 2-3 min', category: 'selfcare', done: false },
        { time: '09:10', task: 'Face skincare: moisturizer + sunscreen SPF 30+', category: 'selfcare', done: false },
        { time: '09:20', task: 'Cook breakfast + pack lunch/snacks + nimbu water + bag pack + room reset', category: 'rest', done: false },
        { time: '09:55', task: 'Breakfast: Besan chilla (2) + salad', category: 'meal', done: false },
        { time: '10:05', task: '🚶 Leave for office', category: 'rest', done: false },
        { time: '10:45', task: 'Reach office + settle + black coffee + dry fruits + medicine', category: 'work', done: false },
        { time: '11:30', task: 'Mid-morning: 1 fruit', category: 'meal', done: false },
        { time: '13:00', task: 'Lunch + Medicines set 2 (15 min gaps)', category: 'meal', done: false },
        { time: '13:45', task: '20 min walk + read/notes', category: 'health', done: false },
        { time: '17:00', task: 'Black coffee OR nimbu pani (no sugar) + makhana/roasted chana', category: 'meal', done: false },
        { time: '19:00', task: '🚶 Leave office', category: 'rest', done: false },
        { time: '20:00', task: 'Reach home – Rest/relax 15 min', category: 'rest', done: false },
        { time: '20:15', task: 'Cook + eat dinner: Khichdi + curd (light) + wash utensils', category: 'meal', done: false },
        { time: '21:15', task: 'Prep tomorrow: soak chana + dry fruits, keep fruit/snacks ready', category: 'rest', done: false },
        { time: '21:35', task: '📚 STUDY (75 min): DSA (45 min) + Govt prep (30 min)', category: 'study', done: false },
        { time: '22:50', task: 'Medicines set 3 + Night skincare: body oil, aloe+vitE, underarm niacinamide', category: 'selfcare', done: false },
        { time: '23:20', task: '10 min meditation + light reading → Sleep by 12', category: 'rest', done: false },
    ],
    // ✅ FRIDAY — Full Body + Fun Cardio (early relax night, no heavy packs)
    Friday: [
        { time: '05:30', task: 'Wake up – Prayer + motivation, warm water + lemon, brush, face cream', category: 'health', done: false },
        { time: '05:45', task: 'Pre-workout medicine + glucose water + 3-5 min mobility', category: 'health', done: false },
        { time: '06:10', task: '🚶 Leave home → Park (travel ~20 min)', category: 'rest', done: false },
        { time: '06:30', task: '🏃 Park: Run 20 min + Full body circuit (squats + push-ups + rows + shoulder press + plank) + Skipping/dance cardio 10-15 min', category: 'health', done: false },
        { time: '07:55', task: 'Stretching 5-8 min', category: 'health', done: false },
        { time: '08:00', task: '🚶 Leave park → Home (travel ~20 min)', category: 'rest', done: false },
        { time: '08:25', task: 'Quick rinse / face wash (basic skincare only – no heavy packs)', category: 'selfcare', done: false },
        { time: '08:35', task: 'Full bath', category: 'selfcare', done: false },
        { time: '09:00', task: 'Body care: body oil/moisturizer + stretch marks massage 2-3 min', category: 'selfcare', done: false },
        { time: '09:10', task: 'Face skincare: moisturizer + sunscreen SPF 30+', category: 'selfcare', done: false },
        { time: '09:20', task: 'Cook breakfast + pack lunch/snacks + nimbu water + bag pack + room reset', category: 'rest', done: false },
        { time: '09:55', task: 'Breakfast: Greek yogurt/curd + chia/flax + small fruit', category: 'meal', done: false },
        { time: '10:05', task: '🚶 Leave for office', category: 'rest', done: false },
        { time: '10:45', task: 'Reach office + settle + black coffee + dry fruits + medicine', category: 'work', done: false },
        { time: '11:30', task: 'Mid-morning: 1 fruit', category: 'meal', done: false },
        { time: '13:00', task: 'Lunch + Medicines set 2 (15 min gaps)', category: 'meal', done: false },
        { time: '13:45', task: '20 min walk + read/notes', category: 'health', done: false },
        { time: '17:00', task: 'Black coffee OR nimbu pani (no sugar) + makhana/roasted chana', category: 'meal', done: false },
        { time: '19:00', task: '🚶 Leave office', category: 'rest', done: false },
        { time: '20:00', task: 'Reach home – Rest/relax 15 min', category: 'rest', done: false },
        { time: '20:15', task: 'Cook + eat dinner: Stir-fry veggies + tofu/paneer + wash utensils', category: 'meal', done: false },
        { time: '21:15', task: 'Prep tomorrow: soak chana + dry fruits, keep fruit/snacks ready', category: 'rest', done: false },
        { time: '21:35', task: '📚 STUDY (75 min): Freelancing/admin OR job applications + portfolio update', category: 'study', done: false },
        { time: '22:50', task: 'Medicines set 3 + Night skincare: body oil, aloe+vitE, underarm niacinamide', category: 'selfcare', done: false },
        { time: '23:20', task: '10 min meditation + light reading → Sleep by 12 (early relax night)', category: 'rest', done: false },
    ],
    Saturday: [
        { time: '05:30', task: 'Wake up – warm water + almonds + walnuts', category: 'health', done: false },
        { time: '05:45', task: 'Pre-workout medicine + mobility', category: 'health', done: false },
        { time: '06:10', task: '🚶 Leave home → Park', category: 'rest', done: false },
        { time: '06:30', task: '🏃 Park: Fun cardio – Badminton/Dance/Swimming + Full-body stretch', category: 'health', done: false },
        { time: '08:00', task: '🚶 Leave park → Home', category: 'rest', done: false },
        { time: '08:30', task: 'Bath + Body oil + Face skincare + sunscreen', category: 'selfcare', done: false },
        { time: '09:00', task: 'Breakfast: Sprouts chaat + 1 fruit', category: 'meal', done: false },
        { time: '09:30', task: 'Room clean: jhadu + pocha + room reset + soak chana for cook', category: 'rest', done: false },
        { time: '10:30', task: '📚 Deep Study: DSA + Coding (2 hrs)', category: 'study', done: false },
        { time: '12:30', task: 'Cooking practice – try new recipe', category: 'study', done: false },
        { time: '13:30', task: 'Lunch: Chole/rajma + salad + Medicines set 2', category: 'meal', done: false },
        { time: '14:30', task: 'Skincare: deep treatment + hair oil + body moisturizer', category: 'selfcare', done: false },
        { time: '15:30', task: 'Hobby / creative time', category: 'rest', done: false },
        { time: '16:30', task: 'Snack: makhana/roasted chana + tea', category: 'meal', done: false },
        { time: '17:00', task: '📚 Study: New tools / online course (1.5 hrs)', category: 'study', done: false },
        { time: '18:30', task: 'Evening walk / cycling / outdoor', category: 'health', done: false },
        { time: '19:30', task: 'Cook dinner + eat (earlier dinner)', category: 'meal', done: false },
        { time: '20:30', task: 'Night skincare + stretch mark care + body oil', category: 'selfcare', done: false },
        { time: '21:00', task: 'Medicines set 3 + movie / relaxation', category: 'rest', done: false },
        { time: '23:00', task: 'Sleep', category: 'rest', done: false },
    ],
    Sunday: [
        { time: '06:00', task: 'Wake up (extra sleep), warm water + almonds', category: 'health', done: false },
        { time: '06:30', task: 'Recovery: light walk 30-45 min + stretching + meditation', category: 'health', done: false },
        { time: '07:30', task: 'Bath + Body oil + Face pack (besan+curd) + skincare', category: 'selfcare', done: false },
        { time: '08:30', task: 'Breakfast: Poha (less oil) + peanuts + curd', category: 'meal', done: false },
        { time: '09:00', task: 'Weekly Review & Planning + set goals', category: 'selfcare', done: false },
        { time: '10:00', task: '📚 Study: AI/ML or Full Stack (2 hrs)', category: 'study', done: false },
        { time: '12:00', task: 'Cooking: Meal prep for week + new recipe', category: 'study', done: false },
        { time: '13:00', task: 'Lunch + Medicines set 2', category: 'meal', done: false },
        { time: '14:00', task: 'Rest / Power nap 20 min', category: 'rest', done: false },
        { time: '15:00', task: 'Skincare: weekly (face pack, hair oil, underarm care, body oil)', category: 'selfcare', done: false },
        { time: '16:00', task: 'Snack + tea', category: 'meal', done: false },
        { time: '16:30', task: 'Grocery list + market + prep for Monday', category: 'rest', done: false },
        { time: '18:00', task: 'Evening walk / cycling / badminton', category: 'health', done: false },
        { time: '19:00', task: '📚 Job apply + resume + revise notes', category: 'study', done: false },
        { time: '20:00', task: 'Dinner: Mixed veg + curd + roti (early)', category: 'meal', done: false },
        { time: '20:30', task: 'Night skincare + retinol + body oil', category: 'selfcare', done: false },
        { time: '21:00', task: 'Medicines set 3', category: 'health', done: false },
        { time: '21:30', task: 'Relaxation / family-friend time', category: 'rest', done: false },
        { time: '23:00', task: 'Sleep', category: 'rest', done: false },
    ],
};

export const LOW_ENERGY_REPLACEMENTS = {
    'run': 'Light walk at home / rest', 'running': 'Gentle stretching', 'legs+stairs': 'Light yoga / hot water bag',
    'upper body': 'Gentle breathing + rest', 'full body circuit': 'Light stretch + rest', 'core+belly': 'Breathing + bed rest',
    'skipping': 'Rest / music', 'badminton': 'Rest / gentle walk', 'dance': 'Music / journaling',
    'swimming': 'Warm bath', 'cycling': 'Light indoor', 'park': 'Skip park – rest at home',
    'cardio': 'Gentle walking', 'leave home': 'Stay home – rest day',
};

// ===== STUDY PROGRESS (subtopics are clickable with done state) =====
export const DEFAULT_STUDY_PROGRESS = {
    dsa: {
        label: 'DSA (Python)', icon: '🧩', subtopics: [
            { id: 'dsa1', text: 'Arrays & Strings', done: false }, { id: 'dsa2', text: 'Linked Lists', done: false },
            { id: 'dsa3', text: 'Stacks & Queues', done: false }, { id: 'dsa4', text: 'Trees & BST', done: false },
            { id: 'dsa5', text: 'Graphs', done: false }, { id: 'dsa6', text: 'Dynamic Programming', done: false },
            { id: 'dsa7', text: 'Sorting & Searching', done: false }, { id: 'dsa8', text: 'Recursion & Backtracking', done: false },
            { id: 'dsa9', text: 'Hashing', done: false }, { id: 'dsa10', text: 'Greedy', done: false },
        ]
    },
    frontend: {
        label: 'Frontend', icon: '🎨', subtopics: [
            { id: 'fe1', text: 'HTML', done: false }, { id: 'fe2', text: 'CSS', done: false }, { id: 'fe3', text: 'JavaScript', done: false },
            { id: 'fe4', text: 'React', done: false }, { id: 'fe5', text: 'Redux', done: false }, { id: 'fe6', text: 'Material UI', done: false },
            { id: 'fe7', text: 'Node.js', done: false },
        ]
    },
    backend: {
        label: 'Backend', icon: '⚙️', subtopics: [
            { id: 'be1', text: 'Python', done: false }, { id: 'be2', text: 'Django', done: false }, { id: 'be3', text: 'FastAPI', done: false },
        ]
    },
    aiml: {
        label: 'AI / ML', icon: '🤖', subtopics: [
            { id: 'ai1', text: 'Python (AI)', done: false }, { id: 'ai2', text: 'Graphs', done: false }, { id: 'ai3', text: 'SQL', done: false },
            { id: 'ai4', text: 'Statistics', done: false }, { id: 'ai5', text: 'Machine Learning', done: false }, { id: 'ai6', text: 'LLM', done: false },
        ]
    },
    devtools: {
        label: 'Dev Tools', icon: '🔧', subtopics: [
            { id: 'dt1', text: 'Postman', done: false }, { id: 'dt2', text: 'CRUD APIs', done: false }, { id: 'dt3', text: 'GitHub', done: false },
            { id: 'dt4', text: 'Linux', done: false }, { id: 'dt5', text: 'SQL', done: false }, { id: 'dt6', text: 'System Design', done: false },
        ]
    },
    projects: {
        label: 'Projects', icon: '🚀', subtopics: [
            { id: 'pj1', text: 'Sky Scanner Clone', done: false }, { id: 'pj2', text: 'OCR', done: false },
            { id: 'pj3', text: 'Chatbot', done: false }, { id: 'pj4', text: 'Vercel Deploy', done: false },
        ]
    },
    newtools: {
        label: 'New Tools', icon: '🆕', subtopics: [
            { id: 'nt1', text: 'Playwright', done: false }, { id: 'nt2', text: 'ShadCN', done: false }, { id: 'nt3', text: 'n8n', done: false },
            { id: 'nt4', text: 'Grok', done: false }, { id: 'nt5', text: 'NotebookLLM', done: false }, { id: 'nt6', text: 'Gemini', done: false },
            { id: 'nt7', text: 'Google AI Studio', done: false }, { id: 'nt8', text: 'Julius', done: false }, { id: 'nt9', text: 'Comet', done: false },
        ]
    },
};

export const DEFAULT_GOALS = [
    {
        id: 'weight_loss', title: 'Weight Loss', icon: '⚖️', color: 'health', items: [
            { id: 'wl1', text: '80kg → 72-74kg (8 weeks)', done: false }, { id: 'wl2', text: 'Then 55-60kg (6-8 months)', done: false },
            { id: 'wl3', text: '8,000-10,000 steps/day', done: false }, { id: 'wl4', text: 'Protein 60-80g/day', done: false },
            { id: 'wl5', text: 'Sleep 6-6.5 hrs', done: false }, { id: 'wl6', text: 'Weigh weekly', done: false },
        ]
    },
    {
        id: 'skincare', title: 'Skin + Body Care', icon: '✨', color: 'skin', items: [
            { id: 'sk1', text: 'Clear skin – safe routine', done: false }, { id: 'sk2', text: 'Underarm: lactic acid Mon+Thu, Niacinamide Tue+Fri', done: false },
            { id: 'sk3', text: 'Stretch marks: oil daily + retinol 3x/week', done: false }, { id: 'sk4', text: 'Tan removal: sunscreen + besan pack 2x/week', done: false },
            { id: 'sk5', text: 'Sunscreen SPF 30+ every morning', done: false }, { id: 'sk6', text: 'No harsh scrubs daily', done: false },
        ]
    },
    {
        id: 'fitness', title: 'Fitness & Stamina', icon: '💪', color: 'fitness', items: [
            { id: 'f1', text: 'Stamina: run 20-30 min daily', done: false }, { id: 'f2', text: 'Strength all body parts', done: false },
            { id: 'f3', text: 'Learn: Yoga, Cycling, Swimming, Dancing, Badminton', done: false },
            { id: 'f4', text: 'Running: 800mx3, 400mx5, 1200mx2, 4km', done: false }, { id: 'f5', text: 'Medicines 3x/day', done: false },
        ]
    },
    {
        id: 'study', title: 'Study & Career', icon: '📚', color: 'study', items: [
            { id: 'st1', text: 'DSA daily', done: false }, { id: 'st2', text: 'Sky Scanner clone', done: false },
            { id: 'st3', text: 'AI/ML course', done: false }, { id: 'st4', text: 'Full Stack', done: false },
            { id: 'st5', text: 'Jobs daily', done: false }, { id: 'st6', text: 'Resume + LinkedIn', done: false },
        ]
    },
    {
        id: 'cooking', title: 'Cooking', icon: '🍳', color: 'cooking', items: [
            { id: 'c1', text: 'Healthy weight-loss food', done: false }, { id: 'c2', text: 'Master Paneer 30+', done: false },
            { id: 'c3', text: 'All breakfast options', done: false }, { id: 'c4', text: 'New recipe every week', done: false },
        ]
    },
    {
        id: 'travel', title: 'Travel', icon: '✈️', color: 'custom', items: [
            { id: 't1', text: 'Dubai', done: false }, { id: 't2', text: 'Nepal', done: false }, { id: 't3', text: 'Himachal', done: false },
            { id: 't4', text: 'Bungee Jump', done: false }, { id: 't5', text: 'Sky Diving', done: false },
        ]
    },
    {
        id: 'others', title: 'Other Skills', icon: '🌟', color: 'custom', items: [
            { id: 'o1', text: 'Guitar', done: false }, { id: 'o2', text: 'Stitching', done: false }, { id: 'o3', text: 'Driving + Bike', done: false },
            { id: 'o4', text: 'Candle Making', done: false },
        ]
    },
];

export const WORKOUT_PLANS = {
    monday: { title: '🦵 Monday – Legs + Glutes + Core', items: ['Run 20-30 min', 'Squats 3x12', 'Lunges 3x10', 'Glute Bridges 3x15', 'Calf Raises 3x15', 'Plank 1-2 min'] },
    tuesday: { title: '💪 Tuesday – Upper Body + Abs', items: ['Run 20-30 min', 'Push-ups 3x10', 'Rows (band) 3x12', 'Shoulder Press 3x10', 'Planks 3x30s'] },
    wednesday: { title: '🏃 Wednesday – Intervals + Yoga', items: ['400m x5 OR 800m x3 easy pace', 'Yoga/Mobility 25-30 min', 'Light core work'] },
    thursday: { title: '🎯 Thursday – Core + Belly + Stairs', items: ['Run 20-25 min', 'Planks', 'Leg Raises 3x12', 'Bicycle Crunch 3x15', 'Mountain Climbers 3x10', 'Stairs 10-15 min'] },
    friday: { title: '⚡ Friday – Full Body + Fun Cardio', items: ['Run 20 min', 'Squats', 'Push-ups', 'Rows', 'Shoulder Press', 'Plank', 'Skipping/Dance Cardio 10-15 min'] },
    saturday: { title: '🎉 Saturday – Fun Cardio', items: ['Badminton/Dance/Swimming', 'Full-body stretch'] },
    sunday: { title: '🧘 Sunday – Recovery', items: ['Light walk 30-45 min', 'Long stretching', 'Meditation 10 min'] },
};

export const COOKING_PLANS = {
    monday: {
        title: '✅ Monday — Quick Prep Day',
        breakfast: ['Cornflakes + milk + 1 banana', 'Oats porridge (milk/water) + nuts', 'Bread toast + peanut butter (or curd)'],
        lunch: 'Dal + sabzi + salad + curd (no roti or 1 roti max)',
        dinner: '2 roti + paneer bhurji + salad',
        learn: 'Poha (15 min) OR daliya basic',
    },
    tuesday: {
        title: '✅ Tuesday — Protein Focus Day',
        breakfast: ['Moong chilla (2) (if batter ready)', 'Greek yogurt/curd bowl + fruit + chia/flax', 'Oats + 50g paneer (quick)'],
        lunch: 'Dal + sabzi + curd + salad',
        dinner: '2 roti + tofu/paneer + veggies',
        learn: 'Chilla variations (besan/moong)',
    },
    wednesday: {
        title: '✅ Wednesday — Comfort Bowl Day',
        breakfast: ['Daliya (veg) + curd', 'Oats porridge + apple', 'Smoothie (milk/curd + banana + oats)'],
        lunch: 'Sabzi + curd + salad (+ 1 roti if needed)',
        dinner: 'Khichdi + curd (light digestion)',
        learn: 'Khichdi styles (moong/veg)',
    },
    thursday: {
        title: '✅ Thursday — High Energy Day',
        breakfast: ['Poha (simple)', 'Besan chilla (2) + chutney', 'Bread toast + cheese/paneer (light)'],
        lunch: 'Chole/rajma (small bowl) + salad + curd',
        dinner: '2 roti + mixed veg + curd',
        learn: 'Bhindi OR aloo gobi sabzi',
    },
    friday: {
        title: '✅ Friday — Fresh & Light Day',
        breakfast: ['Curd + fruit + nuts', 'Cornflakes + milk', 'Sprouts (cooker) small bowl + toast'],
        lunch: 'Dal + sabzi + salad + curd',
        dinner: 'Veg soup + paneer/tofu + salad (low carb)',
        learn: 'Mint/coriander chutney (5 min)',
    },
    saturday: {
        title: '🌟 Saturday — Masterchef Learning Day',
        breakfast: ['Poha / paratha (healthier)'],
        lunch: 'Rajma or chole (learn properly)',
        dinner: 'Try 1 new recipe!',
        learn: 'Rotate weekly: Wk1 Rajma+rice, Wk2 Kadhi+rice, Wk3 Saag+roti, Wk4 Paneer tikka',
    },
    sunday: {
        title: '🌟 Sunday — Prep Day + Comfort',
        breakfast: ['Daliya / oats / fruit curd'],
        lunch: 'Mixed veg + curd + roti',
        dinner: 'Light khichdi / dal soup',
        learn: 'Sunday Prep: Boil chana/rajma, make chutney, chop veggies, knead dough, roast makhana',
    },
};

export const COOKING_ILLNESS_PLAN = {
    title: '🤒 Illness / Periods / Low Energy (No Cooking Stress)',
    breakfast: ['Cornflakes + milk', 'Banana + curd', 'Oats porridge (plain)'],
    meals: ['Moong dal khichdi + curd', 'Dal rice + curd', 'Veg soup + toast'],
    snacks: ['Coconut water', 'Fruit', 'Roasted makhana'],
};

export const COOKING_ROADMAP = [
    { month: 'Month 1', title: 'Easy Daily Basics', items: ['Poha', 'Daliya', 'Oats', 'Chilla', 'Khichdi', 'Basic dal', 'Bhindi/Aloo gobi'] },
    { month: 'Month 2', title: 'Curries + Grains', items: ['Chole', 'Rajma', 'Kadhi', 'Jeera rice', 'Pulav'] },
    { month: 'Month 3', title: 'Paneer + Weekend Specials', items: ['Paneer tikka', 'Palak paneer', 'Kadai paneer', 'Dal makhani (lighter)'] },
    { month: 'Month 4', title: 'Snacks + Desserts', items: ['Chaat (healthy)', 'Fruit custard', 'Kheer/Halwa (weekly only)'] },
];

export const EXERCISE_VIDEOS = [
    { title: 'Leg & Thigh Fat', sets: '20x3', url: 'https://youtube.com/shorts/U_o85OPA5HI' },
    { title: 'Belly Fat', sets: '50x3', url: 'https://youtube.com/shorts/MIU7JhztBew' },
    { title: 'Abs 1', url: 'https://youtube.com/shorts/GLR9zYU4oXE' },
    { title: 'Abs 2', url: 'https://youtube.com/shorts/mUD2u-YVn7A' },
    { title: 'Stairs', url: 'https://youtube.com/shorts/M71-K_E9-5E' },
];

export const DEFAULT_NOTES = {
    weekly_grocery: [{ id: 'wg1', text: '🥛 Curd, Paneer, Milk' }, { id: 'wg2', text: '🥬 Sabzi: palak, lauki, tori, bhindi' }, { id: 'wg3', text: '🍎 Fruits: apple, guava, papaya, banana' }, { id: 'wg4', text: '🌾 Dal, Chana, Rajma, Moong' }, { id: 'wg5', text: '🥜 Almonds, Walnuts, Makhana, Peanuts' }, { id: 'wg6', text: '🍋 Lemons, Ginger, Green chutney' }, { id: 'wg7', text: '🧴 Sunscreen, Body oil, Aloe gel' }, { id: 'wg8', text: '💊 Medicines refill check' }],
    medicine_schedule: [{ id: 'ms1', text: '⏰ Set 1 (5:45 AM): Pre-workout – Med1, +15min Med2, +15min Med3' }, { id: 'ms2', text: '⏰ Set 2 (1:15 PM): After lunch – Med1, +15min Med2, +15min Med3' }, { id: 'ms3', text: '⏰ Set 3 (10:50 PM): Night – Med1, +15min Med2, +15min Med3' }, { id: 'ms4', text: '💡 Keep 3 alarms for each set' }, { id: 'ms5', text: '📦 Carry small pill case to office' }],
    meal_ideas: [{ id: 'mi1', text: '🌅 Breakfast: Poha/Oats/Chilla/Daliya/Sprouts + curd' }, { id: 'mi2', text: '🌞 Lunch: Dal+sabzi+roti+salad+curd (pack from home)' }, { id: 'mi3', text: '🌇 Dinner: Paneer bhurji/Soup+sprouts/Khichdi/Stir-fry' }, { id: 'mi4', text: '🥜 Snacks: Makhana, roasted chana, dry fruits, fruit' }, { id: 'mi5', text: '☕ Drinks: black coffee, nimbu pani (no sugar)' }, { id: 'mi6', text: '❌ Avoid: sugar, fried food, maida, packaged juice' }],
    paneer_recipes: [{ id: 'pr1', text: 'Paneer Tikka' }, { id: 'pr2', text: 'Butter Masala' }, { id: 'pr3', text: 'Palak Paneer' }, { id: 'pr4', text: 'Kadai Paneer' }, { id: 'pr5', text: 'Paneer Bhurji' }, { id: 'pr6', text: 'Shahi Paneer' }, { id: 'pr7', text: 'Paneer Roll/Wrap' }, { id: 'pr8', text: 'Paneer Paratha' }],
    weight_log: [{ id: 'wt1', text: '📊 Current: 80 kg (starting)' }, { id: 'wt2', text: '🎯 8 week target: 72-74 kg' }, { id: 'wt3', text: '🎯 6-8 month target: 55-60 kg' }, { id: 'wt4', text: '💡 Weigh every Sunday morning (empty stomach)' }, { id: 'wt5', text: '⚠️ 0.5-1 kg/week is healthy pace' }],
    daily_reminders: [{ id: 'dr1', text: '💊 3 medicine sets – keep alarms!' }, { id: 'dr2', text: '☀️ Sunscreen before leaving home' }, { id: 'dr3', text: '🫙 Soak chana/dry fruits at night' }, { id: 'dr4', text: '🎒 Pack: lunch, dry fruits, fruit, nimbu water, medicines' }, { id: 'dr5', text: '🚶 8000-10000 steps daily' }, { id: 'dr6', text: '💧 8+ glasses water' }, { id: 'dr7', text: '📵 No phone 30 min before sleep' }],
    pending_tasks: [{ id: 'pt1', text: 'Jhadu + pocha + bartan (Sat/Sun)' }, { id: 'pt2', text: 'Cycle dekhni hai' }, { id: 'pt3', text: 'HDFC Card activate' }, { id: 'pt4', text: 'Running jersey fix' }, { id: 'pt5', text: 'Office charger buy' }, { id: 'pt6', text: 'Resume update on LinkedIn' }, { id: 'pt7', text: 'Naukri profile update' }],
    important_rules: [{ id: 'ir1', text: '🚫 No crash dieting – slow loss protects skin/hair' }, { id: 'ir2', text: '🚫 No lemon+sugar on face daily' }, { id: 'ir3', text: '🚫 No high-impact exercise daily without recovery' }, { id: 'ir4', text: '✅ Patch test any new product 24 hrs' }, { id: 'ir5', text: '✅ If irritation: stop actives 5-7 days' }, { id: 'ir6', text: '✅ Protein 60-80g/day (paneer/curd/dal/chana)' }, { id: 'ir7', text: '✅ Sleep 6-6.5 hrs consistent' }],
};

export const SKINCARE_WEEKLY = {
    Monday: { am: 'Coffee milk cleanse, cucumber ice on eyes. Post-bath: Toner, body cream, body oil.', pm: 'After office: Face wash, cleansing milk.', night: 'Face: Vit E + coconut oil. Body: Body oil.', special: 'Dark spots: Potato juice + baking soda' },
    Tuesday: { am: 'Face wash + scrub, cucumber ice. Post-bath: Toner, body cream, body oil.', pm: 'After office: Face wash, cleansing milk.', night: 'Face: Aloe vera. Body: Body oil.', special: 'Underarm: Niacinamide 4-5%' },
    Wednesday: { am: 'Besan + curd, cucumber ice. Post-bath: Toner, body cream, body oil.', pm: 'After office: Face wash, cleansing milk.', night: 'Face: Vit E + coconut oil. Body: Body oil.', special: 'Tan (Arms): Tomato gravy + curd' },
    Thursday: { am: 'Fruit scrub, cucumber ice. Post-bath: Toner, body cream, body oil.', pm: 'After office: Face wash, cleansing milk.', night: 'Face: Aloe vera. Body: Body oil.', special: 'Dark spots: Potato juice + baking soda' },
    Friday: { am: 'Face wash, cucumber ice. Post-bath: Toner, body cream, body oil.', pm: 'After office: Face wash, cleansing milk.', night: 'Face: Vit E + coconut oil. Body: Body oil.', special: 'Underarm: Niacinamide 4-5%' },
    Saturday: { am: 'Coffee milk cleanse, cucumber ice. Post-bath: Toner, body cream, body oil.', pm: 'After office: Face wash, cleansing milk.', night: 'Face: Aloe vera. Body: Body oil.', special: 'Dark spots: Lemon + sugar (gentle)' },
    Sunday: { am: 'Besan + curd, cucumber ice. Post-bath: Toner, body cream, body oil.', pm: 'After office: Face wash, cleansing milk.', night: 'Face: Vit E + coconut oil. Body: Body oil.', special: 'Tan (Arms): Tomato gravy + curd' },
};

export const TASK_REQUIREMENTS = {
    'chilla': ['Moong Dal/Besan', 'Chutney ingredients', 'Curd'], 'oats': ['Oats', 'Paneer', 'Vegetables'],
    'daliya': ['Daliya', 'Vegetables', 'Curd'], 'yogurt': ['Yogurt/Curd', 'Chia/Flax', 'Fruit'],
    'sprouts': ['Sprouts (soak!)', 'Fruit', 'Chaat masala'], 'poha': ['Poha', 'Peanuts', 'Curd'],
    'paneer': ['Paneer', 'Onion', 'Tomato', 'Spices'], 'khichdi': ['Rice', 'Moong Dal', 'Ghee', 'Curd'],
    'soup': ['Soup vegetables', 'Sprouts'], 'stir-fry': ['Vegetables', 'Tofu/Paneer'],
    'chole': ['Chickpeas (SOAK!)', 'Chole Masala'], 'rajma': ['Rajma (SOAK!)', 'Rice', 'Spices'],
    'body oil': ['Body Oil', 'Moisturizer'], 'sunscreen': ['Sunscreen SPF 30+'],
    'lactic acid': ['Lactic acid 5% lotion'], 'niacinamide': ['Niacinamide serum'],
    'aloe': ['Aloe Vera gel'], 'nimbu': ['Lemons', 'Black Salt'],
    'dry fruits': ['Almonds', 'Walnuts', 'Chana/Makhana'], 'glucose': ['Glucose powder'],
    'medicine': ['Medicine sets', 'Pill case'],
};

export const MOOD_OPTIONS = [
    { emoji: '😊', label: 'Happy', value: 'happy' }, { emoji: '😐', label: 'Neutral', value: 'neutral' },
    { emoji: '😔', label: 'Low', value: 'low' }, { emoji: '😤', label: 'Stressed', value: 'stressed' },
    { emoji: '🤩', label: 'Excited', value: 'excited' }, { emoji: '😴', label: 'Tired', value: 'tired' },
    { emoji: '🤒', label: 'Sick', value: 'sick' }, { emoji: '💫', label: 'Period', value: 'period' },
];

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const DEFAULT_PERIOD_DATA = {
    lastPeriodDate: null, cycleLength: 28, periodDuration: 5, history: [],
};
