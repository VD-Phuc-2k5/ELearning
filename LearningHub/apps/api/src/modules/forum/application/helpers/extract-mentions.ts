interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
}

/**
 * Walk a Tiptap JSON document tree and collect all user IDs referenced via
 * mention nodes (`type: 'mention'` with an `id` attribute).
 */
export function extractMentions(doc: unknown): string[] {
  if (!doc || typeof doc !== 'object') return [];
  const ids = new Set<string>();
  walk(doc as TiptapNode, ids);
  return [...ids];
}

function walk(node: TiptapNode, ids: Set<string>): void {
  if (node.type === 'mention' && node.attrs) {
    const id = node.attrs['id'];
    const labelUserId = node.attrs['userId'];
    const value =
      typeof id === 'string'
        ? id
        : typeof labelUserId === 'string'
          ? labelUserId
          : null;
    if (value) ids.add(value);
  }
  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      walk(child, ids);
    }
  }
}

/**
 * Validate that the supplied JSON is a valid Tiptap document:
 * - top-level type must be 'doc'
 * - total serialized size must not exceed the limit (default 500KB)
 */
export function validateTiptapDoc(
  doc: unknown,
  maxBytes = 500 * 1024,
): { ok: true } | { ok: false; reason: string } {
  if (!doc || typeof doc !== 'object') {
    return { ok: false, reason: 'Content is not an object' };
  }
  if ((doc as TiptapNode).type !== 'doc') {
    return { ok: false, reason: 'Root node must be of type "doc"' };
  }
  const serializedSize = Buffer.byteLength(JSON.stringify(doc), 'utf8');
  if (serializedSize > maxBytes) {
    return { ok: false, reason: 'Document size exceeds limit' };
  }
  return { ok: true };
}
