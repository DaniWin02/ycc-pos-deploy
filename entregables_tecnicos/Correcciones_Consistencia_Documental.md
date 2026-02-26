# Correcciones de Consistencia Documental - Country Club POS

## Objetivo
Consolidar y alinear la documentación técnica existente para evitar contradicciones entre modelo de datos, API, seguridad y setup.

## Alcance
Este documento cubre exclusivamente correcciones de consistencia documental.

## Correcciones Prioritarias

### 1. Eliminar duplicidad de documentos en raíz vs `Informacion_Detalles`
- Acción:
  - Definir una sola fuente oficial para estos documentos.
  - Recomendada: conservar solo la versión dentro de `Informacion_Detalles`.
  - En raíz, dejar un `README` corto apuntando a esa ruta.
- Archivos afectados:
  - `Analisis_POS.txt`
  - `Brief_POS_CountryClubMerida_Ingenieria.md`
  - `DocumentoCompleto_POS_CountryClubMerida.md`
  - `Fase0_1Pager_POS_CountryClubMerida.md`
  - `Fase0_MustShouldCould_POS_CountryClubMerida.md`
  - `Fase1_Requerimientos_DisenoFuncional_POS_CountryClubMerida.md`
  - `Guia_VisualizarDiagramas_Mermaid.md`
  - `Proyecto_POS_CountryClubMerida_Handoff.md`
- Resultado esperado:
  - No más drift por edición paralela en dos rutas.

### 2. Unificar convención de booleanos
- Inconsistencia actual:
  - Convención indica prefijo `is_`/`has_`.
  - Diccionario y ERD usan `active`, `track_inventory`.
- Acción:
  - Definir regla final: permitir `active` como excepción estándar de dominio y mantener `is_`/`has_` para nuevos campos booleanos.
  - Actualizar texto de `entregables_tecnicos/3_modelado_datos/Convenciones_Estandares.md` para reflejarlo explícitamente.
- Resultado esperado:
  - Convención compatible con el modelo actual sin renombrado masivo.

### 3. Unificar estados de venta en todos los documentos
- Inconsistencia actual:
  - Modelo/API: `DRAFT`, `HELD`, `SENT_TO_KITCHEN`, `PAID`, `VOIDED`, `REFUNDED`.
  - Integración: `ACTIVE`, `VOIDED`, `REFUNDED`.
- Acción:
  - Adoptar como canon los estados definidos en OpenAPI y Diccionario.
  - Ajustar `entregables_tecnicos/7_integracion_sap_jonas/Modelo_Datos_Integrado.md` para usar el mismo enum de venta.
- Resultado esperado:
  - Un solo ciclo de vida de venta para arquitectura, API y BD.

### 4. Corregir modelado de headers en OpenAPI
- Inconsistencia actual:
  - `headers` declarado directamente en operaciones.
- Acción:
  - Migrar a `parameters` con `in: header` para `Idempotency-Key`.
  - Aplicar en:
    - `POST /sales`
    - `POST /sync/outbox`
  - Archivo: `entregables_tecnicos/4_disenio_api/OpenAPI_Specification.yaml`.
- Resultado esperado:
  - Especificación OpenAPI válida y portable entre herramientas.

### 5. Alinear scripts de setup con entorno Windows y cross-platform
- Inconsistencia actual:
  - Script `clean` usa `rm -rf`, no portable en PowerShell.
- Acción:
  - Cambiar a `rimraf` o comandos cross-platform.
  - Mantener una sección explícita "Windows" en `entregables_tecnicos/6_setup_proyecto/README.md`.
- Resultado esperado:
  - Ejecución consistente de scripts para todo el equipo.

### 6. Revisar referencias a repositorio externo no presente
- Inconsistencia actual:
  - `README` de setup apunta a `git clone .../pos-system.git`, pero este repo contiene documentación, no ese proyecto base.
- Acción:
  - Sustituir pasos de clonación por instrucciones reales del repositorio actual.
  - Si el repo externo es requisito, declararlo como prerequisito explícito y opcional.
- Resultado esperado:
  - Onboarding sin ambigüedad.

### 7. Corregir problemas de codificación de caracteres (mojibake)
- Inconsistencia actual:
  - Se observan caracteres corruptos en varios documentos (`MÃ©rida`, `PolÃ­ticas`, etc.).
- Acción:
  - Estandarizar encoding a UTF-8.
  - Agregar nota en convención de documentación: "todos los `.md` y `.txt` en UTF-8".
- Resultado esperado:
  - Lectura correcta en IDE, terminal y render de Markdown.

## Orden Recomendado de Ejecución
1. Duplicidad de archivos.
2. Estados de venta.
3. OpenAPI headers.
4. Convención de booleanos.
5. Setup/scripts cross-platform.
6. Referencias de repositorio.
7. Normalización de encoding.

## Criterio de Cierre
- No existen definiciones contradictorias de estados de venta.
- OpenAPI pasa validación de esquema.
- No hay documentos funcionalmente duplicados fuera de la carpeta oficial.
- Scripts base funcionan en Windows y Unix.
- No hay mojibake visible en documentos clave.
