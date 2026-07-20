const isBrowser =
  typeof (globalThis as Record<string, unknown>).document !== 'undefined';

function getDoc(): { cookie: string } {
  return (globalThis as Record<string, unknown>).document as { cookie: string };
}

function read(name: string): string | null {
  if (!isBrowser) return null;
  const match = getDoc().cookie.match(
    new RegExp(
      '(?:^|;\\s*)' +
        name.replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$1') +
        '=([^;]*)',
    ),
  );
  return match?.[1] ?? null;
}

function write(
  name: string,
  value: string,
  opts?: {
    maxAge?: number;
    path?: string;
    sameSite?: 'strict' | 'lax' | 'none';
  },
): void {
  if (!isBrowser) return;
  let cookie = `${name}=${value}`;
  if (opts?.maxAge !== undefined) cookie += `; max-age=${opts.maxAge}`;
  cookie += `; path=${opts?.path ?? '/'}`;
  cookie += `; sameSite=${opts?.sameSite ?? 'lax'}`;
  getDoc().cookie = cookie;
}

function remove(name: string): void {
  if (!isBrowser) return;
  getDoc().cookie = `${name}=; max-age=0; path=/; sameSite=lax`;
}

export const cookie = { read, write, remove };
