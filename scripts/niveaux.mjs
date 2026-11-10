// Règle de choix du niveau de vérification (utilisée par check.mjs, testée dans tests/).

// Zones sensibles : données de la personne, affichage des liens, dépendances,
// mise en ligne, réglages et garde-fous eux-mêmes.
export const SENSIBLES = [
  /^public\/galaxie\.json$/,
  /^src\/ui\.js$/,
  /^scripts\/(donnees|verifier-donnees|check|niveaux)\.mjs$/,
  /^scripts\/hooks\//,
  /^package(-lock)?\.json$/,
  /^\.github\//,
  /^\.claude\//,
  /^\.githooks\//,
  /^\.secretlint/,
  /^biome\.json$/,
  /^vite\.config\.js$/,
];
const CODE = /\.(m?js|css|html|json)$/;

// fichiers : chemins modifiés. Renvoie { niveau: 0 | 1 | 2, raison }.
export function choisirNiveau(fichiers) {
  const sensibles = fichiers.filter((f) => SENSIBLES.some((r) => r.test(f)));
  if (sensibles.length) return { niveau: 2, raison: `zone sensible : ${sensibles.join(', ')}` };
  const code = fichiers.filter((f) => CODE.test(f));
  if (code.length) return { niveau: 1, raison: `code modifié : ${code.join(', ')}` };
  return { niveau: 0, raison: fichiers.length ? 'textes seulement' : 'rien de modifié' };
}
