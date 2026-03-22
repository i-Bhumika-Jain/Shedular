import { TASK_REQUIREMENTS, LOW_ENERGY_REPLACEMENTS, DEFAULT_SCHEDULE } from './data';

export const getTodayName = () => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
export const getTomorrowName = () => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][(new Date().getDay() + 1) % 7];
export const getCurrentTime = () => `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;
export const isCurrentSlot = (t, next) => { const now = getCurrentTime(); return next ? now >= t && now < next : now >= t; };
export const gid = () => Math.random().toString(36).substr(2, 9);

export const to12h = (t) => {
    const [h, m] = t.split(':').map(Number);
    return `${h === 0 ? 12 : h > 12 ? h - 12 : h}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

export const load = (k, d) => { try { const s = localStorage.getItem(k); return s ? JSON.parse(s) : d; } catch { return d; } };
export const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { console.warn(e); } };

export const genChecklist = (sched, day) => {
    const tasks = sched[day] || [], items = [], added = new Set();
    tasks.forEach(slot => {
        const tl = slot.task.toLowerCase();
        Object.entries(TASK_REQUIREMENTS).forEach(([kw, reqs]) => {
            if (tl.includes(kw)) reqs.forEach(r => {
                if (!added.has(r)) { added.add(r); items.push({ id: gid(), text: r, checked: false, reason: `For: ${slot.task.slice(0, 35)}` }); }
            });
        });
    });
    return items;
};

// ===== PERIOD TRACKER (FIXED - no resets, proper persistence) =====
export const getPeriodPrediction = (pd) => {
    if (!pd || !pd.lastPeriodDate) return null;
    const last = new Date(pd.lastPeriodDate + 'T00:00:00');
    const next = new Date(last); next.setDate(next.getDate() + pd.cycleLength);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const daysUntil = Math.ceil((next - today) / (1000 * 60 * 60 * 24));
    const daysSinceLast = Math.ceil((today - last) / (1000 * 60 * 60 * 24));
    const isOnPeriod = daysSinceLast >= 0 && daysSinceLast < pd.periodDuration;
    const periodEndDate = new Date(last); periodEndDate.setDate(periodEndDate.getDate() + pd.periodDuration);
    return { nextDate: next, daysUntil, isOnPeriod, lastDate: last, daysSinceLast, periodEndDate };
};

export const logNewPeriod = (periodData) => {
    const today = new Date().toISOString().split('T')[0];
    // Don't log if same date already logged
    if (periodData.lastPeriodDate === today) return periodData;
    const hist = [...(periodData.history || [])];
    if (periodData.lastPeriodDate) {
        const daysBetween = Math.round((new Date(today) - new Date(periodData.lastPeriodDate)) / (1000 * 60 * 60 * 24));
        if (daysBetween > 0) {
            hist.push({ startDate: periodData.lastPeriodDate, cycleLength: daysBetween, endDate: null });
        }
    }
    // Calculate average cycle from history (only valid entries > 15 days)
    const validHist = hist.filter(h => h.cycleLength > 15 && h.cycleLength < 50);
    const avgCycle = validHist.length > 0 ? Math.round(validHist.reduce((s, h) => s + h.cycleLength, 0) / validHist.length) : periodData.cycleLength;
    return { ...periodData, lastPeriodDate: today, cycleLength: avgCycle, history: hist.slice(-12) };
};

// ===== STUDY PROGRESS CALCULATOR =====
export const calcStudyProgress = (category) => {
    if (!category.subtopics || category.subtopics.length === 0) return 0;
    const done = category.subtopics.filter(s => s.done).length;
    return Math.round((done / category.subtopics.length) * 100);
};

export const calcOverallStudy = (sp) => {
    const vals = Object.values(sp);
    if (vals.length === 0) return 0;
    return Math.round(vals.reduce((s, v) => s + calcStudyProgress(v), 0) / vals.length);
};

