# Guía rápida — Visualizar diagramas Mermaid (VS Code + exportar)

## 1) Instalar extensión en VS Code
- **Extensión recomendada**: `Markdown Preview Mermaid Support` (ID: `bierner.markdown-mermaid`)
- Opción alternativa: `Mermaid Markdown Syntax Highlighting` + `Mermaid Preview`

Pasos:
1) Abrir VS Code.
2) Ir a Extensions (Ctrl+Shift+X).
3) Buscar `Markdown Preview Mermaid Support`.
4) Instalar y recargar VS Code.

## 2) Ver diagramas en el editor
- Abre cualquier archivo `.md` que contenga bloques ```mermaid.
- Usa el comando **“Markdown: Open Preview to the Side”** (Ctrl+K V) o **“Markdown: Open Preview”** (Ctrl+Shift+V).
- El diagrama se renderiza en tiempo real al lado.

## 3) Exportar a imagen (PNG/SVG)
### Opción A: Desde la vista previa de VS Code
1) En la vista previa, haz clic derecho sobre el diagrama renderizado.
2) Selecciona **“Save as PNG”** o **“Save as SVG”**.
3) Guarda donde necesites.

### Opción B: Con la extensión `Mermaid Export`
1) Instala la extensión `Mermaid Export` (ID: `tomoyamanaka.mermaid-export`).
2) Abre el archivo `.md`.
3) En la vista previa, usa el comando de paleta **“Export as PNG”** o **“Export as SVG”**.

### Opción C: Online (si no funciona en VS Code)
1) Copia el bloque Mermaid.
2) Pégalo en https://mermaid.live o https://mermaid-js.github.io/mermaid-live-editor.
3) Usa el botón **Actions > Download SVG/PNG**.

## 4) Tip: diagramas grandes
- Si el diagrama no renderiza, divide en subdiagramas o usa `subgraph` para agrupar.
- Para presentaciones, prefiere **SVG** (vectorial, se escala sin pixelar).

## 5) Referencia rápida
- Nuestros diagramas están en:
  - `Fase1_Requerimientos_DisenoFuncional_POS_CountryClubMerida.md`
  - `Proyecto_POS_CountryClubMerida_Handoff.md`

## 6) Si no renderiza
- Verifica que el bloque esté etiquetado exactamente como:
  ```mermaid
  ...
  ```
- Asegura que no haya espacios/tabulaciones antes del ```mermaid.
- Reinicia VS Code tras instalar extensiones.
