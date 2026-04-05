# Mongo migration

Je veux faire un outil de migration pour mongodb. On peux s'inspirer de @../mongo-migrate.

Je veux pouvoir : 
- Stocker les migrations dans une table (configurable via un fichier de config)
- Up / down les migrations
- Create une migration
    - On doit pouvoir choisir un template custom (sinon celui par defaut)
- Stocker les logs de sorti dans la table de migration
- Une version typescript et une version JS (ESM only)
- un mode dry run (avec un flag expose dans les methode up and down)
- un mode filehash ou sans filehash

En gros ce que fait mongo-migrate mais en mieux

Ah oui et il faut des tests

C'est un gros projet, il faut bien decouper ca!