## Integrar ML Kit Translation con fallback online y detección de idioma

### Objetivo

- Usar traducción local con ML Kit siempre que los modelos estén descargados.
- Si no hay modelo, hacer fallback a traducción online (Google Translate API).
- Detección automática de idioma origen antes de traducir.
- Permitir al usuario descargar/eliminar modelos de idiomas y elegir el idioma de destino desde settings.

### Archivos y cambios propuestos

- Nuevo servicio `MlKitTranslationService.ts` con lógica de detección y fallback.
- Utilidad para guardar/leer idioma destino.
- Pantalla de settings para descarga y selección de idioma.
- Modificación de la lógica de traducción principal.
- Servicio de traducción online de respaldo.
- Actualización de navegación y settings.

### Pasos para QA

1. Probar traducción con y sin modelos descargados.
2. Verificar que el idioma de destino seleccionado se respete.
3. Probar fallback a traducción online.
4. Probar detección automática de idioma.
5. Probar descarga y eliminación de modelos desde settings.

---

> Esta issue documenta la integración de ML Kit Translation con fallback y autodetección de idioma para LNReader.

npm install react-native-mlkit-translate