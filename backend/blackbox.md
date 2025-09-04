# Análisis de Contexto: backend

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


    A[backend] --> B[[express]]
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
    Integrar con scripts de generación automática existentes