import { TypeAuth } from "@/api/authentication/authenticationDto";
import { PoolConnection } from "@/infrastructure/database/connections/pool-connection";
import {
  accountsTable,
  authenticationTable,
  companiesTable,
  rolesTable,
  usersTable,
} from "@/infrastructure/database/drizzle/schema";
import { generateUUid } from "@/shared/utils/security";
import { confirm, input, select } from "@inquirer/prompts";
import dayjs from "dayjs";
import { eq } from "drizzle-orm";

type Database = ReturnType<PoolConnection["mysql"]>;

// ============================================================================
// ANSI Color & Terminal Styling Helpers
// ============================================================================
const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",

  // Foreground Colors
  cyan: "\x1b[36m",
  brightCyan: "\x1b[96m",
  green: "\x1b[32m",
  brightGreen: "\x1b[92m",
  yellow: "\x1b[33m",
  brightYellow: "\x1b[93m",
  blue: "\x1b[34m",
  brightBlue: "\x1b[94m",
  magenta: "\x1b[35m",
  brightMagenta: "\x1b[95m",
  red: "\x1b[31m",
  brightRed: "\x1b[91m",
  white: "\x1b[97m",
  gray: "\x1b[90m",

  // Background Colors
  bgCyan: "\x1b[46m",
  bgBlue: "\x1b[44m",
  bgGreen: "\x1b[42m",
  bgRed: "\x1b[41m",
};

// UI Layout Components
const ui = {
  banner: () => {
    console.clear();
    console.log(`
${c.brightCyan}${c.bold}  ███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗
  ████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝
  ██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗
  ██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║
  ██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║
  ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝${c.reset}
  ${c.dim}─────────────────────────────────────────────────────────────────${c.reset}
  ${c.bold}${c.white}NEXUS CORE${c.reset} ${c.gray}•${c.reset} ${c.cyan}Asistente de Inicialización de Base de Datos${c.reset}
  ${c.gray}Configuración inicial del sistema: Empresa, Administrador y Acceso${c.reset}
  ${c.dim}─────────────────────────────────────────────────────────────────${c.reset}
`);
  },

  stepHeader: (step: number, total: number, title: string, description: string) => {
    console.log(`\n${c.cyan}╭─${c.reset} ${c.bold}${c.bgCyan}${c.white} PASO ${step}/${total} ${c.reset} ${c.bold}${c.brightCyan}${title}${c.reset}`);
    console.log(`${c.cyan}│${c.reset}  ${c.dim}${description}${c.reset}`);
    console.log(`${c.cyan}╰────────────────────────────────────────────────────────────────${c.reset}\n`);
  },

  info: (msg: string) => {
    console.log(`  ${c.cyan}ℹ${c.reset} ${c.dim}${msg}${c.reset}`);
  },

  success: (msg: string) => {
    console.log(`  ${c.brightGreen}✔${c.reset} ${c.bold}${msg}${c.reset}`);
  },

  warning: (msg: string) => {
    console.log(`  ${c.brightYellow}⚠${c.reset} ${c.yellow}${msg}${c.reset}`);
  },

  error: (msg: string) => {
    console.log(`  ${c.brightRed}✖${c.reset} ${c.red}${msg}${c.reset}`);
  },

  action: (msg: string) => {
    console.log(`  ${c.brightCyan}⚙${c.reset}  ${c.dim}${msg}${c.reset}`);
  },
};

// Input validation helpers
const isValidEmail = (val: string): boolean | string => {
  const clean = val.trim();
  if (!clean) return "El correo electrónico es obligatorio.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(clean)
    ? true
    : "Por favor ingrese un correo válido (ej: admin@empresa.com).";
};

const isNonEmpty = (fieldName: string) => (val: string): boolean | string => {
  return val.trim().length > 0
    ? true
    : `${fieldName} es un campo obligatorio.`;
};

