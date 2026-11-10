// Le menu (☰) et le cœur ♥ dans le profil. Le menu : chercher un créateur, ses favoris, « Surprends-moi »,
// partager le système affiché, « Fais le tien ». (Tout ce qui vient de galaxie.json passe par textContent.)
import { basculer, enregistrerFavoris, lireFavoris } from './favoris.js';
import { chercher } from './recherche.js';

function el(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text != null) e.textContent = text;
  return e;
}

function bouton(className, texte, onClic) {
  const b = el('button', className, texte);
  b.type = 'button';
  b.addEventListener('click', onClic);
  return b;
}

// Combien de liens dans ce système (pour la ligne « 5 planètes · 9 liens »).
export const compterLiens = (systeme) => systeme.planetes.reduce((n, p) => n + (p.liens?.length ?? 0), 0);

// api : { galaxie() → {systemes, themes}, courant() → position affichée, aller(i), surprise(), faisLeTien() }
export function creerMenu(api) {
  let favoris = lireFavoris();
  let seulementFavoris = false;

  const feuille = el('section', 'verre feuille');
  feuille.id = 'menu';
  feuille.hidden = true;
  feuille.setAttribute('aria-label', 'Menu');

  const fermer = bouton('ft-fermer', '✕', () => fermerMenu());
  fermer.setAttribute('aria-label', 'Fermer');
  const entete = el('div', 'ft-entete');
  entete.append(el('h2', 'ft-titre', 'Menu'), fermer);

  const recherche = el('input');
  recherche.type = 'search';
  recherche.placeholder = 'Chercher un créateur ou un thème';
  recherche.maxLength = 40;
  recherche.setAttribute('aria-label', 'Chercher un créateur ou un thème');

  const puces = el('div', 'menu-puces');
  const puceTous = bouton('puce actif', 'Tous', () => choisirFiltre(false));
  const puceFavoris = bouton('puce', '♥ Favoris', () => choisirFiltre(true));
  puces.append(puceTous, puceFavoris);

  const liste = el('div', 'menu-liste');
  const vide = el('p', 'ft-note');
  const actions = el('div', 'menu-actions');
  const infos = el('p', 'ft-note');
  actions.append(
    bouton('ft-bouton', '🎲 Surprends-moi', () => {
      fermerMenu();
      api.surprise();
    }),
    bouton('ft-bouton', '↗ Partager ce système', partager),
    bouton('ft-bouton', '✨ Fais le tien', () => {
      fermerMenu();
      api.faisLeTien();
    }),
    infos,
  );
  feuille.append(entete, recherche, puces, liste, vide, actions);
  document.body.appendChild(feuille);

  function choisirFiltre(favs) {
    seulementFavoris = favs;
    puceTous.classList.toggle('actif', !favs);
    puceFavoris.classList.toggle('actif', favs);
    puceTous.setAttribute('aria-pressed', String(!favs));
    puceFavoris.setAttribute('aria-pressed', String(favs));
    remplirListe();
  }

  function remplirListe() {
    const { systemes, themes } = api.galaxie();
    const trouves = chercher(systemes, recherche.value, themes, seulementFavoris ? favoris : null);
    liste.replaceChildren();
    for (const i of trouves) {
      const { nom, pseudo } = systemes[i].profil;
      const nomTheme = themes?.find((t) => t.id === systemes[i].theme)?.nom ?? '';
      const ligne = el('button', 'menu-ligne');
      ligne.type = 'button';
      const textes = el('span', 'menu-textes');
      textes.append(
        el('span', 'menu-nom', nom),
        el('span', 'menu-sous', [pseudo, nomTheme].filter(Boolean).join(' · ')),
      );
      ligne.append(el('span', 'ami-rond', nom.trim()[0]?.toUpperCase() ?? '?'), textes);
      if (favoris.includes(systemes[i].id)) ligne.append(el('span', 'menu-coeur', '♥'));
      ligne.addEventListener('click', () => {
        fermerMenu();
        api.aller(i);
      });
      liste.appendChild(ligne);
    }
    vide.textContent = trouves.length
      ? ''
      : seulementFavoris && !recherche.value
        ? 'Aucun favori pour le moment : touche le ♥ dans le profil.'
        : 'Personne ne correspond.';
  }
  recherche.addEventListener('input', remplirListe);

  async function partager() {
    const { systemes } = api.galaxie();
    const lien = `${window.location.origin}${window.location.pathname}#${systemes[api.courant()].id}`;
    try {
      if (navigator.share) await navigator.share({ url: lien });
      else {
        await navigator.clipboard.writeText(lien);
        infos.textContent = 'Lien copié ✔';
      }
    } catch (e) {
      if (e?.name !== 'AbortError') infos.textContent = 'Impossible de partager ici : copie l’adresse de la page.';
    }
  }

  function ouvrirMenu() {
    const { systemes } = api.galaxie();
    const s = systemes[api.courant()];
    infos.textContent = `Ce système : ${s.planetes.length} planètes · ${compterLiens(s)} liens`;
    recherche.value = '';
    choisirFiltre(false);
    feuille.hidden = false;
    document.body.classList.add('ft-ouvert');
  }
  function fermerMenu() {
    feuille.hidden = true;
    document.body.classList.remove('ft-ouvert');
  }

  // Le ♥ du profil : aimer / ne plus aimer le système affiché.
  let coeur = null;
  function majCoeur() {
    if (!coeur?.isConnected) return;
    const aime = favoris.includes(api.galaxie().systemes[api.courant()].id);
    coeur.textContent = aime ? '♥' : '♡';
    coeur.setAttribute('aria-pressed', String(aime));
    coeur.setAttribute('aria-label', aime ? 'Retirer des favoris' : 'Ajouter aux favoris');
  }

  // Appelée à chaque changement de système, juste après le remplissage du profil.
  function ajouterBoutons(profil) {
    coeur = bouton('profil-bouton coeur', '♡', () => {
      favoris = basculer(favoris, api.galaxie().systemes[api.courant()].id);
      enregistrerFavoris(favoris);
      majCoeur();
    });
    const menu = bouton('profil-bouton', '☰', ouvrirMenu);
    menu.setAttribute('aria-label', 'Ouvrir le menu');
    const groupe = el('div', 'profil-boutons');
    groupe.append(coeur, menu);
    profil.appendChild(groupe);
    majCoeur();
  }

  return { ajouterBoutons, ouvrir: ouvrirMenu, fermer: fermerMenu, favoris: () => favoris };
}
