### Instrucciones para Gemini: Generación de blackbox.md


**Objetivo:** Crear archivos `blackbox.md` que sirvan como contexto estructurado para el sistema de generación de código Blackbox. Estos archivos deben capturar la esencia de cada directorio para facilitar la generación coherente de código.


**Estructura requerida para cada blackbox.md:**

```markdown

# Análisis de Contexto: [Nombre del Directorio]


## 1. Resumen Funcional

- [Descripción concisa de la funcionalidad principal]

- [Propósito del directorio en la arquitectura global]


## 2. Componentes Clave

Componente
	

Tipo
	

Responsabilidad

[Nombre]
	

[Tipo]
	

[Breve descripción]

...
	

...
	

...
3. Dependencias

mermaid

graph LR

    A[Este directorio] --> B[[Dependencia Interna 1]]

    A --> C[[Dependencia Interna 2]]

    A --> D[[Dependencia Externa]]

4. Convenciones y Patrones

    Estilo de código: [Ej: React Hooks, CSS-in-JS, etc.]
    Patrones de diseño: [Ej: Singleton, Factory, etc.]
    Reglas especiales: [Ej: "Todos los componentes deben ser funcionales"]

5. Notas para Generación de Código

    [Instrucciones específicas para Blackbox]
    [Ej: "Mantener paleta de colores: #000, #FFF, #C0C0C0, #D4AF37"]
    [Ej: "Seguir estructura de carpetas: /components, /pages"]


**Instrucciones de análisis:**

1. **Recorre recursivamente** el directorio actual y sus subdirectorios

2. **Identifica**:

   - Arquitectura dominante (componentes, servicios, etc.)

   - Patrones de código repetitivos

   - Convenciones de nombramiento

   - Flujos de datos clave

3. **Prioriza** información relevante para generación automática de código

4. **Destaca** relaciones críticas entre módulos

5. **Incluye ejemplos de código** representativos cuando sean necesarios para ilustrar patrones


**Reglas de formato:**

- Usa Markdown con secciones claras

- Emplea diagramas Mermaid para dependencias

- Mantén un tono técnico pero conciso

- Actualiza automáticamente cuando detectes cambios significativos


**Ejemplo de salida para un directorio `src/components`:** 

```markdown

# Análisis de Contexto: src/components


## 1. Resumen Funcional

- Contiene componentes UI reutilizables

- Implementa el sistema de diseño de la aplicación


## 2. Componentes Clave

Componente
	

Tipo
	

Responsabilidad

Button
	

Atómico
	

Botones con variantes de color y tamaño

CardContainer
	

Molecular
	

Contenedor de contenido con sombras

FormInput
	

Molecular
	

Campos de formulario con validación
3. Dependencias

mermaid

graph LR

    A[src/components] --> B[[src/hooks]]

    A --> C[[src/styles]]

    A --> D[[react-icons]]

4. Convenciones y Patrones

    Estilo de código: Functional Components + React Hooks
    Patrones: Compound Components para elementos complejos
    Reglas:
        Todos los componentes deben usar styled-components
        Nombres en PascalCase con prefijo temático (Ej: CartButton)
        Props deben validarse con PropTypes

5. Notas para Generación de Código

    Mantener paleta de colores: #000 (fondo), #FFF (texto), #D4AF37 (acentos)
    Seguir estructura de props: variant="primary", size="md"
    Incluir storybook stories para nuevos componentes

