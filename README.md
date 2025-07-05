# certificacion-metodologias-modelos-ifrs9

Este repositorio contiene una herramienta sencilla para la certificación y aprobación de metodologías y modelos IFRS 9. Está pensada como un prototipo ligero que puede ejecutarse en cualquier navegador sin dependencias adicionales.

## Estructura del proyecto

- `src/index.html` interfaz principal de la aplicación.
- `src/styles.css` estilos básicos.
- `src/app.js` lógica de la herramienta (almacenamiento en _localStorage_).

## Cómo usar

1. Abrir el archivo `src/index.html` en un navegador moderno.
2. Seleccionar el rol con el que desea ingresar (Analista, Supervisor, Gerente o VP).
3. Según el rol se habilitan distintas acciones:
   - **Analista**: puede registrar nuevas solicitudes completando el checklist predefinido.
   - **Supervisor**: revisa solicitudes en estado *Creado* y puede aprobarlas.
   - **Gerente**: certifica metodologías y envía a precomité.
   - **VP**: realiza la aprobación final.
4. Todas las acciones quedan registradas en un historial interno y el avance se refleja en el tablero principal.

## Exportación de datos

Los datos se guardan localmente en el navegador. Para realizar una copia de seguridad se puede exportar el contenido de `localStorage` a un archivo JSON usando las herramientas del navegador.

## Limitaciones

- Se trata de un prototipo sin autenticación real; el usuario simplemente selecciona el rol.
- La información se almacena localmente, por lo que no hay sincronización entre usuarios.
- La lógica de escalamiento es básica: si una solicitud permanece más de 24 horas sin avance se marca como escalada automáticamente.

Este ejemplo sirve como base para implementar una solución más completa en plataformas de bajo código o integraciones con Office 365.
