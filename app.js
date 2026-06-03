'use strict';

const IAEA_GROUND_STATES_URL = 'https://nds.iaea.org/relnsd/v1/data?fields=ground_states&nuclides=all';

const ELEMENTS = [
  { z: 1, symbol: 'H', name: 'Hidrógeno', english: 'Hydrogen', atomicWeight: '1.008', category: 'No metal' },
  { z: 2, symbol: 'He', name: 'Helio', english: 'Helium', atomicWeight: '4.0026', category: 'Gas noble' },
  { z: 3, symbol: 'Li', name: 'Litio', english: 'Lithium', atomicWeight: '6.94', category: 'Metal alcalino' },
  { z: 4, symbol: 'Be', name: 'Berilio', english: 'Beryllium', atomicWeight: '9.0122', category: 'Alcalinotérreo' },
  { z: 5, symbol: 'B', name: 'Boro', english: 'Boron', atomicWeight: '10.81', category: 'Metaloide' },
  { z: 6, symbol: 'C', name: 'Carbono', english: 'Carbon', atomicWeight: '12.011', category: 'No metal' },
  { z: 7, symbol: 'N', name: 'Nitrógeno', english: 'Nitrogen', atomicWeight: '14.007', category: 'No metal' },
  { z: 8, symbol: 'O', name: 'Oxígeno', english: 'Oxygen', atomicWeight: '15.999', category: 'No metal' },
  { z: 9, symbol: 'F', name: 'Flúor', english: 'Fluorine', atomicWeight: '18.998', category: 'Halógeno' },
  { z: 10, symbol: 'Ne', name: 'Neón', english: 'Neon', atomicWeight: '20.180', category: 'Gas noble' },
  { z: 11, symbol: 'Na', name: 'Sodio', english: 'Sodium', atomicWeight: '22.990', category: 'Metal alcalino' },
  { z: 12, symbol: 'Mg', name: 'Magnesio', english: 'Magnesium', atomicWeight: '24.305', category: 'Alcalinotérreo' },
  { z: 13, symbol: 'Al', name: 'Aluminio', english: 'Aluminium', atomicWeight: '26.982', category: 'Metal postransición' },
  { z: 14, symbol: 'Si', name: 'Silicio', english: 'Silicon', atomicWeight: '28.085', category: 'Metaloide' },
  { z: 15, symbol: 'P', name: 'Fósforo', english: 'Phosphorus', atomicWeight: '30.974', category: 'No metal' },
  { z: 16, symbol: 'S', name: 'Azufre', english: 'Sulfur', atomicWeight: '32.06', category: 'No metal' },
  { z: 17, symbol: 'Cl', name: 'Cloro', english: 'Chlorine', atomicWeight: '35.45', category: 'Halógeno' },
  { z: 18, symbol: 'Ar', name: 'Argón', english: 'Argon', atomicWeight: '39.948', category: 'Gas noble' },
  { z: 19, symbol: 'K', name: 'Potasio', english: 'Potassium', atomicWeight: '39.098', category: 'Metal alcalino' },
  { z: 20, symbol: 'Ca', name: 'Calcio', english: 'Calcium', atomicWeight: '40.078', category: 'Alcalinotérreo' },
  { z: 21, symbol: 'Sc', name: 'Escandio', english: 'Scandium', atomicWeight: '44.956', category: 'Metal de transición' },
  { z: 22, symbol: 'Ti', name: 'Titanio', english: 'Titanium', atomicWeight: '47.867', category: 'Metal de transición' },
  { z: 23, symbol: 'V', name: 'Vanadio', english: 'Vanadium', atomicWeight: '50.942', category: 'Metal de transición' },
  { z: 24, symbol: 'Cr', name: 'Cromo', english: 'Chromium', atomicWeight: '51.996', category: 'Metal de transición' },
  { z: 25, symbol: 'Mn', name: 'Manganeso', english: 'Manganese', atomicWeight: '54.938', category: 'Metal de transición' },
  { z: 26, symbol: 'Fe', name: 'Hierro', english: 'Iron', atomicWeight: '55.845', category: 'Metal de transición' },
  { z: 27, symbol: 'Co', name: 'Cobalto', english: 'Cobalt', atomicWeight: '58.933', category: 'Metal de transición' },
  { z: 28, symbol: 'Ni', name: 'Níquel', english: 'Nickel', atomicWeight: '58.693', category: 'Metal de transición' },
  { z: 29, symbol: 'Cu', name: 'Cobre', english: 'Copper', atomicWeight: '63.546', category: 'Metal de transición' },
  { z: 30, symbol: 'Zn', name: 'Zinc', english: 'Zinc', atomicWeight: '65.38', category: 'Metal de transición' },
  { z: 31, symbol: 'Ga', name: 'Galio', english: 'Gallium', atomicWeight: '69.723', category: 'Metal postransición' },
  { z: 32, symbol: 'Ge', name: 'Germanio', english: 'Germanium', atomicWeight: '72.630', category: 'Metaloide' },
  { z: 33, symbol: 'As', name: 'Arsénico', english: 'Arsenic', atomicWeight: '74.922', category: 'Metaloide' },
  { z: 34, symbol: 'Se', name: 'Selenio', english: 'Selenium', atomicWeight: '78.971', category: 'No metal' },
  { z: 35, symbol: 'Br', name: 'Bromo', english: 'Bromine', atomicWeight: '79.904', category: 'Halógeno' },
  { z: 36, symbol: 'Kr', name: 'Criptón', english: 'Krypton', atomicWeight: '83.798', category: 'Gas noble' },
  { z: 37, symbol: 'Rb', name: 'Rubidio', english: 'Rubidium', atomicWeight: '85.468', category: 'Metal alcalino' },
  { z: 38, symbol: 'Sr', name: 'Estroncio', english: 'Strontium', atomicWeight: '87.62', category: 'Alcalinotérreo' },
  { z: 39, symbol: 'Y', name: 'Itrio', english: 'Yttrium', atomicWeight: '88.906', category: 'Metal de transición' },
  { z: 40, symbol: 'Zr', name: 'Circonio', english: 'Zirconium', atomicWeight: '91.224', category: 'Metal de transición' },
  { z: 41, symbol: 'Nb', name: 'Niobio', english: 'Niobium', atomicWeight: '92.906', category: 'Metal de transición' },
  { z: 42, symbol: 'Mo', name: 'Molibdeno', english: 'Molybdenum', atomicWeight: '95.95', category: 'Metal de transición' },
  { z: 43, symbol: 'Tc', name: 'Tecnecio', english: 'Technetium', atomicWeight: '[98]', category: 'Metal de transición' },
  { z: 44, symbol: 'Ru', name: 'Rutenio', english: 'Ruthenium', atomicWeight: '101.07', category: 'Metal de transición' },
  { z: 45, symbol: 'Rh', name: 'Rodio', english: 'Rhodium', atomicWeight: '102.91', category: 'Metal de transición' },
  { z: 46, symbol: 'Pd', name: 'Paladio', english: 'Palladium', atomicWeight: '106.42', category: 'Metal de transición' },
  { z: 47, symbol: 'Ag', name: 'Plata', english: 'Silver', atomicWeight: '107.87', category: 'Metal de transición' },
  { z: 48, symbol: 'Cd', name: 'Cadmio', english: 'Cadmium', atomicWeight: '112.41', category: 'Metal de transición' },
  { z: 49, symbol: 'In', name: 'Indio', english: 'Indium', atomicWeight: '114.82', category: 'Metal postransición' },
  { z: 50, symbol: 'Sn', name: 'Estaño', english: 'Tin', atomicWeight: '118.71', category: 'Metal postransición' },
  { z: 51, symbol: 'Sb', name: 'Antimonio', english: 'Antimony', atomicWeight: '121.76', category: 'Metaloide' },
  { z: 52, symbol: 'Te', name: 'Telurio', english: 'Tellurium', atomicWeight: '127.60', category: 'Metaloide' },
  { z: 53, symbol: 'I', name: 'Yodo', english: 'Iodine', atomicWeight: '126.90', category: 'Halógeno' },
  { z: 54, symbol: 'Xe', name: 'Xenón', english: 'Xenon', atomicWeight: '131.29', category: 'Gas noble' },
  { z: 55, symbol: 'Cs', name: 'Cesio', english: 'Caesium', atomicWeight: '132.91', category: 'Metal alcalino' },
  { z: 56, symbol: 'Ba', name: 'Bario', english: 'Barium', atomicWeight: '137.33', category: 'Alcalinotérreo' },
  { z: 57, symbol: 'La', name: 'Lantano', english: 'Lanthanum', atomicWeight: '138.91', category: 'Lantánido' },
  { z: 58, symbol: 'Ce', name: 'Cerio', english: 'Cerium', atomicWeight: '140.12', category: 'Lantánido' },
  { z: 59, symbol: 'Pr', name: 'Praseodimio', english: 'Praseodymium', atomicWeight: '140.91', category: 'Lantánido' },
  { z: 60, symbol: 'Nd', name: 'Neodimio', english: 'Neodymium', atomicWeight: '144.24', category: 'Lantánido' },
  { z: 61, symbol: 'Pm', name: 'Prometio', english: 'Promethium', atomicWeight: '[145]', category: 'Lantánido' },
  { z: 62, symbol: 'Sm', name: 'Samario', english: 'Samarium', atomicWeight: '150.36', category: 'Lantánido' },
  { z: 63, symbol: 'Eu', name: 'Europio', english: 'Europium', atomicWeight: '151.96', category: 'Lantánido' },
  { z: 64, symbol: 'Gd', name: 'Gadolinio', english: 'Gadolinium', atomicWeight: '157.25', category: 'Lantánido' },
  { z: 65, symbol: 'Tb', name: 'Terbio', english: 'Terbium', atomicWeight: '158.93', category: 'Lantánido' },
  { z: 66, symbol: 'Dy', name: 'Disprosio', english: 'Dysprosium', atomicWeight: '162.50', category: 'Lantánido' },
  { z: 67, symbol: 'Ho', name: 'Holmio', english: 'Holmium', atomicWeight: '164.93', category: 'Lantánido' },
  { z: 68, symbol: 'Er', name: 'Erbio', english: 'Erbium', atomicWeight: '167.26', category: 'Lantánido' },
  { z: 69, symbol: 'Tm', name: 'Tulio', english: 'Thulium', atomicWeight: '168.93', category: 'Lantánido' },
  { z: 70, symbol: 'Yb', name: 'Iterbio', english: 'Ytterbium', atomicWeight: '173.05', category: 'Lantánido' },
  { z: 71, symbol: 'Lu', name: 'Lutecio', english: 'Lutetium', atomicWeight: '174.97', category: 'Lantánido' },
  { z: 72, symbol: 'Hf', name: 'Hafnio', english: 'Hafnium', atomicWeight: '178.49', category: 'Metal de transición' },
  { z: 73, symbol: 'Ta', name: 'Tántalo', english: 'Tantalum', atomicWeight: '180.95', category: 'Metal de transición' },
  { z: 74, symbol: 'W', name: 'Wolframio', english: 'Tungsten', atomicWeight: '183.84', category: 'Metal de transición' },
  { z: 75, symbol: 'Re', name: 'Renio', english: 'Rhenium', atomicWeight: '186.21', category: 'Metal de transición' },
  { z: 76, symbol: 'Os', name: 'Osmio', english: 'Osmium', atomicWeight: '190.23', category: 'Metal de transición' },
  { z: 77, symbol: 'Ir', name: 'Iridio', english: 'Iridium', atomicWeight: '192.22', category: 'Metal de transición' },
  { z: 78, symbol: 'Pt', name: 'Platino', english: 'Platinum', atomicWeight: '195.08', category: 'Metal de transición' },
  { z: 79, symbol: 'Au', name: 'Oro', english: 'Gold', atomicWeight: '196.97', category: 'Metal de transición' },
  { z: 80, symbol: 'Hg', name: 'Mercurio', english: 'Mercury', atomicWeight: '200.59', category: 'Metal de transición' },
  { z: 81, symbol: 'Tl', name: 'Talio', english: 'Thallium', atomicWeight: '204.38', category: 'Metal postransición' },
  { z: 82, symbol: 'Pb', name: 'Plomo', english: 'Lead', atomicWeight: '207.2', category: 'Metal postransición' },
  { z: 83, symbol: 'Bi', name: 'Bismuto', english: 'Bismuth', atomicWeight: '208.98', category: 'Metal postransición' },
  { z: 84, symbol: 'Po', name: 'Polonio', english: 'Polonium', atomicWeight: '[209]', category: 'Metaloide' },
  { z: 85, symbol: 'At', name: 'Astato', english: 'Astatine', atomicWeight: '[210]', category: 'Halógeno' },
  { z: 86, symbol: 'Rn', name: 'Radón', english: 'Radon', atomicWeight: '[222]', category: 'Gas noble' },
  { z: 87, symbol: 'Fr', name: 'Francio', english: 'Francium', atomicWeight: '[223]', category: 'Metal alcalino' },
  { z: 88, symbol: 'Ra', name: 'Radio', english: 'Radium', atomicWeight: '[226]', category: 'Alcalinotérreo' },
  { z: 89, symbol: 'Ac', name: 'Actinio', english: 'Actinium', atomicWeight: '[227]', category: 'Actínido' },
  { z: 90, symbol: 'Th', name: 'Torio', english: 'Thorium', atomicWeight: '232.04', category: 'Actínido' },
  { z: 91, symbol: 'Pa', name: 'Protactinio', english: 'Protactinium', atomicWeight: '231.04', category: 'Actínido' },
  { z: 92, symbol: 'U', name: 'Uranio', english: 'Uranium', atomicWeight: '238.03', category: 'Actínido' },
  { z: 93, symbol: 'Np', name: 'Neptunio', english: 'Neptunium', atomicWeight: '[237]', category: 'Actínido' },
  { z: 94, symbol: 'Pu', name: 'Plutonio', english: 'Plutonium', atomicWeight: '[244]', category: 'Actínido' },
  { z: 95, symbol: 'Am', name: 'Americio', english: 'Americium', atomicWeight: '[243]', category: 'Actínido' },
  { z: 96, symbol: 'Cm', name: 'Curio', english: 'Curium', atomicWeight: '[247]', category: 'Actínido' },
  { z: 97, symbol: 'Bk', name: 'Berkelio', english: 'Berkelium', atomicWeight: '[247]', category: 'Actínido' },
  { z: 98, symbol: 'Cf', name: 'Californio', english: 'Californium', atomicWeight: '[251]', category: 'Actínido' },
  { z: 99, symbol: 'Es', name: 'Einstenio', english: 'Einsteinium', atomicWeight: '[252]', category: 'Actínido' },
  { z: 100, symbol: 'Fm', name: 'Fermio', english: 'Fermium', atomicWeight: '[257]', category: 'Actínido' },
  { z: 101, symbol: 'Md', name: 'Mendelevio', english: 'Mendelevium', atomicWeight: '[258]', category: 'Actínido' },
  { z: 102, symbol: 'No', name: 'Nobelio', english: 'Nobelium', atomicWeight: '[259]', category: 'Actínido' },
  { z: 103, symbol: 'Lr', name: 'Lawrencio', english: 'Lawrencium', atomicWeight: '[266]', category: 'Actínido' },
  { z: 104, symbol: 'Rf', name: 'Rutherfordio', english: 'Rutherfordium', atomicWeight: '[267]', category: 'Metal de transición' },
  { z: 105, symbol: 'Db', name: 'Dubnio', english: 'Dubnium', atomicWeight: '[268]', category: 'Metal de transición' },
  { z: 106, symbol: 'Sg', name: 'Seaborgio', english: 'Seaborgium', atomicWeight: '[269]', category: 'Metal de transición' },
  { z: 107, symbol: 'Bh', name: 'Bohrio', english: 'Bohrium', atomicWeight: '[270]', category: 'Metal de transición' },
  { z: 108, symbol: 'Hs', name: 'Hassio', english: 'Hassium', atomicWeight: '[277]', category: 'Metal de transición' },
  { z: 109, symbol: 'Mt', name: 'Meitnerio', english: 'Meitnerium', atomicWeight: '[278]', category: 'Desconocido' },
  { z: 110, symbol: 'Ds', name: 'Darmstadtio', english: 'Darmstadtium', atomicWeight: '[281]', category: 'Desconocido' },
  { z: 111, symbol: 'Rg', name: 'Roentgenio', english: 'Roentgenium', atomicWeight: '[282]', category: 'Desconocido' },
  { z: 112, symbol: 'Cn', name: 'Copernicio', english: 'Copernicium', atomicWeight: '[285]', category: 'Metal de transición' },
  { z: 113, symbol: 'Nh', name: 'Nihonio', english: 'Nihonium', atomicWeight: '[286]', category: 'Desconocido' },
  { z: 114, symbol: 'Fl', name: 'Flerovio', english: 'Flerovium', atomicWeight: '[289]', category: 'Desconocido' },
  { z: 115, symbol: 'Mc', name: 'Moscovio', english: 'Moscovium', atomicWeight: '[290]', category: 'Desconocido' },
  { z: 116, symbol: 'Lv', name: 'Livermorio', english: 'Livermorium', atomicWeight: '[293]', category: 'Desconocido' },
  { z: 117, symbol: 'Ts', name: 'Teneso', english: 'Tennessine', atomicWeight: '[294]', category: 'Desconocido' },
  { z: 118, symbol: 'Og', name: 'Oganesón', english: 'Oganesson', atomicWeight: '[294]', category: 'Gas noble' }
];

