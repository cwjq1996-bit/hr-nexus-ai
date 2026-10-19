import uuid
from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator
from pydantic.alias_generators import to_camel

Department = Literal["Engineering", "People", "Sales", "Operations", "Finance"]
EmploymentStatus = Literal["Active", "On leave", "Probation"]

EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"


class EmployeeBase(BaseModel):
    # JSON uses camelCase (startDate) so it matches frontend/src/types/hr.ts.
    # snake_case names are still accepted on input.
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        populate_by_name=True,
    )

    name: str = Field(min_length=1, max_length=200)
    email: str = Field(max_length=320, pattern=EMAIL_PATTERN)
    role: str = Field(min_length=1, max_length=200)
    department: Department
    status: EmploymentStatus
    start_date: date

    @field_validator("name", "role", "email", mode="before")
    @classmethod
    def strip_whitespace(cls, value):
        return value.strip() if isinstance(value, str) else value

    @field_validator("email", mode="after")
    @classmethod
    def lowercase_email(cls, value: str) -> str:
        return value.lower()


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeRead(EmployeeBase):
    id: uuid.UUID
