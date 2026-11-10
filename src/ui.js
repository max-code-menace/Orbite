import { icons } from './icons.js';
import { themes } from './planets.js';

// Petit raccourci pour créer un élément HTML avec une classe et un texte.
// (Le texte passe par textContent : ce qui est écrit dans systeme.json
// s'affiche tel quel, sans jamais être interprété comme du code.)
function el(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text != null) e.textContent = text;
  return e;
}

function initiales(nom) {
  return nom
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((m) => m[0].toUpperCase())
    .join('');
}

// --- En haut : qui c'est -------------------------------------------------
export function remplirProfil(conteneur, profil) {
  conteneur.replaceChildren();

  const photo = el('div', 'profil-photo');
  if (profil.photo) {
    const img = el('img');
    img.src = profil.photo;
    img.alt = '';
    photo.appendChild(img);
  } else {
    photo.textContent = initiales(profil.nom || '?');
  }

  const textes = el('div', 'profil-textes');
  const ligne = el('div', 'profil-ligne');
  ligne.append(el('h1', 'profil-nom', profil.nom), el('span', 'profil-pseudo', profil.pseudo));
  textes.append(ligne, el('p', 'profil-bio', profil.bio));

  conteneur.append(photo, textes);
}

// Sur un écran large tenu à l'horizontale (tablette), l'Accès rapide devient
// une colonne fixe à droite, toujours ouverte.
export const ecranLarge = window.matchMedia('(orientation: landscape) and (min-width: 700px)');

// --- En bas : Accès rapide -----------------------------------------------
// Une liste à moitié ouverte au départ, qu'on remonte du doigt.
export function creerAccesRapide(feuille, planetes, onChange) {
  const liste = feuille.querySelector('.acces-liste');
  liste.replaceChildren();

  for (const p of planetes) {
    const lien = p.liens?.[0];
    const theme = themes[p.id] ?? themes.libre;

    const a = el('a', 'acces-ligne');
    if (lien) {
      a.href = lien.url;
      a.target = '_blank';
      a.rel = 'noopener';
    }
    const icone = el('span', 'acces-icone');
    icone.style.color = theme.anneau;
    icone.style.background = `color-mix(in srgb, ${theme.anneau} 18%, transparent)`;
    icone.innerHTML = icons[p.id] ?? icons.libre;

    const textes = el('span', 'acces-textes');
    textes.append(el('span', 'acces-nom', p.nom), el('span', 'acces-lien', lien ? lien.titre : 'Aucun lien'));

    const fleche = el('span', 'acces-fleche');
    fleche.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';

    a.append(icone, textes, fleche);
    liste.appendChild(a);
  }

  // --- Le glissement du doigt ---
  let ouverte = false;
  let decalageFerme = 0; // de combien la feuille descend quand elle est « à moitié »
  let decalage = 0;

  function hauteurVisible() {
    return feuille.offsetHeight - decalage;
  }

  function mesurer() {
    if (ecranLarge.matches) {
      decalageFerme = 0;
      placer(0, false);
      feuille.classList.add('ouverte');
      return;
    }
    const entete = feuille.querySelector('.acces-entete');
    const ligne = liste.firstElementChild;
    const hLigne = ligne ? ligne.offsetHeight + 8 : 64;
    // À moitié ouverte : le titre et deux lignes et demie, mais jamais plus
    // d'un tiers de l'écran (pour laisser la place aux planètes).
    const voulu = entete.offsetHeight + hLigne * 2.5 + 8;
    const visible = Math.min(voulu, window.innerHeight * 0.34, feuille.offsetHeight);
    decalageFerme = Math.max(0, feuille.offsetHeight - visible);
    placer(ouverte ? 0 : decalageFerme, false);
  }

  function placer(valeur, anime) {
    decalage = Math.max(0, Math.min(decalageFerme, valeur));
    feuille.classList.toggle('anime', anime);
    feuille.style.transform = `translateY(${decalage}px)`;
    feuille.classList.toggle('ouverte', decalage < decalageFerme / 2);
  }

  function basculer(etat) {
    ouverte = etat;
    placer(ouverte ? 0 : decalageFerme, true);
  }

  let depart = null;
  let glisse = false;

  feuille.addEventListener('pointerdown', (e) => {
    if (ecranLarge.matches) return;
    depart = { y: e.clientY, decalage, temps: performance.now() };
    glisse = false;
  });

  window.addEventListener('pointermove', (e) => {
    if (!depart) return;
    const dy = e.clientY - depart.y;
    if (!glisse && Math.abs(dy) > 8) {
      glisse = true;
      feuille.setPointerCapture?.(e.pointerId);
    }
    if (glisse) placer(depart.decalage + dy, false);
  });

  function fin(e) {
    if (!depart) return;
    if (glisse) {
      const dy = e.clientY - depart.y;
      const vitesse = dy / Math.max(1, performance.now() - depart.temps);
      // Un petit coup de doigt rapide suffit ; sinon on regarde où on s'est arrêté.
      if (Math.abs(vitesse) > 0.4) basculer(vitesse < 0);
      else basculer(decalage < decalageFerme / 2);
    }
    depart = null;
  }
  window.addEventListener('pointerup', fin);
  window.addEventListener('pointercancel', fin);

  // Après un glissement, le doigt levé ne doit pas ouvrir un lien par erreur.
  feuille.addEventListener(
    'click',
    (e) => {
      if (glisse) {
        e.preventDefault();
        e.stopPropagation();
        glisse = false;
      }
    },
    true,
  );

  // Toucher le titre ou la poignée ouvre ou referme la liste.
  feuille.querySelector('.acces-entete').addEventListener('click', () => {
    if (!ecranLarge.matches) basculer(!ouverte);
  });

  // Ce qui reste visible quand la feuille est à moitié ouverte : la 3D se cadre au-dessus.
  const observer = new ResizeObserver(() => {
    mesurer();
    onChange?.();
  });
  observer.observe(feuille);
  ecranLarge.addEventListener('change', () => {
    ouverte = false;
    mesurer();
    onChange?.();
  });

  mesurer();

  return {
    // La hauteur cachée par la feuille quand elle est à moitié ouverte.
    hauteurRepos: () => (ecranLarge.matches ? 0 : feuille.offsetHeight - decalageFerme),
    hauteurVisible,
    mesurer,
  };
}

