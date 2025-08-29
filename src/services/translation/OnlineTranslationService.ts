/**
 * Traducción online usando Google Translate API o similar.
 * Sustituye la clave y el endpoint de acuerdo a tu proveedor.
 */
export async function translateTextOnline(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  // Ejemplo simple usando Google Translate API (requiere clave)
  const apiKey = 'TU_API_KEY'; // TODO: Reemplaza por tu key o usa una variable de entorno segura
  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
  const body = {
    q: text,
    source: sourceLang,
    target: targetLang,
    format: 'text',
  };
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (data?.data?.translations?.[0]?.translatedText) {
    return data.data.translations[0].translatedText as string;
  }
  throw new Error('Traducción online fallida');
}
