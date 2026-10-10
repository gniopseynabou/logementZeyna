const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/Documents.tsx', 'utf8');

// Supprimer la note juridique générée automatiquement
content = content.replace(
  /<div class="note-juridique">[\s\S]*?<\/div>/g,
  ''
);
// Enlever "Lu et approuvé" si ça fait trop "fausse mention légale" (l'utilisateur a dit pas de fausses mentions)
content = content.replace(
  /<div class="note">[\s\S]*?<\/div>/g,
  ''
);

fs.writeFileSync('src/pages/admin/Documents.tsx', content);
