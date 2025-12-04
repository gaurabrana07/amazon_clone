import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { IMAGE_CONFIG } from '../src/config/imageConfig.js';

// Mapping of placeholder patterns to real images
const PLACEHOLDER_REPLACEMENTS = {
  // Gaming images
  '/api/placeholder/400/400': IMAGE_CONFIG.PRODUCTS.console,
  '/api/placeholder/500/400': IMAGE_CONFIG.BANNERS.hero1,
  '/api/placeholder/300/200': IMAGE_CONFIG.PRODUCTS.game,
  
  // Fashion images
  '/api/placeholder/400/500': IMAGE_CONFIG.PRODUCTS.dress,
  '/api/placeholder/300/400': IMAGE_CONFIG.PRODUCTS.tshirt,
  '/api/placeholder/250/350': IMAGE_CONFIG.PRODUCTS.jacket,
  '/api/placeholder/400/300': IMAGE_CONFIG.BANNERS.sale,
  
  // General product images
  '/api/placeholder/600/600': IMAGE_CONFIG.PRODUCTS.laptop,
  '/api/placeholder/300/300': IMAGE_CONFIG.PRODUCTS.smartphone,
  '/api/placeholder/40/40': IMAGE_CONFIG.UI.avatar,
  
  // Generic fallbacks
  '/api/placeholder/': IMAGE_CONFIG.FALLBACK.product
};

// Function to replace placeholders in a file
function replacePlaceholdersInFile(filePath) {
  try {
    let content = readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    for (const [placeholder, replacement] of Object.entries(PLACEHOLDER_REPLACEMENTS)) {
      const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      if (content.includes(placeholder)) {
        content = content.replace(regex, replacement);
        hasChanges = true;
        console.log(`Replaced ${placeholder} with ${replacement} in ${filePath}`);
      }
    }
    
    if (hasChanges) {
      writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Function to recursively process files
function processDirectory(dirPath) {
  const files = readdirSync(dirPath);
  
  for (const file of files) {
    const fullPath = join(dirPath, file);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      processDirectory(fullPath);
    } else if (stat.isFile() && ['.jsx', '.js', '.ts', '.tsx'].includes(extname(file))) {
      replacePlaceholdersInFile(fullPath);
    }
  }
}

// Run the replacement script
console.log('🔄 Starting placeholder image replacement...');
processDirectory('./src');
console.log('✅ Placeholder replacement completed!');