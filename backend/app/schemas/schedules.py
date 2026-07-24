from pydantic import BaseModel, Field
from typing import Literal


class CreateSchedulePayload(BaseModel):
    name: str = Field(default="Weekly Schedule", min_length=1, max_length=160)
    scheduleType: Literal["weekly_template", "dated_plan"] = "weekly_template"
    timezone: str = Field(default="Asia/Kolkata", min_length=1, max_length=80)
    startDate: str | None = None
    endDate: str | None = None


class UpdateSchedulePayload(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=160)
    timezone: str | None = Field(default=None, min_length=1, max_length=80)


class CreateScheduleItemPayload(BaseModel):
    title: str = Field(min_length=1, max_length=240)
    description: str | None = None
    category: str = Field(default="custom", min_length=1, max_length=80)
    priority: int = Field(default=3, ge=1, le=5)
    weekday: int | None = Field(default=None, ge=0, le=6)
    scheduledDate: str | None = None
    startTime: str
    endTime: str | None = None
    timezone: str = Field(default="Asia/Kolkata", min_length=1, max_length=80)
    recurrenceRule: dict = Field(default_factory=dict)
    source: Literal["manual", "assistant", "system", "import"] = "manual"
    metadata: dict = Field(default_factory=dict)


class CompletionPayload(BaseModel):
    completionDate: str
    status: Literal["done", "skipped", "moved"] = "done"
    note: str | None = None
