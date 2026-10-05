// Universal Safe JSON Parser preventing "Unexpected end of JSON input" errors across entire application
export async function safeJson<T = any>(res: Response | null | undefined): Promise<T | null> {
  if (!res) return null;
  try {
    const contentType = res.headers?.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return null;
    }
    const text = await res.text();
    if (!text || !text.trim()) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
