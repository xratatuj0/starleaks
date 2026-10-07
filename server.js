const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB error:', err.message);
    process.exit(1);
  });

// Schemas
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

const movieSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: { type: String, default: 'Inne' },
  image: String,
  playerUrl: String,
  isPublished: { type: Boolean, default: true },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Movie = mongoose.model('Movie', movieSchema);

// Create admin account
async function ensureAdmin() {
  const admin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (!admin) {
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await User.create({
      name: 'Administrator',
      email: ADMIN_EMAIL.toLowerCase(),
      password: hash,
      role: 'admin'
    });
    console.log('Admin created:', ADMIN_EMAIL);
  }
}
ensureAdmin();

// Auth middleware
function authRequired(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function adminRequired(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not admin' });
  }
  next();
}

// Routes
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: email.toLowerCase(), password: hash });
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { name, email, role: 'user' } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/movies', authRequired, async (req, res) => {
  const { category } = req.query;
  const filter = { isPublished: true };
  if (category && category !== 'all') filter.category = category;
  const movies = await Movie.find(filter).sort({ createdAt: -1 });
  res.json(movies);
});

app.get('/api/categories', authRequired, async (req, res) => {
  const movies = await Movie.find({ isPublished: true });
  const cats = [...new Set(movies.map(m => m.category))];
  res.json(cats);
});

app.get('/api/admin/movies', authRequired, adminRequired, async (req, res) => {
  const movies = await Movie.find().sort({ createdAt: -1 });
  res.json(movies);
});

app.post('/api/admin/movies', authRequired, adminRequired, async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.json(movie);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/admin/movies/:id', authRequired, adminRequired, async (req, res) => {
  await Movie.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public/login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public/register.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public/admin.html')));

app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
