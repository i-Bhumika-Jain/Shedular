import { useState, useEffect, useRef } from 'react';
import { DEFAULT_SCHEDULE, DEFAULT_GOALS, DEFAULT_NOTES, MOOD_OPTIONS, DAYS_OF_WEEK, DEFAULT_STUDY_PROGRESS, WORKOUT_PLANS, COOKING_PLANS, COOKING_ILLNESS_PLAN, COOKING_ROADMAP, EXERCISE_VIDEOS, SKINCARE_WEEKLY, DEFAULT_PERIOD_DATA, LOW_ENERGY_REPLACEMENTS } from './data';
import { getTodayName, getTomorrowName, isCurrentSlot, gid, to12h, load, save, genChecklist, getPeriodPrediction, logNewPeriod, aiRespond, calcStudyProgress, calcOverallStudy } from './utils';

// ===== OWNER EMAIL — only this email gets default pre-loaded data =====
const OWNER_EMAIL = 'bhumikajain.work@gmail.com';

function MainApp({ currentUser, userEmail, onLogout }) {
    const uid = userEmail || currentUser;
    const loadData = (k, d) => load(`${uid}_${k}`, d);
    const saveData = (k, v) => save(`${uid}_${k}`, v);

    // Only Bhumika's email gets default schedule/goals/notes/study; everyone else gets empty
    const isOwner = (userEmail || '').toLowerCase() === OWNER_EMAIL;
    const emptySchedule = DAYS_OF_WEEK.reduce((a, d) => ({ ...a, [d]: [] }), {});

    // DATA VERSION MIGRATION: wipe stale data for non-owner users created before scoping fix
    const DATA_VERSION = 2;
    const userDataVersion = loadData('dataVersion', 0);
    if (!isOwner && userDataVersion < DATA_VERSION) {
        // Clear all stale data for this non-owner user
        const keysToReset = ['schedule', 'goals', 'notes', 'studyProgress', 'savedLinks', 'chatMsgs', 'checklist', 'mood', 'energy', 'energyAdjusted', 'periodData', 'history', 'isNewUser'];
        keysToReset.forEach(k => localStorage.removeItem(`${uid}_${k}`));
        save(`${uid}_dataVersion`, DATA_VERSION);
        // Must reload so useState picks up clean (empty) defaults
        window.location.reload();
        return null;
    }
    if (isOwner && userDataVersion < DATA_VERSION) {
        save(`${uid}_dataVersion`, DATA_VERSION);
    }

    // Initial section logic for new users
    const isNewUser = loadData('isNewUser', true);
    const [section, setSection] = useState(isNewUser ? 'assistant' : 'dashboard');

    // Save isNewUser to false
    useEffect(() => { if (isNewUser) saveData('isNewUser', false); }, [isNewUser]);

    const [day, setDay] = useState(getTodayName());
    const [mood, setMood] = useState(loadData('mood', null));
    const [energy, setEnergy] = useState(loadData('energy', 5));
    const [schedule, setSchedule] = useState(loadData('schedule', isOwner ? DEFAULT_SCHEDULE : emptySchedule));
    const [goals, setGoals] = useState(loadData('goals', isOwner ? DEFAULT_GOALS : []));
    const [notes, setNotes] = useState(loadData('notes', isOwner ? DEFAULT_NOTES : {}));
    const [noteCat, setNoteCat] = useState(Object.keys(loadData('notes', isOwner ? DEFAULT_NOTES : {}))[0] || '');
    const [noteInput, setNoteInput] = useState('');
    const [studyProgress, setStudyProgress] = useState(loadData('studyProgress', isOwner ? DEFAULT_STUDY_PROGRESS : {}));
    const [chatMsgs, setChatMsgs] = useState(loadData('chatMsgs', [{ role: 'assistant', content: `👋 Welcome ${currentUser}! I can adjust your schedule!\n• "Add gym at 6:30 PM"\n• "I have hospital"\n• "I'm on my period"\n• "Reschedule study to Saturday"\n• "Reset schedule"` }]));
    const [chatInput, setChatInput] = useState('');
    const [checklist, setChecklist] = useState(loadData('checklist', []));
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [newGoalCat, setNewGoalCat] = useState({ title: '', icon: '🎯' });
    const [goalItemTexts, setGoalItemTexts] = useState({});
    const [newNoteCat, setNewNoteCat] = useState('');
    const [theme, setTheme] = useState(loadData('theme', 'dark'));
    const [periodData, setPeriodData] = useState(loadData('periodData', DEFAULT_PERIOD_DATA));
    const [energyAdjusted, setEnergyAdjusted] = useState(loadData('energyAdjusted', false));
    const [planTab, setPlanTab] = useState('workout');
    const [newStudyTopic, setNewStudyTopic] = useState({});

    const [savedLinks, setSavedLinks] = useState(loadData('savedLinks', isOwner ? { workout: EXERCISE_VIDEOS, skincare: [], study: [], cooking: [] } : { workout: [], skincare: [], study: [], cooking: [] }));
    const [newLink, setNewLink] = useState({ title: '', url: '' });

    // ===== HISTORY =====
    const [history, setHistory] = useState(loadData('history', {}));
    const [historyDate, setHistoryDate] = useState(new Date().toISOString().split('T')[0]);
    const chatEnd = useRef(null);

    // Save everything
    useEffect(() => { document.documentElement.setAttribute('data-theme', theme); saveData('theme', theme); }, [theme]);
    useEffect(() => { saveData('schedule', schedule); }, [schedule]);
    useEffect(() => { saveData('goals', goals); }, [goals]);
    useEffect(() => { saveData('notes', notes); }, [notes]);
    useEffect(() => { saveData('savedLinks', savedLinks); }, [savedLinks]);
    useEffect(() => { saveData('mood', mood); }, [mood]);
    useEffect(() => { saveData('energy', energy); }, [energy]);
    useEffect(() => { saveData('chatMsgs', chatMsgs); }, [chatMsgs]);
    useEffect(() => { saveData('checklist', checklist); }, [checklist]);
    useEffect(() => { saveData('studyProgress', studyProgress); }, [studyProgress]);
    useEffect(() => { saveData('periodData', periodData); }, [periodData]);
    useEffect(() => { saveData('energyAdjusted', energyAdjusted); }, [energyAdjusted]);
    useEffect(() => { saveData('history', history); }, [history]);

    // Auto-save daily snapshot every 60 seconds
    useEffect(() => {
        const saveSnapshot = () => {
            const dateKey = new Date().toISOString().split('T')[0];
            const todayName = getTodayName();
            const todayTasks = schedule[todayName] || [];
            const snapshot = {
                date: dateKey, day: todayName, mood, energy,
                totalTasks: todayTasks.length,
                doneTasks: todayTasks.filter(t => t.done).length,
                doneTaskNames: todayTasks.filter(t => t.done).map(t => t.task),
                pendingTaskNames: todayTasks.filter(t => !t.done).map(t => t.task),
                goalsSnapshot: goals.map(g => ({ title: g.title, done: g.items.filter(i => i.done).length, total: g.items.length })),
                savedAt: new Date().toLocaleTimeString(),
            };
            setHistory(prev => ({ ...prev, [dateKey]: snapshot }));
        };
        saveSnapshot();
        const interval = setInterval(saveSnapshot, 60000);
        return () => clearInterval(interval);
    }, [schedule, goals, mood, energy]);

    // AUTO-ADJUST timetable when energy drops to <=3 or mood is unwell
    useEffect(() => {
        const today = getTodayName();
        const lowEnergyMoods = ['period', 'sick', 'tired', 'low', 'stressed'];
        if ((energy <= 3 || lowEnergyMoods.includes(mood)) && !energyAdjusted) {
            const tasks = [...(schedule[today] || [])];
            const adjusted = tasks.map(t => {
                const tl = t.task.toLowerCase();
                for (const [kw, rep] of Object.entries(LOW_ENERGY_REPLACEMENTS)) {
                    if (tl.includes(kw.toLowerCase())) return { ...t, task: `🌸 ${rep}` };
                }
                return t;
            });
            if (mood === 'period') {
                adjusted.push({ time: '08:00', task: '🌸 Period medicine + Hot water bag', category: 'health', done: false });
                adjusted.push({ time: '15:00', task: '🌸 Warm haldi doodh + Rest', category: 'meal', done: false });
                adjusted.sort((a, b) => a.time.localeCompare(b.time));
            }
            setSchedule(p => ({ ...p, [today]: adjusted }));
            setEnergyAdjusted(true);
        }
        // Reset the flag when energy goes back up AND mood is fine
        if (energy > 3 && !lowEnergyMoods.includes(mood) && energyAdjusted) {
            setEnergyAdjusted(false);
        }
    }, [energy, mood]);

    useEffect(() => {
        const tm = getTomorrowName();
        const fresh = genChecklist(schedule, tm);
        const old = loadData('checklist', []);
        setChecklist(fresh.map(i => { const o = old.find(x => x.text === i.text); return o ? { ...i, checked: o.checked } : i; }));
    }, [schedule]);

    useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMsgs]);

    const sendChat = () => { if (!chatInput.trim()) return; const r = aiRespond(chatInput, schedule, setSchedule, day, mood, energy, setMood, setEnergy); setChatMsgs(p => [...p, { role: 'user', content: chatInput }, { role: 'assistant', content: r }]); setChatInput(''); };
    const toggleTaskDone = (dk, i) => setSchedule(p => ({ ...p, [dk]: p[dk].map((t, j) => j === i ? { ...t, done: !t.done } : t) }));
    const toggleGoalItem = (gId, iId) => setGoals(p => p.map(g => g.id !== gId ? g : { ...g, items: g.items.map(i => i.id === iId ? { ...i, done: !i.done } : i) }));
    const addGoalItem = (gId) => { const t = goalItemTexts[gId]; if (!t?.trim()) return; setGoals(p => p.map(g => g.id !== gId ? g : { ...g, items: [...g.items, { id: gid(), text: t.trim(), done: false }] })); setGoalItemTexts(p => ({ ...p, [gId]: '' })); };
    const delGoalItem = (gId, iId) => setGoals(p => p.map(g => g.id !== gId ? g : { ...g, items: g.items.filter(i => i.id !== iId) }));
    const addNote = () => { if (!noteInput.trim()) return; setNotes(p => ({ ...p, [noteCat]: [...(p[noteCat] || []), { id: gid(), text: noteInput.trim() }] })); setNoteInput(''); };
    const delNote = (cat, id) => setNotes(p => ({ ...p, [cat]: (p[cat] || []).filter(n => n.id !== id) }));
    const addNoteCat = () => { if (!newNoteCat.trim()) return; const key = newNoteCat.toLowerCase().replace(/\s+/g, '_'); setNotes(p => ({ ...p, [key]: [] })); setNoteCat(key); setNewNoteCat(''); setShowModal(false); };

    const addLink = () => { if (!newLink.title.trim() || !newLink.url.trim()) return; setSavedLinks(p => ({ ...p, [planTab]: [...(p[planTab] || []), { title: newLink.title.trim(), url: newLink.url.trim() }] })); setNewLink({ title: '', url: '' }); };
    const delLink = (idx) => setSavedLinks(p => ({ ...p, [planTab]: p[planTab].filter((_, i) => i !== idx) }));

    const toggleCL = (id) => setChecklist(p => p.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
    const addGoalCat = () => { if (!newGoalCat.title.trim()) return; setGoals(p => [...p, { id: gid(), title: newGoalCat.title.trim(), icon: newGoalCat.icon, color: 'custom', items: [] }]); setNewGoalCat({ title: '', icon: '🎯' }); setShowModal(false); };
    const toggleSubtopic = (catKey, subId) => { setStudyProgress(p => ({ ...p, [catKey]: { ...p[catKey], subtopics: p[catKey].subtopics.map(s => s.id === subId ? { ...s, done: !s.done } : s) } })); };
    const addStudyTopic = (catKey) => { const text = newStudyTopic[catKey]; if (!text?.trim()) return; setStudyProgress(p => ({ ...p, [catKey]: { ...p[catKey], subtopics: [...p[catKey].subtopics, { id: gid(), text: text.trim(), done: false }] } })); setNewStudyTopic(p => ({ ...p, [catKey]: '' })); };
    const delStudyTopic = (catKey, subId) => { setStudyProgress(p => ({ ...p, [catKey]: { ...p[catKey], subtopics: p[catKey].subtopics.filter(s => s.id !== subId) } })); };

    // Period: log today (won't duplicate)
    const handleLogPeriod = () => { const updated = logNewPeriod(periodData); setPeriodData(updated); setMood('period'); setEnergy(3); };

    // Reset today to default
    const resetToday = () => { const today = getTodayName(); setSchedule(p => ({ ...p, [today]: [...DEFAULT_SCHEDULE[today]] })); setEnergyAdjusted(false); };

    const today = getTodayName(), tomorrow = getTomorrowName();
    const todaySched = schedule[day] || [];
    const doneGoalCount = goals.reduce((s, g) => s + g.items.filter(i => i.done).length, 0);
    const totalGoalCount = goals.reduce((s, g) => s + g.items.length, 0);
    const doneTaskCount = todaySched.filter(t => t.done).length;
    const overallStudy = calcOverallStudy(studyProgress);
    const periodPred = getPeriodPrediction(periodData);
    const showEnergyBanner = (energy <= 3 || ['period', 'sick', 'tired', 'low', 'stressed'].includes(mood)) && day === today;
    const showPeriodAlert = periodPred && periodPred.daysUntil >= 0 && periodPred.daysUntil <= 4;

    const NAV = [
        { id: 'dashboard', icon: '🏠', label: 'Dashboard' }, { id: 'timetable', icon: '📅', label: 'Timetable' },
        { id: 'plans', icon: '📋', label: 'My Plans' },
        { id: 'goals', icon: '🎯', label: 'Goals' }, { id: 'notes', icon: '📝', label: 'Notes' },
        { id: 'history', icon: '📊', label: 'History' },
        { id: 'period', icon: '🌸', label: 'Period Tracker' },
        { id: 'checklist', icon: '✅', label: 'Next Day Prep' }, { id: 'assistant', icon: '🤖', label: 'AI Assistant' },
    ];
    const EMOJIS = ['🎯', '📚', '💪', '🍳', '✨', '🧘', '🎨', '🎵', '🌱', '💻', '🏃', '🧠', '❤️', '🌟'];

    return (<>
        <div className="bg-gradient-orbs"><div className="bg-orb bg-orb-1" /><div className="bg-orb bg-orb-2" /><div className="bg-orb bg-orb-3" /></div>
        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>{sidebarOpen ? '✕' : '☰'}</button>
        <div className="app-container">
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header"><div className="sidebar-logo"><div className="sidebar-logo-icon">✦</div><span className="sidebar-logo-text">My Planner</span></div></div>
                <nav className="sidebar-nav">
                    <div className="nav-section-title">Account</div>
                    <div style={{ padding: '0 var(--space-4)', marginBottom: 'var(--space-3)' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>👤 {currentUser}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginBottom: '2px' }}>{userEmail}</div>
                        <button onClick={onLogout} style={{ fontSize: '0.7rem', color: 'var(--accent-400)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>🚪 Logout</button>
                    </div>

                    <div className="nav-section-title">Menu</div>
                    {NAV.map(n => (<button key={n.id} className={`nav-item ${section === n.id ? 'active' : ''}`} onClick={() => { setSection(n.id); setSidebarOpen(false); }}><span className="nav-item-icon">{n.icon}</span>{n.label}
                        {n.id === 'period' && showPeriodAlert && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff4d6d', marginLeft: 'auto', animation: 'pulseGlow 2s infinite' }} />}
                    </button>))}
                </nav>
                <div className="theme-toggle-container"><button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}><span className="theme-toggle-label">{theme === 'dark' ? '🌙 Dark' : '☀️ Light'}</span><div className={`theme-toggle-switch ${theme === 'light' ? 'active' : ''}`} /></button></div>
                {/* Period next date always in sidebar */}
                {periodPred && <div style={{ padding: '0 var(--space-6)', marginTop: 'var(--space-3)' }}><div className="card" style={{ padding: 'var(--space-3)', textAlign: 'center', borderColor: periodPred.daysUntil <= 4 ? 'rgba(255,77,109,0.3)' : 'var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>Next Period</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: periodPred.daysUntil <= 4 ? 'var(--accent-400)' : 'var(--primary-400)', margin: '2px 0' }}>{periodPred.nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>{periodPred.isOnPeriod ? `🩸 Day ${periodPred.daysSinceLast + 1}` : `${periodPred.daysUntil} days left`}</div>
                </div></div>}
                <div style={{ padding: '0 var(--space-6)', marginTop: 'var(--space-2)' }}><div className="card" style={{ padding: 'var(--space-3)', textAlign: 'center' }}><div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Mood: {mood ? MOOD_OPTIONS.find(m => m.value === mood)?.emoji : '—'} | Energy: {energy}/10</div></div></div>
            </aside>

            <main className="main-content">
                {/* DASHBOARD */}
                {section === 'dashboard' && (<>
                    <div className="page-header"><h1 className="page-title">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}! ☀️</h1><p className="page-subtitle">{today}, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p></div>

                    {showPeriodAlert && <div className="period-alert">🌸 {periodPred.isOnPeriod ? `Period day ${periodPred.daysSinceLast + 1}` : `Period in ${periodPred.daysUntil} day${periodPred.daysUntil !== 1 ? 's' : ''}`}! Next: <strong>{periodPred.nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</strong>
                        <button className="btn btn-ghost btn-sm" onClick={() => setSection('period')} style={{ marginLeft: 'auto', color: 'var(--accent-400)' }}>View →</button></div>}

                    {energyAdjusted && <div className="energy-banner low"><span>⚡ Schedule auto-adjusted for low energy / unwell mood</span><button className="energy-banner-btn" onClick={resetToday}>Reset to Default</button></div>}

                    <div className="mood-container">
                        <div className="mood-card"><div className="mood-question">How are you feeling?</div><div className="mood-options">{MOOD_OPTIONS.map(m => (<button key={m.value} className={`mood-btn ${mood === m.value ? 'selected' : ''}`} onClick={() => setMood(m.value)}><span className="mood-emoji">{m.emoji}</span><span className="mood-label">{m.label}</span></button>))}</div></div>
                        <div className="mood-card"><div className="mood-question">Energy Level? {energyAdjusted && <span style={{ fontSize: '0.65rem', color: 'var(--accent-400)' }}>⚡ Auto-adjusted</span>}</div><div className="energy-slider-container"><div className="energy-slider-labels"><span>🪫 Low</span><span>⚡ Med</span><span>🔥 High</span></div><input type="range" min="1" max="10" value={energy} onChange={e => setEnergy(parseInt(e.target.value))} className="energy-slider" /><div className="energy-value" style={{ color: energy <= 3 ? 'var(--accent-400)' : energy <= 6 ? 'var(--warning-400)' : 'var(--success-400)' }}>{energy}/10</div></div></div>
                    </div>

                    <div className="stats-row">
                        <div className="stat-card"><div className="stat-icon mood">{mood ? MOOD_OPTIONS.find(m => m.value === mood)?.emoji : '😊'}</div><div className="stat-info"><span className="stat-value">{mood ? MOOD_OPTIONS.find(m => m.value === mood)?.label : 'Not set'}</span><span className="stat-label">Mood</span></div></div>
                        <div className="stat-card"><div className="stat-icon energy">⚡</div><div className="stat-info"><span className="stat-value">{energy}/10</span><span className="stat-label">Energy</span></div></div>
                        <div className="stat-card"><div className="stat-icon tasks">📋</div><div className="stat-info"><span className="stat-value">{doneTaskCount}/{todaySched.length}</span><span className="stat-label">Tasks</span></div></div>
                        <div className="stat-card"><div className="stat-icon goals">🎯</div><div className="stat-info"><span className="stat-value">{Math.round(overallStudy)}%</span><span className="stat-label">Study</span></div></div>
                    </div>

                    <div className="dashboard-grid">
                        <div className="card"><div className="card-header"><h2 className="card-title">📅 Today</h2><button className="btn btn-ghost btn-sm" onClick={() => setSection('timetable')}>All →</button></div>
                            <div className="timetable-grid">{todaySched.slice(0, 6).map((s, i) => (<div key={i} className={`time-slot ${isCurrentSlot(s.time, todaySched[i + 1]?.time) && day === today ? 'current-time' : ''}`}><span className="time-slot-time">{to12h(s.time)}</span><span className={`time-slot-task ${s.done ? 'done-task' : ''}`}><span className={`task-badge badge-${s.category}`}>{s.category}</span>{s.task}</span><div className={`task-check ${s.done ? 'checked' : ''}`} onClick={() => toggleTaskDone(day, i)} /></div>))}{todaySched.length > 6 && <div style={{ padding: '4px 16px', color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>+{todaySched.length - 6} more...</div>}</div>
                        </div>
                        <div className="card"><div className="card-header"><h2 className="card-title">📊 Study</h2><button className="btn btn-ghost btn-sm" onClick={() => { setSection('plans'); setPlanTab('study'); }}>Details →</button></div>
                            <div style={{ marginBottom: '8px' }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}><span>Overall</span><span style={{ color: 'var(--primary-400)', fontWeight: 700 }}>{overallStudy}%</span></div><div className="progress-bar"><div className="progress-fill" style={{ width: `${overallStudy}%` }} /></div></div>
                            {Object.entries(studyProgress).slice(0, 5).map(([k, v]) => { const p = calcStudyProgress(v); return (<div key={k} style={{ marginBottom: '5px' }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.73rem', color: 'var(--text-secondary)' }}><span>{v.icon} {v.label}</span><span>{p}%</span></div><div className="progress-bar"><div className="progress-fill blue" style={{ width: `${p}%` }} /></div></div>); })}
                        </div>
                    </div>
                </>)}

                {/* TIMETABLE */}
                {section === 'timetable' && (<>
                    <div className="page-header"><h1 className="page-title">📅 Timetable</h1><p className="page-subtitle">Auto-adjusts your schedule based on your mood & energy</p></div>
                    <div className="day-tabs">{DAYS_OF_WEEK.map(d => (<button key={d} className={`day-tab ${day === d ? 'active' : ''} ${d === today ? 'today' : ''}`} onClick={() => setDay(d)}>{d}</button>))}</div>
                    {energyAdjusted && day === today && <div className="energy-banner low"><span>⚡ Auto-adjusted for low energy / unwell mood</span><button className="energy-banner-btn" onClick={resetToday}>Reset</button></div>}
                    <div className="card"><div className="card-header"><h2 className="card-title">{day === today ? '🟢 ' : ''}{day}</h2><div className="schedule-actions"><span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{todaySched.filter(t => t.done).length}/{todaySched.length}</span><button className="edit-schedule-btn" onClick={() => setSection('assistant')}>🤖 AI</button></div></div>
                        <div className="timetable-grid">{todaySched.map((s, i) => (<div key={i} className={`time-slot ${isCurrentSlot(s.time, todaySched[i + 1]?.time) && day === today ? 'current-time' : ''}`}><span className="time-slot-time">{to12h(s.time)}</span><span className={`time-slot-task ${s.done ? 'done-task' : ''}`}><span className={`task-badge badge-${s.category}`}>{s.category}</span>{s.task}</span><div className={`task-check ${s.done ? 'checked' : ''}`} onClick={() => toggleTaskDone(day, i)} /></div>))}</div>
                    </div>
                </>)}

                {/* MY PLANS — Combined Workout + Skincare + Study */}
                {section === 'plans' && (<>
                    <div className="page-header"><h1 className="page-title">📋 My Plans</h1><p className="page-subtitle">Workout, Skincare & Study – all in one place</p></div>
                    <div className="day-tabs" style={{ marginBottom: 'var(--space-4)' }}>
                        <button className={`day-tab ${planTab === 'workout' ? 'active' : ''}`} onClick={() => setPlanTab('workout')}>💪 Workout</button>
                        <button className={`day-tab ${planTab === 'skincare' ? 'active' : ''}`} onClick={() => setPlanTab('skincare')}>✨ Skincare</button>
                        <button className={`day-tab ${planTab === 'study' ? 'active' : ''}`} onClick={() => setPlanTab('study')}>📊 Study</button>
                        <button className={`day-tab ${planTab === 'cooking' ? 'active' : ''}`} onClick={() => setPlanTab('cooking')}>🍳 Cooking</button>
                    </div>

                    {planTab === 'workout' && (<>
                        <div className="workout-grid">{Object.values(WORKOUT_PLANS).map((wp, i) => (<div key={i} className="workout-card"><div className="workout-card-title">{wp.title}</div>{wp.items.map((item, j) => <div key={j} className="workout-item">{item}</div>)}</div>))}</div>
                        <div className="card" style={{ marginTop: 'var(--space-4)' }}><h3 className="card-title">🏃‍♀️ Running Targets</h3><div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>{['800m × 3', '400m × 5', '1200m × 2', '1600m', '4 km'].map((r, i) => (<div key={i} style={{ padding: '6px 14px', background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.83rem', fontWeight: 600 }}>{r}</div>))}</div></div>
                        <div className="card" style={{ marginTop: 'var(--space-4)' }}><h3 className="card-title">📋 Daily Targets</h3><div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginTop: '8px' }}>• Steps: 8,000-10,000/day • Protein: 60-80g/day • Sleep: 6-6.5 hrs • No crash dieting</div></div>
                    </>)}

                    {planTab === 'skincare' && (<>
                        <div className="skincare-grid">{DAYS_OF_WEEK.map(d => (<div key={d} className={`skincare-day-card ${d === today ? 'today-skin' : ''}`}><div className="skincare-day-name">{d === today ? `🟢 ${d} (Today)` : d}</div><div className="skincare-row"><span className="skincare-row-label">AM</span><span>{SKINCARE_WEEKLY[d].am}</span></div><div className="skincare-row"><span className="skincare-row-label">PM</span><span>{SKINCARE_WEEKLY[d].pm}</span></div><div className="skincare-row"><span className="skincare-row-label">Night</span><span>{SKINCARE_WEEKLY[d].night}</span></div><div className="skincare-row"><span className="skincare-row-label" style={{ color: 'var(--accent-400)' }}>Special</span><span>{SKINCARE_WEEKLY[d].special}</span></div></div>))}</div>
                        <div className="card" style={{ marginTop: 'var(--space-4)' }}><h3 className="card-title">⚠️ Rules</h3><div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginTop: '8px' }}>• No daily harsh scrubs • No lemon+sugar daily • Patch test 24 hrs • If irritation: stop actives 5-7 days • Sunscreen SPF 30+ EVERY morning</div></div>
                    </>)}

                    {planTab === 'study' && (<>
                        <div className="card" style={{ marginBottom: 'var(--space-4)' }}><div className="card-header"><h2 className="card-title">🏆 Overall</h2><span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-400)' }}>{overallStudy}%</span></div><div className="progress-bar" style={{ height: '10px' }}><div className="progress-fill" style={{ width: `${overallStudy}%`, height: '10px' }} /></div></div>
                        <div className="study-progress-grid">
                            {Object.entries(studyProgress).map(([k, v]) => {
                                const p = calcStudyProgress(v); const d = v.subtopics.filter(s => s.done).length; return (<div key={k} className="study-progress-card">
                                    <div className="study-progress-header"><span className="study-progress-label">{v.icon} {v.label}</span><span style={{ fontSize: '0.85rem', fontWeight: 700, color: p === 100 ? 'var(--success-400)' : 'var(--primary-400)' }}>{p}%</span></div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '6px' }}>{d}/{v.subtopics.length} done</div>
                                    <div className="progress-bar"><div className={`progress-fill ${p === 100 ? '' : 'blue'}`} style={{ width: `${p}%` }} /></div>
                                    <div className="study-subtopics">
                                        {v.subtopics.map(s => (<span key={s.id} className={`study-subtopic ${s.done ? 'done-subtopic' : ''}`} onClick={() => toggleSubtopic(k, s.id)} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>{s.done && <span>✓</span>}{s.text}<span onClick={(e) => { e.stopPropagation(); delStudyTopic(k, s.id); }} style={{ marginLeft: '4px', opacity: 0.4, fontSize: '0.85em' }}>✕</span></span>))}
                                    </div>
                                    <div className="add-note-form" style={{ marginTop: '10px' }}>
                                        <input className="add-goal-input" placeholder="Add topic (e.g. OOPs)..." value={newStudyTopic[k] || ''} onChange={e => setNewStudyTopic(p => ({ ...p, [k]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addStudyTopic(k)} />
                                    </div>
                                </div>);
                            })}
                        </div>
                    </>)}

                    {planTab === 'cooking' && (<>
                        <div className="workout-grid">{Object.values(COOKING_PLANS).map((cp, i) => (
                            <div key={i} className="workout-card">
                                <div className="workout-card-title" style={{ color: 'var(--warning-400)' }}>{cp.title}</div>
                                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--info-400)', margin: '6px 0 2px' }}>🍳 Breakfast (choose 1):</div>
                                {cp.breakfast.map((b, j) => <div key={j} className="workout-item">• {b}</div>)}
                                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--success-400)', margin: '6px 0 2px' }}>🍞 Lunch:</div>
                                <div className="workout-item">{cp.lunch}</div>
                                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-300)', margin: '6px 0 2px' }}>🌙 Dinner:</div>
                                <div className="workout-item">{cp.dinner}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--accent-400)', marginTop: '8px', fontStyle: 'italic' }}>📚 Learn: {cp.learn}</div>
                            </div>
                        ))}</div>

                        <div className="card" style={{ marginTop: 'var(--space-4)' }}>
                            <div className="card-header"><h2 className="card-title">🤒 Illness / Period Plan</h2></div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
                                <div><div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--info-400)', marginBottom: '4px' }}>🍳 Breakfast</div>{COOKING_ILLNESS_PLAN.breakfast.map((b, i) => <div key={i} style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>• {b}</div>)}</div>
                                <div><div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--success-400)', marginBottom: '4px' }}>🍲 Lunch / Dinner</div>{COOKING_ILLNESS_PLAN.meals.map((m, i) => <div key={i} style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>• {m}</div>)}</div>
                                <div><div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--warning-400)', marginBottom: '4px' }}>🍪 Snacks</div>{COOKING_ILLNESS_PLAN.snacks.map((s, i) => <div key={i} style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>• {s}</div>)}</div>
                            </div>
                        </div>

                        <div className="card" style={{ marginTop: 'var(--space-4)' }}>
                            <div className="card-header"><h2 className="card-title">🚩 Cooking Skills Roadmap</h2></div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
                                {COOKING_ROADMAP.map((r, i) => (
                                    <div key={i} style={{ padding: 'var(--space-3)', background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-300)', marginBottom: '4px' }}>{r.month}: {r.title}</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>{r.items.map((item, j) => <span key={j} style={{ padding: '2px 8px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', fontSize: '0.73rem', color: 'var(--text-secondary)' }}>{item}</span>)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="card" style={{ marginTop: 'var(--space-4)' }}>
                            <h3 className="card-title">⚖️ Weekday Rules</h3>
                            <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginTop: '8px' }}>• Breakfast ≤ 10 min • Lunch = simple tiffin (dal/sabzi/curd/salad) • Dinner = main meal + roti if wanted • High protein + low oil + portion control • Sat/Sun = learn new recipes + weekly prep</div>
                        </div>
                    </>)}

                    <div className="card" style={{ marginTop: 'var(--space-4)' }}>
                        <div className="card-header"><h2 className="card-title">🔗 {planTab === 'study' || planTab === 'cooking' ? 'Blogs & Reference' : 'Videos'} ({planTab})</h2></div>
                        <div className="video-grid">
                            {(savedLinks[planTab] || []).length === 0 ? <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>No links saved for {planTab} yet. Add a YouTube or blog URL below.</p> : null}
                            {(savedLinks[planTab] || []).map((v, i) => (
                                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <a href={v.url} target="_blank" rel="noopener noreferrer" className="video-link" style={{ flex: 1, margin: 0 }}>▶️ {v.title} {v.sets && `(${v.sets})`}</a>
                                    <button onClick={() => delLink(i)} style={{ color: 'var(--accent-400)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '0 8px' }}>✕</button>
                                </div>
                            ))}
                        </div>
                        <div className="add-note-form" style={{ marginTop: 'var(--space-4)' }}>
                            <input className="add-note-input" style={{ width: '30%' }} placeholder="Title / Name..." value={newLink.title} onChange={e => setNewLink({ ...newLink, title: e.target.value })} />
                            <input className="add-note-input" style={{ flex: 1 }} placeholder="https://youtube.com/..." value={newLink.url} onChange={e => setNewLink({ ...newLink, url: e.target.value })} onKeyDown={e => e.key === 'Enter' && addLink()} />
                            <button className="btn btn-primary" onClick={addLink}>Add Link</button>
                        </div>
                    </div>
                </>)}

                {/* GOALS */}
                {section === 'goals' && (<>
                    <div className="page-header"><h1 className="page-title">🎯 Goals</h1></div>
                    <div className="goals-grid">
                        {goals.map(g => {
                            const d = g.items.filter(i => i.done).length, t = g.items.length, p = t > 0 ? (d / t) * 100 : 0;
                            return (<div key={g.id} className={`goal-card goal-${g.color}`}>
                                <div><div className="goal-icon">{g.icon}</div><h3 className="goal-title">{g.title}</h3></div>
                                <div style={{ fontSize: '0.73rem', color: 'var(--text-tertiary)', marginBottom: '3px' }}>{d}/{t} done</div>
                                <div className="progress-bar" style={{ marginBottom: '8px' }}><div className="progress-fill" style={{ width: `${p}%` }} /></div>
                                <div className="goal-items">{g.items.map(i => (<div key={i.id} className={`goal-item ${i.done ? 'completed' : ''}`}><div className={`goal-checkbox ${i.done ? 'checked' : ''}`} onClick={() => toggleGoalItem(g.id, i.id)} /><span className="goal-item-text" style={{ flex: 1 }}>{i.text}</span><button className="note-delete-btn" onClick={() => delGoalItem(g.id, i.id)} style={{ opacity: 0.4 }}>✕</button></div>))}</div>
                                <div className="add-note-form" style={{ marginTop: '6px' }}><input className="add-goal-input" placeholder="Add item..." value={goalItemTexts[g.id] || ''} onChange={e => setGoalItemTexts(p => ({ ...p, [g.id]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addGoalItem(g.id)} /></div>
                            </div>);
                        })}
                        <button className="add-goal-category" onClick={() => { setModalType('goal'); setShowModal(true); }}><span className="plus-icon">+</span><span className="add-text">Add Category</span></button>
                    </div>
                </>)}

                {/* NOTES */}
                {section === 'notes' && (<>
                    <div className="page-header"><h1 className="page-title">📝 Notes & Reminders</h1><p className="page-subtitle">Grocery, medicines, meals, weight log, rules & more</p></div>
                    <div className="card"><div className="card-header"><div className="notes-categories">{Object.keys(notes).map(c => (<button key={c} className={`note-category-tab ${noteCat === c ? 'active' : ''}`} onClick={() => setNoteCat(c)}>{c.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</button>))}<button className="note-category-tab" onClick={() => { setModalType('noteCat'); setShowModal(true); }} style={{ borderStyle: 'dashed' }}>+ Add</button></div></div>
                        {(notes[noteCat] || []).length === 0 ? <div className="empty-state"><p>No notes yet.</p></div> : (notes[noteCat] || []).map(n => (<div key={n.id} className="note-item"><div className="note-bullet" /><span className="note-text">{n.text}</span><button className="note-delete-btn" onClick={() => delNote(noteCat, n.id)}>✕</button></div>))}
                        <div className="add-note-form"><input className="add-note-input" placeholder="Add note..." value={noteInput} onChange={e => setNoteInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addNote()} /><button className="btn btn-primary" onClick={addNote}>Add</button></div>
                    </div>
                </>)}

                {/* PERIOD TRACKER — FIXED: always shows next date */}
                {section === 'period' && (<>
                    <div className="page-header"><h1 className="page-title">🌸 Period Tracker</h1><p className="page-subtitle">Reminders 3-4 days before, auto-adjusts schedule</p></div>

                    {/* ALWAYS SHOW NEXT PERIOD DATE AT TOP */}
                    {periodPred && <div className="card" style={{ marginBottom: 'var(--space-4)', textAlign: 'center', border: periodPred.daysUntil <= 4 ? '1px solid rgba(255,77,109,0.3)' : '' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>📅 Your Next Period</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-400)' }}>{periodPred.nextDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            {periodPred.isOnPeriod ? `🩸 You're on day ${periodPred.daysSinceLast + 1} of ${periodData.periodDuration}` :
                                periodPred.daysUntil <= 0 ? '📅 Period may have started – log if it did!' :
                                    `${periodPred.daysUntil} days away`}
                        </div>
                        {periodPred.daysUntil <= 4 && periodPred.daysUntil > 0 && <div className="period-alert" style={{ marginTop: 'var(--space-3)' }}>⚠️ <strong>Prepare:</strong> pads, hot water bag, haldi doodh, medicine, comfortable clothes</div>}
                    </div>}

                    <div className="period-tracker">
                        <div className="period-card">
                            <h3 className="period-card-title">📝 Settings</h3>
                            <div className="period-input-group"><label className="period-input-label">Last period start date</label><input type="date" className="period-input" value={periodData.lastPeriodDate || ''} onChange={e => setPeriodData(p => ({ ...p, lastPeriodDate: e.target.value }))} /></div>
                            <div className="period-input-group"><label className="period-input-label">Cycle length (days between periods)</label><input type="number" className="period-input" value={periodData.cycleLength} min={20} max={45} onChange={e => setPeriodData(p => ({ ...p, cycleLength: parseInt(e.target.value) || 28 }))} /></div>
                            <div className="period-input-group"><label className="period-input-label">Period duration (days)</label><input type="number" className="period-input" value={periodData.periodDuration} min={2} max={10} onChange={e => setPeriodData(p => ({ ...p, periodDuration: parseInt(e.target.value) || 5 }))} /></div>
                            <button className="period-log-btn" onClick={handleLogPeriod}>🩸 Log: My Period Started Today</button>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '8px', padding: '8px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                                💡 <strong>Note:</strong> Set your recent period date above to see your next prediction. When your new period arrives, click "Log: My Period Started Today".
                            </div>

                            {/* Logged info summary */}
                            {periodData.lastPeriodDate && (<div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>📋 Current Data</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                                    • Last period: <strong>{new Date(periodData.lastPeriodDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong><br />
                                    • Cycle: <strong>{periodData.cycleLength} days</strong> | Duration: <strong>{periodData.periodDuration} days</strong><br />
                                    {periodPred && <>• Next expected: <strong style={{ color: 'var(--accent-400)' }}>{periodPred.nextDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong><br />
                                        • Days until next: <strong>{periodPred.daysUntil > 0 ? periodPred.daysUntil : 'Now'}</strong></>}
                                </div>
                            </div>)}

                            {periodData.history.length > 0 && (<><h4 style={{ marginTop: 'var(--space-4)', fontSize: '0.85rem', fontWeight: 700 }}>📅 Past Cycles</h4><div className="period-history">{periodData.history.slice().reverse().map((h, i) => (<div key={i} className="period-history-item"><span>{new Date(h.startDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span><span>{h.cycleLength} day cycle</span></div>))}</div></>)}
                        </div>
                        <div className="period-card">
                            <h3 className="period-card-title">🌸 Period Day Tips</h3>
                            {periodPred?.isOnPeriod && <div className="period-alert" style={{ marginBottom: 'var(--space-4)', background: 'rgba(139, 61, 255, 0.08)', borderColor: 'rgba(139, 61, 255, 0.15)', color: 'var(--primary-300)' }}>🌸 <strong>Period Day {periodPred.daysSinceLast + 1}</strong> – Schedule was auto-adjusted. Rest well!</div>}
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.9 }}>
                                • Replace running/gym with light yoga/walk<br />
                                • Hot water bag for cramps<br />
                                • Warm haldi doodh helps<br />
                                • Take all medicines on time<br />
                                • Skip heavy lifting – rest is okay<br />
                                • Comfortable loose clothes<br />
                                • Keep pads/essentials ready<br />
                                • Schedule auto-adjusts for low energy or unwell/tired moods
                            </div>
                            <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                                💡 <strong>How it works:</strong> Set your mood to unwell / tired / period, or slide energy to 3 or below → your timetable automatically replaces intense exercise with gentle alternatives and adds warm drinks + medicine reminders.
                            </div>
                        </div>
                    </div>
                </>)}

                {/* HISTORY */}
                {section === 'history' && (<>
                    <div className="page-header"><h1 className="page-title">📊 Daily History</h1><p className="page-subtitle">See what you did on any past day</p></div>
                    <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Select Date:</label>
                            <input type="date" value={historyDate} onChange={e => setHistoryDate(e.target.value)} style={{ padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '0.85rem' }} />
                            <button className="btn btn-ghost btn-sm" onClick={() => { const d = new Date(historyDate); d.setDate(d.getDate() - 1); setHistoryDate(d.toISOString().split('T')[0]); }}>◀ Prev</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => { const d = new Date(historyDate); d.setDate(d.getDate() + 1); setHistoryDate(d.toISOString().split('T')[0]); }}>Next ▶</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setHistoryDate(new Date().toISOString().split('T')[0])}>Today</button>
                        </div>
                    </div>
                    {(() => {
                        const snap = history[historyDate];
                        if (!snap) return <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}><div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>💭</div><p style={{ color: 'var(--text-tertiary)' }}>No history saved for this date.<br />History is automatically saved as you use the app each day.</p></div>;
                        return (<>
                            <div className="stats-row" style={{ marginBottom: 'var(--space-4)' }}>
                                <div className="stat-card"><div className="stat-icon mood">{MOOD_OPTIONS.find(m => m.value === snap.mood)?.emoji || '—'}</div><div className="stat-info"><span className="stat-value">{snap.mood || 'N/A'}</span><span className="stat-label">Mood</span></div></div>
                                <div className="stat-card"><div className="stat-icon energy">⚡</div><div className="stat-info"><span className="stat-value">{snap.energy}/10</span><span className="stat-label">Energy</span></div></div>
                                <div className="stat-card"><div className="stat-icon tasks">📋</div><div className="stat-info"><span className="stat-value">{snap.doneTasks}/{snap.totalTasks}</span><span className="stat-label">Tasks Done</span></div></div>
                                <div className="stat-card"><div className="stat-icon goals">📅</div><div className="stat-info"><span className="stat-value">{snap.day}</span><span className="stat-label">{new Date(historyDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></div></div>
                            </div>
                            <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                                <h3 className="card-title">✅ Completed Tasks ({snap.doneTasks})</h3>
                                <div style={{ marginTop: 'var(--space-2)' }}>
                                    {snap.doneTaskNames.length === 0 ? <p style={{ color: 'var(--text-tertiary)', fontSize: '0.83rem' }}>No tasks were completed this day.</p> : snap.doneTaskNames.map((t, i) => <div key={i} style={{ padding: '4px 0', fontSize: '0.83rem', color: 'var(--success-400)', borderBottom: '1px solid var(--border-subtle)' }}>✓ {t}</div>)}
                                </div>
                            </div>
                            <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                                <h3 className="card-title">⏳ Pending Tasks ({snap.pendingTaskNames.length})</h3>
                                <div style={{ marginTop: 'var(--space-2)' }}>
                                    {snap.pendingTaskNames.length === 0 ? <p style={{ color: 'var(--text-tertiary)', fontSize: '0.83rem' }}>All tasks were completed! 🎉</p> : snap.pendingTaskNames.map((t, i) => <div key={i} style={{ padding: '4px 0', fontSize: '0.83rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>○ {t}</div>)}
                                </div>
                            </div>
                            {snap.goalsSnapshot && snap.goalsSnapshot.length > 0 && <div className="card">
                                <h3 className="card-title">🎯 Goals Progress (as of {historyDate})</h3>
                                <div style={{ marginTop: 'var(--space-2)' }}>
                                    {snap.goalsSnapshot.map((g, i) => { const pct = g.total > 0 ? Math.round((g.done / g.total) * 100) : 0; return <div key={i} style={{ marginBottom: '8px' }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem' }}><span>{g.title}</span><span style={{ fontWeight: 700, color: 'var(--primary-400)' }}>{g.done}/{g.total} ({pct}%)</span></div><div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div></div>; })}
                                </div>
                            </div>}
                            <div style={{ marginTop: 'var(--space-3)', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Last saved at: {snap.savedAt}</div>
                        </>);
                    })()}
                </>)}

                {/* CHECKLIST */}
                {section === 'checklist' && (<>
                    <div className="page-header"><h1 className="page-title">✅ Next Day Prep</h1><p className="page-subtitle">What to prepare for {tomorrow}</p></div>
                    <div className="card"><div className="card-header"><h2 className="card-title">📆 {tomorrow}</h2></div>
                        {checklist.length === 0 ? <div className="empty-state"><p>🎉 No special items!</p></div> :
                            <div className="checklist-container">{checklist.map(i => (<div key={i.id} className={`checklist-item ${i.checked ? 'checked-item' : ''}`}><div className={`checklist-checkbox ${i.checked ? 'checked' : ''}`} onClick={() => toggleCL(i.id)} /><div style={{ flex: 1 }}><span className="checklist-text">{i.text}</span><div className="checklist-reason">{i.reason}</div></div></div>))}</div>}
                    </div>
                </>)}

                {/* AI ASSISTANT */}
                {section === 'assistant' && (<>
                    <div className="page-header"><h1 className="page-title">🤖 AI Assistant</h1><p className="page-subtitle">Edit {day} schedule</p></div>
                    <div className="day-tabs" style={{ marginBottom: '10px' }}>{DAYS_OF_WEEK.map(d => (<button key={d} className={`day-tab ${day === d ? 'active' : ''} ${d === today ? 'today' : ''}`} onClick={() => setDay(d)}>{d}</button>))}</div>
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}><div className="chat-container"><div className="chat-messages">
                        {chatMsgs.map((m, i) => (<div key={i} className={`chat-message ${m.role}`}><div className="chat-avatar">{m.role === 'assistant' ? '🤖' : '👤'}</div><div className="chat-bubble">{m.content.split('\n').map((l, j) => <div key={j} style={{ minHeight: l ? 'auto' : '6px' }}>{l}</div>)}</div></div>))}
                        <div ref={chatEnd} /></div>
                        <div className="chat-input-container"><input className="chat-input" placeholder="Add gym at 6:30 PM, I have hospital, period..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} /><button className="chat-send-btn" onClick={sendChat}>➤</button></div>
                    </div></div>
                </>)}
            </main>
        </div>

        {/* MODALS */}
        {showModal && (<div className="modal-overlay" onClick={() => setShowModal(false)}><div className="modal" onClick={e => e.stopPropagation()}>
            {modalType === 'goal' && (<><h3 className="modal-title">Add Goal Category</h3><div className="modal-field"><label className="modal-label">Name</label><input className="modal-input" placeholder="e.g. Fitness, Reading..." value={newGoalCat.title} onChange={e => setNewGoalCat(p => ({ ...p, title: e.target.value }))} /></div><div className="modal-field"><label className="modal-label">Icon</label><div className="emoji-picker">{EMOJIS.map(e => <button key={e} className={`emoji-option ${newGoalCat.icon === e ? 'selected' : ''}`} onClick={() => setNewGoalCat(p => ({ ...p, icon: e }))}>{e}</button>)}</div></div><div className="modal-actions"><button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={addGoalCat}>Create</button></div></>)}
            {modalType === 'noteCat' && (<><h3 className="modal-title">Add Note Category</h3><div className="modal-field"><label className="modal-label">Name</label><input className="modal-input" placeholder="e.g. Recipes, Ideas..." value={newNoteCat} onChange={e => setNewNoteCat(e.target.value)} onKeyDown={e => e.key === 'Enter' && addNoteCat()} /></div><div className="modal-actions"><button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={addNoteCat}>Create</button></div></>)}
        </div></div>)}
    </>);
}


function App() {
    const [currentUser, setCurrentUser] = useState(localStorage.getItem('currentUser') || '');
    const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');

    const handleLogin = (name, email) => {
        const trimName = name.trim();
        const trimEmail = email.trim().toLowerCase();
        if (!trimName || !trimEmail) return;
        localStorage.setItem('currentUser', trimName);
        localStorage.setItem('userEmail', trimEmail);
        setCurrentUser(trimName);
        setUserEmail(trimEmail);
    };

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userEmail');
        setCurrentUser('');
        setUserEmail('');
    };

    if (!currentUser || !userEmail) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
                <div className="bg-gradient-orbs"><div className="bg-orb bg-orb-1" /><div className="bg-orb bg-orb-2" /><div className="bg-orb bg-orb-3" /></div>
                <LoginForm onLogin={handleLogin} />
            </div>
        );
    }
    return <MainApp key={userEmail} currentUser={currentUser} userEmail={userEmail} onLogout={handleLogout} />;
}

// Extracted Login component for cleaner architecture
function LoginForm({ onLogin }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const submit = () => onLogin(name, email);

    return (
        <div className="card" style={{ maxWidth: '420px', width: '90%', padding: 'var(--space-8)', zIndex: 10, textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-3)' }}>✦</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>Welcome to My Planner</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-5)', fontSize: '0.88rem' }}>Log in with your email to access your personalised schedule.</p>
            <input className="modal-input" placeholder="Your name (e.g. Bhumika Jain)" value={name} onChange={e => setName(e.target.value)} style={{ marginBottom: 'var(--space-3)', width: '100%' }} />
            <input className="modal-input" type="email" placeholder="Email (e.g. bhumikajain.work@gmail.com)" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} style={{ marginBottom: 'var(--space-4)', width: '100%' }} />
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={submit}>Login / Start</button>
            <div style={{ marginTop: 'var(--space-4)', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                New users are directed to the AI assistant to create their custom schedule.<br />
                Your data is saved locally and scoped to your email.
            </div>
        </div>
    );
}

export default App;
