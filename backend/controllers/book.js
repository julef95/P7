const Book = require('../models/book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
    const bookObjet = JSON.parse(req.body.book);

    delete bookObjet._userId;

    const book = new Book({
      ...bookObjet,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    
    book.save()
    .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
    .catch((error) => res.status(500).json({ error }));
};

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  
    delete bookObject._userId;

    Book.findOne({_id: req.params.id})
    .then((book) => {
        if (book.userId != req.auth.userId) {
            res.status(401).json({ message : 'Non autorisé'});
        } else {
            // Supprime l'ancienne image si une nouvelle image est téléchargée
            if (req.file) {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, (err) => {
                    if (err) {
                        console.log('Erreur lors de la suppression de lancienne image:', err);
                    }
                });
            }

            Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
            .then(() => res.status(200).json({message : 'Livre modifié!'}))
            .catch(error => res.status(500).json({ error }));
        }
    })
    .catch((error) => {
        res.status(500).json({ error });
    });
};

exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id})
    .then(book => {
        if (book.userId != req.auth.userId) {
            res.status(401).json({message: 'Non autorisé'});
        } else {
            const filename = book.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Book.deleteOne({_id: req.params.id})
                .then(() => { res.status(200).json({message: 'Livre supprimé !'})})
                .catch(error => res.status(500).json({ error }));
            });
        }
    })
    .catch( error => {
        res.status(500).json({ error });
    });
};

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(500).json({ error }));
};

exports.getAllBooks = (req, res, next) => {
    Book.find()
    .then(books => res.status(200).json(books))
    .catch((error) => res.status(500).json({ error }));
};

exports.addRating = (req, res, next) => {
    const userId = req.auth.userId;
    const { rating } = req.body;

    // Vérification note comprise entre 0 et 5
    if (rating < 0 || rating > 5) {
        return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5.' });
    }

    const userRating = { userId, grade: rating };

    delete req.body._userId;

    // Vérifie si le livre existe
    Book.findOne({ _id: req.params.id })
    .then(book => {
        if (!book) {
            return res.status(404).json({ message: 'Livre non trouvé' });
        }

            // Vérifie si l'utilisateur a déjà noté le livre
            if (book.ratings.some(rating => rating.userId === userId)) {
                return res.status(403).json({ message: "Vous avez déjà noté ce livre." });
            }
        
                Book.findByIdAndUpdate({ _id: req.params.id },{ $push: { ratings: userRating }},{ new: true })
                .then((book) => {
                    const sumRatings = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
                    book.averageRating = sumRatings / book.ratings.length;

                    // Arrondi la note moyenne à une décimale
                    book.averageRating = parseFloat(book.averageRating.toFixed(1));

                    book.save()
                    .then(book => res.status(200).json(book))
                    .catch((error) => res.status(500).json({ error }));
                })
                .catch((error) => res.status(500).json({ error }));
        })
    .catch((error) => res.status(500).json({ error }));
};

exports.getBestRatedBooks = (req, res, next) => {
    Book.find()
    .then( books => {
        books.sort((a, b) => b.averageRating - a.averageRating);
        const bestRatedBooks = books.slice(0, 3);
        res.status(200).json(bestRatedBooks)})
    .catch(error => res.status(500).json({error}))
};