import { writeFileSync } from 'fs';
import { lightColors, darkColors } from '../src/lib/material-theme';

const lightTokens = Object.entries(lightColors)
  .map(([key, value]) => {
    const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    return `  --md-sys-color${cssVarName}: ${value};`;
  })
  .join('\n');

const darkTokens = Object.entries(darkColors)
  .map(([key, value]) => {
    const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    return `  --md-sys-color${cssVarName}: ${value};`;
  })
  .join('\n');

const css = `/* Auto-generated Material 3 color tokens from seed color #1976D2 */
/* DO NOT EDIT - Run npm run generate-theme to regenerate */

:root {
${lightTokens}
}

.dark {
${darkTokens}
}
`;

writeFileSync('src/styles/material-tokens.css', css);
console.log('✅ Generated material-tokens.css');