const ELEMENT_BY_Z = new Map(ELEMENTS.map(e => [e.z, e]));
const ELEMENT_BY_SYMBOL = new Map(ELEMENTS.map(e => [e.symbol.toLowerCase(), e]));

const CURATED_NUCLIDES = [
  ['H', 1, true, null, null, 'Protio, isótopo dominante del hidrógeno.'],
  ['H', 2, true, null, null, 'Deuterio; contiene un protón y un neutrón.'],
  ['H', 3, false, 388800000, 'B-', 'Tritio; radioisótopo beta usado como trazador.'],
  ['He', 3, true, null, null, 'Helio-3; raro y de interés en criogenia y física nuclear.'],
  ['He', 4, true, null, null, 'Helio-4; núcleo alfa.'],
  ['Li', 6, true, null, null, 'Litio-6; relevante en tecnología nuclear.'],
  ['Li', 7, true, null, null, 'Litio-7; isótopo natural mayoritario.'],
  ['Be', 9, true, null, null, 'Berilio-9; único isótopo estable del berilio.'],
  ['B', 10, true, null, null, 'Boro-10; alta sección eficaz de captura neutrónica.'],
  ['B', 11, true, null, null, 'Boro-11; isótopo estable mayoritario.'],
  ['C', 12, true, null, null, 'Carbono-12; referencia histórica de la unidad de masa atómica.'],
  ['C', 13, true, null, null, 'Carbono-13; útil en RMN.'],
  ['C', 14, false, 180800000000, 'B-', 'Carbono-14; datación radiocarbónica.'],
  ['N', 14, true, null, null, 'Nitrógeno-14; isótopo natural dominante.'],
  ['N', 15, true, null, null, 'Nitrógeno-15; estable y usado como trazador.'],
  ['O', 16, true, null, null, 'Oxígeno-16; isótopo dominante.'],
  ['O', 17, true, null, null, 'Oxígeno-17; estable, poco abundante.'],
  ['O', 18, true, null, null, 'Oxígeno-18; usado en hidrología e investigación climática.'],
  ['F', 18, false, 6586, 'B+ / EC', 'Flúor-18; emisor de positrones usado en PET.'],
  ['Ne', 20, true, null, null, 'Neón-20; estable.'],
  ['Na', 22, false, 82100000, 'B+ / EC', 'Sodio-22; fuente de positrones.'],
  ['Na', 23, true, null, null, 'Sodio-23; único isótopo estable del sodio.'],
  ['Mg', 24, true, null, null, 'Magnesio-24; estable.'],
  ['Al', 26, false, 22600000000000, 'B+ / EC', 'Aluminio-26; radionucleido cosmogénico.'],
  ['Al', 27, true, null, null, 'Aluminio-27; único estable del aluminio.'],
  ['Si', 28, true, null, null, 'Silicio-28; isótopo estable dominante.'],
  ['P', 31, true, null, null, 'Fósforo-31; único estable.'],
  ['P', 32, false, 1230000, 'B-', 'Fósforo-32; trazador beta.'],
  ['S', 32, true, null, null, 'Azufre-32; estable.'],
  ['Cl', 35, true, null, null, 'Cloro-35; estable.'],
  ['Cl', 37, true, null, null, 'Cloro-37; estable.'],
  ['Ar', 40, true, null, null, 'Argón-40; estable, producto de decaimiento del K-40.'],
  ['K', 40, false, 3.94e16, 'B- / EC', 'Potasio-40; contribuye a la radiactividad natural.'],
  ['Ca', 40, true, null, null, 'Calcio-40; estable.'],
  ['Sc', 45, true, null, null, 'Escandio-45; único estable.'],
  ['Ti', 48, true, null, null, 'Titanio-48; estable.'],
  ['V', 51, true, null, null, 'Vanadio-51; prácticamente estable.'],
  ['Cr', 52, true, null, null, 'Cromo-52; estable.'],
  ['Mn', 55, true, null, null, 'Manganeso-55; único estable.'],
  ['Fe', 56, true, null, null, 'Hierro-56; muy abundante y ligado a alta energía de enlace por nucleón.'],
  ['Co', 59, true, null, null, 'Cobalto-59; único estable.'],
  ['Co', 60, false, 166300000, 'B-', 'Cobalto-60; fuente gamma industrial y médica.'],
  ['Ni', 58, true, null, null, 'Níquel-58; estable.'],
  ['Cu', 63, true, null, null, 'Cobre-63; estable.'],
  ['Zn', 64, true, null, null, 'Zinc-64; estable.'],
  ['Ga', 67, false, 281000, 'EC', 'Galio-67; usado en medicina nuclear.'],
  ['Ge', 76, true, null, null, 'Germanio-76; relevante en búsquedas de doble beta.'],
  ['As', 75, true, null, null, 'Arsénico-75; único estable.'],
  ['Se', 80, true, null, null, 'Selenio-80; estable.'],
  ['Br', 79, true, null, null, 'Bromo-79; estable.'],
  ['Kr', 86, true, null, null, 'Criptón-86; estable.'],
  ['Rb', 87, false, 1.56e18, 'B-', 'Rubidio-87; vida media muy larga, geocronología.'],
  ['Sr', 90, false, 908000000, 'B-', 'Estroncio-90; producto de fisión.'],
  ['Y', 89, true, null, null, 'Itrio-89; único estable.'],
  ['Zr', 90, true, null, null, 'Circonio-90; estable.'],
  ['Nb', 93, true, null, null, 'Niobio-93; único estable.'],
  ['Mo', 99, false, 238000, 'B-', 'Molibdeno-99; generador de Tc-99m.'],
  ['Tc', 99, false, 6.66e12, 'B-', 'Tecnecio-99; producto de fisión de vida larga.'],
  ['Ru', 102, true, null, null, 'Rutenio-102; estable.'],
  ['Rh', 103, true, null, null, 'Rodio-103; único estable.'],
  ['Pd', 106, true, null, null, 'Paladio-106; estable.'],
  ['Ag', 107, true, null, null, 'Plata-107; estable.'],
  ['Cd', 114, true, null, null, 'Cadmio-114; estable.'],
  ['In', 111, false, 242000, 'EC', 'Indio-111; diagnóstico en medicina nuclear.'],
  ['Sn', 120, true, null, null, 'Estaño-120; estable.'],
  ['Sb', 121, true, null, null, 'Antimonio-121; estable.'],
  ['Te', 130, true, null, null, 'Telurio-130; estable observacionalmente, candidato doble beta.'],
  ['I', 127, true, null, null, 'Yodo-127; único estable.'],
  ['I', 131, false, 693000, 'B-', 'Yodo-131; medicina nuclear y producto de fisión.'],
  ['Xe', 135, false, 32900, 'B-', 'Xenón-135; fuerte absorbente neutrónico en reactores.'],
  ['Cs', 133, true, null, null, 'Cesio-133; define el segundo en el SI mediante transición hiperfina.'],
  ['Cs', 137, false, 948000000, 'B-', 'Cesio-137; producto de fisión, emisor gamma vía Ba-137m.'],
  ['Ba', 137, true, null, null, 'Bario-137; estable.'],
  ['La', 139, true, null, null, 'Lantano-139; estable.'],
  ['Ce', 140, true, null, null, 'Cerio-140; estable.'],
  ['Pr', 141, true, null, null, 'Praseodimio-141; único estable.'],
  ['Nd', 144, false, 7.2e22, 'A', 'Neodimio-144; decaimiento alfa extremadamente lento.'],
  ['Pm', 147, false, 82700000, 'B-', 'Prometio-147; radioisótopo beta.'],
  ['Sm', 152, true, null, null, 'Samario-152; estable.'],
  ['Eu', 153, true, null, null, 'Europio-153; estable.'],
  ['Gd', 157, true, null, null, 'Gadolinio-157; gran captura de neutrones térmicos.'],
  ['Tb', 159, true, null, null, 'Terbio-159; único estable.'],
  ['Dy', 164, true, null, null, 'Disprosio-164; estable.'],
  ['Ho', 165, true, null, null, 'Holmio-165; único estable.'],
  ['Er', 166, true, null, null, 'Erbio-166; estable.'],
  ['Tm', 169, true, null, null, 'Tulio-169; único estable.'],
  ['Yb', 174, true, null, null, 'Iterbio-174; estable.'],
  ['Lu', 175, true, null, null, 'Lutecio-175; estable.'],
  ['Hf', 180, true, null, null, 'Hafnio-180; estable.'],
  ['Ta', 181, true, null, null, 'Tántalo-181; estable.'],
  ['W', 184, true, null, null, 'Wolframio-184; estable.'],
  ['Re', 187, false, 1.38e18, 'B-', 'Renio-187; vida media muy larga.'],
  ['Os', 192, true, null, null, 'Osmio-192; estable.'],
  ['Ir', 193, true, null, null, 'Iridio-193; estable.'],
  ['Pt', 195, true, null, null, 'Platino-195; estable.'],
  ['Au', 197, true, null, null, 'Oro-197; único estable.'],
  ['Hg', 202, true, null, null, 'Mercurio-202; estable.'],
  ['Tl', 205, true, null, null, 'Talio-205; estable.'],
  ['Pb', 208, true, null, null, 'Plomo-208; doblemente mágico.'],
  ['Bi', 209, false, 6.01e26, 'A', 'Bismuto-209; alfa con vida media extraordinariamente larga.'],
  ['Po', 210, false, 11960000, 'A', 'Polonio-210; emisor alfa.'],
  ['At', 211, false, 26000, 'A', 'Astato-211; radioisótopo de interés terapéutico.'],
  ['Rn', 222, false, 330000, 'A', 'Radón-222; gas noble radiactivo de la cadena del uranio.'],
  ['Fr', 223, false, 1320, 'B-', 'Francio-223; muy radiactivo.'],
  ['Ra', 226, false, 5.05e10, 'A', 'Radio-226; cadena del uranio.'],
  ['Ac', 227, false, 687000000, 'B- / A', 'Actinio-227; actínido radiactivo.'],
  ['Th', 232, false, 4.43e17, 'A', 'Torio-232; radionucleido primordial.'],
  ['Pa', 231, false, 1.03e12, 'A', 'Protactinio-231; cadena del uranio-actinio.'],
  ['U', 235, false, 2.22e16, 'A', 'Uranio-235; fisible con neutrones térmicos.'],
  ['U', 238, false, 1.41e17, 'A', 'Uranio-238; isótopo natural mayoritario.'],
  ['Np', 237, false, 6.76e13, 'A', 'Neptunio-237; actínido de vida larga.'],
  ['Pu', 239, false, 7.61e11, 'A', 'Plutonio-239; fisible.'],
  ['Am', 241, false, 1.36e10, 'A', 'Americio-241; detectores de humo y fuentes alfa.'],
  ['Cm', 244, false, 5.71e8, 'A', 'Curio-244; emisor alfa.'],
  ['Cf', 252, false, 83400000, 'A / SF', 'Californio-252; fuente intensa de neutrones por fisión espontánea.'],
  ['Og', 294, false, 0.0007, 'A / SF', 'Oganesón-294; superpesado, vida media muy corta.']
];

