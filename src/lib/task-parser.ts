export type DeliveryType = 'LANDMARK' | 'HOSTEL' | 'ROOM';

export type ParsedTask = {
  item: string | null;
  quantity: number | null;
  pickup: string | null;
  destination: string | null;
  timingText: string | null;
  deliveryType: DeliveryType | null;
  category: 'BUY_AND_BRING' | 'PICKUP_AND_DROP' | 'PRINT_AND_COLLECT' | 'OTHER';
  confidence: 'high' | 'medium' | 'low';
};

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

const wordNumbers: Record<string, number> = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
};

const routePatterns: Array<[RegExp, ParsedTaskRoute['confidence']]> = [
  [/\bfrom\s+(.+?)\s+(?:and\s+)?(?:bring|take|deliver|drop|send)(?:\s+(?:it|them|that|this|the items?))?\s+(?:back\s+)?to\s+(.+)$/i, 'high'],
  [/\b(?:pick\s+up|collect)\s+.+?\s+from\s+(.+?)\s+(?:and\s+)?(?:bring|take|deliver|drop|send)(?:\s+(?:it|them|that|this|the items?))?\s+(?:back\s+)?to\s+(.+)$/i, 'high'],
  [/\bfrom\s+(.+?)\s+(?:to|towards)\s+(.+)$/i, 'medium'],
  [/\b(?:bring|take|deliver|drop|send)\s+.+?\s+from\s+(.+?)\s+(?:to|at)\s+(.+)$/i, 'medium'],
];

export function parseTaskRoute(input: string): ParsedTaskRoute | null {
  const text = input.replace(/\n/g, ' ').trim();
  if (text.length < 12) return null;
  for (const [pattern, confidence] of routePatterns) {
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

function extractItem(text: string): { item: string | null; quantity: number | null } {
  const beforeRoute = text.split(/\b(?:from|to)\b/i)[0].trim();
  const unitPattern = 'bottles?|packs?|pieces?|pcs?|bags?|boxes?|units?|cartons?|reams?|copies?|plates?|cups?|cans?';
  const withUnit = beforeRoute.match(new RegExp(
    '\\b(?:get|buy|purchase|pick\\s+up|collect|grab)\\s+(\\d+(?:\\.\\d+)?)\\s+(?:' + unitPattern + ')\\s+of\\s+(.+)',
    'i',
  ));
  if (withUnit) return { quantity: Number(withUnit[1]), item: clean(withUnit[2]) };

  const numeric = beforeRoute.match(/\b(?:get|buy|purchase|pick\s+up|collect|grab)\s+(\d+(?:\.\d+)?)\s*(?:x|×)?\s+(.+)/i);
  if (numeric) return { quantity: Number(numeric[1]), item: clean(numeric[2]) };

  const word = beforeRoute.match(new RegExp(
    '\\b(?:get|buy|purchase|pick\\s+up|collect|grab)\\s+(' + Object.keys(wordNumbers).join('|') + ')\\s+(.+)',
    'i',
  ));
  if (word) return { quantity: wordNumbers[word[1].toLowerCase()], item: clean(word[2]) };

  const singular = beforeRoute.match(/\b(?:get|buy|purchase|pick\s+up|collect|grab)\s+(?:a|an)\s+(.+)/i);
  if (singular) return { quantity: 1, item: clean(singular[1]) };

  return { item: null, quantity: null };
}

function extractTiming(text: string): string | null {
  const match =
    text.match(/\b(?:by|before|at)\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?\b/i) ||
    text.match(/\b(?:today|tomorrow|tonight|asap|as soon as possible|now)\b/i);
  return match ? clean(match[0]) : null;
}

function inferDeliveryType(text: string): DeliveryType | null {
  if (/\broom(?:\s*\d+)?\b|\bmy room\b/i.test(text)) return 'ROOM';
  if (/\bhostel\b/i.test(text)) return 'HOSTEL';
  return null;
}

export function parseTask(input: string): ParsedTask | null {
  const text = input.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length < 6) return null;

  const route = parseTaskRoute(text);
  const { item, quantity } = extractItem(text);
  const timingText = extractTiming(text);
  const deliveryType = inferDeliveryType(text);

  let category: ParsedTask['category'] = 'OTHER';
  if (/\bprint(?:ing|ed)?\b/i.test(text)) category = 'PRINT_AND_COLLECT';
  else if (/\b(?:buy|purchase|get|grab)\b/i.test(text)) category = 'BUY_AND_BRING';
  else if (/\b(?:pick\s+up|collect|deliver|drop|take)\b/i.test(text)) category = 'PICKUP_AND_DROP';

  if (!route && !item && !timingText && !deliveryType) return null;

  const confidence: ParsedTask['confidence'] =
    route?.confidence === 'high' && (item || deliveryType) ? 'high' :
    route ? 'medium' :
    item ? 'medium' : 'low';

  return {
    item: item ? clean(item) : null,
    quantity: quantity && Number.isFinite(quantity) && quantity > 0 ? quantity : null,
    pickup: route?.pickup ?? null,
    destination: route?.destination ?? null,
    timingText,
    deliveryType,
    category,
    confidence,
  };
}

export function suggestedTaskTitle(parsed: ParsedTask | null): string | null {
  if (!parsed?.item && !parsed?.pickup) return null;
  const qty = parsed.quantity && parsed.quantity !== 1 ? String(parsed.quantity) + ' × ' : '';
  if (parsed.item) return 'Get ' + qty + parsed.item;
  return parsed.pickup ? 'Pick up from ' + parsed.pickup : null;
}
