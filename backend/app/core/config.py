from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "HRIS Final Year Project"
    app_env: str = "development"
    debug: bool = True

    # Optional so the API still starts without a database configured.
    # Example: postgresql+psycopg://user:password@localhost:5432/hris
    database_url: str | None = None

    # Secret that signs access tokens. It must be at least 32 characters and
    # must never be committed. Generate one with:
    #   python -c "import secrets; print(secrets.token_urlsafe(48))"
    jwt_secret: str | None = None
    access_token_expire_minutes: int = 15

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