function curatedToRecords() {
  const records = CURATED_NUCLIDES.map(([symbol, a, stable, halfLifeSec, decay, note]) => {
    const element = ELEMENT_BY_SYMBOL.get(symbol.toLowerCase());
    return {
      id: `${symbol}-${a}`,
      z: element.z,
      n: a - element.z,
      a,
      symbol,
      elementName: element.name,
      englishName: element.english,
      atomicWeight: element.atomicWeight,
      category: element.category,
      isStable: stable,
      halfLifeSec,
      halfLifeText: stable ? 'Estable' : secondsToHuman(halfLifeSec),
      decayModes: decay ? [{ mode: decay, pct: null }] : [],
      abundance: null,
      atomicMass: null,
      massExcess: null,
      spinParity: null,
      energy: null,
      note,
      source: 'Muestra interna para comprobar la interfaz. Para trabajo científico importa CSV de IAEA/NNDC.',
      raw: { symbol, A: a, Z: element.z, N: a - element.z, note }
    };
  });

  // Añade una línea de referencia para elementos no cubiertos por la muestra, sin fingir datos de decaimiento.
  const existing = new Set(records.map(r => r.symbol));
  for (const element of ELEMENTS) {
    if (existing.has(element.symbol)) continue;
    const a = referenceMassNumber(element.atomicWeight);
    records.push({
      id: `${element.symbol}-${a}-ref`,
      z: element.z,
      n: a - element.z,
      a,
      symbol: element.symbol,
      elementName: element.name,
      englishName: element.english,
      atomicWeight: element.atomicWeight,
      category: element.category,
      isStable: false,
      halfLifeSec: null,
      halfLifeText: 'Sin clasificar en la muestra',
      decayModes: [],
      abundance: null,
      atomicMass: null,
      massExcess: null,
      spinParity: null,
      energy: null,
      note: 'Celda de referencia visual del elemento. Importa un CSV nuclear para reemplazarla por datos evaluados.',
      source: 'Referencia visual generada desde la masa atómica estándar del elemento.',
      raw: { symbol: element.symbol, A_referencia: a, Z: element.z, N: a - element.z, advertencia: 'No es un registro nuclear evaluado.' }
    });
  }
  return records.sort((a, b) => a.z - b.z || a.n - b.n);
}

