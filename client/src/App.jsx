import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard, CheckCircle2, Target, Flame, Plus, CalendarDays,
  TrendingUp, Trophy, Settings, Menu, X, Sun, Moon, Trash2, Activity,
  Sparkles, LogOut, UserRound, ChevronRight, Palette, ShieldCheck,
  CircleUserRound, BarChart3, Clock3, ArrowUpRight, Check, Leaf
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import "./App.css";
import Auth from "./pages/Auth";
import { apiRequest } from "./api";

const navigation = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "habits", label: "My Habits", icon: CheckCircle2 },
  { id: "progress", label: "Progress", icon: TrendingUp },
  { id: "achievements", label: "Achievements", icon: Trophy },
];

const extraNavigation = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "settings", label: "Settings", icon: Settings },
];

const getWeeklyData = (habitData) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = date.toDateString();
    const count = habitData.filter((habit) => {
      const dates = habit.completedDates || habit.completionDates || [];
      return dates.some((item) => new Date(item).toDateString() === key);
    }).length;
    result.push({
      day: days[date.getDay()],
      completed: count,
    });
  }
  return result;
};

function App() {
  const [user, setUser] = useState(null);
  const [habits, setHabits] = useState([]);
  const [streak, setStreak] = useState(0);
  const [weeklyData, setWeeklyData] = useState([]);
  const [newHabit, setNewHabit] = useState("");
  const [activePage, setActivePage] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("habitforge_theme") === "dark"
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadHabits = useCallback(async () => {
    try {
      const [habitData, streakData] = await Promise.all([
        apiRequest("/api/habits"),
        apiRequest("/api/habits/streak"),
      ]);
      const list = Array.isArray(habitData)
        ? habitData
        : habitData.habits || [];
      setHabits(list);
      setStreak(
        typeof streakData === "number"
          ? streakData
          : streakData.streak || streakData.currentStreak || 0
      );
      setWeeklyData(getWeeklyData(list));
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load your habits.");
    }
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem("habitforge_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        await loadHabits();
        setUser({ name: "Habit Builder" });
      } catch {
        localStorage.removeItem("habitforge_token");
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, [loadHabits]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("habitforge_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const handleLogin = async (loggedInUser) => {
    setUser(loggedInUser || { name: "Habit Builder" });
    await loadHabits();
  };

  const logout = () => {
    localStorage.removeItem("habitforge_token");
    setUser(null);
    setHabits([]);
    setStreak(0);
    setWeeklyData([]);
    setActivePage("dashboard");
    setMenuOpen(false);
  };

  const today = new Date().toDateString();
  const completedToday = habits.filter((habit) => {
    const dates = habit.completedDates || habit.completionDates || [];
    return dates.some((item) => new Date(item).toDateString() === today);
  }).length;

  const totalCompletions = habits.reduce((total, habit) => {
    const dates = habit.completedDates || habit.completionDates || [];
    return total + dates.length;
  }, 0);

  const progress = habits.length
    ? Math.round((completedToday / habits.length) * 100)
    : 0;

  const achievements = [
    {
      title: "First Step",
      description: "Complete your first habit",
      icon: "🌱",
      unlocked: totalCompletions >= 1,
    },
    {
      title: "Getting Started",
      description: "Build a 3-day streak",
      icon: "🔥",
      unlocked: streak >= 3,
    },
    {
      title: "One Week Strong",
      description: "Reach a 7-day streak",
      icon: "⚡",
      unlocked: streak >= 7,
    },
    {
      title: "Habit Collector",
      description: "Create 5 habits",
      icon: "🏆",
      unlocked: habits.length >= 5,
    },
    {
      title: "Consistency",
      description: "Complete 25 habits",
      icon: "🎯",
      unlocked: totalCompletions >= 25,
    },
    {
      title: "Dedicated",
      description: "Complete 100 habits",
      icon: "💎",
      unlocked: totalCompletions >= 100,
    },
  ];

  const addHabit = async (event) => {
    event.preventDefault();
    if (!newHabit.trim() || saving) return;
    setSaving(true);
    try {
      await apiRequest("/api/habits", {
        method: "POST",
        body: JSON.stringify({
          title: newHabit.trim(),
          category: "Personal",
        }),
      });
      setNewHabit("");
      await loadHabits();
    } catch (err) {
      setError(err.message || "Could not add habit.");
    } finally {
      setSaving(false);
    }
  };

  const toggleHabit = async (id) => {
    try {
      await apiRequest(`/api/habits/${id}/complete`, { method: "PATCH" });
      await loadHabits();
    } catch (err) {
      setError(err.message || "Could not update habit.");
    }
  };

  const deleteHabit = async (id) => {
    try {
      await apiRequest(`/api/habits/${id}`, { method: "DELETE" });
      await loadHabits();
    } catch (err) {
      setError(err.message || "Could not delete habit.");
    }
  };

  const changePage = (page) => {
    setActivePage(page);
    setMenuOpen(false);
    setError("");
  };

  const displayName = user?.name || user?.username || "Habit Builder";
  const email = user?.email || "Your account";

  const PageHeading = ({ eyebrow, title, description }) => (
    <div className="page-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );

  const StatCard = ({ icon: Icon, label, value, note, accent }) => (
    <div className={`stat-card ${accent || ""}`}>
      <div className="stat-card-top">
        <span>{label}</span>
        <span className="stat-icon"><Icon size={19} /></span>
      </div>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );

  const HabitList = ({ limit }) => {
    const visibleHabits = limit ? habits.slice(0, limit) : habits;
    if (!visibleHabits.length) {
      return (
        <div className="empty-state">
          <span className="empty-icon"><Leaf size={25} /></span>
          <h3>Your habit journey starts here</h3>
          <p>Add your first habit and make today count.</p>
        </div>
      );
    }
    return (
      <div className="habit-list">
        {visibleHabits.map((habit) => {
          const dates = habit.completedDates || habit.completionDates || [];
          const isComplete = dates.some(
            (item) => new Date(item).toDateString() === today
          );
          return (
            <div className="habit-item" key={habit._id || habit.id}>
              <button
                className={`check-button ${isComplete ? "completed" : ""}`}
                onClick={() => toggleHabit(habit._id || habit.id)}
                aria-label="Complete habit"
              >
                {isComplete && <Check size={17} />}
              </button>
              <div className="habit-details">
                <strong>{habit.title || habit.name}</strong>
                <span>{habit.category || "Personal"}</span>
              </div>
              <span className={`habit-status ${isComplete ? "done" : ""}`}>
                {isComplete ? "Completed" : "In progress"}
              </span>
              <button
                className="delete-button"
                onClick={() => deleteHabit(habit._id || habit.id)}
                aria-label="Delete habit"
              >
                <Trash2 size={17} />
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  const AddHabitForm = () => (
    <form className="add-habit-form" onSubmit={addHabit}>
      <input
        type="text"
        value={newHabit}
        onChange={(event) => setNewHabit(event.target.value)}
        placeholder="What habit do you want to build?"
        maxLength={80}
      />
      <button type="submit" disabled={!newHabit.trim() || saving}>
        <Plus size={18} /> {saving ? "Adding..." : "Add habit"}
      </button>
    </form>
  );

  const ProgressRing = () => (
    <div className="progress-ring-wrap">
      <div
        className="progress-circle"
        style={{ "--progress": `${progress}%` }}
      >
        <div className="circle-inner">
          <strong>{progress}%</strong>
          <span>completed</span>
        </div>
      </div>
    </div>
  );

  const WeeklyChart = () => (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={weeklyData} barSize={25}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
          <Tooltip />
          <Bar dataKey="completed" fill="#617b68" radius={[7, 7, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderDashboard = () => (
    <>
      <section className="welcome-banner">
        <div>
          <span className="eyebrow">YOUR PERSONAL GROWTH SPACE</span>
          <h1>Small steps. <em>Remarkable change.</em></h1>
          <p>Every day is a fresh opportunity to become who you want to be.</p>
          <button className="primary-button" onClick={() => changePage("habits")}>
            Explore my habits <ArrowUpRight size={17} />
          </button>
        </div>
        <div className="welcome-art"><span>✳</span><small>MAKE TODAY<br />MATTER</small></div>
      </section>

      <div className="stats-grid">
        <StatCard icon={Target} label="Total habits" value={habits.length} note="Habits you're building" />
        <StatCard icon={CheckCircle2} label="Completed today" value={completedToday} note="Today's accomplishments" />
        <StatCard icon={Flame} label="Current streak" value={`${streak} days`} note="Keep your momentum going" />
        <StatCard icon={Activity} label="Daily progress" value={`${progress}%`} note="Your progress for today" />
      </div>

      <div className="content-grid">
        <section className="panel habits-panel">
          <div className="section-heading">
            <div><span className="eyebrow">YOUR ROUTINE</span><h2>Today's habits</h2></div>
            <button className="text-button" onClick={() => changePage("habits")}>View all <ChevronRight size={16} /></button>
          </div>
          <HabitList limit={4} />
        </section>
        <section className="panel progress-panel">
          <div className="section-heading">
            <div><span className="eyebrow">YOUR MOMENTUM</span><h2>Daily progress</h2></div>
            <CalendarDays size={19} />
          </div>
          <ProgressRing />
          <div className="progress-summary">
            <span>{completedToday} of {habits.length} habits completed</span>
            <strong>{progress}%</strong>
          </div>
          <p className="motivation">Consistency is built one small action at a time.</p>
        </section>
      </div>

      <section className="panel chart-panel">
        <div className="section-heading">
          <div><span className="eyebrow">LAST SEVEN DAYS</span><h2>Your weekly activity</h2></div>
          <button className="text-button" onClick={() => changePage("progress")}>Full report <ArrowUpRight size={16} /></button>
        </div>
        <WeeklyChart />
      </section>
      <section className="panel achievement-panel">
        <div className="section-heading">
          <div><span className="eyebrow">MILESTONES</span><h2>Achievements</h2></div>
          <button className="text-button" onClick={() => changePage("achievements")}>See all <ChevronRight size={16} /></button>
        </div>
        <div className="achievement-grid">
          {achievements.slice(0, 3).map((item) => (
            <div className={`achievement-card ${item.unlocked ? "unlocked" : "locked"}`} key={item.title}>
              <span>{item.icon}</span><div><strong>{item.title}</strong><small>{item.description}</small></div>
            </div>
          ))}
        </div>
      </section>
    </>
  );

  const renderHabits = () => (
    <>
      <PageHeading eyebrow="YOUR DAILY ROUTINE" title="My habits" description="Build a routine that reflects the person you want to become." />
      <section className="panel">
        <div className="section-heading">
          <div><span className="eyebrow">ADD SOMETHING GOOD</span><h2>Create a new habit</h2></div>
          <Sparkles size={20} />
        </div>
        <AddHabitForm />
      </section>
      <section className="panel">
        <div className="section-heading">
          <div><span className="eyebrow">YOUR COLLECTION</span><h2>All habits <span className="count-label">{habits.length}</span></h2></div>
          <span className="date-label"><CalendarDays size={16} /> {new Date().toLocaleDateString()}</span>
        </div>
        <HabitList />
      </section>
    </>
  );

  const renderProgress = () => (
    <>
      <PageHeading eyebrow="THE BIGGER PICTURE" title="Your progress" description="Look back at the effort you've put in. Every completed habit counts." />
      <div className="stats-grid">
        <StatCard icon={CheckCircle2} label="Total completions" value={totalCompletions} note="All recorded completions" />
        <StatCard icon={Flame} label="Current streak" value={`${streak} days`} note="Your current momentum" />
        <StatCard icon={Target} label="Active habits" value={habits.length} note="Habits in your routine" />
      </div>
      <section className="panel progress-detail">
        <div className="section-heading"><div><span className="eyebrow">TODAY</span><h2>Daily completion</h2></div></div>
        <ProgressRing />
        <div className="progress-summary"><span>{completedToday} of {habits.length} completed today</span><strong>{progress}%</strong></div>
      </section>
      <section className="panel chart-panel">
        <div className="section-heading"><div><span className="eyebrow">YOUR LAST SEVEN DAYS</span><h2>Weekly activity</h2></div><BarChart3 size={20} /></div>
        <WeeklyChart />
      </section>
    </>
  );

  const renderAchievements = () => (
    <>
      <PageHeading eyebrow="CELEBRATE YOUR GROWTH" title="Achievements" description="Every milestone is proof that your effort is adding up." />
      <div className="stats-grid">
        <StatCard icon={Trophy} label="Unlocked" value={achievements.filter((a) => a.unlocked).length} note="Milestones earned" />
        <StatCard icon={Target} label="Total milestones" value={achievements.length} note="More goals to reach" />
      </div>
      <section className="panel">
        <div className="section-heading"><div><span className="eyebrow">YOUR MILESTONES</span><h2>Achievement collection</h2></div></div>
        <div className="achievement-grid full">
          {achievements.map((item) => (
            <div className={`achievement-card ${item.unlocked ? "unlocked" : "locked"}`} key={item.title}>
              <span>{item.icon}</span>
              <div><strong>{item.title}</strong><small>{item.description}</small><small className="achievement-state">{item.unlocked ? "✓ Unlocked" : "Not yet unlocked"}</small></div>
            </div>
          ))}
        </div>
      </section>
    </>
  );

  const renderProfile = () => (
    <>
      <PageHeading eyebrow="YOUR SPACE" title="Profile" description="Your HabitForge account and personal activity at a glance." />
      <section className="panel profile-page-card">
        <div className="profile-avatar-large"><UserRound size={36} /></div>
        <h2>{displayName}</h2>
        <p>{email}</p>
        <span className="account-pill"><ShieldCheck size={15} /> Account signed in</span>
        <div className="profile-details">
          <div><span>Account name</span><strong>{displayName}</strong></div>
          <div><span>Email address</span><strong>{email}</strong></div>
          <div><span>Active habits</span><strong>{habits.length}</strong></div>
          <div><span>Total completions</span><strong>{totalCompletions}</strong></div>
        </div>
        <p className="muted-note">Profile details are currently read-only. Profile editing can be added when an update endpoint is available in the backend.</p>
      </section>
    </>
  );

  const renderSettings = () => (
    <>
      <PageHeading eyebrow="MAKE IT YOURS" title="Settings" description="Choose how HabitForge looks and manage your account." />
      <section className="panel settings-panel">
        <div className="section-heading"><div><span className="eyebrow">APPEARANCE</span><h2>Display preferences</h2></div><Palette size={20} /></div>
        <div className="setting-row">
          <div className="setting-icon"><Moon size={20} /></div>
          <div className="setting-copy"><strong>Dark appearance</strong><span>Use a darker theme across HabitForge.</span></div>
          <button className={`theme-switch ${darkMode ? "on" : ""}`} onClick={() => setDarkMode((value) => !value)} aria-label="Toggle dark mode"><span /></button>
        </div>
      </section>
      <section className="panel settings-panel">
        <div className="section-heading"><div><span className="eyebrow">ACCOUNT</span><h2>Account controls</h2></div><CircleUserRound size={20} /></div>
        <div className="setting-row">
          <div className="setting-icon"><UserRound size={20} /></div>
          <div className="setting-copy"><strong>{displayName}</strong><span>{email}</span></div>
        </div>
        <div className="setting-row">
          <div className="setting-icon"><LogOut size={20} /></div>
          <div className="setting-copy"><strong>Sign out</strong><span>Sign out of your HabitForge account on this device.</span></div>
          <button className="secondary-button" onClick={logout}>Log out</button>
        </div>
      </section>
    </>
  );

  if (loading) {
    return <div className="loading-screen"><div className="loading-mark">H</div><p>Preparing your space...</p></div>;
  }

  if (!user) return <Auth onLogin={handleLogin} />;

  const pageTitles = {
    dashboard: "Dashboard",
    habits: "My Habits",
    progress: "Progress",
    achievements: "Achievements",
    profile: "Profile",
    settings: "Settings",
  };

  return (
    <div className={`app ${darkMode ? "dark" : ""}`}>
      {menuOpen && <button className="sidebar-overlay" onClick={() => setMenuOpen(false)} aria-label="Close menu" />}
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <span className="brand-mark">H</span>
          <div><strong>HabitForge<span>.</span></strong><small>YOUR GROWTH STUDIO</small></div>
          <button className="mobile-close" onClick={() => setMenuOpen(false)}><X size={20} /></button>
        </div>
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="navigation">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-item ${activePage === id ? "active" : ""}`} onClick={() => changePage(id)}>
              <Icon size={19} /><span>{label}</span>{activePage === id && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-label secondary-label">PERSONAL</div>
        <nav className="navigation">
          {extraNavigation.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-item ${activePage === id ? "active" : ""}`} onClick={() => changePage(id)}>
              <Icon size={19} /><span>{label}</span>{activePage === id && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-quote">
          <Sparkles size={18} />
          <p>“Great things are done by a series of small things brought together.”</p>
          <small>VINCENT VAN GOGH</small>
        </div>
        <div className="sidebar-profile">
          <div className="profile-avatar">{displayName.charAt(0).toUpperCase()}</div>
          <div className="profile-info"><strong>{displayName}</strong><span>{email}</span></div>
          <button className="logout-icon" onClick={logout} title="Log out"><LogOut size={17} /></button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={22} /></button>
            <div><span className="topbar-overline">HABITFORGE / {pageTitles[activePage].toUpperCase()}</span><h2>{pageTitles[activePage]}</h2></div>
          </div>
          <div className="topbar-actions">
            <span className="today-label"><CalendarDays size={16} /> {new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</span>
            <button className="theme-button" onClick={() => setDarkMode((value) => !value)} aria-label="Toggle theme">
              {darkMode ? <Sun size={19} /> : <Moon size={19} />}
            </button>
          </div>
        </header>

        <div className="page-content">
          {error && <div className="error-message">{error}<button onClick={() => setError("")}><X size={16} /></button></div>}
          {activePage === "dashboard" && renderDashboard()}
          {activePage === "habits" && renderHabits()}
          {activePage === "progress" && renderProgress()}
          {activePage === "achievements" && renderAchievements()}
          {activePage === "profile" && renderProfile()}
          {activePage === "settings" && renderSettings()}
          <footer><span>HabitForge<span className="footer-dot">.</span></span><span>Build better days, one habit at a time.</span></footer>
        </div>
      </main>
    </div>
  );
}

export default App;
