const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/Documents.tsx', 'utf8');
const searchString = "export const generateContratClientHTML";
const endString = "export const printDocument";

const startIndex = content.indexOf(searchString);
const endIndex = content.indexOf(endString);

if (startIndex !== -1 && endIndex !== -1) {
  const newContent = content.substring(0, startIndex) + 
    "import { generateContratClientHTML, generateConventionBailleurHTML, generateBonAffectationHTML } from '@/lib/contract-templates';\n\n" + 
    content.substring(endIndex);
  fs.writeFileSync('src/pages/admin/Documents.tsx', newContent);
  console.log("Success");
} else {
  console.log("Not found");
}
