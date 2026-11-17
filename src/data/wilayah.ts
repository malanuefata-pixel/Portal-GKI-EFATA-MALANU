export interface SektorStructure {
  name: string;
  ksps: string[];
}

export interface RayonStructure {
  name: string;
  sektors: SektorStructure[];
}

export const WILAYAH_HIERARCHY: RayonStructure[] = [
  {
    name: 'Rayon I',
    sektors: [
      { name: 'Sektor Hermon', ksps: ['KSP 1', 'KSP 2', 'KSP 3', 'KSP 4', 'KSP 5'] },
      { name: 'Sektor Sinai', ksps: ['KSP 6', 'KSP 7', 'KSP 8', 'KSP 9', 'KSP 10'] },
    ],
  },
  {
    name: 'Rayon II',
    sektors: [
      { name: 'Sektor Siloam', ksps: ['KSP 1', 'KSP 2', 'KSP 3', 'KSP 4', 'KSP 5'] },
      { name: 'Sektor Genesaret', ksps: ['KSP 6', 'KSP 7', 'KSP 8', 'KSP 9', 'KSP 10'] },
    ],
  },
  {
    name: 'Rayon III',
    sektors: [
      { name: 'Sektor Zaitun', ksps: ['KSP 1', 'KSP 2'] },
      { name: 'Sektor Kalvari', ksps: ['KSP 3', 'KSP 4', 'KSP 5', 'KSP 6', 'KSP 7'] },
    ],
  },
  {
    name: 'Rayon IV',
    sektors: [
      { name: 'Sektor Galilea', ksps: ['KSP 1', 'KSP 2', 'KSP 3', 'KSP 4', 'KSP 5'] },
      { name: 'Sektor Sion', ksps: ['KSP 6', 'KSP 7', 'KSP 8', 'KSP 9', 'KSP 10'] },
    ],
  },
];

export function getSektorsByRayon(rayonName: string): SektorStructure[] {
  const found = WILAYAH_HIERARCHY.find((r) => r.name === rayonName);
  return found ? found.sektors : [];
}

export function getKspsBySektor(rayonName: string, sektorName: string): string[] {
  const sektors = getSektorsByRayon(rayonName);
  const found = sektors.find((s) => s.name === sektorName);
  return found ? found.ksps : [];
}
