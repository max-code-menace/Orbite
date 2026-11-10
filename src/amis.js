// La bande sous le profil : deux flèches (système précédent / suivant) et les amis
// de la personne. Toucher un ami ouvre son système.
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
export function creerBandeAmis(bande, onAller, onSens) {
  const liste = bande.querySelector('.amis-liste');
  for (const bouton of bande.querySelectorAll('.amis-fleche')) {
    bouton.addEventListener('click', () => onSens(Number(bouton.dataset.sens)));
  }

  // indexAmis : les positions (dans la galaxie) des amis du système affiché.
  function remplir(systemes, indexAmis) {
    liste.replaceChildren();
    liste.scrollLeft = 0;
    if (indexAmis.length === 0) return;
    liste.appendChild(el('span', 'amis-titre', 'Amis'));
    for (const i of indexAmis) {
      const { nom } = systemes[i].profil;
      const puce = el('button', 'ami');
      puce.type = 'button';
      puce.append(el('span', 'ami-rond', nom.trim()[0]?.toUpperCase() ?? '?'), el('span', 'ami-nom', prenom(nom)));
      puce.setAttribute('aria-label', `Ouvrir le système de ${nom}`);
      puce.addEventListener('click', () => onAller(i));
      liste.appendChild(puce);
    }
  }

  return { remplir };
}