let state = {
  nuclides: curatedToRecords(),
  selectedId: null,
  cellSize: 24,
  colorMode: 'decay',
  filterMode: 'all',
  query: '',
  labels: true,
  datasetName: 'demo'
};

const chartCanvas = document.getElementById('chartCanvas');
const chartViewport = document.getElementById('chartViewport');
const detailEmpty = document.getElementById('detailEmpty');
const detailPanel = document.getElementById('detailPanel');
const detailTemplate = document.getElementById('detailTemplate');
const datasetStatus = document.getElementById('datasetStatus');
const nuclideCount = document.getElementById('nuclideCount');
const visibleCount = document.getElementById('visibleCount');
const extentInfo = document.getElementById('extentInfo');

const debounce = (fn, wait = 160) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
};

function init() {
  document.getElementById('loadIaeaBtn').addEventListener('click', loadIaeaDataset);
  document.getElementById('csvFile').addEventListener('change', handleCsvFile);
  document.getElementById('searchInput').addEventListener('input', debounce(event => {
    state.query = event.target.value.trim();
    render();
  }));
  document.getElementById('colorMode').addEventListener('change', event => {
    state.colorMode = event.target.value;
    render();
  });
  document.getElementById('filterMode').addEventListener('change', event => {
    state.filterMode = event.target.value;
    render();
  });
  document.getElementById('zoomRange').addEventListener('input', event => {
    state.cellSize = Number(event.target.value);
    document.documentElement.style.setProperty('--cell-size', `${state.cellSize}px`);
    render();
  });
  document.getElementById('labelsToggle').addEventListener('change', event => {
    state.labels = event.target.checked;
    render();
  });

  chartViewport.addEventListener('dragover', event => {
    event.preventDefault();
  });
  chartViewport.addEventListener('drop', async event => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) await importCsvFile(file);
  });

  document.documentElement.style.setProperty('--cell-size', `${state.cellSize}px`);
  render();
  selectNuclide('U-235');
}

