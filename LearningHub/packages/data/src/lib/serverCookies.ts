import { cookies } from 'next/headers';

export async function getServerCookies(): Promise<string> {
  try {
    const jar = await cookies();
    return jar
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join('; ');
  } catch {
    return '';
  }
}
