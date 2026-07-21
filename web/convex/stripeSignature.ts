const DEFAULT_TOLERANCE_SECONDS = 300;

function parseStripeSignature(header: string): { timestamp: number; signatures: string[] } | null {
  let timestamp: number | undefined;
  const signatures: string[] = [];

  for (const part of header.split(',')) {
    const separator = part.indexOf('=');
    if (separator < 1) continue;
    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (key === 't' && /^\d+$/.test(value)) timestamp = Number(value);
    if (key === 'v1' && /^[a-f0-9]{64}$/i.test(value)) signatures.push(value.toLowerCase());
  }

  if (!Number.isSafeInteger(timestamp) || signatures.length === 0) return null;
  return { timestamp: timestamp as number, signatures };
}

function hex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

/** Verify Stripe's t=...,v1=... signature without parsing or changing the body. */
export async function verifyStripeWebhookSignature(
  payload: string,
  header: string,
  endpointSecret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
  toleranceSeconds = DEFAULT_TOLERANCE_SECONDS,
): Promise<boolean> {
  if (!endpointSecret.startsWith('whsec_')) return false;
  const parsed = parseStripeSignature(header);
  if (!parsed || Math.abs(nowSeconds - parsed.timestamp) > toleranceSeconds) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(endpointSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const digest = hex(await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(`${parsed.timestamp}.${payload}`),
  ));

  return parsed.signatures.some((signature) => constantTimeEqual(digest, signature));
}
