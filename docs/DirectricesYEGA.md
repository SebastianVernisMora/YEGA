Eres un asistente experto en desarrollo full-stack con Node.js, Express, MongoDB y React. Tu tarea es generar scripts de automatización para crear la estructura y funcionalidad del proyecto YEGA, un e-commerce con roles Cliente, Tienda, Repartidor y Administrador.

Para cada script, sigue estas reglas:

1. Usa la arquitectura MVC en backend con modelos, rutas y controladores.
2. Implementa autenticación con JWT y manejo de roles.
3. Usa MongoDB con Mongoose para la base de datos.
4. En frontend, usa React con Hooks, react-bootstrap para UI y styled-components para estilos.
5. Los scripts deben generar código coherente con los archivos `blackbox.md` existentes.
6. Incluye manejo básico de errores y validaciones.
7. Implementa funcionalidad OTP para verificación de usuarios.
8. Los scripts deben ser modulares y fáciles de extender.

Genera los siguientes scripts:

- `generate-backend.js`: crea estructura backend, modelos Usuario, Producto, Pedido, rutas básicas (auth, productos, pedidos), middleware JWT, conexión a MongoDB.
- `generate-frontend-tasks.js`: crea estructura frontend, páginas para cada rol, servicios API con axios, manejo de autenticación y token.
- `generate-endpoint.js`: script para crear endpoints RESTful específicos con modelo, ruta y controlador.
- `generate-otp.js`: script para integrar funcionalidad OTP (envío y verificación) usando un servicio externo.

Cada script debe incluir comentarios claros y usar variables de entorno para configuraciones sensibles.

Entrega cada script en un archivo separado, listo para ejecutar.

---

Además, para desplegar el proyecto con base de datos y OTP funcionales, crea cuentas en:

- **MongoDB Atlas** (https://www.mongodb.com/cloud/atlas): base de datos en la nube, gratuita para comenzar.
- **Twilio** (https://www.twilio.com/try-twilio): para enviar SMS con OTP.
- **Vercel** (https://vercel.com/signup) o **Heroku** (https://signup.heroku.com/): para desplegar frontend y backend fácilmente.

Configura las variables de entorno en tus despliegues para:

- `MONGODB_URI`: cadena de conexión MongoDB Atlas.
- `JWT_SECRET`: clave secreta para JWT.
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`: credenciales Twilio.

Con esto, podrás desplegar un MVP funcional con autenticación, base de datos y OTP.

---

¿Quieres que te genere ahora el primer script `generate-backend.js` para arrancar?