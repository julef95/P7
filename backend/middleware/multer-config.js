const multer = require('multer');
const fs = require('fs');
const sharp = require('sharp');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

exports.upload = multer({ storage: storage }).single('image');

exports.resizeImage = (req, res, next) => {
  if (!req.file) {
    return next();
  }
  const imagePath = req.file.path;

  sharp(imagePath)
    .resize(463, null) // Définit la largeur à 463px, laisse la hauteur libre pour respecter les dimensions
    .toFile(`${imagePath}_resized.webp`, (err, info) => {
      if (err) {
        return next(err);
      }
      // Renomme l'image redimensionnée avec le nom d'origine
      fs.rename(`${imagePath}_resized.webp`, imagePath, (err) => {
        if (err) {
          return next(err);
        }
        next();
      });
    });
};