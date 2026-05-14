require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

const { sequelize } = require('./models');
const routes = require('./routes');
const { iniciarCron } = require('./config/cron');
const auth = require('./middlewares/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos (uploads)
app.use('/uploads', auth, express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Rutas API
app.use('/api', routes);

// Error handler global
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== 'production') console.error(err.stack);
  res.status(err.status || 500).json({ message: err.status ? err.message : 'Error interno del servidor' });
});

// Conexión DB + arranque
sequelize
  .authenticate()
  .then(() => {
    console.log('[DB] Conexión a MySQL exitosa');
    if (process.env.DB_SYNC === 'true' && process.env.NODE_ENV !== 'production') {
      const shouldAlter = process.env.DB_SYNC_ALTER === 'true';
      return sequelize.sync({ alter: shouldAlter });
    }
    return Promise.resolve();
  })
  .then(() => {
    console.log('[DB] Modelos sincronizados');
    iniciarCron();
    app.listen(PORT, () => console.log(`[SERVER] CRM WOW corriendo en http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('[DB ERROR]', err.message);
    process.exit(1);
  });
