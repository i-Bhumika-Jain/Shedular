"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { clearSession, getUser } from "@/lib/api";
import {
  completeScheduleItem,
  createSchedule,
  createScheduleItem,
  getPeople,
  getScheduleItems,
  getSchedules,
  updateSchedule,
} from "../services/dashboardApi";
import { currentIsoDate, DAY_NAME_BY_INDEX, getTodayIndex } from "../constants/days";
import {
  COOKING_PLANS,
  DEFAULT_GOALS,
  DEFAULT_NOTES,
  DEFAULT_SCHEDULE,
  MOOD_OPTIONS,
  NAV_ITEMS,
  SKINCARE_WEEKLY,
  TASK_REQUIREMENTS,
  WORKOUT_PLANS,
} from "../constants/plannerDefaults";
import AddTaskForm from "../components/AddTaskForm";

function loadLocal(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function saveLocal(key, value) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function to12h(time) {
  const [hourText, minuteText] = time.split(":");
  const hour = Number(hourText);
  const minute = minuteText || "00";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minute} ${hour >= 12 ? "PM" : "AM"}`;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function getCategoryClass(category) {
  return `task-badge badge-${(category || "custom").toLowerCase()}`;
}

function normalizeItem(item) {
  return {
    id: item.id,
    time: item.startTime,
    task: item.title,
    category: item.category || "custom",
    done: item.completionStatus === "done",
    raw: item,
  };
}

function getPeriodPrediction(periodData) {
  if (!periodData.lastPeriodDate) return null;
  const lastDate = new Date(`${periodData.lastPeriodDate}T00:00:00`);
  const nextDate = new Date(lastDate);
  nextDate.setDate(nextDate.getDate() + Number(periodData.cycleLength || 28));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntil = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
  const daysSinceLast = Math.ceil((today - lastDate) / (1000 * 60 * 60 * 24));
  const isOnPeriod = daysSinceLast >= 0 && daysSinceLast < Number(periodData.periodDuration || 5);

  return { nextDate, daysUntil, daysSinceLast, isOnPeriod };
}

function buildChecklist(tasks) {
  const added = new Set();
  const checklist = [];

  tasks.forEach((task) => {
    const text = task.task.toLowerCase();
    Object.entries(TASK_REQUIREMENTS).forEach(([keyword, requirements]) => {
      if (!text.includes(keyword)) return;
      requirements.forEach((requirement) => {
        if (added.has(requirement)) return;
        added.add(requirement);
        checklist.push({
          id: requirement,
          text: requirement,
          reason: `For: ${task.task.slice(0, 42)}`,
        });
      });
    });
  });

  return checklist;
}

function getFallbackSchedule(dayIndex) {
  return DEFAULT_SCHEDULE[DAY_NAME_BY_INDEX[dayIndex]] || [];
}

const BHUMIKA_PHONE_SUFFIX = "9416043036";
const BHUMIKA_USERNAMES = new Set(["bhumika", "bhumika_4"]);

function onlyDigits(value = "") {
  return String(value).replace(/\D/g, "");
}

function isBhumikaDefaultUser(currentUser) {
  const username = String(currentUser?.username || "").toLowerCase();
  const email = String(currentUser?.email || "").toLowerCase();
  const phoneDigits = onlyDigits(currentUser?.phoneNumber);
  return phoneDigits.endsWith(BHUMIKA_PHONE_SUFFIX) || BHUMIKA_USERNAMES.has(username) || email.includes("bhumika");
}

function to24Hour(hourValue, minuteValue = "00", periodValue = "") {
  let hour = Number(hourValue);
  const minute = String(minuteValue || "00").padStart(2, "0");
  const period = periodValue.toLowerCase();

  if (period === "pm" && hour < 12) hour += 12;
  if (period === "am" && hour === 12) hour = 0;

  return `${String(hour).padStart(2, "0")}:${minute}`;
}

function extractSetupTasks(text) {
  const lines = text
    .split(/\n|,/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines
    .map((line) => {
      const timeFirst = line.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:-|–|—|:)\s*(.+)$/i);
      if (timeFirst) {
        return {
          title: timeFirst[4].trim(),
          startTime: to24Hour(timeFirst[1], timeFirst[2], timeFirst[3]),
        };
      }

      const taskFirst = line.match(/^(.+?)\s+(?:at|@)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
      if (taskFirst) {
        return {
          title: taskFirst[1].trim(),
          startTime: to24Hour(taskFirst[2], taskFirst[3], taskFirst[4]),
        };
      }

      return null;
    })
    .filter((item) => item?.title && item.startTime);
}

async function readSetupTextFiles(files) {
  const textParts = [];

  for (const file of files) {
    const lowerName = file.name.toLowerCase();
    if (!file.type.startsWith("text/") && !lowerName.endsWith(".txt")) continue;

    try {
      textParts.push(await file.text());
    } catch {
      textParts.push("");
    }
  }

  return textParts.filter(Boolean).join("\n");
}

function Sidebar({ activeSection, onChange, user, onLogout, mood, energy, periodPrediction, open, onToggle }) {
  return (
    <>
      <button className="mobile-menu-btn" type="button" onClick={onToggle}>
        {open ? "×" : "☰"}
      </button>
      <aside className={open ? "planner-sidebar open" : "planner-sidebar"}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">✦</div>
            <span className="sidebar-logo-text">My Planner</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Account</div>
          <div className="account-card">
            <strong>👤 {user?.name || user?.username}</strong>
            <span>{user?.email}</span>
            <button type="button" onClick={onLogout}>
              🚪 Logout
            </button>
          </div>

          <div className="nav-section-title">Menu</div>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={activeSection === item.id ? "nav-item active" : "nav-item"}
              onClick={() => {
                onChange(item.id);
                onToggle(false);
              }}
            >
              <span className="nav-item-icon">{item.icon}</span>
              {item.label}
              {item.id === "period" && periodPrediction?.daysUntil <= 4 ? <span className="nav-dot" /> : null}
            </button>
          ))}
        </nav>

        <div className="sidebar-summary-card">
          <span>Mood: {MOOD_OPTIONS.find((item) => item.value === mood)?.emoji || "—"}</span>
          <span>Energy: {energy}/10</span>
        </div>

        {periodPrediction ? (
          <div className="sidebar-summary-card period-mini">
            <span>Next Period</span>
            <strong>{periodPrediction.nextDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</strong>
            <small>{periodPrediction.isOnPeriod ? `Day ${periodPrediction.daysSinceLast + 1}` : `${periodPrediction.daysUntil} days left`}</small>
          </div>
        ) : null}
      </aside>
    </>
  );
}

function TimetableSetup({ user, values, error, actionLoading, onChange, onFilesChange, onStartVoice, onSubmit, onLogout }) {
  return (
    <main className="setup-main">
      <section className="setup-hero">
        <div>
          <span className="setup-eyebrow">New planner</span>
          <h1 className="page-title">Create your first timetable</h1>
          <p className="page-subtitle">
            Hi {user?.name?.split(" ")[0] || "there"}, name this timetable and tell the assistant your routine. You can upload files now, and the
            text/voice routine will be scheduled immediately.
          </p>
        </div>
        <button className="btn btn-ghost" type="button" onClick={onLogout}>
          Logout
        </button>
      </section>

      {error ? <div className="planner-alert error">{error}</div> : null}

      <section className="setup-card">
        <form className="setup-form" onSubmit={onSubmit}>
          <label className="setup-field">
            <span>
              Timetable name <strong>*</strong>
            </span>
            <input
              value={values.name}
              onChange={(event) => onChange("name", event.target.value)}
              placeholder="College routine, Office week, Weight-loss plan..."
              required
            />
          </label>

          <label className="setup-upload">
            <span className="setup-upload-icon">+</span>
            <strong>Upload image, PDF, document, or notes</strong>
            <small>Accepted: image, PDF, TXT, DOC, DOCX. File AI extraction can be connected next.</small>
            <input type="file" multiple accept="image/*,.pdf,.txt,.doc,.docx" onChange={(event) => onFilesChange(event.target.files)} />
          </label>

          {values.files.length ? (
            <div className="setup-file-list">
              {values.files.map((file) => (
                <span key={`${file.name}-${file.size}`}>{file.name}</span>
              ))}
            </div>
          ) : null}

          <label className="setup-field">
            <span>Tell AI your routine</span>
            <textarea
              value={values.prompt}
              onChange={(event) => onChange("prompt", event.target.value)}
              placeholder={`Examples:\n6:30 am - Gym\n9:30 am - Office\nStudy DSA at 8 pm`}
              rows={7}
            />
          </label>

          <div className="setup-actions">
            <button className="btn btn-ghost" type="button" onClick={onStartVoice}>
              {values.listening ? "Listening..." : "Speak routine"}
            </button>
            <button className="btn btn-primary" type="submit" disabled={actionLoading}>
              {actionLoading ? "Creating..." : "Create timetable"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

function TimeSlotList({ tasks, onToggleDone }) {
  if (!tasks.length) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📭</div>
        <p className="empty-state-text">No tasks for this day yet. Add one below.</p>
      </div>
    );
  }

  return (
    <div className="timetable-grid">
      {tasks.map((task) => (
        <div key={task.id} className={task.done ? "time-slot done-row" : "time-slot"}>
          <span className="time-slot-time">{to12h(task.time)}</span>
          <div className={task.done ? "time-slot-task done-task" : "time-slot-task"}>
            <span>{task.task}</span>
            <span className={getCategoryClass(task.category)}>{task.category}</span>
          </div>
          <button
            type="button"
            className={task.done ? "task-check checked" : "task-check"}
            aria-label={task.done ? "Mark task pending" : "Mark task done"}
            onClick={() => onToggleDone(task.raw, !task.done)}
          />
        </div>
      ))}
    </div>
  );
}

function DayTabs({ activeDayIndex, onChange }) {
  return (
    <div className="day-tabs">
      {DAY_NAME_BY_INDEX.map((day, index) => (
        <button
          key={day}
          type="button"
          className={`day-tab ${activeDayIndex === index ? "active" : ""} ${getTodayIndex() === index ? "today" : ""}`}
          onClick={() => onChange(index)}
        >
          {day.slice(0, 3)}
        </button>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [syncMessage, setSyncMessage] = useState("");
  const [user, setUser] = useState(null);
  const [person, setPerson] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [items, setItems] = useState([]);
  const [usesOwnerDefaults, setUsesOwnerDefaults] = useState(false);
  const [needsTimetableSetup, setNeedsTimetableSetup] = useState(false);
  const [setupValues, setSetupValues] = useState({ name: "", prompt: "", files: [], listening: false });
  const [activeDayIndex, setActiveDayIndex] = useState(getTodayIndex);
  const [section, setSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mood, setMood] = useState("neutral");
  const [energy, setEnergy] = useState(6);
  const [goals, setGoals] = useState([]);
  const [notes, setNotes] = useState({});
  const [noteCategory, setNoteCategory] = useState("weekly_grocery");
  const [noteInput, setNoteInput] = useState("");
  const [periodData, setPeriodData] = useState({ lastPeriodDate: "", cycleLength: 28, periodDuration: 5 });
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      content: "Welcome back. I can help adjust your schedule, add a task, or remind you what to prepare tomorrow.",
    },
  ]);

  const dayName = DAY_NAME_BY_INDEX[activeDayIndex];
  const normalizedTasks = useMemo(() => items.map(normalizeItem), [items]);
  const doneTaskCount = normalizedTasks.filter((item) => item.done).length;
  const periodPrediction = useMemo(() => getPeriodPrediction(periodData), [periodData]);
  const selectedMood = MOOD_OPTIONS.find((item) => item.value === mood);
  const noteCategoryNames = Object.keys(notes);
  const tomorrowIndex = (getTodayIndex() + 1) % 7;
  const checklistSourceTasks =
    activeDayIndex === tomorrowIndex
      ? normalizedTasks
      : usesOwnerDefaults
        ? getFallbackSchedule(tomorrowIndex).map((item, index) => ({ ...item, id: index }))
        : [];
  const checklist = buildChecklist(checklistSourceTasks);

  const loadItems = async (scheduleId, weekday) => {
    const loadedItems = await getScheduleItems(scheduleId, weekday);
    setItems(loadedItems);
    return loadedItems;
  };

  const seedDefaultDayIfEmpty = async (scheduleId, weekday, currentUser) => {
    if (!isBhumikaDefaultUser(currentUser)) {
      return loadItems(scheduleId, weekday);
    }

    const existingItems = await getScheduleItems(scheduleId, weekday);
    const alreadySeeded = existingItems.some((item) => item.metadata?.seededFrom === "vite-default-planner");
    if (existingItems.length >= 5 || alreadySeeded) {
      setItems(existingItems);
      return existingItems;
    }

    const defaults = getFallbackSchedule(weekday);
    if (!defaults.length) {
      setItems([]);
      return [];
    }

    setSyncMessage(`Seeding ${DAY_NAME_BY_INDEX[weekday]} from your old planner`);
    const existingKeys = new Set(existingItems.map((item) => `${item.startTime}-${item.title.toLowerCase()}`));
    const missingDefaults = defaults.filter((item) => !existingKeys.has(`${item.time}-${item.task.toLowerCase()}`));

    for (const item of missingDefaults) {
      await createScheduleItem(scheduleId, {
        title: item.task,
        category: item.category,
        weekday,
        startTime: item.time,
        timezone: currentUser?.timezone || "Asia/Kolkata",
        source: "system",
        priority: 3,
        metadata: { seededFrom: "vite-default-planner", ownerDefault: true },
      });
    }

    const seededItems = await getScheduleItems(scheduleId, weekday);
    setItems(seededItems);
    setSyncMessage("Connected to PostgreSQL");
    return seededItems;
  };

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      router.replace("/");
      return;
    }

    setUser(currentUser);
    const ownerDefaultUser = isBhumikaDefaultUser(currentUser);
    setUsesOwnerDefaults(ownerDefaultUser);
    setSetupValues((previous) => ({
      ...previous,
      name: previous.name || `${currentUser.name || currentUser.username || "My"} timetable`,
    }));
    setMood(loadLocal(`${currentUser.id}_mood`, "neutral"));
    setEnergy(loadLocal(`${currentUser.id}_energy`, 6));
    setGoals(loadLocal(`${currentUser.id}_goals`, DEFAULT_GOALS.map((goal) => ({ ...goal, items: goal.items.map((text) => ({ text, done: false })) }))));
    setNotes(loadLocal(`${currentUser.id}_notes`, DEFAULT_NOTES));
    setPeriodData(loadLocal(`${currentUser.id}_period`, { lastPeriodDate: "", cycleLength: 28, periodDuration: 5 }));

    async function loadData() {
      try {
        const people = await getPeople();
        const firstPerson = people[0];
        setPerson(firstPerson || null);

        if (!firstPerson) {
          setLoading(false);
          return;
        }

        const schedules = await getSchedules(firstPerson.id);
        let firstSchedule = schedules.find((item) => item.scheduleType === "weekly_template") || schedules[0];

        if (!firstSchedule && ownerDefaultUser) {
          firstSchedule = await createSchedule(firstPerson.id, {
            name: "Bhumika weekly planner",
            scheduleType: "weekly_template",
            timezone: currentUser.timezone || "Asia/Kolkata",
          });
        }

        if (!firstSchedule) {
          setNeedsTimetableSetup(true);
          setSection("setup");
          setSyncMessage("Create your first timetable");
          return;
        }

        setSchedule(firstSchedule);
        if (ownerDefaultUser) {
          setNeedsTimetableSetup(false);
          await seedDefaultDayIfEmpty(firstSchedule.id, getTodayIndex(), currentUser);
        } else {
          const allItems = await getScheduleItems(firstSchedule.id);
          const hasDefaultScheduleName = !firstSchedule.name || firstSchedule.name === "Weekly Schedule";
          if (!allItems.length && hasDefaultScheduleName) {
            setNeedsTimetableSetup(true);
            setSection("setup");
            setItems([]);
            setSyncMessage("Create your first timetable");
            return;
          }

          setNeedsTimetableSetup(false);
          await loadItems(firstSchedule.id, getTodayIndex());
        }
        setSyncMessage("Connected to PostgreSQL");
      } catch (apiError) {
        setError(apiError.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  useEffect(() => {
    if (!user?.id) return;
    saveLocal(`${user.id}_mood`, mood);
  }, [mood, user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    saveLocal(`${user.id}_energy`, energy);
  }, [energy, user?.id]);

  useEffect(() => {
    if (!user?.id || !goals.length) return;
    saveLocal(`${user.id}_goals`, goals);
  }, [goals, user?.id]);

  useEffect(() => {
    if (!user?.id || !Object.keys(notes).length) return;
    saveLocal(`${user.id}_notes`, notes);
  }, [notes, user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    saveLocal(`${user.id}_period`, periodData);
  }, [periodData, user?.id]);

  useEffect(() => {
    if (!schedule?.id || loading || needsTimetableSetup) return;
    setError("");
    const loader = usesOwnerDefaults
      ? seedDefaultDayIfEmpty(schedule.id, activeDayIndex, user)
      : loadItems(schedule.id, activeDayIndex);
    loader.catch((apiError) => {
      setError(apiError.message || "Could not load tasks for selected day");
    });
  }, [activeDayIndex, schedule?.id, usesOwnerDefaults, needsTimetableSetup]);

  const handleCreateTask = async (payload) => {
    if (!schedule?.id) return;

    try {
      setActionLoading(true);
      setError("");
      await createScheduleItem(schedule.id, {
        title: payload.title,
        category: payload.category,
        weekday: activeDayIndex,
        startTime: payload.startTime,
        timezone: user?.timezone || "Asia/Kolkata",
        source: "manual",
        priority: 3,
        metadata: {},
      });
      await loadItems(schedule.id, activeDayIndex);
      setSyncMessage("Task added and saved");
    } catch (apiError) {
      setError(apiError.message || "Could not create task");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleDone = async (item, nextDone) => {
    try {
      setActionLoading(true);
      setError("");
      await completeScheduleItem(item.id, {
        completionDate: currentIsoDate(),
        status: nextDone ? "done" : "skipped",
      });
      await loadItems(schedule.id, activeDayIndex);
      setSyncMessage("Task status saved");
    } catch (apiError) {
      setError(apiError.message || "Could not update task status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleGoalToggle = (goalIndex, itemIndex) => {
    setGoals((previous) =>
      previous.map((goal, currentGoalIndex) =>
        currentGoalIndex !== goalIndex
          ? goal
          : {
              ...goal,
              items: goal.items.map((item, currentItemIndex) =>
                currentItemIndex === itemIndex ? { ...item, done: !item.done } : item
              ),
            }
      )
    );
  };

  const handleAddNote = () => {
    if (!noteInput.trim() || !noteCategory) return;
    setNotes((previous) => ({
      ...previous,
      [noteCategory]: [...(previous[noteCategory] || []), noteInput.trim()],
    }));
    setNoteInput("");
  };

  const handleSetupChange = (field, value) => {
    setSetupValues((previous) => ({ ...previous, [field]: value }));
  };

  const handleSetupFiles = (fileList) => {
    setSetupValues((previous) => ({ ...previous, files: Array.from(fileList || []) }));
  };

  const handleStartVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Voice input is not supported in this browser. Please type the routine instead.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setSetupValues((previous) => ({ ...previous, listening: true }));
    recognition.onend = () => setSetupValues((previous) => ({ ...previous, listening: false }));
    recognition.onerror = () => {
      setSetupValues((previous) => ({ ...previous, listening: false }));
      setError("Voice input stopped. Please try again or type the routine.");
    };
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join(" ")
        .trim();

      if (transcript) {
        setSetupValues((previous) => ({
          ...previous,
          prompt: `${previous.prompt}${previous.prompt ? "\n" : ""}${transcript}`,
        }));
      }
    };
    recognition.start();
  };

  const handleSetupSubmit = async (event) => {
    event.preventDefault();
    const timetableName = setupValues.name.trim();

    if (!timetableName) {
      setError("Timetable name is required.");
      return;
    }
    if (!person?.id) {
      setError("Your account profile was not found. Please sign out and sign in again.");
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      let activeSchedule = schedule;
      if (!activeSchedule?.id) {
        activeSchedule = await createSchedule(person.id, {
          name: timetableName,
          scheduleType: "weekly_template",
          timezone: user?.timezone || "Asia/Kolkata",
        });
      } else {
        activeSchedule = await updateSchedule(activeSchedule.id, {
          name: timetableName,
          timezone: user?.timezone || "Asia/Kolkata",
        });
      }

      setSchedule(activeSchedule);

      const fileText = await readSetupTextFiles(setupValues.files);
      const importedText = [setupValues.prompt, fileText].filter(Boolean).join("\n");
      const parsedTasks = extractSetupTasks(importedText);
      const fileNames = setupValues.files.map((file) => file.name);

      for (const task of parsedTasks) {
        await createScheduleItem(activeSchedule.id, {
          title: task.title,
          category: "custom",
          weekday: activeDayIndex,
          startTime: task.startTime,
          timezone: user?.timezone || "Asia/Kolkata",
          source: "assistant",
          priority: 3,
          metadata: { setupImport: true, fileNames },
        });
      }

      await loadItems(activeSchedule.id, activeDayIndex);
      setNeedsTimetableSetup(false);
      setSection(parsedTasks.length ? "timetable" : "assistant");
      setSyncMessage(parsedTasks.length ? `Created ${parsedTasks.length} setup tasks` : "Timetable created");
      setChatMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: parsedTasks.length
            ? `I created ${parsedTasks.length} task(s) in "${timetableName}" for ${dayName}.`
            : `I created "${timetableName}". Add lines like "7 am - Gym" or connect PDF/image AI extraction next.`,
        },
      ]);
    } catch (apiError) {
      setError(apiError.message || "Could not create timetable");
    } finally {
      setActionLoading(false);
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;
    const message = chatInput.trim();
    setChatInput("");
    setChatMessages((previous) => [...previous, { role: "user", content: message }]);

    const match = message.match(/add\s+(.+?)\s+at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if (match && schedule?.id) {
      let hour = Number(match[2]);
      const minute = match[3] || "00";
      const period = match[4].toLowerCase();
      if (period === "pm" && hour < 12) hour += 12;
      if (period === "am" && hour === 12) hour = 0;
      await handleCreateTask({
        title: match[1].trim(),
        startTime: `${String(hour).padStart(2, "0")}:${minute}`,
        category: "custom",
      });
      setChatMessages((previous) => [...previous, { role: "assistant", content: `Added "${match[1].trim()}" to ${dayName}.` }]);
      return;
    }

    if (/period|cramp|low energy|tired/i.test(message)) {
      setMood(message.toLowerCase().includes("period") ? "period" : "tired");
      setEnergy((previous) => Math.min(previous, 3));
      setChatMessages((previous) => [
        ...previous,
        { role: "assistant", content: "I lowered the energy state. Keep the schedule gentle today and move intense tasks if needed." },
      ]);
      return;
    }

    setChatMessages((previous) => [
      ...previous,
      { role: "assistant", content: "Try: Add gym at 6:30 PM, I am on my period, or show my schedule." },
    ]);
  };

  const handleLogout = () => {
    clearSession();
    router.replace("/");
  };

  if (loading) {
    return <main className="planner-loading">Loading your planner...</main>;
  }

  if (needsTimetableSetup) {
    return (
      <div className="planner-app setup-only">
        <TimetableSetup
          user={user}
          values={setupValues}
          error={error}
          actionLoading={actionLoading}
          onChange={handleSetupChange}
          onFilesChange={handleSetupFiles}
          onStartVoice={handleStartVoice}
          onSubmit={handleSetupSubmit}
          onLogout={handleLogout}
        />
      </div>
    );
  }

  return (
    <div className="planner-app">
      <Sidebar
        activeSection={section}
        onChange={setSection}
        user={user}
        onLogout={handleLogout}
        mood={mood}
        energy={energy}
        periodPrediction={periodPrediction}
        open={sidebarOpen}
        onToggle={(next) => setSidebarOpen((previous) => (typeof next === "boolean" ? next : !previous))}
      />

      <main className="planner-main">
        {error ? <div className="planner-alert error">{error}</div> : null}

        {section === "dashboard" ? (
          <>
            <div className="page-header">
              <h1 className="page-title">{getGreeting()}, {user?.name?.split(" ")[0] || "there"}!</h1>
              <p className="page-subtitle">
                {DAY_NAME_BY_INDEX[getTodayIndex()]}, {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                {person ? ` · Planner: ${person.displayName}` : ""}
                {syncMessage ? ` · ${syncMessage}` : ""}
              </p>
            </div>

            {energy <= 3 || mood === "period" || mood === "sick" ? (
              <div className="planner-alert soft">
                🌸 Low-energy mode is active. Keep today gentle and move heavy tasks if your body says so.
              </div>
            ) : null}

            <div className="mood-container">
              <section className="mood-card">
                <h2 className="mood-question">How are you feeling?</h2>
                <div className="mood-options">
                  {MOOD_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={mood === option.value ? "mood-btn selected" : "mood-btn"}
                      onClick={() => setMood(option.value)}
                    >
                      <span className="mood-emoji">{option.emoji}</span>
                      <span className="mood-label">{option.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="mood-card">
                <h2 className="mood-question">Energy Level?</h2>
                <div className="energy-slider-labels">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
                <input
                  className="energy-slider"
                  type="range"
                  min="1"
                  max="10"
                  value={energy}
                  onChange={(event) => setEnergy(Number(event.target.value))}
                />
                <div className="energy-value">{energy}/10</div>
              </section>
            </div>

            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-icon mood">{selectedMood?.emoji || "😊"}</div>
                <div className="stat-info">
                  <span className="stat-value">{selectedMood?.label || "Not set"}</span>
                  <span className="stat-label">Mood</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon energy">⚡</div>
                <div className="stat-info">
                  <span className="stat-value">{energy}/10</span>
                  <span className="stat-label">Energy</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon tasks">📋</div>
                <div className="stat-info">
                  <span className="stat-value">{doneTaskCount}/{normalizedTasks.length}</span>
                  <span className="stat-label">{dayName} Tasks</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon goals">🎯</div>
                <div className="stat-info">
                  <span className="stat-value">
                    {goals.reduce((total, goal) => total + goal.items.filter((item) => item.done).length, 0)}/
                    {goals.reduce((total, goal) => total + goal.items.length, 0)}
                  </span>
                  <span className="stat-label">Goals</span>
                </div>
              </div>
            </div>

            <div className="dashboard-grid">
              <section className="card full-width">
                <div className="card-header">
                  <h2 className="card-title">📅 {dayName} Timetable</h2>
                  <button className="btn btn-ghost btn-sm" type="button" onClick={() => setSection("timetable")}>
                    Open timetable
                  </button>
                </div>
                <DayTabs activeDayIndex={activeDayIndex} onChange={setActiveDayIndex} />
                <TimeSlotList tasks={normalizedTasks.slice(0, 8)} onToggleDone={handleToggleDone} />
              </section>

              <section className="card">
                <div className="card-header">
                  <h2 className="card-title">🎯 Goal Focus</h2>
                  <button className="btn btn-ghost btn-sm" type="button" onClick={() => setSection("goals")}>
                    View all
                  </button>
                </div>
                <div className="mini-list">
                  {goals.slice(0, 4).map((goal) => (
                    <div key={goal.id} className="mini-row">
                      <span>{goal.icon}</span>
                      <strong>{goal.title}</strong>
                      <small>{goal.items.filter((item) => item.done).length}/{goal.items.length}</small>
                    </div>
                  ))}
                </div>
              </section>

              <section className="card">
                <div className="card-header">
                  <h2 className="card-title">📝 Quick Notes</h2>
                  <button className="btn btn-ghost btn-sm" type="button" onClick={() => setSection("notes")}>
                    Open notes
                  </button>
                </div>
                <div className="mini-list">
                  {(notes[noteCategory] || []).slice(0, 5).map((note) => (
                    <div key={note} className="mini-row">
                      <span>•</span>
                      <strong>{note}</strong>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </>
        ) : null}

        {section === "timetable" ? (
          <>
            <div className="page-header">
              <h1 className="page-title">{dayName} Timetable</h1>
              <p className="page-subtitle">Saved in PostgreSQL. Pick a day, complete tasks, or add a new one.</p>
            </div>
            <DayTabs activeDayIndex={activeDayIndex} onChange={setActiveDayIndex} />
            <section className="card">
              <TimeSlotList tasks={normalizedTasks} onToggleDone={handleToggleDone} />
            </section>
            <section className="card add-task-card">
              <div className="card-header">
                <h2 className="card-title">Add a task</h2>
              </div>
              <AddTaskForm onCreate={handleCreateTask} disabled={actionLoading} />
            </section>
          </>
        ) : null}

        {section === "plans" ? (
          <>
            <div className="page-header">
              <h1 className="page-title">My Plans</h1>
              <p className="page-subtitle">Workout, cooking, and skincare references from the original planner.</p>
            </div>
            <div className="plan-section-grid">
              <section className="card">
                <h2 className="card-title">💪 Workout Plan</h2>
                <div className="tile-grid">
                  {WORKOUT_PLANS.map((plan) => (
                    <div key={plan.title} className="info-tile">
                      <strong>{plan.title}</strong>
                      {plan.items.map((item) => (
                        <span key={item}>{item}</span>
                      ))}
                    </div>
                  ))}
                </div>
              </section>
              <section className="card">
                <h2 className="card-title">🍳 Cooking Plan</h2>
                <div className="tile-grid">
                  {COOKING_PLANS.map((plan) => (
                    <div key={plan.title} className="info-tile">
                      <strong>{plan.title}</strong>
                      {plan.items.map((item) => (
                        <span key={item}>{item}</span>
                      ))}
                    </div>
                  ))}
                </div>
              </section>
              <section className="card full-width">
                <h2 className="card-title">✨ Skincare Weekly</h2>
                <div className="skincare-grid">
                  {SKINCARE_WEEKLY.map((item) => (
                    <div key={item.day} className="skincare-day-card">
                      <strong>{item.day}</strong>
                      <span>{item.routine}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </>
        ) : null}

        {section === "goals" ? (
          <>
            <div className="page-header">
              <h1 className="page-title">Goals</h1>
              <p className="page-subtitle">The original planner goals are back, with local progress saved per account.</p>
            </div>
            <div className="goals-grid">
              {goals.map((goal, goalIndex) => (
                <section key={goal.id} className={`goal-card goal-${goal.color || "custom"}`}>
                  <div className="goal-icon">{goal.icon}</div>
                  <h2 className="goal-title">{goal.title}</h2>
                  <div className="goal-items">
                    {goal.items.map((item, itemIndex) => (
                      <button key={`${goal.id}-${item.text}`} className="goal-item" type="button" onClick={() => handleGoalToggle(goalIndex, itemIndex)}>
                        <span className={item.done ? "goal-checkbox checked" : "goal-checkbox"} />
                        <span className={item.done ? "done-task" : ""}>{item.text}</span>
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        ) : null}

        {section === "notes" ? (
          <>
            <div className="page-header">
              <h1 className="page-title">Notes</h1>
              <p className="page-subtitle">Groceries, medicines, meal ideas, pending tasks, and daily reminders.</p>
            </div>
            <section className="card">
              <div className="notes-categories">
                {noteCategoryNames.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={category === noteCategory ? "note-category-tab active" : "note-category-tab"}
                    onClick={() => setNoteCategory(category)}
                  >
                    {category.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
              <div className="notes-list">
                {(notes[noteCategory] || []).map((note) => (
                  <div key={note} className="note-item">
                    <span className="note-bullet" />
                    <span className="note-text">{note}</span>
                  </div>
                ))}
              </div>
              <div className="add-note-form">
                <input
                  className="add-note-input"
                  value={noteInput}
                  onChange={(event) => setNoteInput(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && handleAddNote()}
                  placeholder="Add a note"
                />
                <button className="btn btn-primary" type="button" onClick={handleAddNote}>
                  Add
                </button>
              </div>
            </section>
          </>
        ) : null}

        {section === "period" ? (
          <>
            <div className="page-header">
              <h1 className="page-title">Period Tracker</h1>
              <p className="page-subtitle">Set your recent date and the planner shows the next expected period.</p>
            </div>
            <div className="period-tracker">
              <section className="period-card">
                <h2 className="period-card-title">Settings</h2>
                <label className="period-input-group">
                  <span className="period-input-label">Last period start date</span>
                  <input
                    className="period-input"
                    type="date"
                    value={periodData.lastPeriodDate}
                    onChange={(event) => setPeriodData((previous) => ({ ...previous, lastPeriodDate: event.target.value }))}
                  />
                </label>
                <label className="period-input-group">
                  <span className="period-input-label">Cycle length</span>
                  <input
                    className="period-input"
                    type="number"
                    min="15"
                    max="60"
                    value={periodData.cycleLength}
                    onChange={(event) => setPeriodData((previous) => ({ ...previous, cycleLength: Number(event.target.value) || 28 }))}
                  />
                </label>
                <label className="period-input-group">
                  <span className="period-input-label">Period duration</span>
                  <input
                    className="period-input"
                    type="number"
                    min="1"
                    max="15"
                    value={periodData.periodDuration}
                    onChange={(event) => setPeriodData((previous) => ({ ...previous, periodDuration: Number(event.target.value) || 5 }))}
                  />
                </label>
                <button
                  className="period-log-btn"
                  type="button"
                  onClick={() => {
                    setPeriodData((previous) => ({ ...previous, lastPeriodDate: currentIsoDate() }));
                    setMood("period");
                    setEnergy(3);
                  }}
                >
                  Log: Period started today
                </button>
              </section>
              <section className="period-card">
                <h2 className="period-card-title">Prediction</h2>
                {periodPrediction ? (
                  <div className="period-prediction">
                    <span>Your next period</span>
                    <strong>{periodPrediction.nextDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</strong>
                    <small>
                      {periodPrediction.isOnPeriod
                        ? `You are on day ${periodPrediction.daysSinceLast + 1}`
                        : `${periodPrediction.daysUntil} days away`}
                    </small>
                  </div>
                ) : (
                  <div className="empty-state">
                    <p className="empty-state-text">Add your last period date to see predictions.</p>
                  </div>
                )}
                <div className="period-tips">
                  <span>Replace intense workouts with light yoga/walk.</span>
                  <span>Keep hot water bag, pads, and medicines ready.</span>
                  <span>Warm haldi doodh and rest are allowed. No guilt.</span>
                </div>
              </section>
            </div>
          </>
        ) : null}

        {section === "checklist" ? (
          <>
            <div className="page-header">
              <h1 className="page-title">Next Day Prep</h1>
              <p className="page-subtitle">Things to prepare for {DAY_NAME_BY_INDEX[tomorrowIndex]}.</p>
            </div>
            <section className="card">
              {checklist.length ? (
                <div className="checklist-container">
                  {checklist.map((item) => (
                    <div key={item.id} className="checklist-item">
                      <span className="checklist-checkbox" />
                      <div>
                        <strong>{item.text}</strong>
                        <small>{item.reason}</small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p className="empty-state-text">No prep items found for tomorrow yet.</p>
                </div>
              )}
            </section>
          </>
        ) : null}

        {section === "history" ? (
          <>
            <div className="page-header">
              <h1 className="page-title">Daily History</h1>
              <p className="page-subtitle">Today’s snapshot from your PostgreSQL timetable.</p>
            </div>
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-icon tasks">📋</div>
                <div className="stat-info">
                  <span className="stat-value">{normalizedTasks.length}</span>
                  <span className="stat-label">Tasks planned</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon energy">✅</div>
                <div className="stat-info">
                  <span className="stat-value">{doneTaskCount}</span>
                  <span className="stat-label">Completed</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon mood">{selectedMood?.emoji || "😊"}</div>
                <div className="stat-info">
                  <span className="stat-value">{selectedMood?.label || "Neutral"}</span>
                  <span className="stat-label">Mood</span>
                </div>
              </div>
            </div>
            <section className="card">
              <h2 className="card-title">Completed Today</h2>
              <div className="mini-list">
                {normalizedTasks.filter((item) => item.done).length ? (
                  normalizedTasks.filter((item) => item.done).map((item) => (
                    <div key={item.id} className="mini-row">
                      <span>✓</span>
                      <strong>{item.task}</strong>
                      <small>{to12h(item.time)}</small>
                    </div>
                  ))
                ) : (
                  <p className="empty-state-text">No tasks completed yet.</p>
                )}
              </div>
            </section>
          </>
        ) : null}

        {section === "assistant" ? (
          <>
            <div className="page-header">
              <h1 className="page-title">AI Assistant</h1>
              <p className="page-subtitle">Quick schedule helper. The full AI backend can come after planner APIs are stable.</p>
            </div>
            <DayTabs activeDayIndex={activeDayIndex} onChange={setActiveDayIndex} />
            <section className="card chat-card">
              <div className="chat-messages">
                {chatMessages.map((message, index) => (
                  <div key={`${message.role}-${index}`} className={`chat-message ${message.role}`}>
                    <span className="chat-avatar">{message.role === "assistant" ? "🤖" : "👤"}</span>
                    <div className="chat-bubble">{message.content}</div>
                  </div>
                ))}
              </div>
              <div className="chat-input-container">
                <input
                  className="chat-input"
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && handleChatSend()}
                  placeholder="Add gym at 6:30 PM, I am on my period..."
                />
                <button className="chat-send-btn" type="button" onClick={handleChatSend}>
                  ➤
                </button>
              </div>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
