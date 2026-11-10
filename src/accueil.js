// L'écran d'accueil, vu une seule fois par appareil (et jamais quand on arrive par le lien d'un système :
// le lien en bio mène droit chez la personne). Rien n'est envoyé : on retient juste « déjà vu » sur l'appareil.

const CLE = 'orbite-accueil';

function dejaVu() {
  try {
    return localStorage.getItem(CLE) === '1';
  } catch {
    return false;
  }
}

// Montre l'accueil si besoin. onFaisLeTien : ouvrir le formulaire à la place de « Commencer ».
// `?accueil` dans l'adresse force l'affichage (pour le revoir).
export function montrerAccueil({ onFaisLeTien }) {
  const force = new URLSearchParams(window.location.search).has('accueil');
  if (!force && (dejaVu() || window.location.hash.length > 1)) return;

  const ecran = document.getElementById('accueil');
  if (!ecran) return;
  const fermer = (apres) => {
    try {
      localStorage.setItem(CLE, '1');
    } catch {
      // pas de stockage : l'accueil reviendra, ce n'est pas grave
    }
    ecran.hidden = true;
    document.body.classList.remove('accueil-ouvert');
    apres?.();
  };
  ecran.querySelector('[data-action=commencer]').addEventListener('click', () => fermer());
  ecran.querySelector('[data-action=faisletien]').addEventListener('click', () => fermer(onFaisLeTien));
  ecran.hidden = false;
  document.body.classList.add('accueil-ouvert');
}
