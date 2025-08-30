import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, ActivityIndicator, Alert } from 'react-native';
import { mlkitDownloadModel, mlkitDeleteModel, mlkitGetAvailableModels } from '@services/translation/MlKitTranslationService';
import { setTranslationSettings, getTranslationSettings } from '@utils/TranslationSettings';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'Inglés' },
  { code: 'es', name: 'Español' },
  { code: 'ja', name: 'Japonés' },
  { code: 'fr', name: 'Francés' },
  { code: 'zh', name: 'Chino' },
  { code: 'pt', name: 'Portugués' },
  { code: 'de', name: 'Alemán' },
  // ...agrega los que soporta ML Kit
];

export default function TranslationLanguageScreen() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [available, setAvailable] = useState<string[]>([]);
  const [settings, setSettings] = useState<{ targetLang: string } | null>(null);

  useEffect(() => {
    refresh();
    getTranslationSettings().then(setSettings);
  }, []);

  const refresh = () => {
    mlkitGetAvailableModels().then(setAvailable);
  };

  const handleDownload = async (lang: string) => {
    setDownloading(lang);
    try {
      await mlkitDownloadModel(lang);
      Alert.alert('Modelo descargado', `El modelo de ${lang} está listo.`);
      refresh();
    } catch (e) {
      Alert.alert('Error', 'No se pudo descargar el modelo.');
    }
    setDownloading(null);
  };

  const handleDelete = async (lang: string) => {
    await mlkitDeleteModel(lang);
    refresh();
  };

  const handleSetLang = async (type: 'targetLang', value: string) => {
    const updated = { targetLang: value };
    await setTranslationSettings(updated);
    setSettings(updated);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Selecciona idioma de destino:</Text>
      <FlatList
        data={SUPPORTED_LANGUAGES}
        keyExtractor={l => l.code}
        horizontal
        renderItem={({ item }) => (
          <Button
            title={item.name}
            color={settings?.targetLang === item.code ? 'blue' : undefined}
            onPress={() => handleSetLang('targetLang', item.code)}
          />
        )}
      />
      <Text style={{ marginTop: 20 }}>Modelos descargados:</Text>
      {SUPPORTED_LANGUAGES.map(lang => (
        <View key={lang.code} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
          <Text style={{ width: 120 }}>{lang.name}</Text>
          {available.includes(lang.code) ? (
            <Button title="Eliminar" onPress={() => handleDelete(lang.code)} />
          ) : (
            <Button
              title={downloading === lang.code ? 'Descargando...' : 'Descargar'}
              disabled={!!downloading}
              onPress={() => handleDownload(lang.code)}
            />
          )}
        </View>
      ))}
      {downloading && <ActivityIndicator />}
    </View>
  );
}