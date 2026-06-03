'use strict';

const ELEMENTS = [
  null,
  ['H', 'Hidrógeno'], ['He', 'Helio'], ['Li', 'Litio'], ['Be', 'Berilio'], ['B', 'Boro'], ['C', 'Carbono'], ['N', 'Nitrógeno'], ['O', 'Oxígeno'], ['F', 'Flúor'], ['Ne', 'Neón'],
  ['Na', 'Sodio'], ['Mg', 'Magnesio'], ['Al', 'Aluminio'], ['Si', 'Silicio'], ['P', 'Fósforo'], ['S', 'Azufre'], ['Cl', 'Cloro'], ['Ar', 'Argón'], ['K', 'Potasio'], ['Ca', 'Calcio'],
  ['Sc', 'Escandio'], ['Ti', 'Titanio'], ['V', 'Vanadio'], ['Cr', 'Cromo'], ['Mn', 'Manganeso'], ['Fe', 'Hierro'], ['Co', 'Cobalto'], ['Ni', 'Níquel'], ['Cu', 'Cobre'], ['Zn', 'Zinc'],
  ['Ga', 'Galio'], ['Ge', 'Germanio'], ['As', 'Arsénico'], ['Se', 'Selenio'], ['Br', 'Bromo'], ['Kr', 'Kriptón'], ['Rb', 'Rubidio'], ['Sr', 'Estroncio'], ['Y', 'Itrio'], ['Zr', 'Circonio'],
  ['Nb', 'Niobio'], ['Mo', 'Molibdeno'], ['Tc', 'Tecnecio'], ['Ru', 'Rutenio'], ['Rh', 'Rodio'], ['Pd', 'Paladio'], ['Ag', 'Plata'], ['Cd', 'Cadmio'], ['In', 'Indio'], ['Sn', 'Estaño'],
  ['Sb', 'Antimonio'], ['Te', 'Telurio'], ['I', 'Yodo'], ['Xe', 'Xenón'], ['Cs', 'Cesio'], ['Ba', 'Bario'], ['La', 'Lantano'], ['Ce', 'Cerio'], ['Pr', 'Praseodimio'], ['Nd', 'Neodimio'],
  ['Pm', 'Prometio'], ['Sm', 'Samario'], ['Eu', 'Europio'], ['Gd', 'Gadolinio'], ['Tb', 'Terbio'], ['Dy', 'Disprosio'], ['Ho', 'Holmio'], ['Er', 'Erbio'], ['Tm', 'Tulio'], ['Yb', 'Iterbio'],
  ['Lu', 'Lutecio'], ['Hf', 'Hafnio'], ['Ta', 'Tántalo'], ['W', 'Wolframio'], ['Re', 'Renio'], ['Os', 'Osmio'], ['Ir', 'Iridio'], ['Pt', 'Platino'], ['Au', 'Oro'], ['Hg', 'Mercurio'],
  ['Tl', 'Talio'], ['Pb', 'Plomo'], ['Bi', 'Bismuto'], ['Po', 'Polonio'], ['At', 'Astato'], ['Rn', 'Radón'], ['Fr', 'Francio'], ['Ra', 'Radio'], ['Ac', 'Actinio'], ['Th', 'Torio'],
  ['Pa', 'Protactinio'], ['U', 'Uranio'], ['Np', 'Neptunio'], ['Pu', 'Plutonio'], ['Am', 'Americio'], ['Cm', 'Curio'], ['Bk', 'Berkelio'], ['Cf', 'Californio'], ['Es', 'Einstenio'], ['Fm', 'Fermio'],
  ['Md', 'Mendelevio'], ['No', 'Nobelio'], ['Lr', 'Lawrencio'], ['Rf', 'Rutherfordio'], ['Db', 'Dubnio'], ['Sg', 'Seaborgio'], ['Bh', 'Bohrio'], ['Hs', 'Hassio'], ['Mt', 'Meitnerio'], ['Ds', 'Darmstadtio'],
  ['Rg', 'Roentgenio'], ['Cn', 'Copernicio'], ['Nh', 'Nihonio'], ['Fl', 'Flerovio'], ['Mc', 'Moscovio'], ['Lv', 'Livermorio'], ['Ts', 'Teneso'], ['Og', 'Oganesón']
];

