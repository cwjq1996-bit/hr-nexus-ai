from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "HRIS Final Year Project"
    app_env: str = "development"
    debug: bool = True

    # Optional so the API still starts without a database configured.
    # Example: postgresql+psycopg://user:password@localhost:5432/hris
    database_url: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
