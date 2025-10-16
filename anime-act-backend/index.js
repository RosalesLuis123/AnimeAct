import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const SECRET = process.env.JWT_SECRET || 'anime-act-secret-2024';

// ✅ MIDDLEWARES
app.use(cors({ 
  origin: 'http://localhost:4200',
  credentials: true 
}));
app.use(express.json());

// ✅ LOGS PARA DEBUG
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Body:`, req.body);
  next();
});

// ✅ POOL DE BASE DE DATOS
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'anime_act',
  password: process.env.DB_PASSWORD || 'tu contrasena',
  port: process.env.DB_PORT || 5432,
});

// Test conexión
pool.connect()
  .then(() => console.log('✅ BD conectada'))
  .catch(err => console.error('❌ Error BD:', err));

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'OK', db: 'Connected' });
  } catch (err) {
    res.status(500).json({ error: 'DB Error' });
  }
});

// =================================================================
// TUS RUTAS REGISTRO Y LOGIN (CON FIXES)
// =================================================================

// --- Registro (CON NORMALIZACIÓN EMAIL Y MANEJO DE ERRORES)
app.post('/api/register', async (req, res) => {
  console.log('📝 === REGISTRO ===');
  
  const { username, email, password } = req.body;
  
  // ✅ NORMALIZAR EMAIL
  const normalizedEmail = email.toLowerCase().trim();
  
  if (!username || !normalizedEmail || !password) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    console.log('🔐 Hash creado para:', normalizedEmail);

    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, normalizedEmail, hashed]
    );
    
    console.log('✅ Usuario creado ID:', result.rows[0].id);
    res.status(201).json(result.rows[0]);
    
  } catch (err) {
    console.error('💥 Error registro:', err);
    
    // ✅ MANEJO ESPECÍFICO DE ERRORES POSTGRES
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Usuario o email ya existente' });
    }
    
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// --- Login (CON NORMALIZACIÓN EMAIL Y CASE INSENSITIVE)
app.post('/api/login', async (req, res) => {
  console.log('🔐 === LOGIN ===');
  
  const { email, password } = req.body;
  
  // ✅ NORMALIZAR EMAIL
  const normalizedEmail = email.toLowerCase().trim();
  console.log('🔍 Buscando:', normalizedEmail);

  try {
    // ✅ QUERY CASE INSENSITIVE
    const userResult = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)', 
      [normalizedEmail]
    );
    
    const user = userResult.rows[0];
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    console.log('🔐 Verificando password...');
    const valid = await bcrypt.compare(password, user.password);
    
    if (!valid) {
      console.log('❌ Contraseña incorrecta');
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // ✅ TOKEN CON ID DEL USUARIO
    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '1d' });
    
    console.log('✅ Login exitoso:', user.username);
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username,
        email: user.email 
      } 
    });
    
  } catch (err) {
    console.error('💥Error login:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// =================================================================
// TUS RUTAS DE ANIME (PROTEGIDAS)
// =================================================================

// Middleware para verificar token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user; // { id: userId }
    next();
  });
};

// --- Guardar estado de anime (PROTEGIDO)
app.post('/api/anime/status', authenticateToken, async (req, res) => {
  const { animeId, status } = req.body;
  const userId = req.user.id;

  if (!animeId || !status) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  try {
    await pool.query(
      `INSERT INTO user_animes (user_id, anime_id, status)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, anime_id, status)
       DO NOTHING`,
      [userId, animeId, status]
    );
    
    res.json({ message: `Estado '${status}' guardado correctamente.` });
  } catch (err) {
    console.error('💥 Error anime status:', err.message);
    res.status(500).json({ error: 'Error guardando estado', details: err.message });
  }
});

// --- Eliminar un estado de anime (PROTEGIDO)
app.delete('/api/anime/status', authenticateToken, async (req, res) => {
  const { animeId, status } = req.body;
  const userId = req.user.id;

  if (!animeId || !status) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  try {
    await pool.query(
      `DELETE FROM user_animes WHERE user_id = $1 AND anime_id = $2 AND status = $3`,
      [userId, animeId, status]
    );
    res.json({ message: `Estado '${status}' eliminado correctamente.` });
  } catch (err) {
    console.error('💥 Error al eliminar estado:', err);
    res.status(500).json({ error: 'Error eliminando estado' });
  }
});


// --- Obtener animes del usuario (PROTEGIDO)
app.get('/api/anime/status/:userId', authenticateToken, async (req, res) => {
  // ✅ VERIFICAR QUE userId del param == userId del token
  const { userId } = req.params;
  
  if (parseInt(userId) !== req.user.id) {
    return res.status(403).json({ error: 'No autorizado' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM user_animes WHERE user_id = $1 ORDER BY updated_at DESC', 
      [userId]
    );
    
    res.json(result.rows);
    
  } catch (err) {
    console.error('💥 Error obtener animes:', err);
    res.status(500).json({ error: 'Error obteniendo estados' });
  }
});

// =================================================================
// INICIAR SERVIDOR
// =================================================================

app.listen(PORT, () => {
  console.log(`\n🚀 ✅ API corriendo en http://localhost:${PORT}`);
  console.log(`📡 Health: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Registro: POST /api/register`);
  console.log(`🔐 Login: POST /api/login`);
  console.log(`🎌 Anime: POST /api/anime/status (con token)`);
  console.log(`📋 Usuarios: GET /api/anime/status/:userId (con token)`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando...');
  await pool.end();
  process.exit(0);
});