const SAMPLE_CSV = `z,n,a,symbol,name,nuclide,mass_u,atomic_weight,half_life,half_life_seconds,decay_mode,abundance,spin_parity,binding_energy_per_nucleon_kev,mass_excess_kev,q_alpha_kev,neutron_capture_cross_section_barns,notes,wikipedia_url
1,0,1,H,Hidrógeno,H-1,1.007825,1.008,Estable,,stable,99.985%,1/2+,0,7288.97,,0.3326,Protio; núcleo formado por un único protón.,https://es.wikipedia.org/wiki/Hidr%C3%B3geno
1,1,2,H,Hidrógeno,H-2,2.014102,1.008,Estable,,stable,0.015%,1+,1112.28,13135.7,,0.000519,Deuterio; isótopo estable usado en agua pesada.,https://es.wikipedia.org/wiki/Deuterio
1,2,3,H,Hidrógeno,H-3,3.016049,1.008,12.32 años,388800000,beta-,,1/2+,2827.27,14949.8,,0.000001,Tritio; emisor beta usado como trazador y en fusión.,https://es.wikipedia.org/wiki/Tritio
2,1,3,He,Helio,He-3,3.016029,4.002602,Estable,,stable,0.000137%,1/2+,2572.68,14931.2,,5330,Interesante en criogenia y detectores de neutrones.,https://es.wikipedia.org/wiki/Helio-3
2,2,4,He,Helio,He-4,4.002603,4.002602,Estable,,stable,99.999863%,0+,7073.92,2424.9,,0,Partícula alfa; núcleo extraordinariamente ligado.,https://es.wikipedia.org/wiki/Helio-4
3,3,6,Li,Litio,Li-6,6.015123,6.94,Estable,,stable,7.59%,1+,5332.33,14086.9,,940,Usado en producción de tritio y detectores.,https://es.wikipedia.org/wiki/Litio
3,4,7,Li,Litio,Li-7,7.016004,6.94,Estable,,stable,92.41%,3/2-,5606.44,14907.1,,0.045,Isótopo natural mayoritario del litio.,https://es.wikipedia.org/wiki/Litio
4,5,9,Be,Berilio,Be-9,9.012183,9.012183,Estable,,stable,100%,3/2-,6462.67,11348.5,,0.0076,Único isótopo estable del berilio.,https://es.wikipedia.org/wiki/Berilio
5,5,10,B,Boro,B-10,10.012937,10.81,Estable,,stable,19.9%,3+,6475.08,12050.6,,3837,Alta captura neutrónica; útil en control de reactores.,https://es.wikipedia.org/wiki/Boro-10
5,6,11,B,Boro,B-11,11.009305,10.81,Estable,,stable,80.1%,3/2-,6927.73,8667.7,,0.0055,Isótopo natural mayoritario del boro.,https://es.wikipedia.org/wiki/Boro
6,6,12,C,Carbono,C-12,12,12.011,Estable,,stable,98.93%,0+,7680.14,0,,0.0035,Referencia exacta de la unidad de masa atómica.,https://es.wikipedia.org/wiki/Carbono-12
6,7,13,C,Carbono,C-13,13.003355,12.011,Estable,,stable,1.07%,1/2-,7469.85,3125,,0.00137,Usado en RMN y estudios isotópicos.,https://es.wikipedia.org/wiki/Carbono-13
6,8,14,C,Carbono,C-14,14.003242,12.011,5730 años,180800000000,beta-,,0+,7520.32,3019.9,,0.0009,Datación radiocarbónica.,https://es.wikipedia.org/wiki/Carbono-14
7,7,14,N,Nitrógeno,N-14,14.003074,14.007,Estable,,stable,99.632%,1+,7475.61,2863.4,,1.83,Isótopo natural mayoritario del nitrógeno.,https://es.wikipedia.org/wiki/Nitr%C3%B3geno
7,8,15,N,Nitrógeno,N-15,15.000109,14.007,Estable,,stable,0.368%,1/2-,7699.46,101.4,,0.000024,Isótopo estable usado como trazador.,https://es.wikipedia.org/wiki/Nitr%C3%B3geno-15
8,8,16,O,Oxígeno,O-16,15.994915,15.999,Estable,,stable,99.757%,0+,7976.21,-4737,,0.00019,Isótopo dominante del oxígeno.,https://es.wikipedia.org/wiki/Ox%C3%ADgeno
8,9,17,O,Oxígeno,O-17,16.999132,15.999,Estable,,stable,0.038%,5/2+,7750.73,-809,,0.235,Isótopo estable poco abundante.,https://es.wikipedia.org/wiki/Ox%C3%ADgeno
8,10,18,O,Oxígeno,O-18,17.999160,15.999,Estable,,stable,0.205%,0+,7767.10,-782,,0.00016,Usado en climatología isotópica.,https://es.wikipedia.org/wiki/Ox%C3%ADgeno-18
9,10,19,F,Flúor,F-19,18.998403,18.998403,Estable,,stable,100%,1/2+,7779.02,-1487,,0.0096,Único isótopo estable del flúor.,https://es.wikipedia.org/wiki/Fl%C3%BAor
10,10,20,Ne,Neón,Ne-20,19.992440,20.1797,Estable,,stable,90.48%,0+,8032.24,-7041,,0.039,Isótopo mayoritario del neón.,https://es.wikipedia.org/wiki/Ne%C3%B3n
11,12,23,Na,Sodio,Na-23,22.989770,22.989769,Estable,,stable,100%,3/2+,8111.49,-9529,,0.53,Único isótopo estable del sodio.,https://es.wikipedia.org/wiki/Sodio
12,12,24,Mg,Magnesio,Mg-24,23.985042,24.305,Estable,,stable,78.99%,0+,8260.71,-13933,,0.05,Isótopo natural mayoritario del magnesio.,https://es.wikipedia.org/wiki/Magnesio
13,14,27,Al,Aluminio,Al-27,26.981538,26.981538,Estable,,stable,100%,5/2+,8331.56,-17196,,0.231,Único isótopo estable del aluminio.,https://es.wikipedia.org/wiki/Aluminio
14,14,28,Si,Silicio,Si-28,27.976927,28.085,Estable,,stable,92.23%,0+,8447.74,-21493,,0.177,Isótopo dominante del silicio.,https://es.wikipedia.org/wiki/Silicio
15,16,31,P,Fósforo,P-31,30.973762,30.973762,Estable,,stable,100%,1/2+,8481.20,-24440,,0.172,Único isótopo estable del fósforo.,https://es.wikipedia.org/wiki/F%C3%B3sforo
16,16,32,S,Azufre,S-32,31.972071,32.06,Estable,,stable,94.99%,0+,8493.13,-26016,,0.53,Isótopo mayoritario del azufre.,https://es.wikipedia.org/wiki/Azufre
17,18,35,Cl,Cloro,Cl-35,34.968853,35.45,Estable,,stable,75.78%,3/2+,8520.28,-29143,,44.1,Uno de los dos isótopos estables del cloro.,https://es.wikipedia.org/wiki/Cloro
18,22,40,Ar,Argón,Ar-40,39.962383,39.948,Estable,,stable,99.604%,0+,8595.25,-35040,,0.66,Producto radiogénico de K-40; dominante en la atmósfera.,https://es.wikipedia.org/wiki/Arg%C3%B3n
19,20,39,K,Potasio,K-39,38.963707,39.0983,Estable,,stable,93.258%,3/2+,8556.34,-33808,,2.1,Isótopo mayoritario del potasio.,https://es.wikipedia.org/wiki/Potasio
19,21,40,K,Potasio,K-40,39.963999,39.0983,1.248e9 años,39390000000000000,beta-/ec,0.0117%,4-,8551.0,-33535,,30.0,Radionúclido natural relevante en geocronología.,https://es.wikipedia.org/wiki/Potasio-40
20,20,40,Ca,Calcio,Ca-40,39.962591,40.078,Estable,,stable,96.941%,0+,8551.3,-34135,,0.41,Isótopo doblemente mágico aproximado: Z=20 y N=20.,https://es.wikipedia.org/wiki/Calcio
20,22,42,Ca,Calcio,Ca-42,41.958618,40.078,Estable,,stable,0.647%,0+,8616.6,-38547,,0.68,Isótopo estable minoritario del calcio.,https://es.wikipedia.org/wiki/Calcio
20,23,43,Ca,Calcio,Ca-43,42.958767,40.078,Estable,,stable,0.135%,7/2-,8600.3,-38408,,6.2,Único calcio estable con spin nuclear semientero abundante natural.,https://es.wikipedia.org/wiki/Calcio
20,24,44,Ca,Calcio,Ca-44,43.955482,40.078,Estable,,stable,2.086%,0+,8658.2,-41469,,0.88,Isótopo estable usado en estudios geoquímicos.,https://es.wikipedia.org/wiki/Calcio
20,26,46,Ca,Calcio,Ca-46,45.953689,40.078,Estable,,stable,0.004%,0+,8668.9,-43135,,0.74,Isótopo estable extremadamente escaso.,https://es.wikipedia.org/wiki/Calcio
20,28,48,Ca,Calcio,Ca-48,47.952522,40.078,Estable/2β muy lento,,stable,0.187%,0+,8666.7,-44224,,1.09,Núcleo doblemente mágico; candidato en estudios de doble beta.,https://es.wikipedia.org/wiki/Calcio-48
21,24,45,Sc,Escandio,Sc-45,44.955908,44.955908,Estable,,stable,100%,7/2-,8618.0,-41072,,27.2,Único isótopo estable del escandio.,https://es.wikipedia.org/wiki/Escandio
22,26,48,Ti,Titanio,Ti-48,47.947942,47.867,Estable,,stable,73.72%,0+,8723.3,-48491,,7.84,Isótopo natural mayoritario del titanio.,https://es.wikipedia.org/wiki/Titanio
23,28,51,V,Vanadio,V-51,50.943957,50.9415,Estable,,stable,99.75%,7/2-,8742.0,-52204,,4.9,Isótopo natural mayoritario del vanadio.,https://es.wikipedia.org/wiki/Vanadio
24,28,52,Cr,Cromo,Cr-52,51.940506,51.9961,Estable,,stable,83.79%,0+,8775.9,-55418,,0.76,Isótopo mayoritario del cromo.,https://es.wikipedia.org/wiki/Cromo
25,30,55,Mn,Manganeso,Mn-55,54.938044,54.938044,Estable,,stable,100%,5/2-,8765.0,-57711,,13.3,Único isótopo estable del manganeso.,https://es.wikipedia.org/wiki/Manganeso
26,28,54,Fe,Hierro,Fe-54,53.939609,55.845,Estable,,stable,5.845%,0+,8790.3,-56255,,2.25,Isótopo estable del hierro.,https://es.wikipedia.org/wiki/Hierro
26,30,56,Fe,Hierro,Fe-56,55.934936,55.845,Estable,,stable,91.754%,0+,8790.4,-60606,,2.59,Uno de los núcleos con mayor energía de enlace por nucleón.,https://es.wikipedia.org/wiki/Hierro-56
26,31,57,Fe,Hierro,Fe-57,56.935393,55.845,Estable,,stable,2.119%,1/2-,8770.2,-60181,,2.48,Usado en espectroscopía Mössbauer.,https://es.wikipedia.org/wiki/Hierro-57
26,32,58,Fe,Hierro,Fe-58,57.933274,55.845,Estable,,stable,0.282%,0+,8792.2,-62155,,1.28,Isótopo estable minoritario del hierro.,https://es.wikipedia.org/wiki/Hierro
27,32,59,Co,Cobalto,Co-59,58.933194,58.933194,Estable,,stable,100%,7/2-,8768.0,-62229,,37.2,Único isótopo estable del cobalto.,https://es.wikipedia.org/wiki/Cobalto
27,33,60,Co,Cobalto,Co-60,59.933817,58.933194,5.27 años,166000000,beta-,,5+,8765.0,-61649,,2.0,Fuente gamma importante en radioterapia e industria.,https://es.wikipedia.org/wiki/Cobalto-60
28,30,58,Ni,Níquel,Ni-58,57.935342,58.6934,Estable,,stable,68.077%,0+,8732.0,-60225,,4.6,Isótopo mayoritario del níquel.,https://es.wikipedia.org/wiki/N%C3%ADquel
28,32,60,Ni,Níquel,Ni-60,59.930786,58.6934,Estable,,stable,26.223%,0+,8780.8,-64472,,2.9,Isótopo estable del níquel.,https://es.wikipedia.org/wiki/N%C3%ADquel
29,34,63,Cu,Cobre,Cu-63,62.929598,63.546,Estable,,stable,69.15%,3/2-,8752.0,-65579,,4.5,Isótopo mayoritario del cobre.,https://es.wikipedia.org/wiki/Cobre
30,34,64,Zn,Zinc,Zn-64,63.929142,65.38,Estable,,stable,49.17%,0+,8736.0,-66000,,0.76,Isótopo natural mayoritario del zinc.,https://es.wikipedia.org/wiki/Zinc
36,48,84,Kr,Kriptón,Kr-84,83.911497,83.798,Estable,,stable,56.99%,0+,8718.0,-82431,,0.113,Isótopo estable mayoritario del kriptón.,https://es.wikipedia.org/wiki/Kript%C3%B3n
38,52,90,Sr,Estroncio,Sr-90,89.907738,87.62,28.8 años,908000000,beta-,,0+,8695.0,-85894,,1.2,Producto de fisión de larga vida; relevancia radiológica.,https://es.wikipedia.org/wiki/Estroncio-90
43,56,99,Tc,Tecnecio,Tc-99,98.906250,98,2.11e5 años,6650000000000,beta-,,9/2+,8550.0,-87323,,20,Radionúclido de fisión; sin isótopos estables.,https://es.wikipedia.org/wiki/Tecnecio-99
53,78,131,I,Yodo,I-131,130.906124,126.90447,8.02 días,693000,beta-,,7/2+,8420.0,-87600,,6.2,Radioisótopo médico y de accidentes nucleares.,https://es.wikipedia.org/wiki/Yodo-131
54,78,132,Xe,Xenón,Xe-132,131.904154,131.293,Estable,,stable,26.91%,0+,8425.0,-89280,,0.45,Isótopo estable del xenón.,https://es.wikipedia.org/wiki/Xen%C3%B3n
55,82,137,Cs,Cesio,Cs-137,136.907089,132.90545,30.05 años,948000000,beta-,,7/2+,8390.0,-86700,,0.11,Producto de fisión; emisor gamma vía Ba-137m.,https://es.wikipedia.org/wiki/Cesio-137
56,82,138,Ba,Bario,Ba-138,137.905247,137.327,Estable,,stable,71.7%,0+,8380.0,-88000,,0.40,Isótopo estable mayoritario del bario.,https://es.wikipedia.org/wiki/Bario
74,110,184,W,Wolframio,W-184,183.950931,183.84,Estable,,stable,30.64%,0+,7950.0,-45710,,1.7,Isótopo estable del wolframio.,https://es.wikipedia.org/wiki/Wolframio
79,118,197,Au,Oro,Au-197,196.966569,196.96657,Estable,,stable,100%,3/2+,7916.0,-31145,,98.7,Único isótopo estable del oro.,https://es.wikipedia.org/wiki/Oro
82,126,208,Pb,Plomo,Pb-208,207.976652,207.2,Estable,,stable,52.4%,0+,7867.0,-21749,,0.23,Núcleo doblemente mágico: Z=82 y N=126.,https://es.wikipedia.org/wiki/Plomo-208
83,126,209,Bi,Bismuto,Bi-209,208.980399,208.9804,1.9e19 años,5.99e26,alpha,100%,9/2-,7848.0,-18258,3137,0.033,Extremadamente longevo; antes considerado estable.,https://es.wikipedia.org/wiki/Bismuto-209
86,136,222,Rn,Radón,Rn-222,222.017578,222,3.8235 días,330350,alpha,,0+,7690.0,16373,5590,,Gas radiactivo natural de la cadena del uranio.,https://es.wikipedia.org/wiki/Rad%C3%B3n-222
88,138,226,Ra,Radio,Ra-226,226.025410,226,1600 años,50460000000,alpha,,0+,7660.0,23669,4871,,Radioisótopo histórico; cadena de desintegración del U-238.,https://es.wikipedia.org/wiki/Radio-226
90,142,232,Th,Torio,Th-232,232.038055,232.0377,1.405e10 años,443000000000000000,alpha,100%,0+,7615.0,35444,4082,7.4,Isótopo primordial del torio; ciclo Th-U.,https://es.wikipedia.org/wiki/Torio-232
92,143,235,U,Uranio,U-235,235.043930,238.02891,7.04e8 años,22200000000000000,alpha,0.720%,7/2-,7590.0,40920,4679,98.3,Fisible con neutrones térmicos; clave en reactores y armas.,https://es.wikipedia.org/wiki/Uranio-235
92,146,238,U,Uranio,U-238,238.050788,238.02891,4.468e9 años,141000000000000000,alpha,99.274%,0+,7570.0,47307,4269,2.68,Isótopo natural mayoritario del uranio; fértil a Pu-239.,https://es.wikipedia.org/wiki/Uranio-238
94,145,239,Pu,Plutonio,Pu-239,239.052163,244,24110 años,760000000000,alpha,,1/2+,7560.0,48710,5245,1017,Fisible; producido en reactores a partir de U-238.,https://es.wikipedia.org/wiki/Plutonio-239
94,150,244,Pu,Plutonio,Pu-244,244.064205,244,8.08e7 años,2550000000000000,alpha/sf,,0+,7510.0,59799,4665,,Radionúclido muy longevo; interés cosmoquímico.,https://es.wikipedia.org/wiki/Plutonio-244`
;

