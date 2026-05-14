const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_BASE = path.resolve(path.join(__dirname, '..', 'uploads'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const raw = req.uploadFolder || '';
    const dest = path.resolve(path.join(UPLOAD_BASE, raw));

    if (!dest.startsWith(UPLOAD_BASE)) {
      return cb(new Error('Directorio de destino inválido'));
    }

    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.xml', '.png', '.jpg', '.jpeg'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Tipo de archivo no permitido'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

module.exports = upload;