// --- Le panneau d'une planète ----------------------------------------------
// Il monte du bas quand on touche une planète : nom, une phrase, les liens.
// On le ferme avec la croix, en touchant à côté, ou en le glissant vers le bas.
export function creerPanneau(panneau, onFermer) {
  const titre = panneau.querySelector('.panneau-titre');
  const icone = panneau.querySelector('.panneau-icone');
  const description = panneau.querySelector('.panneau-description');
  const liens = panneau.querySelector('.panneau-liens');
  let ouvert = false;

  function ouvrir(planete, theme) {
    titre.textContent = planete.nom;
    icone.innerHTML = icons[planete.id] ?? icons.libre;
    icone.style.color = theme.anneau;
    icone.style.background = `color-mix(in srgb, ${theme.anneau} 18%, transparent)`;
    panneau.style.setProperty('--accent', theme.anneau);
    description.textContent = planete.description ?? '';

    liens.replaceChildren();
    (planete.liens ?? []).slice(0, 3).forEach((l, i) => {
      const a = el('a', i === 0 ? 'panneau-lien principal' : 'panneau-lien', l.titre);
      a.href = l.url;
      a.target = '_blank';
      a.rel = 'noopener';
      liens.appendChild(a);
    });

    panneau.style.removeProperty('--tire');
    panneau.hidden = false;
    void panneau.offsetHeight; // le navigateur place le panneau en bas avant de le faire monter
    panneau.classList.add('visible');
    ouvert = true;
  }

  function fermer() {
    if (!ouvert) return;
    ouvert = false;
    panneau.style.removeProperty('--tire');
    panneau.classList.remove('visible');
    onFermer?.();
  }

  panneau.addEventListener('transitionend', () => {
    if (!ouvert) panneau.hidden = true;
  });

  panneau.querySelector('.panneau-fermer').addEventListener('click', fermer);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fermer();
  });

  // Glisser vers le bas pour fermer.
  let depart = null;
  let glisse = false;
  panneau.addEventListener('pointerdown', (e) => {
    depart = { y: e.clientY, temps: performance.now() };
    glisse = false;
  });
  panneau.addEventListener('pointermove', (e) => {
    if (!depart) return;
    const dy = e.clientY - depart.y;
    if (!glisse && dy > 8) {
      glisse = true;
      panneau.classList.add('glisse');
      panneau.setPointerCapture?.(e.pointerId);
    }
    if (glisse) panneau.style.setProperty('--tire', `${Math.max(0, dy)}px`);
  });
  function fin(e) {
    if (!depart) return;
    panneau.classList.remove('glisse');
    if (glisse) {
      const dy = e.clientY - depart.y;
      const vitesse = dy / Math.max(1, performance.now() - depart.temps);
      if (dy > 80 || vitesse > 0.5) fermer();
      else panneau.style.removeProperty('--tire');
    }
    depart = null;
  }
  panneau.addEventListener('pointerup', fin);
  panneau.addEventListener('pointercancel', fin);
  panneau.addEventListener(
    'click',
    (e) => {
      if (glisse) {
        e.preventDefault();
        e.stopPropagation();
        glisse = false;
      }
    },
    true,
  );

  return {
    ouvrir,
    fermer,
    estOuvert: () => ouvert,
    hauteur: () => (ouvert ? panneau.offsetHeight : 0),
  };
}
