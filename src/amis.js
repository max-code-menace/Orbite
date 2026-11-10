// La bande sous le profil : deux flèches (système précédent / suivant), les thèmes et les amis
// de la personne. Toucher un thème ne montre que les systèmes de ce thème ; un ami ouvre son système.
// (Les noms passent par textContent : ce qui est écrit dans galaxie.json
// s'affiche tel quel, sans jamais être interprété comme du code.)

function el(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text != null) e.textContent = text;
  return e;
}

// « Noé Ferrand » → « Noé ». Une pastille a peu de place.
const prenom = (nom) => nom.trim().split(/\s+/)[0];

// bande : l'élément #amis. onAller(index) : ouvrir ce système. onSens(+1 | -1) : suivant / précédent.
// onTheme(id | null) : choisir un thème (null = « Tous »).
// Dans la bande qui défile : d'abord les thèmes (fixes), puis les amis du système affiché (qui changent).
export function creerBandeAmis(bande, onAller, onSens, onTheme) {
  const liste = bande.querySelector('.amis-liste');
  for (const bouton of bande.querySelectorAll('.amis-fleche')) {
    bouton.addEventListener('click', () => onSens(Number(bouton.dataset.sens)));
  }
  const groupeThemes = el('div', 'bande-groupe');
  const groupeAmis = el('div', 'bande-groupe');
  liste.append(groupeThemes, groupeAmis);

  // Les pastilles de thèmes : « Tous » + un thème par entrée de galaxie.json (rien s'il n'y en a pas).
  function creerThemes(themes) {
    groupeThemes.replaceChildren();
    if (!themes?.length) return;
    for (const t of [{ id: null, nom: 'Tous' }, ...themes]) {
      const puce = el('button', 'theme', t.nom);
      puce.type = 'button';
      puce.dataset.theme = t.id ?? '';
      puce.addEventListener('click', () => onTheme(t.id));
      groupeThemes.appendChild(puce);
    }
    marquerTheme(null);
  }

  // Met en avant la pastille du thème choisi.
  function marquerTheme(id) {
    for (const puce of groupeThemes.children) {
      const actif = puce.dataset.theme === (id ?? '');
      puce.classList.toggle('actif', actif);
      puce.setAttribute('aria-pressed', String(actif));
    }
  }

  // indexAmis : les positions (dans la galaxie) des amis du système affiché.
  function remplir(systemes, indexAmis) {
    groupeAmis.replaceChildren();
    if (indexAmis.length === 0) return;
    groupeAmis.appendChild(el('span', 'amis-titre', 'Amis'));
    for (const i of indexAmis) {
      const { nom } = systemes[i].profil;
      const puce = el('button', 'ami');
      puce.type = 'button';
      puce.append(el('span', 'ami-rond', nom.trim()[0]?.toUpperCase() ?? '?'), el('span', 'ami-nom', prenom(nom)));
      puce.setAttribute('aria-label', `Ouvrir le système de ${nom}`);
      puce.addEventListener('click', () => onAller(i));
      groupeAmis.appendChild(puce);
    }
  }

  return { remplir, creerThemes, marquerTheme };
}