async function loadIaeaDataset() {
  setStatus('Intentando cargar CSV de IAEA LiveChart…', 'warn');
  try {
    const response = await fetch(IAEA_GROUND_STATES_URL, { mode: 'cors' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    const records = csvToNuclides(text);
    if (!records.length) throw new Error('El CSV no contiene registros reconocibles.');
    loadRecords(records, 'IAEA LiveChart ground_states');
    setStatus(`Datos IAEA cargados: ${records.length.toLocaleString('es-ES')} registros`, 'ok');
  } catch (error) {
    console.error(error);
    setStatus('No se pudo cargar IAEA desde el navegador. Descarga el CSV e impórtalo localmente.', 'error');
  }
}

async function handleCsvFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  await importCsvFile(file);
  event.target.value = '';
}

async function importCsvFile(file) {
  setStatus(`Importando ${file.name}…`, 'warn');
  try {
    const text = await file.text();
    const records = csvToNuclides(text);
    if (!records.length) throw new Error('No se encontraron filas con Z y N reconocibles.');
    loadRecords(records, file.name);
    setStatus(`CSV importado: ${records.length.toLocaleString('es-ES')} registros`, 'ok');
  } catch (error) {
    console.error(error);
    setStatus(`Error al importar CSV: ${error.message}`, 'error');
  }
}

function loadRecords(records, datasetName) {
  state.nuclides = records.sort((a, b) => a.z - b.z || a.n - b.n || a.a - b.a);
  state.datasetName = datasetName;
  state.selectedId = null;
  render();
  const uranium = state.nuclides.find(n => n.symbol === 'U' && n.a === 235);
  selectNuclide(uranium?.id ?? state.nuclides[Math.floor(state.nuclides.length / 2)]?.id);
}

function csvToNuclides(csvText) {
  const rows = parseCSV(csvText);
  if (rows.length < 2) return [];
  const header = rows[0].map(h => h.trim());
  const records = [];

  for (const row of rows.slice(1)) {
    if (!row.some(Boolean)) continue;
    const raw = {};
    header.forEach((h, i) => { raw[h] = row[i] ?? ''; });
    const normalized = normalizeNuclide(raw);
    if (normalized) records.push(normalized);
  }
  return records;
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  row.push(field);
  rows.push(row);
  return rows.filter(r => r.some(cell => String(cell).trim() !== ''));
}

function normalizeNuclide(raw) {
  const keyMap = new Map(Object.keys(raw).map(k => [canonicalKey(k), k]));
  const get = (...names) => {
    for (const name of names) {
      const original = keyMap.get(canonicalKey(name));
      if (original && raw[original] !== undefined && String(raw[original]).trim() !== '') return String(raw[original]).trim();
    }
    return '';
  };

  let z = toNumber(get('z', 'Z', 'protons', 'proton_number'));
  let n = toNumber(get('n', 'N', 'neutrons', 'neutron_number'));
  let symbol = get('symbol', 'element', 'el', 'Element', 'elem');
  let nuclideText = get('nuclide', 'isotope', 'isotope_symbol', 'nucleus');

  if ((!z || !n) && nuclideText) {
    const parsed = parseNuclideLabel(nuclideText);
    if (parsed) {
      symbol = symbol || parsed.symbol;
      if (!z) z = ELEMENT_BY_SYMBOL.get(parsed.symbol.toLowerCase())?.z ?? null;
      if (!n && parsed.a && z) n = parsed.a - z;
    }
  }

  if (!z && symbol) z = ELEMENT_BY_SYMBOL.get(symbol.toLowerCase())?.z ?? null;
  if (!symbol && z) symbol = ELEMENT_BY_Z.get(z)?.symbol ?? '';
  if (!z && !symbol) return null;

  const aFromColumn = toNumber(get('a', 'A', 'mass_number', 'massnumber'));
  const a = aFromColumn || (z && Number.isFinite(n) ? z + n : null);
  if (!a || !Number.isFinite(z) || !Number.isFinite(n)) return null;

  const element = ELEMENT_BY_Z.get(z) ?? ELEMENT_BY_SYMBOL.get(symbol.toLowerCase()) ?? { symbol, name: symbol, english: symbol, category: 'Elemento', atomicWeight: '' };
  symbol = element.symbol || symbol;

  const halfLifeSec = toNumber(get('half_life_sec', 'halflife_sec', 'half_life_seconds', 'half_life_s', 'halflife_seconds'));
  const halfLifeRaw = get('half_life', 'halflife', 't1/2', 't12');
  const halfLifeUnit = get('unit_hl', 'half_life_unit', 'unit', 'hl_unit');
  const halfLifeText = formatHalfLife(halfLifeSec, halfLifeRaw, halfLifeUnit);
  const decayModes = extractDecayModes(get);
  const isStableRaw = get('is_stable', 'stable', 'stability');
  const isStable = parseStable(isStableRaw, halfLifeSec, decayModes, halfLifeRaw);

  const atomicMass = get('atomic_mass', 'atomicmass', 'mass', 'mass_amu', 'amu');
  const atomicMassUnc = get('atomic_mass_uncert', 'unc_am', 'atomicmass_uncert', 'mass_uncert');
  const massExcess = get('mass_excess', 'massexcess', 'mass_excess_keV', 'mass_excess_kev');
  const abundance = get('abundance', 'natural_abundance', 'abund');
  const spinParity = get('jp', 'jpi', 'spin', 'spin_parity', 'spinparity');
  const energy = get('energy', 'level_energy', 'e', 'p_energy');
  const radius = get('radius', 'charge_radius');

  return {
    id: `${symbol}-${a}${energy && energy !== '0' ? `@${energy}` : ''}`,
    z, n, a, symbol,
    elementName: element.name,
    englishName: element.english,
    atomicWeight: element.atomicWeight,
    category: element.category,
    isStable,
    halfLifeSec: halfLifeSec || null,
    halfLifeText,
    halfLifeRaw,
    halfLifeUnit,
    decayModes,
    abundance,
    atomicMass,
    atomicMassUnc,
    massExcess,
    spinParity,
    energy,
    radius,
    note: '',
    source: state.datasetName,
    raw
  };
}

function canonicalKey(value) {
  return String(value).toLowerCase().replace(/[\s\-/%()]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
}

function extractDecayModes(get) {
  const modes = [];
  for (let i = 1; i <= 5; i++) {
    const mode = get(`decay_${i}`, `decay${i}`, `decay_${i}_mode`, `decay mode ${i}`);
    if (!mode) continue;
    const pct = get(`decay_${i}_%`, `decay_${i}_pct`, `decay${i}_pct`, `branch_${i}`, `branching_${i}`);
    modes.push({ mode, pct: pct || null });
  }
  const compact = get('decay', 'decay_mode', 'decay_modes', 'mode');
  if (!modes.length && compact) {
    for (const part of compact.split(/[;,]/).map(v => v.trim()).filter(Boolean)) {
      modes.push({ mode: part, pct: null });
    }
  }
  return modes;
}

function parseStable(value, halfLifeSec, decayModes, halfLifeRaw) {
  const v = String(value || '').trim().toLowerCase();
  if (['true', 'yes', 'y', 'si', 'sí', 'stable', '1'].includes(v)) return true;
  if (['false', 'no', 'n', 'radioactive', '0'].includes(v)) return false;
  if (String(halfLifeRaw || '').toLowerCase().includes('stable')) return true;
  if (!halfLifeSec && decayModes.length === 0) return true;
  return false;
}

function parseNuclideLabel(label) {
  const plain = String(label)
    .replace(/[{}_^]/g, '')
    .replace(/\s+/g, '')
    .replace(/−/g, '-');
  let match = plain.match(/^(\d+)([A-Z][a-z]?)/);
  if (match) return { a: Number(match[1]), symbol: match[2] };
  match = plain.match(/^([A-Z][a-z]?)[-]?(\d+)/);
  if (match) return { a: Number(match[2]), symbol: match[1] };
  match = plain.match(/(\d+).*?([A-Z][a-z]?)/);
  if (match) return { a: Number(match[1]), symbol: match[2] };
  return null;
}

function toNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const cleaned = String(value).trim().replace(/\s/g, '').replace(',', '.').replace(/[<>~≈]/g, '');
  const match = cleaned.match(/[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?/);
  if (!match) return null;
  const num = Number(match[0]);
  return Number.isFinite(num) ? num : null;
}

function referenceMassNumber(atomicWeight) {
  const num = toNumber(atomicWeight);
  return Math.max(1, Math.round(num || 1));
}

function formatHalfLife(seconds, raw, unit) {
  if (seconds) return secondsToHuman(seconds);
  if (raw && unit) return `${raw} ${unit}`;
  if (raw) return raw;
  return 'Estable o no indicado';
}

function secondsToHuman(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return 'No indicada';
  const units = [
    ['Gy', 1e9 * 365.25 * 24 * 3600],
    ['My', 1e6 * 365.25 * 24 * 3600],
    ['ky', 1e3 * 365.25 * 24 * 3600],
    ['a', 365.25 * 24 * 3600],
    ['d', 24 * 3600],
    ['h', 3600],
    ['min', 60],
    ['s', 1],
    ['ms', 1e-3],
    ['µs', 1e-6],
    ['ns', 1e-9]
  ];
  for (const [label, factor] of units) {
    if (seconds >= factor || label === 'ns') {
      const value = seconds / factor;
      return `${formatNumber(value)} ${label}`;
    }
  }
  return `${formatNumber(seconds)} s`;
}

function formatNumber(value) {
  if (value === null || value === undefined || value === '') return '—';
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  if (Math.abs(n) >= 100000 || Math.abs(n) < 0.001) return n.toExponential(3).replace('.', ',');
  return new Intl.NumberFormat('es-ES', { maximumSignificantDigits: 5 }).format(n);
}

function render() {
  const extent = getExtent(state.nuclides);
  const axisPad = Math.max(36, state.cellSize * 1.7);
  const width = axisPad + (extent.maxN + 2) * state.cellSize;
  const height = axisPad + (extent.maxZ + 2) * state.cellSize;
  chartCanvas.style.width = `${width}px`;
  chartCanvas.style.height = `${height}px`;
  chartCanvas.innerHTML = '';

  renderAxes(extent, axisPad);
  let visible = 0;
  let searchHits = 0;

  const fragment = document.createDocumentFragment();
  for (const nuclide of state.nuclides) {
    if (!matchesFilter(nuclide)) continue;
    visible++;
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = `nuclide-cell ${colorClass(nuclide)}`;
    if (!state.labels) cell.classList.add('no-label');
    if (state.selectedId === nuclide.id) cell.classList.add('selected');
    if (matchesSearch(nuclide, state.query)) {
      if (state.query) cell.classList.add('search-hit');
      if (state.query) searchHits++;
    } else if (state.query) {
      cell.style.opacity = '0.22';
    }
    cell.style.left = `${axisPad + nuclide.n * state.cellSize}px`;
    cell.style.top = `${axisPad + (extent.maxZ - nuclide.z) * state.cellSize}px`;
    cell.textContent = state.labels ? `${nuclide.a}${nuclide.symbol}` : '';
    cell.title = `${nuclide.symbol}-${nuclide.a} · Z=${nuclide.z}, N=${nuclide.n} · ${nuclide.halfLifeText}`;
    cell.dataset.id = nuclide.id;
    cell.addEventListener('click', () => selectNuclide(nuclide.id));
    fragment.appendChild(cell);
  }
  chartCanvas.appendChild(fragment);

  nuclideCount.textContent = `${state.nuclides.length.toLocaleString('es-ES')} nucleídos`;
  visibleCount.textContent = state.query ? `${visible.toLocaleString('es-ES')} visibles · ${searchHits.toLocaleString('es-ES')} coincidencias` : `${visible.toLocaleString('es-ES')} visibles`;
  extentInfo.textContent = `Z 1–${extent.maxZ} · N 0–${extent.maxN}`;
  renderLegend();
  if (state.selectedId) renderDetail(state.nuclides.find(n => n.id === state.selectedId));
}

function renderAxes(extent, axisPad) {
  const stepN = state.cellSize < 20 ? 20 : 10;
  const stepZ = state.cellSize < 20 ? 10 : 5;
  for (let n = 0; n <= extent.maxN; n += stepN) {
    const label = document.createElement('span');
    label.className = 'axis-label x';
    label.style.left = `${axisPad + n * state.cellSize}px`;
    label.textContent = `N ${n}`;
    chartCanvas.appendChild(label);
  }
  for (let z = 1; z <= extent.maxZ; z += stepZ) {
    const label = document.createElement('span');
    label.className = 'axis-label y';
    label.style.top = `${axisPad + (extent.maxZ - z) * state.cellSize}px`;
    label.textContent = `Z ${z}`;
    chartCanvas.appendChild(label);
  }
}

function getExtent(records) {
  return records.reduce((acc, r) => {
    acc.maxZ = Math.max(acc.maxZ, r.z || 0);
    acc.maxN = Math.max(acc.maxN, r.n || 0);
    return acc;
  }, { maxZ: 118, maxN: 180 });
}

function matchesFilter(nuclide) {
  const type = decayType(nuclide);
  switch (state.filterMode) {
    case 'stable': return nuclide.isStable;
    case 'radioactive': return !nuclide.isStable;
    case 'alpha': return type === 'alpha' || type === 'mixed';
    case 'betaMinus': return type === 'beta-minus' || type === 'mixed';
    case 'betaPlusEc': return type === 'beta-plus' || type === 'mixed';
    case 'unknown': return type === 'unknown';
    default: return true;
  }
}

function matchesSearch(nuclide, query) {
  if (!query) return false;
  const q = query.toLowerCase().replace(/\s+/g, '');
  const tokens = [
    `${nuclide.symbol}-${nuclide.a}`,
    `${nuclide.a}${nuclide.symbol}`,
    `${nuclide.symbol}${nuclide.a}`,
    nuclide.symbol,
    nuclide.elementName,
    nuclide.englishName,
    `z=${nuclide.z}`,
    `n=${nuclide.n}`,
    `a=${nuclide.a}`
  ].filter(Boolean).map(v => String(v).toLowerCase().replace(/\s+/g, ''));
  return tokens.some(token => token.includes(q));
}

function colorClass(nuclide) {
  if (state.colorMode === 'stability') return nuclide.isStable ? 'decay-stable' : 'decay-unknown';
  if (state.colorMode === 'halfLife') return halfLifeColorClass(nuclide);
  return `decay-${decayType(nuclide)}`;
}

function halfLifeColorClass(nuclide) {
  if (nuclide.isStable) return 'decay-stable';
  const s = nuclide.halfLifeSec;
  if (!s) return 'decay-unknown';
  if (s < 60) return 'decay-sf';
  if (s < 86400) return 'decay-alpha';
  if (s < 365.25 * 24 * 3600) return 'decay-beta-plus';
  return 'decay-beta-minus';
}

function decayType(nuclide) {
  if (nuclide.isStable) return 'stable';
  const text = nuclide.decayModes.map(d => d.mode).join(' ').toUpperCase();
  if (!text.trim()) return 'unknown';
  const flags = new Set();
  if (/\bA\b|ALPHA|α/.test(text)) flags.add('alpha');
  if (/B-|BETA-|β-|BM/.test(text)) flags.add('beta-minus');
  if (/B\+|BETA\+|β\+|EC|ELECTRON/.test(text)) flags.add('beta-plus');
  if (/SF|FISSION/.test(text)) flags.add('sf');
  if (/IT|ISOMERIC|GAMMA|γ/.test(text)) flags.add('it');
  if (flags.size > 1) return 'mixed';
  return [...flags][0] || 'unknown';
}

function renderLegend() {
  const entries = state.colorMode === 'halfLife'
    ? [
      ['Estable', 'decay-stable'], ['< 1 min', 'decay-sf'], ['< 1 día', 'decay-alpha'], ['< 1 año', 'decay-beta-plus'], ['≥ 1 año', 'decay-beta-minus'], ['Sin dato', 'decay-unknown']
    ]
    : [
      ['Estable', 'decay-stable'], ['β−', 'decay-beta-minus'], ['β+ / EC', 'decay-beta-plus'], ['α', 'decay-alpha'], ['Fisión espontánea', 'decay-sf'], ['Transición isomérica', 'decay-it'], ['Mixto', 'decay-mixed'], ['Sin dato', 'decay-unknown']
    ];
  const legend = document.getElementById('legend');
  legend.innerHTML = entries.map(([label, className]) => `
    <span class="legend-item"><span class="legend-swatch ${className}"></span>${label}</span>
  `).join('');
}

function selectNuclide(id) {
  if (!id) return;
  state.selectedId = id;
  render();
  const cell = chartCanvas.querySelector(`[data-id="${cssEscape(id)}"]`);
  if (cell) {
    cell.classList.add('selected');
  }
}

function cssEscape(value) {
  if (window.CSS?.escape) return window.CSS.escape(value);
  return String(value).replace(/"/g, '\\"');
}

function renderDetail(nuclide) {
  if (!nuclide) {
    detailEmpty.classList.remove('hidden');
    detailPanel.classList.add('hidden');
    return;
  }
  detailEmpty.classList.add('hidden');
  detailPanel.classList.remove('hidden');
  const node = detailTemplate.content.cloneNode(true);

  node.querySelector('[data-field="title"]').textContent = `${nuclide.symbol}-${nuclide.a}`;
  node.querySelector('[data-field="subtitle"]').textContent = `${nuclide.elementName} · ${nuclide.category || 'Elemento'} · Z=${nuclide.z}, N=${nuclide.n}`;

  const badges = node.querySelector('[data-field="badges"]');
  const badgeValues = [
    nuclide.isStable ? 'Estable' : 'Radiactivo / no estable',
    `A=${nuclide.a}`,
    `Z=${nuclide.z}`,
    `N=${nuclide.n}`,
    decayLabel(decayType(nuclide))
  ];
  badges.innerHTML = badgeValues.map(v => `<span class="badge">${escapeHtml(v)}</span>`).join('');

  const facts = [
    ['Elemento', `${nuclide.elementName} (${nuclide.symbol})`],
    ['Masa atómica estándar', nuclide.atomicWeight || '—'],
    ['Masa atómica del nucleído', formatMaybeMicroMass(nuclide.atomicMass, nuclide.atomicMassUnc)],
    ['Exceso de masa', nuclide.massExcess ? `${nuclide.massExcess} keV` : '—'],
    ['Abundancia natural', formatAbundance(nuclide.abundance)],
    ['Spin/paridad', nuclide.spinParity || '—'],
    ['Energía de estado', nuclide.energy ? `${nuclide.energy} keV` : '—'],
    ['Radio de carga', nuclide.radius ? `${nuclide.radius} fm` : '—']
  ];
  const mainFacts = node.querySelector('[data-field="mainFacts"]');
  mainFacts.innerHTML = facts.map(([k, v]) => `<div><dt>${escapeHtml(k)}</dt><dd>${escapeHtml(String(v))}</dd></div>`).join('');

  node.querySelector('[data-field="decayBlock"]').innerHTML = renderDecayBlock(nuclide);
  node.querySelector('[data-field="links"]').innerHTML = renderLinks(nuclide);
  node.querySelector('[data-field="rawFields"]').innerHTML = renderRawFields(nuclide.raw);
  node.querySelector('#closeDetail').addEventListener('click', () => {
    state.selectedId = null;
    detailPanel.classList.add('hidden');
    detailEmpty.classList.remove('hidden');
    render();
  });

  detailPanel.replaceChildren(node);
}

function renderDecayBlock(nuclide) {
  const halfLife = `<div class="decay-row"><strong>Vida media</strong><span>${escapeHtml(nuclide.halfLifeText || '—')}</span></div>`;
  const note = nuclide.note ? `<p class="subtitle">${escapeHtml(nuclide.note)}</p>` : '';
  if (!nuclide.decayModes.length) {
    return `<div class="decay-list">${halfLife}<div class="decay-row"><strong>Modo</strong><span>${nuclide.isStable ? 'Estable' : 'No indicado'}</span></div></div>${note}`;
  }
  const modes = nuclide.decayModes.map(d => `
    <div class="decay-row"><strong>${escapeHtml(d.mode)}</strong><span>${escapeHtml(d.pct ? `${d.pct}%` : 'rama no indicada')}</span></div>
  `).join('');
  return `<div class="decay-list">${halfLife}${modes}</div>${note}`;
}

function renderLinks(nuclide) {
  const elementPage = `https://es.wikipedia.org/wiki/${encodeURIComponent(nuclide.elementName)}`;
  const isotopesPage = `https://en.wikipedia.org/wiki/Isotopes_of_${encodeURIComponent((nuclide.englishName || nuclide.symbol).replace(/ /g, '_'))}`;
  const iaeaNuclide = `https://nds.iaea.org/relnsd/vcharthtml/VChartHTML.html`;
  const nudat = `https://www.nndc.bnl.gov/nudat3/`;
  return [
    ['Wikipedia del elemento', elementPage],
    ['Wikipedia: isótopos del elemento', isotopesPage],
    ['IAEA LiveChart of Nuclides', iaeaNuclide],
    ['NNDC NuDat 3', nudat]
  ].map(([label, url]) => `<a href="${url}" target="_blank" rel="noreferrer">${escapeHtml(label)} ↗</a>`).join('');
}

function renderRawFields(raw) {
  const entries = Object.entries(raw || {}).filter(([, value]) => String(value ?? '').trim() !== '');
  if (!entries.length) return '<p class="subtitle">No hay campos crudos disponibles.</p>';
  return entries.map(([key, value]) => `<div class="raw-field"><strong>${escapeHtml(key)}</strong><span>${escapeHtml(String(value))}</span></div>`).join('');
}

function formatMaybeMicroMass(value, uncert) {
  if (!value) return '—';
  const num = toNumber(value);
  const maybeAmu = num && num > 10000 ? num / 1_000_000 : num;
  const base = maybeAmu ? `${formatNumber(maybeAmu)} u` : String(value);
  return uncert ? `${base} ± ${uncert}` : base;
}

function formatAbundance(value) {
  if (!value) return '—';
  const n = toNumber(value);
  if (n === null) return value;
  return n <= 1 ? `${formatNumber(n * 100)} %` : `${formatNumber(n)} %`;
}

function decayLabel(type) {
  return {
    stable: 'Estable',
    'beta-minus': 'β−',
    'beta-plus': 'β+ / EC',
    alpha: 'α',
    sf: 'Fisión espontánea',
    it: 'Transición isomérica',
    mixed: 'Modos mixtos',
    unknown: 'Sin dato'
  }[type] || type;
}

function setStatus(message, kind = '') {
  datasetStatus.textContent = message;
  datasetStatus.className = `status-chip ${kind}`.trim();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

init();
