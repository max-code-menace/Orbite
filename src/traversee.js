// L'écran « Direction la galaxie Musique… » : une courte traversée quand on change de thème.
// Il ne bloque rien (on peut toucher à travers) et disparaît seul ; sauté avec « réduire les animations ».

const DUREE_MS = 1100;
let minuteur = null;

export function montrerTraversee(nomTheme, reduireAnimations) {
  const ecran = document.getElementById('traversee');
  if (!ecran || reduireAnimations) return;
  ecran.querySelector('.traversee-texte').textContent = `Direction la galaxie ${nomTheme}…`;
  // On relance l'animation même si une traversée précédente n'est pas finie.
  ecran.hidden = true;
  void ecran.offsetWidth;
  ecran.hidden = false;
  clearTimeout(minuteur);
  minuteur = setTimeout(() => {
    ecran.hidden = true;
  }, DUREE_MS);
}
