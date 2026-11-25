// Every fact about La Royaltine lives here.
// Real (from their Instagram @laroyaltine): name, trades, Dakar, both phones, opening hours, the
// story-highlight categories (Noël 2026, Nos pains, Viennoiseries, Gâteaux glacés, Cakes).
// ASSUMED, to confirm with the bakery: every product name not seen in their photographs, every price,
// the order lead times and the pickup capacity. They are marked "à confirmer" in the README.

export const info = {
  name: 'La Royaltine',
  fullName: 'Pâtisserie La Royaltine',
  trades: ['Pâtissier', 'Boulanger', 'Glacier', 'Chocolatier'],
  city: 'Dakar',
  timezone: 'Africa/Dakar',
  phones: [
    { label: '33 821 99 94', tel: '+221338219994' },
    { label: '78 879 74 75', tel: '+221788797475' },
  ],
  instagram: 'https://www.instagram.com/laroyaltine/',
  instagramHandle: '@laroyaltine',
  map: 'https://www.google.com/maps/search/?api=1&query=P%C3%A2tisserie+La+Royaltine+Dakar',
  payment: 'Espèces, Wave ou Orange Money au retrait',
};

/** Opening hours by weekday (0 = Sunday). Public holidays follow Sunday hours. */
export const hours: Record<number, { open: string; close: string }> = {
  0: { open: '07:00', close: '20:00' },
  1: { open: '06:30', close: '20:30' },
  2: { open: '06:30', close: '20:30' },
  3: { open: '06:30', close: '20:30' },
  4: { open: '06:30', close: '20:30' },
  5: { open: '06:30', close: '20:30' },
  6: { open: '06:30', close: '20:30' },
};
export const hoursRows = [
  { days: 'Lundi à samedi', time: '6 h 30 – 20 h 30' },
  { days: 'Dimanche et jours fériés', time: '7 h – 20 h' },
];

/** Click & collect rules (ASSUMED). */
export const ordering = {
  slotMinutes: 30,
  ordersPerSlot: 8,
  daysAhead: 21,
  counterLeadMinutes: 60, // breads, viennoiseries, individual pastries
  maxQty: 30,
};

export type Lead = 'jour' | '48h';
export interface Product {
  id: string;
  name: string;
  price: number; // FCFA
  desc?: string;
  unit?: string;
  img?: string;
}
export interface Category {
  id: string;
  name: string;
  lead: Lead;
  intro: string;
  items: Product[];
}

export const catalog: Category[] = [
  {
    id: 'noel',
    name: 'Noël 2026',
    lead: '48h',
    intro: 'Bûches à commander 48 h à l’avance, à retirer jusqu’au 31 décembre.',
    items: [
      { id: 'buche-trois-chocolats', name: 'Bûche trois chocolats', price: 18000, unit: '6 parts', desc: 'Mousses chocolat noir, lait et blanc, croustillant praliné.', img: 'poche' },
      { id: 'buche-mangue-passion', name: 'Bûche mangue passion', price: 18000, unit: '6 parts', desc: 'Crémeux mangue, insert passion, biscuit coco.', img: 'mangue' },
      { id: 'buche-glacee-vanille', name: 'Bûche glacée vanille noix de pécan', price: 20000, unit: '6 parts', desc: 'Glace vanille, caramel, pécans torréfiées.', img: 'glace' },
      { id: 'buche-8', name: 'Bûche au choix, grand format', price: 24000, unit: '8 parts' },
    ],
  },
  {
    id: 'viennoiseries',
    name: 'Viennoiseries',
    lead: 'jour',
    intro: 'Pur beurre, à retirer dès l’ouverture.',
    items: [
      { id: 'croissant', name: 'Croissant', price: 700, img: 'croissants' },
      { id: 'pain-chocolat', name: 'Pain au chocolat', price: 800, img: 'croissants' },
      { id: 'pain-raisins', name: 'Pain aux raisins', price: 900 },
      { id: 'chausson-pommes', name: 'Chausson aux pommes', price: 900 },
      { id: 'croissant-amandes', name: 'Croissant aux amandes', price: 1200 },
      { id: 'brioche', name: 'Brioche tressée', price: 2500 },
    ],
  },
  {
    id: 'pains',
    name: 'Nos pains',
    lead: 'jour',
    intro: 'Cuits chaque jour, à retirer chaud le matin.',
    items: [
      { id: 'baguette', name: 'Baguette', price: 200 },
      { id: 'baguette-tradition', name: 'Baguette tradition', price: 400 },
      { id: 'pain-campagne', name: 'Pain de campagne', price: 1500 },
      { id: 'pain-cereales', name: 'Pain aux céréales', price: 1800 },
      { id: 'pain-mie', name: 'Pain de mie', price: 2000 },
      { id: 'pain-complet', name: 'Pain complet', price: 1500 },
    ],
  },
  {
    id: 'patisseries',
    name: 'Pâtisseries',
    lead: 'jour',
    intro: 'Les pièces individuelles de la vitrine.',
    items: [
      { id: 'tartelette-myrtilles', name: 'Tartelette myrtilles', price: 2500, img: 'tartelette' },
      { id: 'entremets-mangue', name: 'Carré mangue', price: 2800, img: 'mangue' },
      { id: 'tiramisu', name: 'Tiramisu', price: 2500 },
      { id: 'opera', name: 'Opéra', price: 2500, img: 'poche' },
      { id: 'eclair', name: 'Éclair chocolat ou café', price: 1500 },
      { id: 'paris-brest', name: 'Paris-brest', price: 2500 },
    ],
  },
  {
    id: 'glaces',
    name: 'Glaces',
    lead: 'jour',
    intro: 'Faites maison, en pot à emporter.',
    items: [
      { id: 'pot-petit', name: 'Pot de glace, 2 parfums', price: 2000, img: 'glace' },
      { id: 'pot-500', name: 'Pot de glace 500 ml', price: 5500, img: 'glace' },
      { id: 'pot-1l', name: 'Bac de glace 1 litre', price: 10000 },
    ],
  },
  {
    id: 'gateaux',
    name: 'Gâteaux et cakes',
    lead: '48h',
    intro: 'Gâteaux entiers et gâteaux glacés, préparés pour vous en 48 h.',
    items: [
      { id: 'gateau-chocolat-6', name: 'Gâteau chocolat caramel', price: 15000, unit: '6 parts', desc: 'Mousse vanille, copeaux de chocolat, caramel.', img: 'gateau' },
      { id: 'gateau-chocolat-10', name: 'Gâteau chocolat caramel', price: 24000, unit: '10 parts', img: 'gateau' },
      { id: 'gateau-fruits-8', name: 'Gâteau aux fruits rouges', price: 20000, unit: '8 parts' },
      { id: 'gateau-glace-6', name: 'Gâteau glacé', price: 16000, unit: '6 parts' },
      { id: 'cake-marbre', name: 'Cake marbré', price: 6000 },
      { id: 'cake-citron', name: 'Cake citron', price: 6000 },
    ],
  },
];

export const allProducts = catalog.flatMap((c) => c.items.map((p) => ({ ...p, category: c.id, lead: c.lead })));
export const productById = new Map(allProducts.map((p) => [p.id, p]));

export const fcfa = (n: number) => new Intl.NumberFormat('fr-FR').format(n).replace(/ | /g, ' ') + ' FCFA';
