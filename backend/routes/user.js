const express = require('express');
const router = express.Router();
const { body } = require('express-validator'); // Importer la fonction body d'express-validator

const userCtrl = require('../controllers/user');

// Définition des règles de validation de l'email et du mot de passe lors de l'inscription
const registrationValidationRules = [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères dont une minuscule, une majuscule et un chiffre.')
        .matches(/[a-z]/).withMessage('Le mot de passe doit contenir au moins une miniscule.')
        .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une majuscule.')
        .matches(/\d/).withMessage('Le mot de passe doit contenir au moins un chiffre.')
];

router.post('/signup', registrationValidationRules, userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;