const CSV_TEMPLATE = `z,n,a,symbol,name,nuclide,mass_u,atomic_weight,half_life,half_life_seconds,decay_mode,abundance,spin_parity,binding_energy_per_nucleon_kev,mass_excess_kev,q_alpha_kev,neutron_capture_cross_section_barns,notes,wikipedia_url
20,20,40,Ca,Calcio,Ca-40,39.962591,40.078,Estable,,stable,96.941%,0+,8551.3,-34135,,0.41,Ejemplo de nucleído estable,https://es.wikipedia.org/wiki/Calcio
92,143,235,U,Uranio,U-235,235.043930,238.02891,7.04e8 años,22200000000000000,alpha,0.720%,7/2-,7590,40920,4679,98.3,Ejemplo de nucleído fisible,https://es.wikipedia.org/wiki/Uranio-235`;

const state = {
  nuclides: [],
  cellMap: new Map(),
  selectedKey: null,
  transform: { x: 0, y: 0, scale: 1 },
  maxZ: 118,
  maxN: 183,
  colorMode: 'decay',
  filters: new Set(['stable', 'alpha', 'beta-', 'beta+', 'ec', 'sf', 'it', 'unknown']),
  dragging: false,
  dragStart: { x: 0, y: 0 },
  dragOrigin: { x: 0, y: 0 },
  moved: false
};

