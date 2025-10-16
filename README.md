# 🎌 AnimeAct — Seguimiento de Animes

Aplicación web para gestionar tus animes: marcarlos como *Viendo*, *Favorito*, *Terminado* o *Ver después*.  
Proyecto construido con **Angular + Node.js (Express) + PostgreSQL**.

---

## 🚀 Tecnologías

| Área | Tecnología |
|------|-------------|
| Frontend | Angular 17+ |
| Backend | Node.js + Express |
| Base de datos | PostgreSQL |
| Autenticación | JWT (JSON Web Token) |
| Seguridad | Bcrypt.js para contraseñas |
| API externa | [Jikan API (MyAnimeList)](https://docs.api.jikan.moe/) |

---

## 📂 Estructura del Proyecto
```bash
anime-act/
├── anime-act-frontend/ # Proyecto Angular
│ ├── src/app/
│ └── ...
├── anime-act-backend/ # Servidor Express
│ ├── index.js
│ ├── package.json
│ └── .env
└── database/
└── anime_act_schema.sql # Script para crear la BD
```
---

## 🧠 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- 🟢 **Node.js** (v18 o superior)  
- 🐘 **PostgreSQL** (v14 o superior)  
- 🧰 **pgAdmin** o **psql** (para ejecutar scripts SQL)
- ⚙️ **Angular CLI 14** (`npm install -g @angular/cli@14`)

---

## ⚙️ Instalación del Backend

1️⃣ **Clona este repositorio:**
```bash
git clone https://github.com/tuusuario/anime-act.git
cd anime-act/anime-act-backend'
```
2️⃣ **Instala las dependencias:**
```bash
npm install
```

3️⃣ Configura tu archivo .env:
Crea un archivo .env dentro de anime-act-backend/ con el siguiente contenido:
```bash
PORT=4000
DB_USER=postgres
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=anime_act
JWT_SECRET=anime-act-secret-2024
```

4️⃣ Ejecuta el servidor:
```bash
npm run dev
```

Si todo va bien, deberías ver:

✅ BD conectada
🚀 API corriendo en http://localhost:4000

🗄️ Instalación de la Base de Datos

1️⃣ Abre pgAdmin o tu terminal de psql
2️⃣ Ejecuta el script de base de datos incluido:
```bash
psql -U postgres -f database/anime_act_schema.sql
```

Esto creará automáticamente:

📘 Base de datos: anime_act

🧑‍💻 Tabla: users

🎞️ Tabla: user_animes

⚙️ Trigger: update_user_animes_updated_at

También incluye un par de usuarios y registros de ejemplo.

🧩 Endpoints Principales
Método	Ruta	Descripción	Autenticación
POST	/api/register	Registro de usuario	❌
POST	/api/login	Inicio de sesión y JWT	❌
POST	/api/anime/status	Guarda o quita un estado de anime	✅
GET	/api/anime/status/:userId	Lista los animes del usuario	✅

Ejemplo de POST /api/anime/status:

{
  "animeId": 5114,
  "status": "favorito"
}
💻 Frontend (Angular)

1️⃣ Desde la carpeta raíz:

cd anime-act/anime-act-frontend


2️⃣ Instala dependencias:

npm install


3️⃣ Inicia el servidor Angular:

ng serve


4️⃣ Abre tu navegador en:
👉 http://localhost:4200

🎨 Funcionalidades

✅ Registro e inicio de sesión con validación JWT
✅ Visualización de información del anime (título, imagen, puntuación, sinopsis, tráiler)
✅ Marcar como:

🎥 Viendo

💖 Favorito

✅ Terminado

🕒 Ver después

✅ Botones activos/claros si el anime está marcado
✅ Eliminar anime de una lista directamente desde el Dashboard
✅ Persistencia de estados en PostgreSQL

🧰 Scripts útiles
🔁 Reiniciar la base de datos:
psql -U postgres -d anime_act -f database/anime_act_schema.sql

🧪 Correr el backend en modo desarrollo:
npm run dev

🧱 Construir el frontend para producción:
ng build --prod
