/**
 * Utilidades para guardar/leer configuración de idioma de traducción.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = 'translationSettings';

export async function setTranslationSettings(settings: { targetLang: string }) {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function getTranslationSettings(): Promise<{ targetLang: string }> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!raw) return { targetLang: 'es' };
  return JSON.parse(raw);
}