/**
 * Script de création des comptes de test via l'API
 * Utilise l'API d'inscription pour créer les comptes
 */

const axios = require('axios');

// URL de l'API
const API_URL = process.env.API_URL || 'http://localhost:8000';

// Utilisateurs de test
const testUsers = [
    {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'instructor@har-academy.com',
        password: 'Instructor123!',
        role: 'instructor'
    },
    {
        firstName: 'Marie',
        lastName: 'Martin',
        email: 'student@har-academy.com',
        password: 'Student123!',
        role: 'student'
    },
    {
        firstName: 'Admin',
        lastName: 'HAR',
        email: 'admin@har-academy.com',
        password: 'Admin123!',
        role: 'admin'
    }
];

async function createTestUsers() {
    console.log('\n' + '='.repeat(60));
    console.log('CREATION DES COMPTES DE TEST VIA API');
    console.log('='.repeat(60) + '\n');

    console.log(`API URL: ${API_URL}/api/auth/register\n`);

    for (const userData of testUsers) {
        try {
            console.log(`Creation de ${userData.role.toUpperCase()}...`);

            const response = await axios.post(`${API_URL}/api/auth/register`, userData);

            if (response.data.success) {
                console.log(`OK ${userData.role.toUpperCase().padEnd(12)} cree avec succes!`);
                console.log(`   Email: ${userData.email}`);
                console.log(`   Mot de passe: ${userData.password}`);
                console.log(`   Nom: ${userData.firstName} ${userData.lastName}\n`);
            }
        } catch (error) {
            if (error.response?.status === 400 && error.response?.data?.error?.message?.includes('already exists')) {
                console.log(`ATTENTION ${userData.role.toUpperCase().padEnd(12)} existe deja`);
                console.log(`   Email: ${userData.email}`);
                console.log(`   Mot de passe: ${userData.password}\n`);
            } else {
                console.error(`ERREUR pour ${userData.email}:`);
                console.error(`   ${error.response?.data?.error?.message || error.message}\n`);
            }
        }
    }

    console.log('='.repeat(60));
    console.log('PROCESSUS TERMINE!');
    console.log('='.repeat(60));
    console.log('\nRESUME DES IDENTIFIANTS:\n');

    testUsers.forEach(user => {
        console.log(`${user.role.toUpperCase()}:`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Mot de passe: ${user.password}\n`);
    });

    console.log('Vous pouvez maintenant vous connecter sur:');
    console.log('   http://localhost:3000/login\n');
}

// Verifier la connexion a l'API
async function checkAPI() {
    try {
        console.log('Verification de la connexion a l\'API...');
        await axios.get(`${API_URL}/health`, { timeout: 5000 });
        console.log('OK API accessible!\n');
        return true;
    } catch (error) {
        console.error('ERREUR Impossible de se connecter a l\'API');
        console.error(`   URL testee: ${API_URL}/health`);
        console.error(`   Erreur: ${error.message}\n`);
        console.log('Assurez-vous que:');
        console.log('   1. Les services backend sont demarres');
        console.log('   2. L\'API Gateway est accessible sur le port 8000');
        console.log('   3. MongoDB est en cours d\'execution\n');
        return false;
    }
}

// Executer le script
(async () => {
    const apiReady = await checkAPI();

    if (apiReady) {
        await createTestUsers();
    } else {
        console.log('Script arrete. Demarrez les services backend et reessayez.\n');
        process.exit(1);
    }
})();
