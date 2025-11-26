/**
 * Script de création des comptes de test
 * Crée automatiquement les utilisateurs de test dans la base de données
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Configuration MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/har_academy_auth';

// Schéma User (simplifié)
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
    isEmailVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Utilisateurs de test
const testUsers = [
    {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'instructor@har-academy.com',
        password: 'Instructor123!',
        role: 'instructor',
        isEmailVerified: true
    },
    {
        firstName: 'Marie',
        lastName: 'Martin',
        email: 'student@har-academy.com',
        password: 'Student123!',
        role: 'student',
        isEmailVerified: true
    },
    {
        firstName: 'Admin',
        lastName: 'HAR',
        email: 'admin@har-academy.com',
        password: 'Admin123!',
        role: 'admin',
        isEmailVerified: true
    },
    {
        firstName: 'Sophie',
        lastName: 'Bernard',
        email: 'instructor2@har-academy.com',
        password: 'Instructor123!',
        role: 'instructor',
        isEmailVerified: true
    },
    {
        firstName: 'Pierre',
        lastName: 'Dubois',
        email: 'student2@har-academy.com',
        password: 'Student123!',
        role: 'student',
        isEmailVerified: true
    }
];

async function createTestUsers() {
    try {
        console.log('🔌 Connexion à MongoDB...');
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connecté à MongoDB\n');

        console.log('🧹 Suppression des utilisateurs de test existants...');
        const testEmails = testUsers.map(u => u.email);
        await User.deleteMany({ email: { $in: testEmails } });
        console.log('✅ Utilisateurs de test supprimés\n');

        console.log('👥 Création des utilisateurs de test...\n');

        for (const userData of testUsers) {
            try {
                // Hash du mot de passe
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(userData.password, salt);

                // Créer l'utilisateur
                const user = await User.create({
                    ...userData,
                    password: hashedPassword
                });

                console.log(`✅ ${userData.role.toUpperCase().padEnd(12)} créé:`);
                console.log(`   📧 Email: ${userData.email}`);
                console.log(`   🔑 Mot de passe: ${userData.password}`);
                console.log(`   👤 Nom: ${userData.firstName} ${userData.lastName}`);
                console.log(`   🆔 ID: ${user._id}\n`);
            } catch (error) {
                console.error(`❌ Erreur lors de la création de ${userData.email}:`, error.message);
            }
        }

        console.log('='.repeat(60));
        console.log('🎉 COMPTES DE TEST CRÉÉS AVEC SUCCÈS!');
        console.log('='.repeat(60));
        console.log('\n📋 RÉSUMÉ DES IDENTIFIANTS:\n');

        testUsers.forEach(user => {
            console.log(`${user.role.toUpperCase()}:`);
            console.log(`  Email: ${user.email}`);
            console.log(`  Mot de passe: ${user.password}\n`);
        });

        console.log('🚀 Vous pouvez maintenant vous connecter sur:');
        console.log('   http://localhost:3000/login\n');

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Connexion MongoDB fermée');
        process.exit(0);
    }
}

// Exécuter le script
console.log('\n' + '='.repeat(60));
console.log('🔧 SCRIPT DE CRÉATION DES COMPTES DE TEST');
console.log('='.repeat(60) + '\n');

createTestUsers();
