"use client";

function categoryClass(category) {
  const value = (category || "custom").toLowerCase();
  return `taskPill taskPill-${value}`;
}

export default function TaskList({ items, onToggleDone }) {
  if (!items.length) {
    return <p className="emptyState">No tasks for this day yet. Add one below.</p>;
  }

  return (
    <ul className="taskList">
      {items.map((item) => {
        const isDone = item.completionStatus === "done";
        return (
          <li key={item.id} className={isDone ? "taskItem done" : "taskItem"}>
            <label className="taskCheckLabel">
              <input
                type="checkbox"
                checked={isDone}
                onChange={(event) => onToggleDone(item, event.target.checked)}
              />
              <span />
            </label>
            <div className="taskBody">
              <span>{item.startTime}</span>
              <strong>{item.title}</strong>
            </div>
            <small className={categoryClass(item.category)}>{item.category}</small>
          </li>
        );
      })}
    </ul>
  );
}
