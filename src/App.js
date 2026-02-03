import { useEffect, useMemo, useState } from "react";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";

const STORAGE_TASKS = "tasks_v2";
const STORAGE_THEME = "theme_v1";
const STORAGE_SORT = "sort_v1";
const STORAGE_FILTER = "filter_v1";
const STORAGE_QUERY = "query_v1";
const STORAGE_PAGE_SIZE = "page_size_v1";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const PRIORITY_WEIGHT = { low: 1, medium: 2, high: 3 };

export default function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem(STORAGE_THEME) || "light",
  );
  const [sortMode, setSortMode] = useState(
    () => localStorage.getItem(STORAGE_SORT) || "created_desc",
  );
  const [filterMode, setFilterMode] = useState(
    () => localStorage.getItem(STORAGE_FILTER) || "all",
  );
  const [query, setQuery] = useState(
    () => localStorage.getItem(STORAGE_QUERY) || "",
  );
  const [pageSize, setPageSize] = useState(() => {
    const raw = localStorage.getItem(STORAGE_PAGE_SIZE);
    const n = raw ? Number(raw) : 10;
    return Number.isFinite(n) && n > 0 ? n : 10;
  });
  const [page, setPage] = useState(1);

  const [tasks, setTasks] = useState(() => {
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

  useEffect(() => localStorage.setItem(STORAGE_THEME, theme), [theme]);
  useEffect(() => localStorage.setItem(STORAGE_SORT, sortMode), [sortMode]);
  useEffect(
    () => localStorage.setItem(STORAGE_FILTER, filterMode),
    [filterMode],
  );
  useEffect(() => localStorage.setItem(STORAGE_QUERY, query), [query]);
  useEffect(
    () => localStorage.setItem(STORAGE_PAGE_SIZE, String(pageSize)),
    [pageSize],
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    setPage(1);
  }, [query, filterMode, sortMode, pageSize]);

  const totalCount = tasks.length;
  const remaining = useMemo(() => tasks.filter((t) => !t.done).length, [tasks]);
  const doneCount = totalCount - remaining;

  const activeByPriority = useMemo(() => {
    const acc = { low: 0, medium: 0, high: 0 };
    for (const t of tasks) {
      if (t.done) continue;
      if (
        t.priority === "low" ||
        t.priority === "medium" ||
        t.priority === "high"
      )
        acc[t.priority] += 1;
      else acc.medium += 1;
    }
    return acc;
  }, [tasks]);

  const sortedTasks = useMemo(() => {
    const copy = [...tasks];

    copy.sort((a, b) => {
      if (sortMode === "created_desc")
        return (b.createdAt ?? 0) - (a.createdAt ?? 0);
      if (sortMode === "created_asc")
        return (a.createdAt ?? 0) - (b.createdAt ?? 0);

      if (sortMode === "priority_desc")
        return (
          (PRIORITY_WEIGHT[b.priority] ?? 2) -
          (PRIORITY_WEIGHT[a.priority] ?? 2)
        );
      if (sortMode === "priority_asc")
        return (
          (PRIORITY_WEIGHT[a.priority] ?? 2) -
          (PRIORITY_WEIGHT[b.priority] ?? 2)
        );

      return 0;
    });

    return copy;
  }, [tasks, sortMode]);

  const filteredByStatus = useMemo(() => {
    if (filterMode === "active") return sortedTasks.filter((t) => !t.done);
    if (filterMode === "done") return sortedTasks.filter((t) => t.done);
    return sortedTasks;
  }, [sortedTasks, filterMode]);

  const filteredByQuery = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return filteredByStatus;
    return filteredByStatus.filter((t) =>
      (t.title || "").toLowerCase().includes(q),
    );
  }, [filteredByStatus, query]);

  const totalFiltered = filteredByQuery.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  const pageStartIndex = (page - 1) * pageSize;
  const pageEndIndex = Math.min(pageStartIndex + pageSize, totalFiltered);

  const visibleTasks = useMemo(() => {
    return filteredByQuery.slice(pageStartIndex, pageEndIndex);
  }, [filteredByQuery, pageStartIndex, pageEndIndex]);

  // CRUD
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

  function updateTaskTitle(id, title) {
    const clean = title.trim();
    if (!clean) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title: clean } : t)),
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

  function clearSearch() {
    setQuery("");
  }

  function prevPage() {
    setPage((p) => Math.max(1, p - 1));
  }

  function nextPage() {
    setPage((p) => Math.min(totalPages, p + 1));
  }

  const vars = theme === "dark" ? darkVars : lightVars;

  return (
    <div style={{ ...styles.page, ...vars }}>
      <div style={styles.card}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>Task Manager</h1>
            <p style={styles.subtitle}>
              {remaining} pendente{remaining === 1 ? "" : "s"} • {doneCount}{" "}
              concluída{doneCount === 1 ? "" : "s"} • {totalCount} total
            </p>

            <div style={styles.priorityRow}>
              <span style={styles.pill}>Alta: {activeByPriority.high}</span>
              <span style={styles.pill}>Média: {activeByPriority.medium}</span>
              <span style={styles.pill}>Baixa: {activeByPriority.low}</span>
            </div>
          </div>

          <button style={styles.themeBtn} onClick={toggleTheme}>
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
        </header>

        {/* Busca */}
        <div style={styles.searchRow}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título..."
            style={styles.searchInput}
            aria-label="Buscar tarefas"
          />
          <button
            style={styles.clearBtn}
            onClick={clearSearch}
            disabled={!query.trim()}
          >
            Limpar
          </button>
        </div>

        <div style={styles.toolbar}>
          <div style={styles.filters}>
            <button
              style={
                filterMode === "all" ? styles.filterBtnActive : styles.filterBtn
              }
              onClick={() => setFilterMode("all")}
            >
              Todas
            </button>
            <button
              style={
                filterMode === "active"
                  ? styles.filterBtnActive
                  : styles.filterBtn
              }
              onClick={() => setFilterMode("active")}
            >
              Pendentes
            </button>
            <button
              style={
                filterMode === "done"
                  ? styles.filterBtnActive
                  : styles.filterBtn
              }
              onClick={() => setFilterMode("done")}
            >
              Concluídas
            </button>
          </div>

          <div style={styles.rightControls}>
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

            <label style={styles.toolbarLabel}>
              Por página:
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                style={styles.select}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </label>
          </div>
        </div>

        <TaskForm onAdd={addTaskTitle} />

        {/* Lista + edição inline */}
        <TaskList
          tasks={visibleTasks}
          onToggle={toggleTask}
          onRemove={removeTask}
          onEdit={updateTaskTitle}
        />

        {/* Paginação */}
        <div style={styles.pagination}>
          <div style={styles.pageInfo}>
            Exibindo {totalFiltered === 0 ? 0 : pageStartIndex + 1}–
            {pageEndIndex} de {totalFiltered}
            {query.trim() ? ` • busca: "${query.trim()}"` : ""}
          </div>

          <div style={styles.pageButtons}>
            <button
              style={styles.pageBtn}
              onClick={prevPage}
              disabled={page <= 1}
            >
              Anterior
            </button>
            <span style={styles.pageNum}>
              Página {page} / {totalPages}
            </span>
            <button
              style={styles.pageBtn}
              onClick={nextPage}
              disabled={page >= totalPages}
            >
              Próxima
            </button>
          </div>
        </div>

        <div style={styles.footer}>
          <button
            style={styles.linkBtn}
            onClick={clearDone}
            disabled={doneCount === 0}
          >
            Limpar concluídas
          </button>
        </div>
      </div>
    </div>
  );
}

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
  subtitle: { marginTop: 6, marginBottom: 8, color: "var(--muted)" },

  priorityRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  pill: {
    fontSize: 12,
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text)",
  },

  themeBtn: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text)",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  searchRow: { display: "flex", gap: 8, marginBottom: 10 },
  searchInput: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text)",
    outline: "none",
  },
  clearBtn: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid var(--border)",
    background: "transparent",
    color: "var(--text)",
    cursor: "pointer",
  },

  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 10,
  },
  filters: { display: "flex", gap: 8 },
  filterBtn: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid var(--border)",
    background: "transparent",
    color: "var(--text)",
    cursor: "pointer",
  },
  filterBtnActive: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text)",
    cursor: "pointer",
  },

  rightControls: { display: "flex", gap: 10, flexWrap: "wrap" },
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

  pagination: {
    marginTop: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    paddingTop: 10,
    borderTop: "1px solid var(--border)",
  },
  pageInfo: { color: "var(--muted)", fontSize: 12 },
  pageButtons: { display: "flex", alignItems: "center", gap: 10 },
  pageBtn: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid var(--border)",
    background: "transparent",
    color: "var(--text)",
    cursor: "pointer",
  },
  pageNum: { color: "var(--muted)", fontSize: 12 },

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
