import { useEffect, useRef, useState } from "react";

const PRIORITY_LABEL = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

const PRIORITY_WEIGHT = {
  low: 1,
  medium: 2,
  high: 3,
};

export default function TaskItem({ task, onToggle, onRemove, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isEditing) setDraft(task.title);
  }, [task.title, isEditing]);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  function startEdit() {
    setIsEditing(true);
    setDraft(task.title);
  }

  function cancelEdit() {
    setIsEditing(false);
    setDraft(task.title);
  }

  function saveEdit() {
    const clean = draft.trim();
    if (!clean) return; // não salva vazio
    if (clean !== task.title) onEdit?.(task.id, clean);
    setIsEditing(false);
  }

  function onKeyDown(e) {
    if (e.key === "Enter") saveEdit();
    if (e.key === "Escape") cancelEdit();
  }

  return (
    <li style={styles.item}>
      <label style={styles.label}>
        <input
          type="checkbox"
          checked={task.done}
          onChange={() => onToggle(task.id)}
        />

        <div style={styles.textBlock}>
          {!isEditing ? (
            <span style={{ ...styles.text, ...(task.done ? styles.done : {}) }}>
              {task.title}
            </span>
          ) : (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              style={styles.editInput}
              aria-label="Editar tarefa"
            />
          )}

          <span style={badgeStyle(task.priority)}>
            Prioridade: {PRIORITY_LABEL[task.priority] ?? "Média"}
          </span>
        </div>
      </label>

      <div style={styles.actions}>
        {!isEditing ? (
          <button style={styles.editBtn} onClick={startEdit}>
            Editar
          </button>
        ) : (
          <>
            <button
              style={styles.saveBtn}
              onClick={saveEdit}
              disabled={!draft.trim()}
            >
              Salvar
            </button>
            <button style={styles.cancelBtn} onClick={cancelEdit}>
              Cancelar
            </button>
          </>
        )}

        <button style={styles.delete} onClick={() => onRemove(task.id)}>
          Remover
        </button>
      </div>
    </li>
  );
}

function badgeStyle(priority = "medium") {
  const w = PRIORITY_WEIGHT[priority] ?? 2;
  return {
    display: "inline-block",
    marginTop: 4,
    fontSize: 12,
    padding: "2px 8px",
    borderRadius: 999,
    border: "1px solid var(--border)",
    background:
      w === 3
        ? "var(--badgeHigh)"
        : w === 1
          ? "var(--badgeLow)"
          : "var(--badgeMed)",
    color: "var(--text)",
  };
}

const styles = {
  item: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid var(--border)",
    background: "var(--surface)",
  },
  label: { display: "flex", alignItems: "center", gap: 10, flex: 1 },
  textBlock: { display: "flex", flexDirection: "column", flex: 1 },

  text: { userSelect: "none" },
  done: { textDecoration: "line-through", color: "var(--muted)" },

  editInput: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid var(--border)",
    background: "var(--card)",
    color: "var(--text)",
    outline: "none",
    width: "100%",
    maxWidth: 320,
  },

  actions: { display: "flex", alignItems: "center", gap: 8 },

  editBtn: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid var(--border)",
    background: "transparent",
    color: "var(--text)",
    cursor: "pointer",
  },
  saveBtn: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text)",
    cursor: "pointer",
  },
  cancelBtn: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid var(--border)",
    background: "transparent",
    color: "var(--muted)",
    cursor: "pointer",
  },

  delete: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid var(--danger)",
    background: "transparent",
    color: "var(--danger)",
    cursor: "pointer",
  },
};