const els = {
  viewport: document.getElementById('viewport'),
  world: document.getElementById('world'),
  grid: document.getElementById('grid'),
  axisLayer: document.getElementById('axisLayer'),
  nuclideLayer: document.getElementById('nuclideLayer'),
  menuButton: document.getElementById('menuButton'),
  closeMenuButton: document.getElementById('closeMenuButton'),
  sideMenu: document.getElementById('sideMenu'),
  menuBackdrop: document.getElementById('menuBackdrop'),
  detailPopup: document.getElementById('detailPopup'),
  detailContent: document.getElementById('detailContent'),
  closePopupButton: document.getElementById('closePopupButton'),
  statusBar: document.getElementById('statusBar'),
  searchInput: document.getElementById('searchInput'),
  searchButton: document.getElementById('searchButton'),
  colorMode: document.getElementById('colorMode'),
  fitButton: document.getElementById('fitButton'),
  resetButton: document.getElementById('resetButton'),
  csvInput: document.getElementById('csvInput'),
  loadSampleButton: document.getElementById('loadSampleButton'),
  downloadTemplateButton: document.getElementById('downloadTemplateButton'),
  remoteCsvUrl: document.getElementById('remoteCsvUrl'),
  loadRemoteButton: document.getElementById('loadRemoteButton'),
  filterList: document.getElementById('filterList')
};

