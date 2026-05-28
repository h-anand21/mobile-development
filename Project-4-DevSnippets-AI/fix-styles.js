const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/screens/TrashScreen/TrashScreen.tsx',
  'src/screens/SnippetDetailsScreen/SnippetDetailsScreen.tsx',
  'src/screens/ProfileScreen/ProfileScreen.tsx',
  'src/screens/FolderDetailScreen/FolderDetailScreen.tsx',
  'src/screens/CreateSnippetScreen/EditSnippetScreen.tsx',
  'src/screens/FavoritesScreen/FavoritesScreen.tsx',
  'src/screens/AIHistoryScreen/AIHistoryScreen.tsx',
  'src/components/modals/AIChatModal.tsx',
  'src/components/cards/SnippetCard.tsx'
];

for (const relPath of filesToFix) {
  const fullPath = path.join(__dirname, relPath);
  let content = fs.readFileSync(fullPath, 'utf8');
  
  if (content.includes('const getStyles = (colors: any) => StyleSheet.create({')) {
    // Replace the start
    content = content.replace('const getStyles = (colors: any) => StyleSheet.create({', 'const getStyles = (colors: any) => ({');
    
    // Replace the ending `});` of getStyles.
    // It's usually the very last `});` in the file.
    const lastIndex = content.lastIndexOf('});');
    if (lastIndex !== -1) {
      content = content.substring(0, lastIndex) + '} as any);' + content.substring(lastIndex + 3);
    }
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Fixed', relPath);
  }
}
