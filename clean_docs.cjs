const fs = require('fs');

const path = 'src/pages/admin/Documents.tsx';
let content = fs.readFileSync(path, 'utf8');

// The inline generators start with: export const generateContratClientHTML = ...
// and end right before: export const printDocument = ...
const printDocIndex = content.indexOf('export const printDocument =');
if (printDocIndex > -1) {
  // Find where the block of generators starts (around line 18 after imports)
  const generatorStartStr = '// ─────────────────────────────────────────────────────────────────────────────\n// GÉNÉRATEUR HTML - CONTRAT ZEYNA ↔ ÉTUDIANT';
  // Use a regex to find the start if there are encoding issues
  const importEnd = content.indexOf('import { fr } from "date-fns/locale";') + 'import { fr } from "date-fns/locale";'.length;
  
  const beforeGenerators = content.substring(0, importEnd) + '\n\nimport { generateContratClientHTML, generateConventionBailleurHTML, generateBonAffectationHTML } from "@/lib/contract-templates";\n\n';
  const afterGenerators = content.substring(printDocIndex);
  
  fs.writeFileSync(path, beforeGenerators + afterGenerators);
  console.log("Documents.tsx cleaned successfully!");
} else {
  console.log("Could not find printDocument");
}
