import { useEffect, useMemo, useState } from "react";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";

const STORAGE_TASKS = "tasks_v2";
const STORAGE_THEME = "theme_v1";
const STORAGE_SORT = "sort_v1";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const PRIORITY_WEIGHT = { low: 1, medium: 2, high: 3 };

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(STORAGE_THEME) || "light";
  });

  const [sortMode, setSortMode] = useState(() => {
    return localStorage.getItem(STORAGE_SORT) || "created_desc";
  });

  const [tasks, setTasks] = useState(() => {
    // Migração: tenta v2; se não existir, cai pro v1 (se você usava)
    try {
      const rawV2 = localStorage.getItem(STORAGE_TASKS);
      if (rawV2) return migrateTasks(JSON.parse(rawV2));

      const rawV1 = localStorage.getItem("tasks_v1");
      if (rawV1) return migrateTasks(JSON.parse(rawV1));

      return [];
    } catch {
      return [];
    }
  });

  // Persistências
  useEffect(() => localStorage.setItem(STORAGE_THEME, theme), [theme]);
  useEffect(() => localStorage.setItem(STORAGE_SORT, sortMode), [sortMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_TASKS, JSON.stringify(tasks));
  }, [tasks]);

  const remaining = useMemo(() => tasks.filter((t) => !t.done).length, [tasks]);

  const sortedTasks = useMemo(() => {
    const copy = [...tasks];

    copy.sort((a, b) => {
      if (sortMode === "created_desc")
        return (b.createdAt ?? 0) - (a.createdAt ?? 0);
      if (sortMode === "created_asc")
        return (a.createdAt ?? 0) - (b.createdAt ?? 0);

      if (sortMode === "priority_desc") {
        return (
          (PRIORITY_WEIGHT[b.priority] ?? 2) -
          (PRIORITY_WEIGHT[a.priority] ?? 2)
        );
      }
      if (sortMode === "priority_asc") {
        return (
          (PRIORITY_WEIGHT[a.priority] ?? 2) -
          (PRIORITY_WEIGHT[b.priority] ?? 2)
        );
      }

      // fallback
      return 0;
    });

    return copy;
  }, [tasks, sortMode]);

  function addTaskTitle(title, priority = "medium") {
    setTasks((prev) => [
      { id: uid(), title, done: false, priority, createdAt: Date.now() },
      ...prev,
    ]);
  }

  function toggleTask(id) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  }

  function removeTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function clearDone() {
    setTasks((prev) => prev.filter((t) => !t.done));
  }

  function toggleTheme() {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }

  const vars = theme === "dark" ? darkVars : lightVars;

  return (
    <div style={{ ...styles.page, ...vars }}>
      <div style={styles.card}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>Task Manager</h1>
            <p style={styles.subtitle}>
              {remaining} pendente{remaining === 1 ? "" : "s"}
            </p>
          </div>

          <button style={styles.themeBtn} onClick={toggleTheme}>
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
        </header>

        <div style={styles.toolbar}>
          <label style={styles.toolbarLabel}>
            Ordenação:
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value)}
              style={styles.select}
            >
              <option value="created_desc">Mais recentes</option>
              <option value="created_asc">Mais antigas</option>
              <option value="priority_desc">Prioridade alta → baixa</option>
              <option value="priority_asc">Prioridade baixa → alta</option>
            </select>
          </label>
        </div>

        <TaskForm onAdd={addTaskTitle} />

        <TaskList
          tasks={sortedTasks}
          onToggle={toggleTask}
          onRemove={removeTask}
        />

        <div style={styles.footer}>
          <button style={styles.linkBtn} onClick={clearDone}>
            Limpar concluídas
          </button>
        </div>
      </div>
    </div>
  );
}

// Migra tarefas antigas: garante priority e createdAt
function migrateTasks(list) {
  if (!Array.isArray(list)) return [];
  return list.map((t) => ({
    id: t.id ?? uid(),
    title: String(t.title ?? ""),
    done: Boolean(t.done),
    priority:
      t.priority === "low" || t.priority === "high" || t.priority === "medium"
        ? t.priority
        : "medium",
    createdAt: typeof t.createdAt === "number" ? t.createdAt : Date.now(),
  }));
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 16,
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
    background: "var(--bg)",
    color: "var(--text)",
  },
  card: {
    width: "100%",
    maxWidth: 560,
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: 20,
    background: "var(--card)",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  title: { margin: 0, fontSize: 28 },
  subtitle: { marginTop: 6, marginBottom: 0, color: "var(--muted)" },

  themeBtn: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text)",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  toolbar: { display: "flex", justifyContent: "flex-end", marginBottom: 10 },
  toolbarLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "var(--muted)",
  },
  select: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text)",
  },

  footer: { marginTop: 12, display: "flex", justifyContent: "flex-end" },
  linkBtn: {
    border: "none",
    background: "transparent",
    color: "var(--text)",
    cursor: "pointer",
    textDecoration: "underline",
  },
};

const lightVars = {
  "--bg": "#f8fafc",
  "--card": "#ffffff",
  "--surface": "#ffffff",
  "--text": "#111827",
  "--muted": "#6b7280",
  "--border": "#e5e7eb",
  "--danger": "#ef4444",
  "--btnBg": "#111827",
  "--btnText": "#ffffff",
  "--btnBorder": "#111827",
  "--badgeHigh": "#fee2e2",
  "--badgeMed": "#e0e7ff",
  "--badgeLow": "#dcfce7",
};

const darkVars = {
  "--bg": "#0b1220",
  "--card": "#0f172a",
  "--surface": "#111c33",
  "--text": "#e5e7eb",
  "--muted": "#94a3b8",
  "--border": "#22314f",
  "--danger": "#fb7185",
  "--btnBg": "#e5e7eb",
  "--btnText": "#111827",
  "--btnBorder": "#e5e7eb",
  "--badgeHigh": "#3b0a14",
  "--badgeMed": "#111a3a",
  "--badgeLow": "#06331f",
};
