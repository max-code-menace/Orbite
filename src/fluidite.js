// Règles de fluidité (sans 3D ni navigateur : testables seules, voir tests/).

// Résolution limitée : au plus 2x, et au plus ~2,2 millions de points dessinés
// à chaque image. Au-delà, l'œil ne voit pas la différence mais le téléphone
// (surtout une tablette, avec son grand écran) rame et chauffe.
export const BUDGET_PIXELS = 2.2e6;

// Mode allégé automatique : si l'appareil n'arrive pas à suivre, on dessine
// moins finement, palier par palier (1 = finesse normale).
export const PALIERS = [1, 0.8, 0.65, 0.5];

// En dessous de ce nombre d'images par seconde, on passe au palier suivant.
export const SEUIL_IPS = 50;

// Finesse du dessin pour un écran donné (largeur × hauteur en points CSS).
export function calculerRatio(largeur, hauteur, densiteEcran, palier) {
  const ecran = largeur * hauteur;
  const normal = Math.max(1, Math.min(densiteEcran || 1, 2, Math.sqrt(BUDGET_PIXELS / ecran)));
  return Math.max(0.6, normal * PALIERS[palier]);
}

// Palier après une mesure : on descend d'un cran si c'est trop lent, jamais plus bas que le dernier.
export function palierApres(palier, ips) {
  if (ips < SEUIL_IPS && palier < PALIERS.length - 1) return palier + 1;
  return palier;
}