function getCellSize() {
  return Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell')) || 18;
}

function keyFor(z, n) {
  return `${z}:${n}`;
}

function field(row, aliases, fallback = '') {
  for (const alias of aliases) {
    if (row[alias] !== undefined && row[alias] !== null && String(row[alias]).trim() !== '') return String(row[alias]).trim();
    const lower = Object.keys(row).find(k => k.toLowerCase() === alias.toLowerCase());
    if (lower && String(row[lower]).trim() !== '') return String(row[lower]).trim();
  }
  return fallback;
}

function toNumber(value, fallback = null) {
  if (value === null || value === undefined || value === '') return fallback;
  const clean = String(value).replace(',', '.').replace(/[^0-9eE+\-.]/g, '');
  const num = Number(clean);
  return Number.isFinite(num) ? num : fallback;
}

function normalizeSymbol(symbol, z) {
  if (symbol) return symbol.charAt(0).toUpperCase() + symbol.slice(1).toLowerCase();
  return ELEMENTS[z]?.[0] || '?';
}

function normalizeDecay(raw) {
  const s = String(raw || '').trim().toLowerCase();
  if (!s || s === '?' || s === 'unknown') return 'unknown';
  if (s.includes('stable') || s.includes('estable')) return 'stable';
  if (s.includes('alpha') || s.includes('α')) return 'alpha';
  if (s.includes('beta-') || s.includes('b-') || s.includes('β-') || s.includes('electron emission')) return 'beta-';
  if (s.includes('beta+') || s.includes('b+') || s.includes('β+') || s.includes('positron')) return 'beta+';
  if (s === 'ec' || s.includes('electron capture') || s.includes('captura')) return 'ec';
  if (s.includes('sf') || s.includes('spontaneous fission') || s.includes('fisión')) return 'sf';
  if (s.includes('it') || s.includes('isomeric') || s.includes('isom')) return 'it';
  if (s.includes('/')) return 'unknown';
  return 'unknown';
}

function colorClassFor(nuclide) {
  if (state.colorMode === 'stability') return nuclide.isStable ? 'stable' : 'unknown';

  if (state.colorMode === 'halfLife') {
    if (nuclide.isStable) return 'stable';
    const seconds = toNumber(nuclide.halfLifeSeconds, null);
    if (seconds === null) return 'unknown';
    if (seconds > 31557600 * 1000000) return 'beta-minus';
    if (seconds > 31557600) return 'alpha';
    if (seconds > 3600) return 'beta-plus';
    return 'sf';
  }

  return decayClass(nuclide.decayCategory);
}

function decayClass(category) {
  switch (category) {
    case 'stable': return 'stable';
    case 'alpha': return 'alpha';
    case 'beta-': return 'beta-minus';
    case 'beta+': return 'beta-plus';
    case 'ec': return 'ec';
    case 'sf': return 'sf';
    case 'it': return 'it';
    default: return 'unknown';
  }
}

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]).map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = splitCsvLine(line);
    const row = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ''; });
    return row;
  });
}

