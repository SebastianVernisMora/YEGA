#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const KEY_DIRECTORIES = [
  'backend',
  'backend/models',
  'backend/routes',
  'frontend',
  'frontend/src/pages',
  'frontend/src/components',
  'frontend/src/services'
];

const CONTEXT_TEMPLATES = {
  backend: (dirName) => `# Análisis de Contexto: ${dirName}

1. Resumen Funcional

    Gestiona lógica de negocio, API y base de datos
    Punto de entrada para todas las peticiones del cliente
    Orquesta servicios y modelos

2. Componentes Clave

| Componente | Tipo | Responsabilidad |
| --- | --- | --- |
| models/ | Modelos | Esquemas Mongoose para entidades de negocio |
| routes/ | Rutas | Endpoints API con lógica de controladores |
| config/ | Config | Variables de entorno y configuración |

3. Dependencias


    A[${dirName}] --> B[[express]]
    A --> C[[mongoose]]
    A --> D[[jsonwebtoken]]
    A --> E[[bcrypt]]

4. Convenciones y Patrones

    Estilo de código: Node.js con Express, async/await para operaciones asíncronas
    Arquitectura: MVC (Model-View-Controller)
    Autenticación: JWT con roles (cliente, tienda, repartidor, admin)
    Generación de código: Usar scripts generate-*.js para mantener consistencia

5. Notas para Generación de Código

    Nuevos endpoints deben seguir convenciones RESTful
    Usar variables de entorno para claves sensibles
    Mantener estructura de carpetas: models/, routes/, config/
    Integrar con scripts de generación automática existentes`,

  models: (dirName) => `# Análisis de Contexto: ${dirName}

1. Resumen Funcional

    Define esquemas Mongoose para entidades de negocio
    Gestiona estructura de datos y validaciones
    Proporciona interfaz para operaciones CRUD con MongoDB

2. Componentes Clave

| Componente | Tipo | Responsabilidad |
| --- | --- | --- |
| Producto.js | Modelo | Define estructura de productos |
| Usuario.js | Modelo | Gestiona datos de usuarios y autenticación |
| Pedido.js | Modelo | Controla información de pedidos |

3. Dependencias


    A[${dirName}] --> B[[mongoose]]
    A --> C[[backend/routes]]

4. Convenciones y Patrones

    Esquemas: Definir tipos, requeridos y valores por defecto
    Validaciones: Usar validadores incorporados de Mongoose
    Métodos: Añadir métodos personalizados para operaciones complejas
    Virtuals: Usar propiedades virtuales para campos calculados

5. Notas para Generación de Código

    Mantener nombres de modelos en PascalCase
    Definir relaciones entre modelos con refs
    Usar timestamps para createdAt/updatedAt
    Añadir índices para consultas frecuentes`,

  routes: (dirName) => `# Análisis de Contexto: ${dirName}

1. Resumen Funcional

    Contiene endpoints API para la aplicación
    Gestiona peticiones HTTP y respuestas
    Coordina interacción entre frontend y modelos

2. Componentes Clave

| Componente | Tipo | Responsabilidad |
| --- | --- | --- |
| productosList.js | Endpoint | GET /productos con paginación y filtros |
| usuariosLogin.js | Endpoint | POST /login para autenticación |
| usuariosRegister.js | Endpoint | POST /register para nuevos usuarios |

3. Dependencias


    A[${dirName}] --> B[[express]]
    A --> C[[backend/models]]
    A --> D[[jsonwebtoken]]

4. Convenciones y Patrones

    Estructura: Separar en controladores si la lógica crece
    Autenticación: Proteger rutas con middleware JWT
    Validación: Usar express-validator para datos de entrada
    Respuestas: Formato JSON consistente: { success, data, message }

5. Notas para Generación de Código

    Seguir convención RESTful para nombres de rutas
    Usar try/catch para manejo de errores
    Documentar endpoints con Swagger en el futuro
    Mantener lógica de negocio en controladores, no en rutas`,

  pages: (dirName) => `# Análisis de Contexto: ${dirName}

1. Resumen Funcional

    Contiene componentes de página principales
    Organizado por roles de usuario
    Cada página gestiona una vista completa

2. Componentes Clave

| Componente | Tipo | Responsabilidad |
| --- | --- | --- |
| Cliente.js | Página | Vista principal para clientes |
| Tienda.js | Página | Panel de control para tiendas |
| Repartidor.js | Página | Interfaz de seguimiento para repartidores |
| Administrador.js | Página | Dashboard de administración |

3. Dependencias


    A[${dirName}] --> B[[react]]
    A --> C[[react-bootstrap]]
    A --> D[[styled-components]]
    A --> E[[src/services]]

4. Convenciones y Patrones

    Diseño: Responsive con react-bootstrap
    Estilos: styled-components con paleta definida
    Estado: Usar hooks (useState, useEffect)
    Datos: Conectar con servicios API

5. Notas para Generación de Código

    Mantener paleta: #000 fondo, #FFF texto, #C0C0C0 acentos, #D4AF37 destacados
    Usar Container, Row, Col de react-bootstrap para layout
    Componentes funcionales con hooks
    Separar lógica de presentación`,

  components: (dirName) => `# Análisis de Contexto: ${dirName}

1. Resumen Funcional

    Componentes UI reutilizables
    Bloques de construcción para las páginas
    Aislados de lógica de negocio específica

2. Componentes Clave

| Componente | Tipo | Responsabilidad |
| --- | --- | --- |
| ProductCard.js | Presentación | Muestra tarjeta de producto |
| Navbar.js | Navegación | Barra de navegación global |
| FormInput.js | Formulario | Campo de formulario con validación |

3. Dependencias


    A[${dirName}] --> B[[react]]
    A --> C[[react-bootstrap]]
    A --> D[[styled-components]]

4. Convenciones y Patrones

    Composición: Componentes pequeños y enfocados
    Props: Typed con PropTypes
    Estilos: styled-components con temas
    Reutilización: Máxima independencia

5. Notas para Generación de Código

    Nombrar componentes en PascalCase
    Usar props para personalización
    Documentar con JSDoc
    Mantener sin estado cuando sea posible
    Probar con Storybook`,

  services: (dirName) => `# Análisis de Contexto: ${dirName}

1. Resumen Funcional

    Gestiona comunicación con backend
    Encapsula lógica de llamadas API
    Centraliza manejo de errores

2. Componentes Clave

| Componente | Tipo | Responsabilidad |
| --- | --- | --- |
| apiClient.js | Servicio | Cliente HTTP con axios y manejo de tokens |
| authService.js | Servicio | Gestiona autenticación y sesiones |
| productService.js | Servicio | Operaciones CRUD para productos |

3. Dependencias


    A[${dirName}] --> B[[axios]]
    A --> C[[frontend/src/pages]]

4. Convenciones y Patrones

    Interfaces: Funciones claras con parámetros definidos
    Tokens: Manejar automáticamente en interceptor
    Errores: Normalizar respuestas de error
    Env: Usar variables de entorno`,
  frontend: (dirName) => `# Análisis de Contexto: ${dirName}

1. Resumen Funcional

    Contiene la aplicación de cara al cliente (UI)
    Construido con React y un conjunto de librerías modernas
    Se comunica con el backend a través de una API RESTful

2. Componentes Clave

| Componente | Tipo | Responsabilidad |
| --- | --- | --- |
| src/pages/ | Páginas | Vistas principales de la aplicación por rol |
| src/components/ | Componentes | Componentes de UI reutilizables |
| src/services/ | Servicios | Lógica de comunicación con la API |

3. Dependencias


    A[${dirName}] --> B[[react]]
    A --> C[[react-bootstrap]]
    A --> D[[styled-components]]
    A --> E[[axios]]

4. Convenciones y Patrones

    Estilo de código: React con Hooks, componentes funcionales
    Diseño: Responsive, mobile-first
    Styling: CSS-in-JS con styled-components
    Gestión de estado: Hooks de React (useState, useEffect, useContext)

5. Notas para Generación de Código

    Mantener la paleta de colores corporativa
    Componentes deben ser pequeños y reutilizables
    Usar 
react-bootstrap
 para la estructura y componentes base
    Las llamadas a la API deben estar en el directorio 
services
  `,
  default: (dirName) => `# Análisis de Contexto: ${dirName}

Este directorio no tiene una plantilla específica. Por favor, añade una si es necesario.
`
};

function generateBlackboxFiles() {
  KEY_DIRECTORIES.forEach(dirPath => {
    const fullPath = path.join(PROJECT_ROOT, dirPath);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }

    const dirName = path.basename(dirPath);
    let templateKey = 'default';

    if (dirPath.includes('models')) templateKey = 'models';
    else if (dirPath.includes('routes')) templateKey = 'routes';
    else if (dirPath.includes('pages')) templateKey = 'pages';
    else if (dirPath.includes('components')) templateKey = 'components';
    else if (dirPath.includes('services')) templateKey = 'services';
    else if (dirPath.includes('backend')) templateKey = 'backend';
    else if (dirPath.includes('frontend')) templateKey = 'frontend';

    const template = CONTEXT_TEMPLATES[templateKey] || CONTEXT_TEMPLATES['default'];
    const content = template(dirName);

    const outputPath = path.join(fullPath, 'blackbox.md');
    fs.writeFileSync(outputPath, content);
    console.log(`✅ blackbox.md generado en: ${outputPath}`);
  });
}

generateBlackboxFiles();