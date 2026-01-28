import { useEffect, useMemo, useState } from "react";
import TaskItem from "./components/TaskItem";

const STORAGE_KEY = "tasks_v1";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function App() {
  const [text, setText] = useState("");
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

  function addTask(e) {
    e.preventDefault();
    const title = text.trim();
    if (!title) return;

    setTasks((prev) => [{ id: uid(), title, done: false }, ...prev]);
    setText("");
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

        <form onSubmit={addTask} style={styles.form}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Adicionar tarefa..."
            style={styles.input}
          />
          <button style={styles.button} type="submit">
            Adicionar
          </button>
        </form>

        <ul style={styles.list}>
          {tasks.length === 0 ? (
            <li style={styles.empty}>Nenhuma tarefa ainda.</li>
          ) : (
            tasks.map((t) => (
              <TaskItem
                key={t.id}
                task={t}
                onToggle={toggleTask}
                onRemove={removeTask}
              />
            ))
          )}
        </ul>

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
  form: { display: "flex", gap: 8, marginBottom: 14 },
  input: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    outline: "none",
  },
  button: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #111827",
    background: "#111827",
    color: "white",
    cursor: "pointer",
  },
  list: { listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 },
  item: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
  },
  label: { display: "flex", alignItems: "center", gap: 10 },
  task: { userSelect: "none" },
  done: { textDecoration: "line-through", color: "#6b7280" },
  delete: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #ef4444",
    background: "white",
    color: "#ef4444",
    cursor: "pointer",
  },
  empty: { color: "#6b7280", padding: 10 },
  footer: { marginTop: 12, display: "flex", justifyContent: "flex-end" },
  linkBtn: {
    border: "none",
    background: "transparent",
    color: "#111827",
    cursor: "pointer",
    textDecoration: "underline",
  },
};
