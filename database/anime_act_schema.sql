-- ============================================================
-- 📦 DATABASE SETUP: anime_act
-- 🗓️ Export Date: 2025-10-16
-- 🧑‍💻 Author: Proyecto AnimeAct
-- 💾 Description: Script SQL para crear la base de datos completa
-- ============================================================

-- ============================================================
-- 0️⃣ CREACIÓN DE LA BASE DE DATOS
-- ============================================================
-- ⚠️ Ejecuta esto solo si la base de datos no existe aún.
-- Si ya la tienes creada, puedes omitir esta sección.
-- ============================================================
CREATE DATABASE anime_act
  WITH 
  OWNER = postgres
  ENCODING = 'UTF8'
  LC_COLLATE = 'Spanish_Spain.1252'
  LC_CTYPE = 'Spanish_Spain.1252'
  TABLESPACE = pg_default
  CONNECTION LIMIT = -1;

-- Conectarse a la nueva base antes de crear las tablas:
\c anime_act;

-- ============================================================
-- 1️⃣ FUNCTION: update_updated_at_column
-- ============================================================
-- Actualiza automáticamente el campo `updated_at` en cada UPDATE
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 2️⃣ TABLE: users
-- ============================================================
CREATE TABLE public.users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

-- ============================================================
-- 3️⃣ TABLE: user_animes
-- ============================================================
CREATE TABLE public.user_animes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
  anime_id INTEGER NOT NULL,
  status TEXT CHECK (
    status IN ('viendo', 'terminado', 'favorito', 'ver despues')
  ),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice único: evita duplicar el mismo anime con el mismo estado
CREATE UNIQUE INDEX unique_user_anime_status 
  ON public.user_animes (user_id, anime_id, status);

-- Trigger: actualiza automáticamente `updated_at`
CREATE TRIGGER update_user_animes_updated_at
BEFORE UPDATE ON public.user_animes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 4️⃣ DATOS DE EJEMPLO (Opcional)
-- ============================================================
INSERT INTO public.users (username, email, password)
VALUES 
  ('testuser', 'test@example.com', '$2a$12$W9jZ6K6z6z6z6z6z6z6z6z6z6z6z6z6z6z6z6z6z6z6z6z6z6z6z6z6'),
  ('Juan', 'juan@gmail.com', '$2a$10$hnWcSzKz696ZJW.FvN8fVeLvTUzfXOWMiAvR8RQL2W9Hq/E9z6ijy');

INSERT INTO public.user_animes (user_id, anime_id, status)
VALUES
  (2, 21, 'viendo'),
  (2, 21, 'ver despues');

-- ============================================================
-- ✅ END OF SCRIPT
-- ============================================================
