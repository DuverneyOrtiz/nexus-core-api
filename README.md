# 🚀 nexus-core-node

> **API REST & Core Backend** modular de alto rendimiento construido con **[Bun](https://bun.sh/)**, **[TypeScript](https://www.typescriptlang.org/)**, **[Express 5](https://expressjs.com/)** y **[Drizzle ORM](https://orm.drizzle.team/)**.

Diseñado para soportar múltiples modelos de negocio (**B2B**, **B2C**, **Suscripción + Trial**, **Híbrido** y **Personalizado**), con arquitectura desacoplada por capas, soporte multi-motor de base de datos (**MySQL**, **PostgreSQL**, **Supabase**, **Neon**), autenticación robusta mediante firmas asimétricas JWT, MFA vía email con **[Brevo](https://www.brevo.com/)** y asistentes CLI interactivos para configuración y seeding.

---

## 📑 Tabla de Contenidos

- [✨ Características](#-características)
- [🛠️ Stack Tecnológico](#️-stack-tecnológico)
- [📋 Requisitos Previos](#-requisitos-previos)
- [🚀 Instalación y Configuración Paso a Paso](#-instalación-y-configuración-paso-a-paso)
  - [1. Clonar el repositorio](#1-clonar-el-repositorio)
  - [2. Instalar dependencias con Bun](#2-instalar-dependencias-con-bun)
  - [3. Crear la base de datos (vacía)](#3-crear-la-base-de-datos-vacía)
  - [4. Configuración asistida del proyecto (`bun setting`)](#4-configuración-asistida-del-proyecto-bun-setting)
  - [5. Ejecutar las migraciones (`bun migrate`)](#5-ejecutar-las-migraciones-bun-migrate)
  - [6. Configurar datos iniciales (`bun settingDb`)](#6-configurar-datos-iniciales-bun-settingdb)
  - [7. Configurar reglas de autorización Casbin (`bun casbin`)](#7-configurar-reglas-de-autorización-casbin-bun-casbin)
  - [8. Configurar servicio de correo (`BREVO_API_KEY`)](#8-configurar-servicio-de-correo-brevo_api_key)
  - [9. Configurar llaves criptográficas de seguridad (`keys_security`)](#9-configurar-llaves-criptográficas-de-seguridad-keys_security)
- [▶️ Ejecución del Proyecto](#️-ejecución-del-proyecto)
- [🏛️ Arquitectura y Organización del Proyecto](#️-arquitectura-y-organización-del-proyecto)
- [📜 Scripts Disponibles](#-scripts-disponibles)
- [📚 Referencias y Documentación](#-referencias-y-documentación)
- [📄 Licencia](#-licencia)

---

## ✨ Características

- ⚡ **Rendimiento Ultrarrápido:** Potenciado por el runtime de [Bun](https://bun.sh/).
- 🛡️ **Seguridad y Autenticación de Grado Empresarial:**
  - Token JWT firmado con claves asimétricas RSA (`RS256`).
  - Hashing seguro de contraseñas con [Argon2](https://github.com/ranisalt/node-argon2).
  - Autenticación multifactor (MFA) mediante OTP enviado al correo.
  - Protección con [Helmet](https://helmetjs.github.io/) y [CORS](https://github.com/expressjs/cors).
- 🗄️ **Multi-motor & Drizzle ORM:** Compatibilidad nativa con MySQL y PostgreSQL (incluyendo proveedores cloud como Supabase y Neon).
- 🧩 **Modelos de Negocio Adaptables:** Plantillas listas para B2B (empresas/multitenant), B2C, esquemas de prueba/suscripción e híbridos.
- 🧙 **Asistentes CLI Interactivos:**
  - `bun setting`: Selección de modelo de negocio y motor de base de datos con generación automática de esquema y `.env`.
  - `bun settingDb`: Poblado guiado (*seeding*) de empresa inicial, usuario maestro, rol Super Administrador, cuenta y matriz de permisos.
  - `bun casbin`: Creación de la tabla `casbin_rule` y carga de reglas RBAC base para autorización.
- 📧 **Notificaciones Transaccionales:** Integración lista para producción con la API de [Brevo](https://www.brevo.com/).

---

## 🛠️ Stack Tecnológico

| Tecnología | Descripción | Documentación |
| :--- | :--- | :--- |
| **Bun** | Runtime de JavaScript todo-en-uno, gestor de paquetes y bundler de alta velocidad | [bun.sh](https://bun.sh/docs) |
| **TypeScript** | Superset tipado estáticamente para JavaScript | [typescriptlang.org](https://www.typescriptlang.org/docs/) |
| **Express 5** | Framework web rápido, flexible y minimalista para Node.js / Bun | [expressjs.com](https://expressjs.com/en/5x/api.html) |
| **Drizzle ORM** | ORM ligero, tipeado seguro (TypeScript-first) y de alto desempeño | [orm.drizzle.team](https://orm.drizzle.team/) |
| **Drizzle Kit** | Suite de herramientas para generación y ejecución de migraciones SQL | [orm.drizzle.team/kit-docs](https://orm.drizzle.team/kit-docs/overview) |
| **MySQL / PostgreSQL** | Motores de bases de datos relacionales compatibles | [MySQL](https://dev.mysql.com/doc/) / [PostgreSQL](https://www.postgresql.org/docs/) |
| **Casbin** | Motor de autorización RBAC/ABAC para validar permisos por rol, recurso y acción | [casbin.org](https://casbin.org/docs/overview) |
| **Brevo (Sendinblue)** | Plataforma de envío de correos transaccionales y códigos OTP | [developers.brevo.com](https://developers.brevo.com/) |
| **Argon2** | Algoritmo de hash de contraseñas ganador de la Password Hashing Competition | [github.com/ranisalt/node-argon2](https://github.com/ranisalt/node-argon2) |
| **Inquirer Prompts** | Colección interactiva de prompts para consolas CLI | [github.com/SBoudrias/Inquirer.js](https://github.com/SBoudrias/Inquirer.js) |

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de contar con las siguientes herramientas instaladas en tu entorno:

1. **[Bun](https://bun.sh/)** (versión 1.0 o superior).
   - En macOS / Linux / WSL:
     ```bash
     curl -fsSL https://bun.sh/install | bash
     ```
   - En Windows (PowerShell):
     ```powershell
     powershell -c "irm bun.sh/install.ps1 | iex"
     ```
2. **Motor de Base de Datos** instalado localmente o una instancia remota/cloud:
   - [MySQL](https://www.mysql.com/) (v8.0+)
   - O [PostgreSQL](https://www.postgresql.org/) (v14+) / [Neon](https://neon.tech/) / [Supabase](https://supabase.com/)
3. **Cuenta en [Brevo](https://www.brevo.com/)** (para obtener tu API Key y enviar correos transaccionales).

---

## 🚀 Instalación y Configuración Paso a Paso

Sigue estos pasos para dejar el proyecto 100% operativo en tu entorno local:

### 1. Clonar el repositorio

Descarga el código fuente del proyecto desde GitHub y accede al directorio:

```bash
git clone https://github.com/DuverneyOrtiz/nexus-core-node.git
cd nexus-core-node
```

---

### 2. Instalar dependencias con Bun

Instala todas las dependencias necesarias ejecutando:

```bash
bun install
```

> [!TIP]
> Bun utiliza un caché global ultrarrápido, por lo que la instalación toma solo un par de segundos.

---

### 3. Crear la base de datos (vacía)

Crea una base de datos limpia en tu gestor preferido (local o en la nube). 

> [!IMPORTANT]
> **Crea únicamente la base de datos vacía, sin tablas ni esquemas.**  
> Más adelante, Drizzle Kit creará toda la estructura de tablas, tipos y relaciones de forma automática según el modelo de negocio que selecciones.

**Ejemplo en MySQL:**
```sql
CREATE DATABASE nexus_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Ejemplo en PostgreSQL:**
```sql
CREATE DATABASE nexus_db;
```

---

### 4. Configuración asistida del proyecto (`bun setting`)

Ejecuta el asistente interactivo de configuración inicial:

```bash
bun setting
```

El script [`src/scripts/cli.ts`](file:///g:/PLAN%20DE%20TRABAJO/nexus-core-node/src/scripts/cli.ts) te guiará en pantalla preguntando:

1. 🎯 **Modelo de Negocio:**
   - `B2B - Vigencia por compañías`
   - `B2C - Vigencia por usuarios`
   - `Suscripción + Trial`
   - `Modelo híbrido`
   - `Personalizado`
2. 🗄️ **Motor de Base de Datos:**
   - `MySQL`
   - `PostgreSQL` *(permite elegir el proveedor: PostgreSQL nativo, Supabase o Neon)*.
3. 🔑 **Credenciales y conexión:**
   - Host, puerto, nombre de la base de datos, usuario, contraseña y URL de conexión.

**¿Qué hace este comando automáticamente?**
- Copia la plantilla correspondiente del modelo seleccionado hacia `src/infrastructure/database/drizzle/schema.ts`.
- Genera el archivo de variables de entorno `.env` en la raíz con la configuración ingresada.

---

### 5. Ejecutar las migraciones (`bun migrate`)

Una vez definido el esquema y las credenciales de conexión, ejecuta la migración para aplicar el esquema sobre tu base de datos vacía:

```bash
bun migrate
```

Este comando ejecuta internamente:
1. `bunx drizzle-kit generate`: Lee tu archivo `schema.ts` y genera los archivos de migración SQL en `src/infrastructure/database/drizzle/migrations/`.
2. `bunx drizzle-kit migrate`: Aplica los archivos SQL pendientes directamente sobre la base de datos.

---

### 6. Configurar datos iniciales (`bun settingDb`)

Ahora que las tablas existen en la base de datos, inicializa los datos maestros y de seguridad del sistema:

```bash
bun settingDb
```

El script [`src/scripts/initDatabase.ts`](file:///g:/PLAN%20DE%20TRABAJO/nexus-core-node/src/scripts/initDatabase.ts) solicitará interactivamente:

- 🏢 **Información de la Compañía:** Nombre, NIT/Tax ID, persona de contacto, email, dirección y teléfono.
- 👤 **Información del Usuario Administrador:** Nombre, apellido, email y teléfono.
- 🔐 **Información de la Cuenta:** Nombre de usuario y correo para iniciar sesión.

**El script creará automáticamente:**
- La compañía y el usuario principal.
- El rol **Super Administrador** asignado a la compañía.
- La cuenta de acceso ligada al usuario y rol.
- La matriz de permisos base (operaciones `search`, `create`, `update`, `delete` sobre los módulos `account`, `company`, `permission`, `rol` y `user`).
- El método de autenticación por defecto (`EMAIL_OTP_MFA`).

---

### 7. Configurar reglas de autorización Casbin (`bun casbin`)

Después de crear los datos iniciales, registra las reglas base de autorización RBAC utilizadas por los middlewares de permisos:

```bash
bun casbin
```

El script [`src/scripts/casbi_rules.ts`](file:///g:/PLAN%20DE%20TRABAJO/nexus-core-node/src/scripts/casbi_rules.ts) crea la tabla `casbin_rule` si no existe y carga las políticas definidas en [`src/scripts/rbac.ts`](file:///g:/PLAN%20DE%20TRABAJO/nexus-core-node/src/scripts/rbac.ts).

> [!IMPORTANT]
> Ejecuta este paso después de `bun settingDb`, porque las reglas de Casbin complementan los roles y permisos iniciales que ya fueron sembrados en la base de datos.

---

### 8. Configurar servicio de correo (`BREVO_API_KEY`)

Para permitir el envío de correos transaccionales (como el código de un solo uso para autenticación MFA), abre tu archivo `.env` y define los siguientes valores:

```env
# Configuración del proveedor de correo (Brevo)
BREVO_API_KEY="xkeysib-tu_clave_de_api_aqui_..."
NAME_SENDER_EMAIL="Nexus Core Auth"
```

#### Estructura completa de `.env` de referencia:

```env
DATABASE_URL="mysql://usuario:password@localhost:3306/nexus_db"
DATABASE_USER="usuario"
DATABASE_PASSWORD="password"
DATABASE_NAME="nexus_db"
DATABASE_HOST="localhost"
DATABASE_PORT=3306
DATABASE_CONNECTION_LIMIT=10
DATABASE_DIALECT="mysql"

# Correo transaccional (MFA & Notificaciones)
BREVO_API_KEY="tu_api_key_de_brevo"
NAME_SENDER_EMAIL="Nexus Core"

# Opcional (Puerto de la API, por defecto 4000)
PORT=4000
```

> [!NOTE]
> Para obtener tu API Key de Brevo: regístrate en [Brevo](https://www.brevo.com/), ve a **Configuración** > **SMTP y API** > **Claves API** y genera una nueva clave.

---

### 9. Configurar llaves criptográficas de seguridad (`keys_security`)

El núcleo de autenticación en [`src/shared/utils/security.ts`](file:///g:/PLAN%20DE%20TRABAJO/nexus-core-node/src/shared/utils/security.ts) utiliza el algoritmo asimétrico **RS256** para la generación y validación de tokens JWT (`generateAccessToken` y `verifyAccessToken`).

Para que el sistema funcione correctamente, requiere un par de llaves criptográficas en formato `.pem`:
- `keys_security/private_key.pem`: Llave privada RSA para la firma de access tokens.
- `keys_security/public_certificate.pem`: Certificado público X.509 para verificar la firma de los tokens.

> [!WARNING]
> Por directivas estrictas de seguridad, la carpeta `keys_security/` y los archivos `.pem` están listados en el [`.gitignore`](file:///g:/PLAN%20DE%20TRABAJO/nexus-core-node/.gitignore) para **no ser expuestos ni rastreados en el repositorio**.  
> Por tanto, al clonar el proyecto en un nuevo entorno, deberás crear la carpeta y proveer o generar tus propias llaves con los nombres exactos indicados.

#### Generación de llaves para desarrollo local (con OpenSSL):

Si no cuentas con certificados previos, puedes generarlos rápidamente desde tu terminal ejecutando:

```bash
# 1. Crear la carpeta en la raíz del proyecto (si no existe)
mkdir keys_security

# 2. Generar la clave privada RSA (2048 bits)
openssl genrsa -out keys_security/private_key.pem 2048

# 3. Generar el certificado público X.509 autofirmado
openssl req -new -x509 -key keys_security/private_key.pem -out keys_security/public_certificate.pem -days 365 -subj "/CN=nexus-core-auth"
```

> [!IMPORTANT]
> Los archivos deben llamarse **exactamente** `private_key.pem` y `public_certificate.pem` dentro del directorio `keys_security/` en la raíz del proyecto.

---

## ▶️ Ejecución del Proyecto

Una vez completada la instalación y configuración, inicia la aplicación:

### Modo Desarrollo (con recarga en vivo)
```bash
bun run dev
```
> El servidor iniciará por defecto en `http://localhost:4000`.

### Compilar para Producción
```bash
bun run build
```

### Ejecutar en Producción
```bash
bun run start
```

---

## 🏛️ Arquitectura y Organización del Proyecto

El proyecto implementa una arquitectura en capas desacoplada y orientada al dominio, facilitando el mantenimiento, la escalabilidad y las pruebas:

```text
nexus-core-node/
├── src/
│   ├── api/                     # Capa HTTP (Controladores, Rutas, DTOs y Servicios de API)
│   │   ├── accounts/            # Gestión de cuentas de usuario
│   │   ├── auth-method/         # Métodos de autenticación configurados
│   │   ├── authentication/      # Lógica de login, MFA OTP, refresco y verificación
│   │   ├── companies/           # Gestión de compañías / tenants
│   │   ├── permissions/         # Catálogo de permisos
│   │   ├── roles/               # Gestión de roles
│   │   ├── roles_permisos/      # Asignación de roles y permisos
│   │   ├── routes/              # Agrupador principal de rutas de Express
│   │   └── users/               # Gestión de perfiles de usuario
│   ├── infrastructure/          # Detalles técnicos, drivers y servicios externos
│   │   └── database/
│   │       ├── connections/     # Pool de conexiones (MySQL, PostgreSQL, Neon, Supabase)
│   │       └── drizzle/         # Instancia de Drizzle ORM, migraciones y esquema activo
│   ├── shared/                  # Código común reutilizable
│   │   ├── enums/               # Enumeraciones tipadas (códigos HTTP, dialectos, etc.)
│   │   ├── middlewares/         # Middlewares globales (autenticación JWT, guards, etc.)
│   │   └── utils/               # Utilidades de hashing, seguridad RSA, respuestas y Brevo
│   ├── scripts/                 # Scripts CLI interactivos para configuración y seeding
│   │   ├── cli.ts               # Asistente de configuración de esquema y base de datos
│   │   └── initDatabase.ts      # Seeder maestro para datos iniciales
│   ├── app.ts                   # Configuración y middlewares de la aplicación Express
│   └── server.ts                # Entrada principal y arranque del servidor HTTP
├── keys_security/               # Llaves RSA y certificados PEM (ignorado por git)
│   ├── private_key.pem          # Clave privada para firma de tokens JWT (RS256)
│   └── public_certificate.pem   # Certificado público para verificación de tokens
├── templates/                   # Plantillas predefinidas por modelo y motor
│   ├── mysql/                   # Plantillas de esquema (b2b, b2c, trial, etc.) y env para MySQL
│   └── postgres/                # Plantillas de esquema y env para PostgreSQL
├── drizzle.config.ts            # Configuración dinámica de Drizzle Kit
├── tsconfig.json                # Configuración de compilación de TypeScript y path aliases
└── package.json                 # Metadatos, scripts y dependencias
```

---

## 📜 Scripts Disponibles

Puedes ejecutar cualquiera de estos scripts mediante `bun <comando>` o `bun run <comando>`:

| Comando | Descripción |
| :--- | :--- |
| `bun dev` | Inicia el servidor en modo desarrollo con observación de cambios en tiempo real vía `tsx`. |
| `bun build` | Compila el código TypeScript a JavaScript en la carpeta `dist/` resolviendo alias de rutas. |
| `bun start` | Ejecuta la versión compilada en producción (`dist/server.js`). |
| `bun setting` | Ejecuta el asistente interactivo para elegir modelo de negocio, base de datos y generar `.env`. |
| `bun migrate` | Genera los archivos SQL de migración y los aplica en la base de datos con Drizzle Kit. |
| `bun settingDb` | Asistente interactivo para sembrar la compañía inicial, superadministrador, cuenta y permisos. |
| `bun casbin` | Crea la tabla `casbin_rule` si no existe y carga las reglas RBAC base de autorización. |

---

## 📚 Referencias y Documentación

Para profundizar en las tecnologías utilizadas en este proyecto, consulta sus sitios oficiales:

- 📖 **[Documentación de Bun](https://bun.sh/docs)** - Guías sobre el runtime, package manager y APIs nativas.
- 📖 **[Documentación de Drizzle ORM](https://orm.drizzle.team/docs/overview)** - Consultas, esquemas y relaciones.
- 📖 **[Guía de Migraciones con Drizzle Kit](https://orm.drizzle.team/kit-docs/overview)** - Flujo de trabajo de migraciones.
- 📖 **[Documentación de Casbin](https://casbin.org/docs/overview)** - Modelos y políticas de autorización.
- 📖 **[Documentación de Express 5](https://expressjs.com/en/5x/api.html)** - Novedades del router y manejo de peticiones.
- 📖 **[API de Brevo (Sendinblue)](https://developers.brevo.com/)** - Guías para envío de plantillas y correos transaccionales.
- 📖 **[Guía de Seguridad con Argon2](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#argon2id)** - Recomendaciones de OWASP para almacenamiento de contraseñas.

---

## 📄 Licencia

Este proyecto está bajo la licencia privada y de uso exclusivo de **Duverney Ortiz**. Para dudas o sugerencias, abre un issue o envía una solicitud de pull request en el repositorio oficial.
