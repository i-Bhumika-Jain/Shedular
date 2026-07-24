export const DAY_NAME_BY_INDEX = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function getTodayIndex() {
  return new Date().getDay();
}

export function currentIsoDate() {
  return new Date().toISOString().slice(0, 10);
}
