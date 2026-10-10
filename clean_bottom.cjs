const fs = require('fs');

const path = 'src/pages/admin/Documents.tsx';
let content = fs.readFileSync(path, 'utf8');

const endOfComponent = content.indexOf('export default AdminDocuments;');
if (endOfComponent > -1) {
  content = content.substring(0, endOfComponent + 'export default AdminDocuments;\n'.length);
  fs.writeFileSync(path, content);
  console.log("Documents.tsx bottom cleaned successfully!");
}
