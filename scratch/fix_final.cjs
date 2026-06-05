const fs = require('fs');
const absolutePath = 'c:\\Users\\Gui\\Documents\\Projetos IDEs\\jc-card-wars\\src\\pages\\TestLab.tsx';
let content = fs.readFileSync(absolutePath, 'utf8');

// Replace the form feed character ( \f ) with a backtick ( ` )
content = content.replace(/\f/g, '`');

// Fix any other weird characters like double-backticks or missing ones
content = content.replace(/className={flex/g, 'className={`flex');
content = content.replace(/selection:bg-purple-500\/30}/g, 'selection:bg-purple-500/30`}');

fs.writeFileSync(absolutePath, content);
console.log('Form feed characters and template literals fixed!');
