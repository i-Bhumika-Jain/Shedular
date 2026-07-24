"use client";

import { DAY_NAME_BY_INDEX } from "../constants/days";

export default function DayTabs({ activeDayIndex, onChange }) {
  return (
    <div className="dayTabs" role="tablist" aria-label="Days of week">
      {DAY_NAME_BY_INDEX.map((dayName, index) => (
        <button
          key={dayName}
          type="button"
          role="tab"
          aria-selected={activeDayIndex === index}
          className={activeDayIndex === index ? "dayTab active" : "dayTab"}
          onClick={() => onChange(index)}
        >
          {dayName.slice(0, 3)}
        </button>
      ))}
    </div>
  );
}
