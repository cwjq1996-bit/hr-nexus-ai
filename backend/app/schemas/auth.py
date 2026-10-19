import uuid
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

Role = Literal["Admin", "Employee"]


class _CamelModel(BaseModel):
    # JSON uses camelCase (accessToken) to match the frontend. snake_case
    # names are still accepted on input.
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class LoginRequest(_CamelModel):
    email: str = Field(min_length=3, max_length=320)
    # The upper bound stops someone sending a huge "password" to make the
    # server spend time hashing it.
    password: str = Field(min_length=1, max_length=256)


class CurrentUser(_CamelModel):
    id: uuid.UUID
    employee_id: uuid.UUID
    name: str
    email: str
    role: Role


class TokenResponse(_CamelModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    expires_in: int
    user: CurrentUser
