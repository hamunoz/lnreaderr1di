import { BackgroundTaskMetadata } from '@services/ServiceManager';
import { getTranslationSettings } from '@utils/TranslationSettings';
import FileManager from '@native/FileManager';
import { NOVEL_STORAGE } from '@utils/Storages';
import { showToast } from '@utils/showToast';
import { smartTranslateText } from './MlKitTranslationService'; // Nuevo import
import { getChapterInfo, getTranslation, saveTranslation } from '@database/queries/TranslationQueries';

export class DependencyMissingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DependencyMissingError';
  }
}

/**
 * Ejecuta la tarea de traducción de un capítulo en segundo plano.
 */
export const translateChapterTask = async (
  data: {
    chapterId: number | string;
    novelId: number | string;
    pluginId: string;
    chapterName: string;
    novelName: string;
  },
  setMeta: (
    transformer: (meta: BackgroundTaskMetadata) => BackgroundTaskMetadata,
  ) => void,
): Promise<void> => {
  const {
    chapterId,
    novelId,
    pluginId,
    chapterName,
  } = data;

  setMeta(meta => ({
    ...meta,
    isRunning: true,
    progress: 0,
    progressText: 'Iniciando traducción...',
  }));

  try {
    // 1. Verifica si ya está traducido (contenido o nombre)
    setMeta(meta => ({ ...meta, progressText: 'Verificando traducción existente...' }));
    const chapterInfo = await getChapterInfo(chapterId);
    if (!chapterInfo) {
      throw new Error('Capítulo no encontrado en base de datos.');
    }

    if (chapterInfo.hasTranslation && chapterInfo.translatedName) {
      setMeta(meta => ({
        ...meta,
        progress: 1,
        isRunning: false,
        progressText: 'Ya traducido (contenido y nombre)',
      }));
      return;
    }

    // 2. Verifica si existe el archivo de contenido local
    setMeta(meta => ({
      ...meta,
      progress: 0.1,
      progressText: 'Buscando contenido de capítulo...',
    }));
    const filePath = `${NOVEL_STORAGE}/${pluginId}/${novelId}/${chapterId}/index.html`;
    const fileExists = await FileManager.exists(filePath);

    if (!fileExists) {
      throw new DependencyMissingError(
        `Contenido de capítulo no encontrado para '${chapterName}'. Esperando descarga.`,
      );
    }

    // 3. Lee el contenido
    setMeta(meta => ({
      ...meta,
      progress: 0.2,
      progressText: 'Leyendo contenido...',
    }));
    const chapterContent = await FileManager.readFile(filePath);
    if (!chapterContent || chapterContent.trim() === '') {
      throw new Error('El contenido del capítulo está vacío.');
    }

    let translatedContent = '';
    let translatedTitle = chapterInfo.translatedName;
    let translationModel = 'mlkit';
    let translationInstruction = 'ML Kit translation';

    // 4. Traduce el contenido (si es necesario)
    if (!chapterInfo.hasTranslation) {
      setMeta(meta => ({
        ...meta,
        progress: 0.4,
        progressText: 'Traduciendo contenido (ML Kit)...',
      }));

      // Obtiene el idioma destino de settings
      const translationSettings = await getTranslationSettings();
      const targetLang = translationSettings.targetLang || 'es';

      translatedContent = await smartTranslateText(chapterContent, targetLang);

      // Opcional: puedes limpiar el HTML si lo deseas aquí
      translatedContent = translatedContent
        .replace(/\n/g, '<br/>')
        .replace(/ {2}/g, '&nbsp;&nbsp;');

      translationModel = 'mlkit';
      translationInstruction = 'ML Kit translation';
    } else {
      // Si el contenido ya está traducido, obtiene la traducción existente
      const existingTranslation = await getTranslation(chapterId);
      if (existingTranslation) {
        translatedContent = existingTranslation.content;
        translationModel = existingTranslation.model;
        translationInstruction = existingTranslation.instruction || '';
      } else {
        throw new Error(
          'Estado inconsistente: El capítulo está marcado como traducido pero no se encontró la traducción.',
        );
      }
      setMeta(meta => ({
        ...meta,
        progress: 0.6,
        progressText: 'Contenido ya traducido',
      }));
    }

    // 5. Traduce el título (si es necesario y existe original)
    if (
      !translatedTitle &&
      chapterInfo.name &&
      chapterInfo.name.trim() !== ''
    ) {
      setMeta(meta => ({
        ...meta,
        progress: 0.7,
        progressText: 'Traduciendo título (ML Kit)...',
      }));
      // Obtiene el idioma destino de settings
      const translationSettings = await getTranslationSettings();
      const targetLang = translationSettings.targetLang || 'es';

      // Traducción con autodetección
      translatedTitle = (await smartTranslateText(chapterInfo.name, targetLang)).trim();
    } else if (translatedTitle) {
      setMeta(meta => ({
        ...meta,
        progress: 0.8,
        progressText: 'Título ya traducido o vacío',
      }));
    }

    // 6. Guarda la traducción y actualiza el título
    setMeta(meta => ({ ...meta, progress: 0.9, progressText: 'Guardando traducción...' }));
    if (!chapterInfo.hasTranslation && translatedContent) {
      await saveTranslation(
        chapterId,
        translatedContent,
        translationModel,
        translationInstruction,
        translatedTitle,
      );
    }

    setMeta(meta => ({
      ...meta,
      progress: 1,
      isRunning: false,
      progressText: 'Traducción completada',
    }));
  } catch (err: any) {
    if (err instanceof DependencyMissingError) throw err;
    setMeta(meta => ({
      ...meta,
      isRunning: false,
      progress: 1,
      progressText: `Error: ${err.message}`,
    }));
    throw err;
  }
};