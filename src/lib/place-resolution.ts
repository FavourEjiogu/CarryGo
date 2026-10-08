export type CampusPlace = {
  label: string;
  locationId: string;
  kind: string;
  merchant?: {
    id: string;
    name: string;
    category: string;
    verificationStatus: string;
    storefrontEnabled: boolean;
    averagePrepMinutes: number | null;
  };
};

export type PlaceResolution = {
  place: CampusPlace;
  confidence: number;
};

const aliases: Record<string, string> = {
  plz: 'plaza', h: 'hostel', hs: 'hostel', rd: 'road', st: 'street',
  bldg: 'building', ctr: 'center', centre: 'center', jct: 'junction',
  univ: 'university', uni: 'university', sch: 'school',
};

const normalize = (value: string) => value
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9\s]/g, ' ')
  .split(/\s+/)
  .filter(Boolean)
  .map(token => aliases[token] || token)
  .join(' ')
  .trim();

const initials = (value: string) => normalize(value)
  .split(' ')
  .filter(Boolean)
  .map(token => token[0])
  .join('');

function levenshtein(a: string, b: string) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const prev = new Array<number>(cols);
  const next = new Array<number>(cols);
  for (let j = 0; j < cols; j++) prev[j] = j;
  for (let i = 1; i < rows; i++) {
    next[0] = i;
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      next[j] = Math.min(next[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j < cols; j++) prev[j] = next[j];
  }
  return prev[cols - 1];
}

function score(query: string, label: string) {
  const q = normalize(query);
  const l = normalize(label);
  if (!q || !l) return 0;
  if (q === l) return 1;

  const qi = initials(q);
  const li = initials(l);
  if (qi.length >= 2 && qi === li) return 0.94;

  const qTokens = q.split(' ');
  const lTokens = new Set(l.split(' '));
  const overlap = qTokens.filter(token => lTokens.has(token)).length / Math.max(qTokens.length, lTokens.size);
  const edit = 1 - levenshtein(q, l) / Math.max(q.length, l.length);
  return Math.max(0, Math.min(0.93, overlap * 0.72 + edit * 0.28));
}

export function resolveCampusPlace(query: string, places: CampusPlace[]): PlaceResolution | null {
  const trimmed = query.trim();
  if (trimmed.length < 2 || !places.length) return null;

  const ranked = places
    .map(place => ({ place, confidence: score(trimmed, place.label) }))
    .sort((a, b) => b.confidence - a.confidence);

  const best = ranked[0];
  const second = ranked[1]?.confidence ?? 0;
  if (!best || best.confidence < 0.9) return null;
  if (best.confidence - second < 0.08) return null;
  return best;
}
