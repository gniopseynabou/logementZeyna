const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/Documents.tsx', 'utf8');

content = content.replace(
  '<div class="sig-label">Pour Les Logements de Zeyna</div>',
  '<div class="sig-label">Le Sous-Bailleur (ZEYNA)</div>'
);
content = content.replace(
  '<div class="sig-hint">Nom, fonction, date &amp; cachet</div>',
  '<div class="sig-hint">Nom, fonction &amp; date</div>'
);
content = content.replace(
  /<div class="sig-hint">Signature précédée de « Lu et approuvé »<\/div>/g,
  '<div class="sig-hint">Signature (préciser la date)</div>'
);

fs.writeFileSync('src/pages/admin/Documents.tsx', content);