// ============================================================================
// Main Initialization Orchestrator
// ============================================================================
export const initDatabase = async () => {
  ui.banner();

  // 1. Recolección interactiva de datos (Paso a paso)
  const companyData = await promptCompanyData();
  const userData = await promptUserData(companyData.email);
  const accountData = await promptAccountData(userData.firstName, userData.lastName, userData.email);
  const authData = await promptAuthData();

  // 2. Pantalla de confirmación y revisión previa
  renderSummaryCard(companyData, userData, accountData, authData);

  const proceed = await confirm({
    message: "¿Deseas aplicar estos cambios e inicializar la base de datos?",
    default: true,
  });

  if (!proceed) {
    console.log(`\n${c.yellow}⚠ Operación cancelada por el usuario. No se guardaron cambios en la base de datos.${c.reset}\n`);
    return;
  }

  // 3. Ejecución y guardado en base de datos
  console.log(`\n${c.bold}${c.brightCyan}─────────────────────────────────────────────────────────────────${c.reset}`);
  console.log(`${c.bold}${c.brightCyan}  APLICANDO CAMBIOS EN LA BASE DE DATOS...${c.reset}`);
  console.log(`${c.bold}${c.brightCyan}─────────────────────────────────────────────────────────────────${c.reset}\n`);

  const db = new PoolConnection().mysql();

  try {
    // 3.1 Guardar compañía
    ui.action("[1/5] Guardando información de la compañía...");
    const companyId = await insertCompany(db, companyData);
    ui.success(`Compañía creada exitosamente [ID: #${companyId}]`);

    // 3.2 Guardar usuario
    ui.action("[2/5] Registrando usuario administrador...");
    const userId = await insertUser(db, userData, companyId);
    ui.success(`Usuario administrador registrado [ID: #${userId}]`);

    // 3.3 Rol Super Administrador
    ui.action("[3/5] Verificando rol de Super Administrador...");
    const { roleId, wasCreated } = await resolveRoleSuperAdmin(db);
    ui.success(
      wasCreated
        ? `Rol 'Super Administrador' creado [ID: #${roleId}]`
        : `Rol 'Super Administrador' existente reutilizado [ID: #${roleId}]`,
    );

    // 3.4 Guardar cuenta
    ui.action("[4/5] Creando cuenta de acceso al sistema...");
    const accountId = await insertAccount(db, accountData, userId, roleId);
    ui.success(`Cuenta de acceso vinculada exitosamente [ID: #${accountId}]`);

    // 3.5 Esquema de autenticación
    ui.action(`[5/5] Configurando esquema de autenticación (${authData.typeAuth})...`);
    await insertAuthentication(db, accountId, authData.typeAuth);
    ui.success(`Esquema de autenticación configurado exitosamente`);

    // 4. Pantalla final de éxito
    renderSuccessDashboard({
      companyId,
      companyName: companyData.name,
      userId,
      userFullName: `${userData.firstName} ${userData.lastName}`,
      accountId,
      username: accountData.username,
      accountEmail: accountData.email,
      roleId,
      typeAuth: authData.typeAuth,
    });
  } catch (error: any) {
    renderErrorCard(error);
    throw error;
  } finally {
    await db.$client.end();
  }
};

// Alias para retrocompatibilidad con versiones anteriores
export const initDabase = initDatabase;

// ============================================================================
// Interactive Prompt Steps
// ============================================================================

interface CompanyPromptResult {
  name: string;
  taxId: string;
  contactPerson: string;
  email: string;
  address?: string;
  phone?: string;
  expiresAt: Date;
}

const promptCompanyData = async (): Promise<CompanyPromptResult> => {
  ui.stepHeader(
    1,
    4,
    "Información de la Compañía",
    "Registra la entidad u organización matriz del sistema",
  );

  const name = (
    await input({
      message: "Nombre o razón social de la compañía:",
      validate: isNonEmpty("El nombre de la compañía"),
    })
  ).trim();

  const taxId = (
    await input({
      message: "NIT o Identificación fiscal (Tax ID):",
      validate: isNonEmpty("El NIT/Tax ID"),
    })
  ).trim();

  const contactPerson = (
    await input({
      message: "Persona o contacto principal:",
      validate: isNonEmpty("El nombre del contacto"),
    })
  ).trim();

  const email = (
    await input({
      message: "Correo electrónico oficial de la compañía:",
      validate: isValidEmail,
    })
  ).trim();

  const address = (
    await input({
      message: "Dirección fiscal (opcional):",
    })
  ).trim();

  const phone = (
    await input({
      message: "Teléfono de contacto de la compañía (opcional):",
    })
  ).trim();

  // Vigencia por defecto: 1 mes calendario a partir de hoy
  const expiresAt = dayjs().add(1, "month").toDate();

  return {
    name,
    taxId,
    contactPerson,
    email,
    address: address || undefined,
    phone: phone || undefined,
    expiresAt,
  };
};

interface UserPromptResult {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const promptUserData = async (companyEmail: string): Promise<UserPromptResult> => {
  ui.stepHeader(
    2,
    4,
    "Usuario Administrador Principal",
    "Crea el perfil del administrador asignado a la empresa",
  );

