# Projet 3 tiers - Application web

Application Node.js de gestion de produits avec base de données MySQL, déployée sur OpenShift.

## Structure

- `webapp/` : code source de l'application
- `.github/workflows/deploy.yml` : CI/CD pour déploiement automatique

## Variables d'environnement

- `DB_HOST` : nom du service MySQL (défaut : mysql-service)
- `DB_USER` : utilisateur MySQL (défaut : webuser)
- `DB_PASSWORD` : mot de passe MySQL (défaut : password)
- `DB_NAME` : nom de la base (défaut : webapp)