function splitCsvLine(line) {
  const out = [];
  let current = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const next = line[i + 1];
    if (ch === '"' && quoted && next === '"') {
      current += '"';
      i++;
      continue;
    }
    if (ch === '"') {
      quoted = !quoted;
      continue;
    }
    if (ch === ',' && !quoted) {
      out.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  out.push(current);
  return out.map(v => v.trim());
}

function normalizeRows(rows) {
  const nuclides = [];
  for (const row of rows) {
    let z = toNumber(field(row, ['z', 'Z', 'protons', 'proton_number']), null);
    let n = toNumber(field(row, ['n', 'N', 'neutrons', 'neutron_number']), null);
    let a = toNumber(field(row, ['a', 'A', 'mass_number', 'nuclide_a']), null);

    const rawSymbol = field(row, ['symbol', 'element', 'el', 'element_symbol']);
    let symbol = normalizeSymbol(rawSymbol, z);

    if (z === null && symbol !== '?') {
      const foundZ = ELEMENTS.findIndex(e => e && e[0].toLowerCase() === symbol.toLowerCase());
      if (foundZ > 0) z = foundZ;
    }
    if (a === null && z !== null && n !== null) a = z + n;
    if (n === null && z !== null && a !== null) n = a - z;
    if (z === null || n === null || a === null || z < 1 || n < 0) continue;

    symbol = normalizeSymbol(symbol, z);
    const elementName = field(row, ['name', 'element_name', 'elemento', 'nombre'], ELEMENTS[z]?.[1] || symbol);
    const nuclideName = field(row, ['nuclide', 'isotope', 'nucid', 'isótopo'], `${symbol}-${a}`);
    const halfLife = field(row, ['half_life', 'halflife', 't1/2', 'half life'], 'Sin dato');
    const decayRaw = field(row, ['decay_mode', 'decay', 'decay_1', 'decay mode'], halfLife.toLowerCase().includes('estable') || halfLife.toLowerCase().includes('stable') ? 'stable' : 'unknown');
    const decayCategory = normalizeDecay(decayRaw);
    const isStable = decayCategory === 'stable' || /stable|estable/i.test(halfLife);

    const normalized = {
      raw: row,
      z,
      n,
      a,
      symbol,
      elementName,
      nuclideName,
      key: keyFor(z, n),
      massU: field(row, ['mass_u', 'atomic_mass', 'mass', 'masa_atomica']),
      atomicWeight: field(row, ['atomic_weight', 'standard_atomic_weight', 'peso_atomico']),
      halfLife,
      halfLifeSeconds: field(row, ['half_life_seconds', 'half_life_sec', 'seconds']),
      decayMode: decayRaw || 'Sin dato',
      decayCategory: isStable ? 'stable' : decayCategory,
      isStable,
      abundance: field(row, ['abundance', 'natural_abundance', 'abundancia']),
      spinParity: field(row, ['spin_parity', 'jp', 'spin']),
      bindingEnergy: field(row, ['binding_energy_per_nucleon_kev', 'binding_energy', 'be_per_a']),
      massExcess: field(row, ['mass_excess_kev', 'mass_excess', 'excess']),
      qAlpha: field(row, ['q_alpha_kev', 'q_alpha']),
      neutronCapture: field(row, ['neutron_capture_cross_section_barns', 'thermal_capture', 'sigma_gamma']),
      notes: field(row, ['notes', 'peculiarities', 'observaciones', 'comentarios']),
      wikipediaUrl: field(row, ['wikipedia_url', 'wiki', 'url'])
    };
    nuclides.push(normalized);
  }
  return nuclides;
}

function loadNuclidesFromCsv(text, sourceLabel = 'CSV') {
  const rows = parseCsv(text);
  const nuclides = normalizeRows(rows);
  if (!nuclides.length) {
    setStatus(`No se han encontrado nucleídos válidos en ${sourceLabel}.`);
    return;
  }
  state.nuclides = nuclides;
  state.cellMap = new Map(nuclides.map(n => [n.key, n]));
  state.maxZ = Math.max(118, ...nuclides.map(n => n.z));
  state.maxN = Math.max(183, ...nuclides.map(n => n.n + 4));
  state.selectedKey = null;
  closeDetail();
  renderAll();
  fitToScreen();
  setStatus(`${nuclides.length} nucleídos cargados desde ${sourceLabel}.`);
}

function renderAll() {
  const cell = getCellSize();
  els.world.style.width = `${(state.maxN + 1) * cell}px`;
  els.world.style.height = `${state.maxZ * cell}px`;
  renderAxis();
  renderNuclides();
}

function renderAxis() {
  const cell = getCellSize();
  const fragment = document.createDocumentFragment();
  els.axisLayer.textContent = '';

  for (let n = 0; n <= state.maxN; n += 10) {
    const label = document.createElement('div');
    label.className = 'axis-label axis-label--n';
    label.textContent = `N ${n}`;
    label.style.left = `${n * cell + cell / 2}px`;
    fragment.append(label);
  }

  for (let z = 10; z <= state.maxZ; z += 10) {
    const label = document.createElement('div');
    label.className = 'axis-label axis-label--z';
    label.textContent = `Z ${z}`;
    label.style.top = `${(state.maxZ - z) * cell + cell / 2}px`;
    fragment.append(label);
  }

  els.axisLayer.append(fragment);
}

function renderNuclides() {
  const cell = getCellSize();
  const fragment = document.createDocumentFragment();
  els.nuclideLayer.textContent = '';

  for (const nuclide of state.nuclides) {
    const div = document.createElement('button');
    div.type = 'button';
    div.className = `nuclide-cell ${colorClassFor(nuclide)}`;
    div.dataset.key = nuclide.key;
    div.dataset.decay = nuclide.decayCategory;
    div.style.left = `${nuclide.n * cell}px`;
    div.style.top = `${(state.maxZ - nuclide.z) * cell}px`;
    div.title = `${nuclide.nuclideName} · Z=${nuclide.z}, N=${nuclide.n}`;
    div.textContent = nuclide.a;
    div.addEventListener('click', event => {
      event.stopPropagation();
      selectNuclide(nuclide.key, { center: false });
    });
    fragment.append(div);
  }

  els.nuclideLayer.append(fragment);
  applyFilters();
}

function selectNuclide(key, options = {}) {
  const nuclide = state.cellMap.get(key);
  if (!nuclide) return;

  document.querySelectorAll('.nuclide-cell.is-selected').forEach(el => el.classList.remove('is-selected'));
  const cell = document.querySelector(`.nuclide-cell[data-key="${CSS.escape(key)}"]`);
  if (cell) cell.classList.add('is-selected');

  state.selectedKey = key;
  openDetail(nuclide);
  if (options.center) centerOnNuclide(nuclide);
}

function centerOnNuclide(nuclide) {
  const cell = getCellSize();
  const targetX = nuclide.n * cell + cell / 2;
  const targetY = (state.maxZ - nuclide.z) * cell + cell / 2;
  const rect = els.viewport.getBoundingClientRect();
  const desiredScale = Math.max(state.transform.scale, 1.65);
  state.transform.scale = clamp(desiredScale, minScale(), 7);
  state.transform.x = rect.width * 0.48 - targetX * state.transform.scale;
  state.transform.y = rect.height * 0.45 - targetY * state.transform.scale;
  applyTransform();
}

function openDetail(nuclide) {
  els.detailContent.innerHTML = buildDetailHtml(nuclide);
  els.detailContent.className = 'detail-content';
  els.detailPopup.classList.add('is-open');
}

function closeDetail() {
  state.selectedKey = null;
  els.detailPopup.classList.remove('is-open');
  document.querySelectorAll('.nuclide-cell.is-selected').forEach(el => el.classList.remove('is-selected'));
}

function buildDetailHtml(n) {
  const stabilityLabel = n.isStable ? 'Estable' : 'Radiactivo';
  const wikipedia = n.wikipediaUrl || `https://es.wikipedia.org/wiki/${encodeURIComponent(n.elementName)}`;
  const iaeaQuery = `https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html`;
  const rawRows = Object.entries(n.raw)
    .filter(([_, value]) => String(value ?? '').trim() !== '')
    .map(([key, value]) => `<tr><th>${escapeHtml(key)}</th><td>${escapeHtml(value)}</td></tr>`)
    .join('');

  return `
    <h2 class="detail-title">${escapeHtml(n.symbol)}-${escapeHtml(n.a)}</h2>
    <div class="detail-subtitle">${escapeHtml(n.elementName)} · ${escapeHtml(n.nuclideName)}</div>

    <div class="detail-badges">
      <span class="badge">Z=${escapeHtml(n.z)}</span>
      <span class="badge">N=${escapeHtml(n.n)}</span>
      <span class="badge">A=${escapeHtml(n.a)}</span>
      <span class="badge">${escapeHtml(stabilityLabel)}</span>
      <span class="badge">${escapeHtml(n.decayMode || 'Sin dato')}</span>
    </div>

    <section class="detail-section">
      <h3>Composición nuclear</h3>
      <div class="info-grid">
        ${infoItem('Protones', n.z)}
        ${infoItem('Neutrones', n.n)}
        ${infoItem('Nucleones', n.a)}
        ${infoItem('Elemento', `${n.elementName} (${n.symbol})`)}
      </div>
    </section>

    <section class="detail-section">
      <h3>Masa y energía</h3>
      <div class="info-grid">
        ${infoItem('Masa atómica', n.massU || 'Sin dato')}
        ${infoItem('Peso atómico estándar', n.atomicWeight || 'Sin dato')}
        ${infoItem('Energía enlace/nucleón', formatWithUnit(n.bindingEnergy, 'keV'))}
        ${infoItem('Exceso de masa', formatWithUnit(n.massExcess, 'keV'))}
      </div>
    </section>

    <section class="detail-section">
      <h3>Estabilidad y desintegración</h3>
      <div class="info-grid">
        ${infoItem('Vida media', n.halfLife || 'Sin dato')}
        ${infoItem('Modo principal', n.decayMode || 'Sin dato')}
        ${infoItem('Q alfa', formatWithUnit(n.qAlpha, 'keV'))}
        ${infoItem('Spin-paridad', n.spinParity || 'Sin dato')}
      </div>
    </section>

    <section class="detail-section">
      <h3>Abundancia y neutrones</h3>
      <div class="info-grid">
        ${infoItem('Abundancia natural', n.abundance || 'Sin dato')}
        ${infoItem('Captura neutrónica térmica', formatWithUnit(n.neutronCapture, 'barns'))}
      </div>
    </section>

    <section class="detail-section">
      <h3>Peculiaridades</h3>
      <p class="detail-subtitle">${escapeHtml(n.notes || 'Sin notas específicas en el dataset cargado.')}</p>
    </section>

    <section class="detail-section">
      <h3>Enlaces</h3>
      <div class="detail-links">
        <a href="${escapeAttribute(wikipedia)}" target="_blank" rel="noopener noreferrer">Wikipedia</a>
        <a href="${escapeAttribute(iaeaQuery)}" target="_blank" rel="noopener noreferrer">IAEA LiveChart</a>
        <a href="https://www.nndc.bnl.gov/nudat3/" target="_blank" rel="noopener noreferrer">NNDC NuDat</a>
      </div>
    </section>

    <section class="detail-section">
      <h3>Campos crudos importados</h3>
      <table class="raw-table"><tbody>${rawRows}</tbody></table>
    </section>
  `;
}

function infoItem(label, value) {
  return `<div class="info-item"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || 'Sin dato')}</strong></div>`;
}

function formatWithUnit(value, unit) {
  return value ? `${value} ${unit}` : 'Sin dato';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll('`', '&#096;');
}

function applyFilters() {
  const cells = document.querySelectorAll('.nuclide-cell');
  for (const cell of cells) {
    const decay = cell.dataset.decay || 'unknown';
    cell.classList.toggle('is-hidden', !state.filters.has(decay));
  }
}

function applyColorMode() {
  for (const cell of document.querySelectorAll('.nuclide-cell')) {
    const nuclide = state.cellMap.get(cell.dataset.key);
    if (!nuclide) continue;
    cell.className = `nuclide-cell ${colorClassFor(nuclide)}${cell.dataset.key === state.selectedKey ? ' is-selected' : ''}`;
    cell.dataset.decay = nuclide.decayCategory;
  }
  applyFilters();
}

function fitToScreen() {
  const cell = getCellSize();
  const rect = els.viewport.getBoundingClientRect();
  const worldW = (state.maxN + 1) * cell;
  const worldH = state.maxZ * cell;
  const scale = Math.min(rect.width / worldW, rect.height / worldH) * 0.92;
  state.transform.scale = clamp(scale, 0.08, 7);
  state.transform.x = (rect.width - worldW * state.transform.scale) / 2;
  state.transform.y = (rect.height - worldH * state.transform.scale) / 2;
  applyTransform();
}

function centerWorld() {
  const cell = getCellSize();
  const rect = els.viewport.getBoundingClientRect();
  const worldW = (state.maxN + 1) * cell;
  const worldH = state.maxZ * cell;
  state.transform.x = (rect.width - worldW * state.transform.scale) / 2;
  state.transform.y = (rect.height - worldH * state.transform.scale) / 2;
  applyTransform();
}

function applyTransform() {
  els.world.style.transform = `translate(${state.transform.x}px, ${state.transform.y}px) scale(${state.transform.scale})`;
}

function minScale() {
  const cell = getCellSize();
  const rect = els.viewport.getBoundingClientRect();
  const worldW = (state.maxN + 1) * cell;
  const worldH = state.maxZ * cell;
  return Math.min(rect.width / worldW, rect.height / worldH) * 0.45;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function handleWheel(event) {
  event.preventDefault();
  const rect = els.viewport.getBoundingClientRect();
  const pointerX = event.clientX - rect.left;
  const pointerY = event.clientY - rect.top;
  const worldX = (pointerX - state.transform.x) / state.transform.scale;
  const worldY = (pointerY - state.transform.y) / state.transform.scale;
  const factor = Math.exp(-event.deltaY * 0.00115);
  const nextScale = clamp(state.transform.scale * factor, minScale(), 7);
  state.transform.x = pointerX - worldX * nextScale;
  state.transform.y = pointerY - worldY * nextScale;
  state.transform.scale = nextScale;
  applyTransform();
  setStatus(`Zoom ${(state.transform.scale * 100).toFixed(0)}%`);
}

function handlePointerDown(event) {
  if (shouldIgnoreViewportEvent(event.target)) return;
  state.dragging = true;
  state.moved = false;
  state.dragStart = { x: event.clientX, y: event.clientY };
  state.dragOrigin = { x: state.transform.x, y: state.transform.y };
  els.viewport.setPointerCapture?.(event.pointerId);
}

function handlePointerMove(event) {
  updateCoordinateStatus(event);
  if (!state.dragging) return;
  const dx = event.clientX - state.dragStart.x;
  const dy = event.clientY - state.dragStart.y;
  if (Math.hypot(dx, dy) > 3) state.moved = true;
  state.transform.x = state.dragOrigin.x + dx;
  state.transform.y = state.dragOrigin.y + dy;
  applyTransform();
}

function handlePointerUp(event) {
  if (!state.dragging) return;
  els.viewport.releasePointerCapture?.(event.pointerId);
  const wasMoved = state.moved;
  state.dragging = false;
  state.moved = false;
  if (!wasMoved && !shouldIgnoreViewportEvent(event.target) && !event.target.closest('.nuclide-cell')) {
    closeDetail();
  }
}

function shouldIgnoreViewportEvent(target) {
  return Boolean(
    target.closest('.side-menu') ||
    target.closest('.hamburger') ||
    target.closest('.detail-popup') ||
    target.closest('.menu-backdrop')
  );
}

function updateCoordinateStatus(event) {
  const cell = getCellSize();
  const rect = els.viewport.getBoundingClientRect();
  const wx = (event.clientX - rect.left - state.transform.x) / state.transform.scale;
  const wy = (event.clientY - rect.top - state.transform.y) / state.transform.scale;
  const n = Math.floor(wx / cell);
  const z = state.maxZ - Math.floor(wy / cell);
  if (n >= 0 && n <= state.maxN && z >= 1 && z <= state.maxZ) {
    const found = state.cellMap.get(keyFor(z, n));
    const suffix = found ? ` · ${found.symbol}-${found.a}` : '';
    setStatus(`N=${n} · Z=${z}${suffix} · zoom ${(state.transform.scale * 100).toFixed(0)}%`);
  }
}

function setStatus(message) {
  els.statusBar.textContent = message;
}

function openMenu() {
  els.sideMenu.classList.add('is-open');
  els.menuBackdrop.hidden = false;
  els.menuButton.setAttribute('aria-expanded', 'true');
}

function closeMenu() {
  els.sideMenu.classList.remove('is-open');
  els.menuBackdrop.hidden = true;
  els.menuButton.setAttribute('aria-expanded', 'false');
}

function searchNuclide() {
  const query = els.searchInput.value.trim();
  if (!query) return;
  const found = findNuclide(query);
  if (!found) {
    setStatus(`No he encontrado “${query}” en los datos cargados.`);
    return;
  }
  selectNuclide(found.key, { center: true });
  closeMenu();
}

function findNuclide(query) {
  const q = query.trim();
  const zMatch = q.match(/z\s*=\s*(\d+)/i);
  const nMatch = q.match(/n\s*=\s*(\d+)/i);
  if (zMatch && nMatch) return state.cellMap.get(keyFor(Number(zMatch[1]), Number(nMatch[1])));

  const canonical = q.replace(/\s+/g, '').toLowerCase();
  let m = canonical.match(/^([a-z]{1,3})-?(\d{1,3})$/i);
  if (m) {
    const symbol = normalizeSymbol(m[1]);
    const a = Number(m[2]);
    return state.nuclides.find(n => n.symbol.toLowerCase() === symbol.toLowerCase() && n.a === a);
  }
  m = canonical.match(/^(\d{1,3})([a-z]{1,3})$/i);
  if (m) {
    const a = Number(m[1]);
    const symbol = normalizeSymbol(m[2]);
    return state.nuclides.find(n => n.symbol.toLowerCase() === symbol.toLowerCase() && n.a === a);
  }

  return state.nuclides.find(n =>
    n.nuclideName.toLowerCase() === q.toLowerCase() ||
    n.elementName.toLowerCase() === q.toLowerCase() ||
    `${n.symbol}-${n.a}`.toLowerCase() === canonical
  );
}

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'plantilla_nucleidos.csv';
  a.click();
  URL.revokeObjectURL(url);
}

async function loadRemoteCsv() {
  const url = els.remoteCsvUrl.value.trim();
  if (!url) return;
  setStatus('Intentando cargar CSV remoto...');
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    loadNuclidesFromCsv(text, 'CSV remoto');
  } catch (error) {
    console.error(error);
    setStatus('El navegador ha bloqueado o fallado la carga remota. Descarga el CSV e impórtalo localmente.');
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

function wireEvents() {
  els.viewport.addEventListener('wheel', handleWheel, { passive: false });
  els.viewport.addEventListener('pointerdown', handlePointerDown);
  els.viewport.addEventListener('pointermove', handlePointerMove);
  els.viewport.addEventListener('pointerup', handlePointerUp);
  els.viewport.addEventListener('pointercancel', handlePointerUp);

  els.menuButton.addEventListener('click', openMenu);
  els.closeMenuButton.addEventListener('click', closeMenu);
  els.menuBackdrop.addEventListener('click', closeMenu);
  els.closePopupButton.addEventListener('click', closeDetail);

  els.searchButton.addEventListener('click', searchNuclide);
  els.searchInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') searchNuclide();
  });

  els.colorMode.addEventListener('change', () => {
    state.colorMode = els.colorMode.value;
    applyColorMode();
  });

  els.fitButton.addEventListener('click', () => {
    fitToScreen();
    closeMenu();
  });

  els.resetButton.addEventListener('click', () => {
    centerWorld();
    closeMenu();
  });

  els.csvInput.addEventListener('change', async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    loadNuclidesFromCsv(text, file.name);
    closeMenu();
  });

  els.loadSampleButton.addEventListener('click', () => {
    loadNuclidesFromCsv(SAMPLE_CSV, 'muestra interna');
    closeMenu();
  });

  els.downloadTemplateButton.addEventListener('click', downloadTemplate);
  els.loadRemoteButton.addEventListener('click', loadRemoteCsv);

  els.filterList.addEventListener('change', () => {
    state.filters = new Set([...els.filterList.querySelectorAll('input:checked')].map(input => input.value));
    applyFilters();
  });

  window.addEventListener('resize', () => {
    renderAll();
    fitToScreen();
  });

  window.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeMenu();
      closeDetail();
    }
  });
}

function init() {
  wireEvents();
  loadNuclidesFromCsv(SAMPLE_CSV, 'muestra interna');
}

init();
