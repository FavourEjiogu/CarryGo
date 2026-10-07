export type ParsedTaskRoute = {
  pickup: string;
  destination: string;
  confidence: 'high' | 'medium';
};

const clean = (value: string) =>
  value
    .replace(/\s+/g, ' ')
    .replace(/^[\s,.-]+|[\s,.-]+$/g, '')
    .replace(/[.!?]+$/, '')
    .trim();

const patterns: Array<[RegExp, ParsedTaskRoute['confidence']]> = [
  [
    /\bfrom\s+(.+?)\s+(?:and\s+)?(?:bring|take|deliver|drop|send)(?:\s+(?:it|them|that|this|the items?))?\s+(?:back\s+)?to\s+(.+)$/i,
    'high',
  ],
  [
    /\b(?:pick\s+up|collect)\s+.+?\s+from\s+(.+?)\s+(?:and\s+)?(?:bring|take|deliver|drop|send)(?:\s+(?:it|them|that|this|the items?))?\s+(?:back\s+)?to\s+(.+)$/i,
    'high',
  ],
  [
    /\bfrom\s+(.+?)\s+(?:to|towards)\s+(.+)$/i,
    'medium',
  ],
  [
    /\b(?:bring|take|deliver|drop|send)\s+.+?\s+from\s+(.+?)\s+(?:to|at)\s+(.+)$/i,
    'medium',
  ],
];

export function parseTaskRoute(input: string): ParsedTaskRoute | null {
  const text = input.replace(/\n/g, ' ').trim();
  if (text.length < 12) return null;

  for (const [pattern, confidence] of patterns) {
    const match = text.match(pattern);
    if (!match) continue;

    const pickup = clean(match[1]);
    const destination = clean(match[2]);
    if (!pickup || !destination || pickup.length < 2 || destination.length < 2) continue;
    if (pickup.toLowerCase() === destination.toLowerCase()) continue;

    return { pickup, destination, confidence };
  }

  return null;
}
