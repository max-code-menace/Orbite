// « Fais le tien » : un petit formulaire qui prépare un message à envoyer, pour demander son propre système.
// Rien n'est enregistré ni envoyé par l'appli : la personne partage ou copie le message elle-même.
// (Ce qu'elle tape passe par textContent / value : jamais interprété comme du code.)

export const MAX_NOM = 40;
export const MAX_BIO = 80;
export const MAX_LIENS = 5;
const MAX_URL = 200;

// Un lien n'est accepté que s'il commence par https:// et se lit comme une vraie adresse.
export function lienValide(texte) {
  const t = String(texte ?? '').trim();
  if (!t || t.length > MAX_URL || /\s/.test(t)) return false;
  try {
    return new URL(t).protocol === 'https:';
  } catch {
    return false;
  }
}

// Construit le message à partir du formulaire. Renvoie { texte } ou { erreur } (en français, pour l'écran).
export function construireMessage({ nom, bio, theme, liens }) {
  const n = String(nom ?? '').trim();
  if (!n) return { erreur: 'Écris ton nom.' };
  if (n.length > MAX_NOM) return { erreur: `Ton nom est trop long (${MAX_NOM} caractères au plus).` };
  const b = String(bio ?? '').trim();
  if (b.length > MAX_BIO) return { erreur: `Ta bio est trop longue (${MAX_BIO} caractères au plus).` };
  const saisis = (liens ?? []).map((l) => String(l ?? '').trim()).filter(Boolean);
  if (saisis.length === 0) return { erreur: 'Ajoute au moins un lien.' };
  if (saisis.length > MAX_LIENS) return { erreur: `${MAX_LIENS} liens au plus.` };
  const faux = saisis.find((l) => !lienValide(l));
  if (faux) return { erreur: `Ce lien ne va pas : « ${faux.slice(0, 40)} ». Il doit commencer par https://` };
  const lignes = ['Salut ! Je voudrais mon système sur Orbite.', '', `Nom : ${n}`];
  if (b) lignes.push(`Bio : ${b}`);
  if (theme) lignes.push(`Thème : ${theme}`);
  lignes.push('Mes liens :', ...saisis.map((l) => `- ${l}`));
  return { texte: lignes.join('\n') };
}

function el(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text != null) e.textContent = text;
  return e;
}

function champ(libelle, input) {
  const l = el('label', 'ft-champ');
  l.append(el('span', 'ft-libelle', libelle), input);
  return l;
}

// Crée la feuille du formulaire (cachée) et renvoie { creerBouton, ouvrir, fermer }.
// themes : la liste [{ id, nom }] de galaxie.json (peut être vide).
export function creerFaisLeTien(themes, onOuvert) {
  const feuille = el('section', 'verre');
  feuille.id = 'faistien';
  feuille.hidden = true;
  feuille.setAttribute('aria-label', 'Fais le tien');

  const entete = el('div', 'ft-entete');
  const fermer = el('button', 'ft-fermer', '✕');
  fermer.type = 'button';
  fermer.setAttribute('aria-label', 'Fermer');
  entete.append(el('h2', 'ft-titre', 'Fais le tien'), fermer);

  const nom = el('input');
  nom.type = 'text';
  nom.maxLength = MAX_NOM;
  nom.autocomplete = 'name';
  const bio = el('input');
  bio.type = 'text';
  bio.maxLength = MAX_BIO;
  const theme = el('select');
  theme.append(new Option('(aucun)', ''));
  for (const t of themes ?? []) theme.append(new Option(t.nom, t.nom));
  const liens = Array.from({ length: MAX_LIENS }, () => {
    const i = el('input');
    i.type = 'url';
    i.inputMode = 'url';
    i.placeholder = 'Colle ton lien ici';
    i.maxLength = MAX_URL;
    return i;
  });

  const erreur = el('p', 'ft-erreur');
  erreur.setAttribute('role', 'alert');
  const sortie = el('textarea', 'ft-sortie');
  sortie.readOnly = true;
  sortie.rows = 7;
  sortie.hidden = true;
  const preparer = el('button', 'ft-bouton', 'Préparer mon message');
  preparer.type = 'button';
  const partager = el('button', 'ft-bouton', 'Partager / copier');
  partager.type = 'button';
  partager.hidden = true;
  const note = el('p', 'ft-note', "Rien n'est enregistré : envoie ce message à la personne qui t'a donné le lien.");

  feuille.append(
    entete,
    champ('Ton nom', nom),
    champ('Ta bio (facultatif)', bio),
    champ('Ton thème (facultatif)', theme),
    el('p', 'ft-libelle', 'Tes liens (5 au plus, en https://)'),
    ...liens,
    erreur,
    preparer,
    sortie,
    partager,
    note,
  );
  document.body.appendChild(feuille);

  const ouvrir = () => {
    feuille.hidden = false;
    document.body.classList.add('ft-ouvert');
    onOuvert?.();
  };
  const fermerFeuille = () => {
    feuille.hidden = true;
    document.body.classList.remove('ft-ouvert');
  };
  fermer.addEventListener('click', fermerFeuille);

  preparer.addEventListener('click', () => {
    const r = construireMessage({
      nom: nom.value,
      bio: bio.value,
      theme: theme.value,
      liens: liens.map((i) => i.value),
    });
    erreur.textContent = r.erreur ?? '';
    sortie.hidden = partager.hidden = !r.texte;
    if (r.texte) sortie.value = r.texte;
  });

  partager.addEventListener('click', async () => {
    erreur.textContent = '';
    try {
      if (navigator.share) await navigator.share({ text: sortie.value });
      else {
        await navigator.clipboard.writeText(sortie.value);
        erreur.textContent = 'Message copié ✔';
      }
    } catch (e) {
      // Partage annulé : rien à dire. Sinon on laisse le texte sélectionnable pour le copier à la main.
      if (e?.name !== 'AbortError') {
        sortie.select();
        erreur.textContent = 'Copie le message ci-dessus à la main.';
      }
    }
  });

  // Le bouton « ✨ Fais le tien » vient dans le profil (rappelé à chaque changement de système).
  function ajouterBouton(profil) {
    const b = el('button', 'ft-ouvrir', '✨ Fais le tien');
    b.type = 'button';
    b.addEventListener('click', ouvrir);
    profil.appendChild(b);
  }

  return { ajouterBouton, ouvrir, fermer: fermerFeuille };
}
