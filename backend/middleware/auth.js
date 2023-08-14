// Charge les variables d'environnement dans le fichier .env
require('dotenv').config();

const jwt = require('jsonwebtoken');
 
module.exports = (req, res, next) => {
   try {
       const token = req.headers.authorization.split(' ')[1];
       // Importe le grain de sel contenu dans le fichier .env
       const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN);
       const userId = decodedToken.userId;
       req.auth = {
           userId: userId
       };
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};