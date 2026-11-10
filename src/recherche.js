// Chercher un créateur : par nom, pseudo, bio ou thème, sans tenir compte des accents ni des majuscules.
// (Logique pure, testée sans navigateur.)

const simple = (t) =>
  String(t ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

// Les positions des systèmes qui correspondent. Texte vide = tous. Plusieurs mots : tous doivent se trouver.
// favoris : si donné (liste d'ids), ne garde que ceux-là.
export function chercher(systemes, texte, themes = [], favoris = null) {
  const mots = simple(texte).split(/\s+/).filter(Boolean);
  const nomTheme = (id) => themes.find((t) => t.id === id)?.nom ?? '';
  return systemes
    .map((_, i) => i)
    .filter((i) => {
      const s = systemes[i];
      if (favoris && !favoris.includes(s.id)) return false;
      const meule = simple(`${s.profil.nom} ${s.profil.pseudo} ${s.profil.bio} ${nomTheme(s.theme)}`);
      return mots.every((m) => meule.includes(m));
    });
}
