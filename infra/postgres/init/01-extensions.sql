-- Bootstrap SQL run once on first Postgres container start.
-- Enables the extensions the platform relies on (doc 12 / doc 14):
--   vector   -> embeddings & similarity search (pgvector)
--   pg_trgm  -> trigram fuzzy text matching (search fallbacks)
--   uuid-ossp / pgcrypto -> UUID + cryptographic helpers
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
