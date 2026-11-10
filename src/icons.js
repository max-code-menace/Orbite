// Des icônes simples, dessinées à la main (pas de vrais logos).
const svg = (body) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const icons = {
  // Un appareil photo
  instagram: svg('<rect x="3" y="6" width="18" height="14" rx="4"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/>'),
  // Un écran avec un triangle de lecture
  youtube: svg('<rect x="2.5" y="5" width="19" height="14" rx="4"/><path d="M10 9.5v5l4.5-2.5z" fill="currentColor"/>'),
  // Une note de musique
  spotify: svg('<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>'),
  // Un avion
  voyage: svg('<path d="M10.5 13.5L3 11l1.5-1.5 8 .5 4.5-4.5a2.1 2.1 0 013 3L15.5 13l.5 8-1.5 1.5-2.5-7.5-3 3v2.5L7.5 22 6 18l-4-1.5L3.5 15H6z"/>'),
  // Une étincelle
  libre: svg('<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/><path d="M19 3v4M17 5h4"/>'),
};
