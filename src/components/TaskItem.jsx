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

export default function TaskItem({ task, onToggle, onRemove }) {
  return (
    <li style={styles.item}>
      <label style={styles.label}>
        <input
          type="checkbox"
          checked={task.done}
          onChange={() => onToggle(task.id)}
        />

        <div style={styles.textBlock}>
          <span style={{ ...styles.text, ...(task.done ? styles.done : {}) }}>
            {task.title}
          </span>

          <span style={badgeStyle(task.priority)}>
            Prioridade: {PRIORITY_LABEL[task.priority] ?? "Média"}
          </span>
        </div>
      </label>

      <button style={styles.delete} onClick={() => onRemove(task.id)}>
        Remover
      </button>
    </li>
  );
}

function badgeStyle(priority = "medium") {
  const w = PRIORITY_WEIGHT[priority] ?? 2;
  // só muda intensidade via borda/fundo; mantém simples
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
  textBlock: { display: "flex", flexDirection: "column" },
  text: { userSelect: "none" },
  done: { textDecoration: "line-through", color: "var(--muted)" },
  delete: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid var(--danger)",
    background: "transparent",
    color: "var(--danger)",
    cursor: "pointer",
  },
};
