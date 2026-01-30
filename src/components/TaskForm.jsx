import { useState } from "react";

export default function TaskForm({ onAdd }) {
  const [text, setText] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const title = text.trim();
    if (!title) return;

    onAdd(title);
    setText("");
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
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
  );
}

const styles = {
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
};
