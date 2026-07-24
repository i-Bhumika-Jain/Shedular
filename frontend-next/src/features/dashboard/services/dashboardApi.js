import { apiRequest } from "@/lib/api";

export async function getPeople() {
  const data = await apiRequest("/people");
  return data.people || [];
}

export async function getSchedules(personId) {
  const data = await apiRequest(`/people/${personId}/schedules`);
  return data.schedules || [];
}

export async function getScheduleItems(scheduleId, weekday) {
  const query = Number.isInteger(weekday) ? `?weekday=${weekday}` : "";
  const data = await apiRequest(`/schedules/${scheduleId}/items${query}`);
  return data.items || [];
}

export async function createSchedule(personId, payload) {
  const data = await apiRequest(`/people/${personId}/schedules`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.schedule;
}

export async function updateSchedule(scheduleId, payload) {
  const data = await apiRequest(`/schedules/${scheduleId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return data.schedule;
}

export async function createScheduleItem(scheduleId, payload) {
  const data = await apiRequest(`/schedules/${scheduleId}/items`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.item;
}

export async function completeScheduleItem(itemId, payload) {
  const data = await apiRequest(`/schedule-items/${itemId}/completions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.completion;
}
