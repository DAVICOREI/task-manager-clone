import TaskItem from "./TaskItem";

export default function TaskList({ tasks, onToggle, onRemove, onEdit }) {
  if (!tasks || tasks.length === 0) {
    return <p style={styles.empty}>Nenhuma tarefa ainda.</p>;
  }

  return (
    <ul style={styles.list}>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onRemove={onRemove}
          onEdit={onEdit}
        />
      ))}
    </ul>
  );
}

const styles = {
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "grid",
    gap: 8,
  },
  empty: {
    color: "var(--muted)",
    padding: 10,
    margin: 0,
  },
};