// ===== AI RESPONSE ENGINE =====
export const aiRespond = (msg, schedule, setSchedule, day, mood, energy, setMood, setEnergy) => {
    const ml = msg.toLowerCase();

    if (ml.includes('hospital') || ml.includes('doctor') || ml.includes('sick') || ml.includes('emergency')) {
        const newSched = { ...schedule };
        const tasks = [...(newSched[day] || [])];
        const adjusted = tasks.map(t => {
            if (t.category === 'work') return { ...t, task: '🏥 Skip – Hospital Visit', category: 'rest' };
            if (t.category === 'study') return { ...t, task: '🏥 Rest – Take care', category: 'rest' };
            if (t.category === 'health' && (t.task.toLowerCase().includes('run') || t.task.toLowerCase().includes('park') || t.task.toLowerCase().includes('workout')))
                return { ...t, task: '🏥 Rest – No exercise today', category: 'rest' };
            return t;
        });
        let ht = '10:00';
        const tm = ml.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)/i);
        if (tm) { let h = parseInt(tm[1]); const m = tm[2] || '00', p = (tm[3] || '').toLowerCase(); if (p === 'pm' && h < 12) h += 12; if (p === 'am' && h === 12) h = 0; ht = `${String(h).padStart(2, '0')}:${m}`; }
        adjusted.push({ time: ht, task: '🏥 Hospital/Doctor Visit', category: 'selfcare', done: false });
        adjusted.sort((a, b) => a.time.localeCompare(b.time));
        newSched[day] = adjusted; setSchedule(newSched);
        return `🏥 Adjusted ${day}!\n• Removed work & exercise\n• Hospital at ${to12h(ht)}\n• Kept meals/skincare\n\nUndo: "reset schedule"`;
    }

    if (ml.includes('period') || ml.includes('cramp') || ml.match(/low energy|exhausted|weak|cant run|can't run/)) {
        const newSched = { ...schedule };
        const adjusted = [...(newSched[day] || [])].map(t => {
            const tl = t.task.toLowerCase();
            for (const [kw, rep] of Object.entries(LOW_ENERGY_REPLACEMENTS)) { if (tl.includes(kw.toLowerCase())) return { ...t, task: `🌸 ${rep}` }; }
            return t;
        });
        if (ml.includes('period') || ml.includes('cramp')) {
            adjusted.push({ time: '08:00', task: '🌸 Period medicine + Hot water bag', category: 'health', done: false });
            adjusted.push({ time: '15:00', task: '🌸 Warm haldi doodh + Rest', category: 'meal', done: false });
            adjusted.sort((a, b) => a.time.localeCompare(b.time));
        }
        newSched[day] = adjusted; setSchedule(newSched);
        if (ml.includes('period')) setMood('period');
        setEnergy(Math.min(energy, 3));
        return `🌸 Adjusted ${day}!\n• Gentle alternatives for exercise\n• Added hot water bag & haldi doodh\n\nReset: "reset schedule"`;
    }

    if (ml.includes('reschedule') && ml.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i)) {
        const dm = ml.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
        const targetDay = dm[1].charAt(0).toUpperCase() + dm[1].slice(1).toLowerCase();
        const tasks = schedule[day] || [];
        const studyTasks = tasks.filter(t => t.category === 'study');
        if (studyTasks.length > 0) {
            const newSched = { ...schedule };
            const targetTasks = [...(newSched[targetDay] || [])];
            studyTasks.forEach(t => targetTasks.push({ ...t, done: false }));
            targetTasks.sort((a, b) => a.time.localeCompare(b.time));
            newSched[targetDay] = targetTasks;
            newSched[day] = tasks.filter(t => t.category !== 'study');
            setSchedule(newSched);
            return `📅 Moved ${studyTasks.length} study task(s) from ${day} → ${targetDay}!`;
        }
        return `No study tasks found on ${day} to reschedule.`;
    }

    if (ml.includes('reset') || ml.includes('restore')) {
        const newSched = { ...schedule }; newSched[day] = [...DEFAULT_SCHEDULE[day]]; setSchedule(newSched);
        return `🔄 Reset ${day} to default!`;
    }

    if (ml.includes('add') && ml.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)/i)) {
        const tm = ml.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)/i);
        let h = parseInt(tm[1]); const m = tm[2] || '00', p = tm[3].toLowerCase();
        if (p === 'pm' && h < 12) h += 12; if (p === 'am' && h === 12) h = 0;
        const time = `${String(h).padStart(2, '0')}:${m}`;
        let text = msg.replace(/add|at\s+\d.*?(am|pm)/gi, '').replace(/to.*?schedule/gi, '').trim() || 'New Task';
        text = text.charAt(0).toUpperCase() + text.slice(1);
        let cat = 'rest';
        if (ml.match(/work|meeting|office/)) cat = 'work'; else if (ml.match(/study|dsa|code/)) cat = 'study';
        else if (ml.match(/eat|lunch|dinner|breakfast|drink|water/)) cat = 'meal'; else if (ml.match(/exercise|yoga|walk|gym|workout/)) cat = 'health';

        const newSched = { ...schedule };

        if (ml.includes('every day') || ml.includes('everyday') || ml.includes('daily')) {
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            days.forEach(d => {
                const dt = [...(newSched[d] || [])];
                dt.push({ time, task: text, category: cat, done: false });
                dt.sort((a, b) => a.time.localeCompare(b.time));
                newSched[d] = dt;
            });
            setSchedule(newSched);
            return `✅ Added "${text}" at ${to12h(time)} for EVERY day!`;
        } else {
            const dt = [...(newSched[day] || [])];
            dt.push({ time, task: text, category: cat, done: false }); dt.sort((a, b) => a.time.localeCompare(b.time));
            newSched[day] = dt; setSchedule(newSched);
            return `✅ Added "${text}" at ${to12h(time)} on ${day}!`;
        }
    }

    if (ml.match(/remove|delete|cancel|skip/)) {
        const tasks = schedule[day] || [];
        const words = ml.split(' ').filter(w => w.length > 3 && !['remove', 'delete', 'cancel', 'skip', 'from', 'schedule'].includes(w));
        const matched = tasks.find(t => words.some(w => t.task.toLowerCase().includes(w)));
        if (matched) { const ns = { ...schedule }; ns[day] = tasks.filter(t => t !== matched); setSchedule(ns); return `🗑️ Removed "${matched.task}" from ${day}.`; }
        return `Couldn't find that task.`;
    }

    if (ml.includes('show') || ml.includes('what') || (ml.includes('schedule') && !ml.includes('add'))) {
        const tasks = schedule[day] || [];
        return tasks.length ? `📅 ${day}:\n${tasks.map(t => `• ${to12h(t.time)} – ${t.task} ${t.done ? '✅' : ''}`).join('\n')}` : `No tasks for ${day}.`;
    }

    if (ml.includes('help')) return `🤖 I can:\n• "Add gym at 6:30 PM"\n• "Remove yoga"\n• "I have hospital"\n• "I'm on my period"\n• "Reschedule study to Saturday"\n• "Reset schedule"\n• "Show schedule"`;

    return `Try: "Add [task] at [time]", "I have hospital", "I'm on my period", "Reschedule study to Saturday", "Reset schedule"`;
};
