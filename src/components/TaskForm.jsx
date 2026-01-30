import { useState } from "react";

export default function TaskForm({ onAdd }) {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("medium");

  function handleSubmit(e) {
    e.preventDefault();
    const title = text.trim();
    if (!title) return;

    onAdd(title, priority);
    setText("");
    setPriority("medium");
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Adicionar tarefa..."
        style={styles.input}
      />

      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        style={styles.select}
        aria-label="Prioridade"
      >
        <option value="low">Baixa</option>
        <option value="medium">Média</option>
        <option value="high">Alta</option>
      </select>

      <button style={styles.button} type="submit" disabled={!text.trim()}>
        Adicionar
      </button>
    </form>
  );
}

const styles = {
  form: { display: "flex", gap: 8, marginBottom: 14 },
  input: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid var(--border)",
    outline: "none",
    background: "var(--surface)",
    color: "var(--text)",
  },
  select: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text)",
  },
  button: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid var(--btnBorder)",
    background: "var(--btnBg)",
    color: "var(--btnText)",
    cursor: "pointer",
  },
};
