import { useEffect, useMemo, useState } from "react";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";

const STORAGE_KEY = "tasks_v1";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const remaining = useMemo(() => tasks.filter((t) => !t.done).length, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  function addTaskTitle(title) {
    setTasks((prev) => [{ id: uid(), title, done: false }, ...prev]);
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

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Task Manager</h1>
        <p style={styles.subtitle}>
          {remaining} pendente{remaining === 1 ? "" : "s"}
        </p>

        <TaskForm onAdd={addTaskTitle} />

        <TaskList tasks={tasks} onToggle={toggleTask} onRemove={removeTask} />

        <div style={styles.footer}>
          <button style={styles.linkBtn} onClick={clearDone}>
            Limpar concluídas
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 16,
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
  },
  card: {
    width: "100%",
    maxWidth: 520,
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 20,
  },
  title: { margin: 0, fontSize: 28 },
  subtitle: { marginTop: 6, marginBottom: 18, color: "#6b7280" },
  footer: { marginTop: 12, display: "flex", justifyContent: "flex-end" },
  linkBtn: {
    border: "none",
    background: "transparent",
    color: "#111827",
    cursor: "pointer",
    textDecoration: "underline",
  },
};
