# Exercices C · MPI

24 exercices en français, des fonctions élémentaires aux graphes et à unir-trouver. Interface inspirée du site [ocaml-exercices](https://github.com/mpi-informatique/ocaml) de Quentin Fortier : navigation par chapitre, lien MPI, bouton GitHub et mode clair/sombre.

## Stack

- React 19, TypeScript strict, Vite/Vinext.
- Tailwind CSS 4 et composants accessibles shadcn/Radix (framework CSS retenu ; MUI n'est pas nécessaire).
- CodeMirror 6 : coloration C, indentation, appariement des délimiteurs, historique, Ctrl/Cmd+Entrée.
- Clang 8 / LLD compilés en WebAssembly, C17, libc WASI, issus de [binji/wasm-clang](https://github.com/binji/wasm-clang).

Les sources C sont compilées et exécutées dans un Web Worker du navigateur. Aucun code élève n'est envoyé à un serveur de compilation. Le compilateur et son environnement sont servis depuis le site : environ 19 Mo compressés au premier lancement. La réutilisation des modules en mémoire accélère les vérifications suivantes.

Chaque vérification compile une seule fois, puis crée une instance WebAssembly distincte pour chaque test. Les sorties standard sont comparées exactement après suppression des blancs aux extrémités. Limites : 2,5 s par test, 25 s de compilation, 32 Mio de mémoire linéaire pour le programme et 64 Ko de sortie. Arrêter termine le Worker. Le langage C conserve ses comportements indéfinis : il ne s'agit pas d'un détecteur complet d'erreurs mémoire. Les tests ne prouvent pas la correction générale, les contraintes d'algorithme ni les complexités ; les explications donnent celles à justifier.

Les brouillons, validations et le thème sont conservés dans localStorage sur cet appareil. Modifier une réponse validée retire sa validation. Aucun compte élève ni suivi serveur.

## Développement

```sh
pnpm install
pnpm dev
pnpm build
pnpm exec tsc --noEmit
node scripts/verify-exercises.mjs
```

La collection, les contrats, corrections et jeux de tests se trouvent dans `lib/exercises.ts`. Ajouter un exercice consiste à ajouter un objet typé. Le moteur est dans `lib/runner.ts` et `public/compiler/worker.js`.

Les binaires gzip portent l’extension `.bin` pour éviter une décompression HTTP implicite avant la décompression applicative. Les assets du compilateur sont versionnés dans `public/compiler/`. `upstream.json` indique la provenance et les empreintes SHA-256. `shared.js` est conservé sans modification ; `worker.js` est l'adaptation C propre au site. Les licences Apache-2.0 et LLVM sont incluses. Décompression native avec `DecompressionStream`, donc navigateur moderne requis. Aucun CDN requis à l'exécution.

Dépôt GitHub prévu : `mpi-informatique/c`. Le bouton GitHub cible ce dépôt.

## Validation

Le script de vérification exécute les 147 cas contre les 24 corrections à l'aide des mêmes binaires Clang/LLD/WASI et du même Worker que l'interface. Il contrôle également la détection d'une réponse fausse, d'une erreur de syntaxe, d'une erreur d'exécution et la réinitialisation des variables globales entre deux tests.

L'interface expose facultativement quatre outils WebMCP si `document.modelContext` est disponible : lister, ouvrir, modifier le code et vérifier. Cette capacité n'est pas présente dans le navigateur de validation ; sa validation dynamique y est indisponible. Le fonctionnement normal du site n'en dépend pas.

## GitHub Pages

`pnpm build:pages` produit un site entièrement statique dans `dist/pages`, avec une page `index.html` et le préfixe `/c/` pour les ressources. `pnpm preview:pages` permet de le vérifier localement à `/c/`. Le workflow GitHub Pages publie ce dossier ; `dist/client` appartient au build serveur Vinext et ne contient pas de page HTML d’entrée.
