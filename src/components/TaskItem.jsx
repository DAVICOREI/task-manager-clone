export default function TaskItem({ task, onToggle, onRemove }) {
  return (
    <li style={styles.item}>
      <label style={styles.label}>
        <input
          type="checkbox"
          checked={task.done}
          onChange={() => onToggle(task.id)}
        />
        <span style={{ ...styles.text, ...(task.done ? styles.done : {}) }}>
          {task.title}
        </span>
      </label>

      <button style={styles.delete} onClick={() => onRemove(task.id)}>
        Remover
      </button>
    </li>
  );
}

const styles = {
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
  text: { userSelect: "none" },
  done: { textDecoration: "line-through", color: "#6b7280" },
  delete: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #ef4444",
    background: "white",
    color: "#ef4444",
    cursor: "pointer",
  },
};
