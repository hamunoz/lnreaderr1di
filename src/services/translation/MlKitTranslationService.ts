import { translate, downloadModel, deleteModel, getAvailableModels, identifyLanguage } from 'react-native-mlkit-translate';
import { translateTextOnline } from './OnlineTranslationService';

/**
 * Traduce texto usando ML Kit si hay modelos disponibles, si no usa traducción online.
 * Detecta automáticamente el idioma de origen.
 */
export async function smartTranslateText(
  text: string,
  targetLang: string
): Promise<string> {
  // Detecta idioma automáticamente
  const detectedLang = await identifyLanguage(text);

  // Verifica si el modelo está descargado para ambos idiomas
  const available = await getAvailableModels();
  if (available.includes(targetLang) && available.includes(detectedLang)) {
    // Traducir localmente
    return await translate(text, detectedLang, targetLang);
  } else {
    // Fallback online
    return await translateTextOnline(text, detectedLang, targetLang);
  }
}

export async function mlkitDownloadModel(lang: string): Promise<void> {
  await downloadModel(lang);
}

export async function mlkitDeleteModel(lang: string): Promise<void> {
  await deleteModel(lang);
}

export async function mlkitGetAvailableModels(): Promise<string[]> {
  return await getAvailableModels();
}

export async function mlkitDetectLanguage(text: string): Promise<string> {
  return await identifyLanguage(text);
}
