---
sidebar_position: 1
title: Diagrams
---

# docusaurus-theme-pele

This playground renders every diagram type used by kywk.me with Pele instead of
Mermaid. Toggle the color mode to check that diagrams restyle without a
re-render.

## Flowchart

```mermaid
flowchart LR
  A[Markdown] --> B{Fenced block}
  B -->|mermaid| C[Pele]
  C --> D[SVG]
  D --> E[CSS variables]
```

## Flowchart with subgraph and CJK labels

```mermaid
flowchart TD
  subgraph Build["建置流程"]
    A[讀取 Markdown] --> B[解析 Mermaid]
    B --> C[產生 SVG]
  end
  C --> D[部署]
```

## Sequence

```mermaid
sequenceDiagram
  participant U as 使用者
  participant D as Docusaurus
  participant P as Pele
  U->>D: 開啟頁面
  D->>P: import('pele')
  P-->>D: mount()
  D-->>U: SVG diagram
```

## Gantt

```mermaid
gantt
  title Release plan
  dateFormat YYYY-MM-DD
  section Theme
  Package scaffold :a1, 2026-10-20, 3d
  Playground       :a2, after a1, 2d
  section Publish
  Changeset        :b1, after a2, 1d
  npm publish      :b2, after b1, 1d
```

## Class

```mermaid
classDiagram
  class Theme {
    +getThemePath()
    +getClientModules()
  }
  class Mermaid {
    +value
  }
  Theme --> Mermaid
```

## Block

```mermaid
block-beta
  columns 3
  markdown["Markdown"] pele["Pele"] svg["SVG"]
  markdown --> pele --> svg
```

## Wide diagram

```mermaid
flowchart LR
  A[Source] --> B[Parser] --> C[Layout] --> D[SVG builder] --> E[Theme] --> F[Zoom] --> G[Links]
```