  const firstName = (
    await input({
      message: "Nombres del usuario:",
      validate: isNonEmpty("El nombre"),
    })
  ).trim();

  const lastName = (
    await input({
      message: "Apellidos del usuario:",
      validate: isNonEmpty("El apellido"),
    })
  ).trim();

  const email = (
    await input({
      message: "Correo electrónico del usuario:",
      default: companyEmail,
      validate: isValidEmail,
    })
  ).trim();

  const phone = (
    await input({
      message: "Teléfono móvil del usuario:",
      validate: isNonEmpty("El teléfono móvil"),
    })
  ).trim();

  return {
    firstName,
    lastName,
    email,
    phone,
  };
};

interface AccountPromptResult {
  username: string;
  email: string;
}

const promptAccountData = async (
  firstName: string,
  lastName: string,
  userEmail: string,
): Promise<AccountPromptResult> => {
  ui.stepHeader(
    3,
    4,
    "Cuenta de Acceso y Credenciales",
    "Configura el usuario de acceso al sistema con privilegios administrativos",
  );

  const suggestedUsername = (
    `${firstName.toLowerCase().replace(/\s+/g, "")}.${lastName.toLowerCase().replace(/\s+/g, "")}` || "admin"
  ).replace(/[^a-z0-9._-]/g, "");

  const username = (
    await input({
      message: "Nombre de usuario para iniciar sesión:",
      default: suggestedUsername || "admin",
      validate: isNonEmpty("El nombre de usuario"),
    })
  ).trim();

  const email = (
    await input({
      message: "Correo electrónico asociado a la cuenta de login:",
      default: userEmail,
      validate: isValidEmail,
    })
  ).trim();

  return {
    username,
    email,
  };
};

interface AuthPromptResult {
  typeAuth: TypeAuth;
}

const promptAuthData = async (): Promise<AuthPromptResult> => {
  ui.stepHeader(
    4,
    4,
    "Seguridad y Método de Autenticación",
    "Selecciona el mecanismo de autenticación para esta cuenta",
  );

  const typeAuth = await select<TypeAuth>({
    message: "Selecciona el método de autenticación preferido:",
    choices: [
      {
        name: "EMAIL_OTP_MFA — Códigos OTP por correo (Recomendado)",
        value: "EMAIL_OTP_MFA",
        description: "Envía un código de un solo uso (OTP) al correo del usuario al ingresar",
      },
      {
        name: "EMAIL_PASSWORD — Correo y contraseña tradicional",
        value: "EMAIL_PASSWORD",
        description: "Inicio de sesión clásico mediante correo y clave hash",
      },
      {
        name: "USERNAME_PASSWORD — Usuario y contraseña tradicional",
        value: "USERNAME_PASSWORD",
        description: "Inicio de sesión clásico mediante username y clave hash",
      },
      {
        name: "USERNAME_OTP_MFA — Código OTP vinculado al usuario",
        value: "USERNAME_OTP_MFA",
        description: "Autenticación multifactor vinculada al nombre de usuario",
      },
    ],
    default: "EMAIL_OTP_MFA",
  });

  return { typeAuth };
};

// ============================================================================
// Summary & Dashboard Views
// ============================================================================

const renderSummaryCard = (
  company: CompanyPromptResult,
  user: UserPromptResult,
  account: AccountPromptResult,
  auth: AuthPromptResult,
) => {
  const expiresFormatted = dayjs(company.expiresAt).format("DD/MM/YYYY HH:mm");

  console.log(`\n${c.cyan}╭──────────────────────────────────────────────────────────────────╮${c.reset}`);
  console.log(`${c.cyan}│${c.reset}  ${c.bold}${c.white}📋 RESUMEN DE LA CONFIGURACIÓN INICIAL${c.reset}                          ${c.cyan}│${c.reset}`);
  console.log(`${c.cyan}├──────────────────────────────────────────────────────────────────┤${c.reset}`);
  console.log(`${c.cyan}│${c.reset}  ${c.bold}${c.brightCyan}🏢 Compañía:${c.reset}`);
  console.log(`${c.cyan}│${c.reset}     • Razón Social:  ${c.white}${company.name}${c.reset}`);
  console.log(`${c.cyan}│${c.reset}     • NIT / Tax ID:  ${c.white}${company.taxId}${c.reset}`);
  console.log(`${c.cyan}│${c.reset}     • Contacto:      ${c.white}${company.contactPerson}${c.reset}`);
  console.log(`${c.cyan}│${c.reset}     • Correo:        ${c.white}${company.email}${c.reset}`);
  console.log(`${c.cyan}│${c.reset}     • Dirección:     ${c.dim}${company.address || "No especificada"}${c.reset}`);
  console.log(`${c.cyan}│${c.reset}     • Teléfono:      ${c.dim}${company.phone || "No especificado"}${c.reset}`);
  console.log(`${c.cyan}│${c.reset}     • Vigencia:      ${c.yellow}1 mes (Hasta ${expiresFormatted})${c.reset}`);
  console.log(`${c.cyan}│${c.reset}`);
  console.log(`${c.cyan}│${c.reset}  ${c.bold}${c.brightCyan}👤 Administrador:${c.reset}`);
  console.log(`${c.cyan}│${c.reset}     • Nombre:        ${c.white}${user.firstName} ${user.lastName}${c.reset}`);
  console.log(`${c.cyan}│${c.reset}     • Correo:        ${c.white}${user.email}${c.reset}`);
  console.log(`${c.cyan}│${c.reset}     • Teléfono:      ${c.white}${user.phone}${c.reset}`);
  console.log(`${c.cyan}│${c.reset}`);
  console.log(`${c.cyan}│${c.reset}  ${c.bold}${c.brightCyan}🛡️  Acceso y Seguridad:${c.reset}`);
  console.log(`${c.cyan}│${c.reset}     • Usuario:       ${c.brightGreen}${account.username}${c.reset}`);
  console.log(`${c.cyan}│${c.reset}     • Correo login:  ${c.white}${account.email}${c.reset}`);
  console.log(`${c.cyan}│${c.reset}     • Rol:           ${c.brightYellow}Super Administrador (Scope: SYSTEM)${c.reset}`);
  console.log(`${c.cyan}│${c.reset}     • Autenticación: ${c.magenta}${auth.typeAuth}${c.reset}`);
  console.log(`${c.cyan}╰──────────────────────────────────────────────────────────────────╯${c.reset}\n`);
};

interface SuccessDashboardParams {
  companyId: number;
  companyName: string;
  userId: number;
  userFullName: string;
  accountId: number;
  username: string;
  accountEmail: string;
  roleId: number;
  typeAuth: TypeAuth;
}

const renderSuccessDashboard = (params: SuccessDashboardParams) => {
  console.log(`\n${c.green}╭──────────────────────────────────────────────────────────────────╮${c.reset}`);
  console.log(`${c.green}│${c.reset}  ${c.bold}${c.brightGreen}✨ ¡BASE DE DATOS INICIALIZADA EXITOSAMENTE!${c.reset}                    ${c.green}│${c.reset}`);
  console.log(`${c.green}├──────────────────────────────────────────────────────────────────┤${c.reset}`);
  console.log(`${c.green}│${c.reset}  ${c.bold}${c.white}Detalles de los registros creados:${c.reset}`);
  console.log(`${c.green}│${c.reset}  ✦ Compañía:      ${c.white}${params.companyName}${c.reset} ${c.dim}[ID: #${params.companyId}]${c.reset}`);
  console.log(`${c.green}│${c.reset}  ✦ Usuario Admin: ${c.white}${params.userFullName}${c.reset} ${c.dim}[ID: #${params.userId}]${c.reset}`);
  console.log(`${c.green}│${c.reset}  ✦ Cuenta Login:  ${c.brightGreen}${params.username}${c.reset} (${params.accountEmail}) ${c.dim}[ID: #${params.accountId}]${c.reset}`);
  console.log(`${c.green}│${c.reset}  ✦ Rol Asignado:  ${c.brightYellow}Super Administrador${c.reset} ${c.dim}[ID: #${params.roleId}]${c.reset}`);
  console.log(`${c.green}│${c.reset}  ✦ Método Auth:   ${c.magenta}${params.typeAuth}${c.reset}`);
  console.log(`${c.green}├──────────────────────────────────────────────────────────────────┤${c.reset}`);
  console.log(`${c.green}│${c.reset}  ${c.bold}${c.brightCyan}🚀 Siguientes pasos recomendados:${c.reset}`);
  console.log(`${c.green}│${c.reset}  ${c.dim}1.${c.reset} Inicia el servidor de desarrollo:`);
  console.log(`${c.green}│${c.reset}     ${c.bold}${c.brightGreen}bun run dev${c.reset}  ${c.dim}(o npm run dev)${c.reset}`);
  console.log(`${c.green}│${c.reset}  ${c.dim}2.${c.reset} Si necesitas configurar reglas de permisos RBAC:`);
  console.log(`${c.green}│${c.reset}     ${c.bold}${c.brightCyan}bun run casbin${c.reset}`);
  console.log(`${c.green}│${c.reset}  ${c.dim}3.${c.reset} Inicia sesión con el usuario ${c.bold}${params.username}${c.reset}`);
  console.log(`${c.green}╰──────────────────────────────────────────────────────────────────╯${c.reset}\n`);
};

const renderErrorCard = (error: any) => {
  console.log(`\n${c.red}╭──────────────────────────────────────────────────────────────────╮${c.reset}`);
  console.log(`${c.red}│${c.reset}  ${c.bold}${c.brightRed}✖ ERROR AL INICIALIZAR LA BASE DE DATOS${c.reset}                         ${c.red}│${c.reset}`);
  console.log(`${c.red}├──────────────────────────────────────────────────────────────────┤${c.reset}`);
  console.log(`${c.red}│${c.reset}  ${c.white}Causa reportada:${c.reset}`);
  console.log(`${c.red}│${c.reset}  ${c.brightRed}${error?.message || error}${c.reset}`);

  if (error?.code === "ECONNREFUSED") {
    console.log(`${c.red}│${c.reset}`);
    console.log(`${c.red}│${c.reset}  ${c.yellow}💡 Sugerencia:${c.reset}`);
    console.log(`${c.red}│${c.reset}  • El motor MySQL no está respondiendo en el puerto configurado.`);
    console.log(`${c.red}│${c.reset}  • Verifica que el servicio MySQL esté iniciado.`);
    console.log(`${c.red}│${c.reset}  • Revisa el archivo .env (DATABASE_HOST, DATABASE_PORT).`);
  } else if (error?.code === "ER_DUP_ENTRY") {
    console.log(`${c.red}│${c.reset}`);
    console.log(`${c.red}│${c.reset}  ${c.yellow}💡 Sugerencia:${c.reset}`);
    console.log(`${c.red}│${c.reset}  • Ya existe un registro con ese correo electrónico o username.`);
    console.log(`${c.red}│${c.reset}  • Utiliza un correo o nombre de usuario diferente.`);
  }

  console.log(`${c.red}╰──────────────────────────────────────────────────────────────────╯${c.reset}\n`);
};

// ============================================================================
// Database Persistence Layer
// ============================================================================

const insertCompany = async (db: Database, data: CompanyPromptResult): Promise<number> => {
  const [result] = await db.insert(companiesTable).values({
    name: data.name,
    taxId: data.taxId,
    contactPerson: data.contactPerson,
    email: data.email,
    address: data.address,
    phone: data.phone,
    expiresAt: data.expiresAt,
  });

  return result.insertId;
};

const insertUser = async (
  db: Database,
  data: UserPromptResult,
  companyId: number,
): Promise<number> => {
  const [result] = await db.insert(usersTable).values({
    companyId,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
  });

  return result.insertId;
};

const resolveRoleSuperAdmin = async (
  db: Database,
): Promise<{ roleId: number; wasCreated: boolean }> => {
  // Evitar duplicar el rol si ya existe en la base de datos
  const existingRole = await db
    .select({ id: rolesTable.id })
    .from(rolesTable)
    .where(eq(rolesTable.role, "Super Administrador"))
    .limit(1);

  if (existingRole[0]) {
    return { roleId: existingRole[0].id, wasCreated: false };
  }

  const [result] = await db.insert(rolesTable).values({
    role: "Super Administrador",
    scope: "SYSTEM",
  });

  return { roleId: result.insertId, wasCreated: true };
};

const insertAccount = async (
  db: Database,
  data: AccountPromptResult,
  userId: number,
  roleId: number,
): Promise<number> => {
  const [result] = await db.insert(accountsTable).values({
    userId,
    roleId,
    username: data.username,
    email: data.email,
  });

  return result.insertId;
};

const insertAuthentication = async (
  db: Database,
  accountId: number,
  typeAuth: TypeAuth,
): Promise<void> => {
  const secretKeyOTP = generateUUid();

  await db.insert(authenticationTable).values({
    accountId,
    typeAuth,
    secretKeyOTP,
  });
};

// ============================================================================
// CLI Execution Entrypoint
// ============================================================================
try {
  await initDatabase();
} catch (error: any) {
  // Salida limpia si el usuario interrumpe el prompt con Ctrl+C
  if (
    error?.name === "ExitPromptError" ||
    error?.message?.includes("force closed")
  ) {
    console.log(`\n${c.yellow}⚠ Proceso interrumpido por el usuario.${c.reset}\n`);
    process.exit(0);
  }

  process.exitCode = 1;
}

