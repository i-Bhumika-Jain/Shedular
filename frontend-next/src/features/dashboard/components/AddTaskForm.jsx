"use client";

import { useMemo, useState } from "react";

const initialState = {
  title: "",
  startTime: "",
  category: "custom",
};

export default function AddTaskForm({ onCreate, disabled }) {
  const [values, setValues] = useState(initialState);

  const canSubmit = useMemo(
    () => values.title.trim().length > 0 && /^\d{2}:\d{2}$/.test(values.startTime),
    [values]
  );

  return (
    <form
      className="addTaskForm"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit || disabled) return;
        onCreate({
          title: values.title.trim(),
          startTime: values.startTime,
          category: values.category,
        });
        setValues(initialState);
      }}
    >
      <label>
        Task
        <input
          value={values.title}
          onChange={(event) => setValues((prev) => ({ ...prev, title: event.target.value }))}
          placeholder="Morning walk"
        />
      </label>
      <label>
        Time
        <input
          type="time"
          value={values.startTime}
          onChange={(event) => setValues((prev) => ({ ...prev, startTime: event.target.value }))}
        />
      </label>
      <label>
        Category
        <select
          value={values.category}
          onChange={(event) => setValues((prev) => ({ ...prev, category: event.target.value }))}
        >
          <option value="custom">Custom</option>
          <option value="health">Health</option>
          <option value="study">Study</option>
          <option value="work">Work</option>
          <option value="meal">Meal</option>
          <option value="selfcare">Selfcare</option>
        </select>
      </label>
      <button type="submit" disabled={!canSubmit || disabled}>
        Add task
      </button>
    </form>
  );
}
