# 🚀 Plataforma de Encuestas SaaS - Backend

Backend serverless para una plataforma de encuestas con analíticas en tiempo real. Construido con Node.js, AWS Lambda, DynamoDB y AppSync.

## Arquitectura

El proyecto sigue una arquitectura **MVC desacoplada** y utiliza **Dependency Injection (DIP)** para facilitar el mantenimiento y las pruebas. Se organiza como un Monorepo usando **NPM Workspaces**.

### Estructura de Carpetas

- `functions/`: Contiene las funciones Lambda independientes.
  - `admin-survey/`: Gestión de encuestas (CRUD), preguntas y obtención de resultados.
  - `analyze-survey/`: Procesamiento de analíticas disparado por DynamoDB Streams. Envía actualizaciones en tiempo real a AppSync.
  - `process-response/`: Ingestión de respuestas de usuarios y consulta de historial por email.
- `shared/`: Código compartido entre Lambdas (tipos, repositorios base, validadores, clientes DB).

## Requisitos de Infraestructura (AWS)

### DynamoDB Tables

1. **`surveys`**:
   - Partition Key: `surveyId` (String)
2. **`surveys-response`**:
   - Partition Key: `responseId` (String)
   - GSI `surveyId-index`: Partition Key `surveyId`
   - GSI `UserEmailIndex`: Partition Key `userEmail`
3. **`surveys-analytics`**:
   - Partition Key: `surveyId` (String)
   - Sort Key: `questionId` (String)

### AppSync GraphQL

El backend utiliza AppSync para notificaciones en tiempo real (Subscriptions). El esquema se encuentra en `schema.graphql`.
- Requiere un Data Source tipo **None** para la mutación `updateSurveyResult`.

## Variables de Entorno

Cada Lambda requiere las siguientes variables configuradas:

- `SURVEYS_TABLE`: Nombre de la tabla de encuestas.
- `SURVEYS_RESPONSE_TABLE`: Nombre de la tabla de respuestas.
- `SURVEYS_ANALYTICS_TABLE`: Nombre de la tabla de analíticas.
- `APPSYNC_API_URL`: URL del endpoint de AppSync (solo para `analyze-survey`).
- `APPSYNC_API_KEY`: API Key de AppSync (solo para `analyze-survey`).

## 🚀 Instalación y Configuración local

### Requisitos previos
- Node.js (v20 o superior)
- NPM (v10 o superior)
- AWS CLI configurado

### Pasos para comenzar
1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/jessusvelasquez/SaaSSurveyBackEnd.git
   cd SaaSSurveyBackEnd
   ```

2. **Instalar dependencias del Monorepo:**
   ```bash
   npm install
   ```

3. **Configurar el entorno:**
   Cada Lambda en `functions/` puede requerir sus propias variables de entorno en AWS, pero para el desarrollo local y empaquetado, asegúrate de tener los nombres de las tablas correctos.

### Construcción y Despliegue

El proyecto utiliza **NPM Workspaces** para gestionar las múltiples Lambdas.
```bash
npm run build
```

### Empaquetado
Genera un archivo `function.zip` en cada carpeta de función listo para subir a AWS.
```bash
npm run package
```

## Patrones de Implementación

Como decisión de diseño para demostrar versatilidad técnica, este proyecto implementa el patrón MVC utilizando dos enfoques distintos:

1. **Enfoque Funcional (Lambda `admin-survey`):** Utiliza funciones puras y constantes exportadas. Es un patrón ligero que minimiza el overhead de inicialización en Lambdas.
2. **Enfoque Orientado a Objetos (Lambdas `process-response` y `analyze-survey`):** Utiliza clases y constructores para una Inyección de Dependencias (DI) más explícita, siguiendo principios de SOLID.

Ambos enfoques respetan estrictamente la **Separación de Responsabilidades (SoC)** y la **Arquitectura Limpia**.

---
Desarrollado por Jessus Velasquez.
