// Charge les variables d'environnement dans le fichier .env
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

// Importe le module pour mettre en place la sécurité de rate limiting contre les attaques de robots
const rateLimit = require('express-rate-limit'); 

const bookRoutes = require('./routes/book');
const userRoutes = require('./routes/user');

mongoose.connect(
  // importe l'url contenu dans le fichier .env
  process.env.MONGODB_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

app.use(bodyParser.json());

// Configuration du rate limiting
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // Durée de la fenêtre observée en ms (ici 5 min)
  max: 5, // Nb de requêtes limites par adresse IP dans l'intervalle de temps observé au dessus
});

app.use(limiter);

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;