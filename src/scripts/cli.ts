import { confirm, input, password } from "@inquirer/prompts";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENV_PATH = path.resolve(__dirname, "../../.env");

interface EnvVariables {
  DATABASE_URL: string;
  DATABASE_USER: string;
  DATABASE_PASSWORD: string;
  DATABASE_NAME: string;
  DATABASE_HOST: string;
  DATABASE_PORT: string;
  DATABASE_CONNECTION_LIMIT: string;
  DATABASE_DIALECT: string;
  BREVO_API_KEY: string;
  NAME_SENDER_EMAIL: string;
}

const envExists = async (): Promise<boolean> => {
  try {
    await fs.access(ENV_PATH);
    return true;
  } catch {
    return false;
  }
};

const getExistingEnv = async (): Promise<Record<string, string>> => {
  try {
    const raw = await fs.readFile(ENV_PATH, "utf-8");
    return dotenv.parse(raw);
  } catch {
    return {};
  }
};

const promptEnvVariables = async (
  existing: Record<string, string>,
): Promise<EnvVariables> => {
  const host = await input({
    message: "Ingrese el host de la base de datos:",
    default: existing.DATABASE_HOST || "localhost",
    validate: (val) => (val.trim().length > 0 ? true : "El host es obligatorio."),
  });

  const port = await input({
    message: "Ingrese el número de puerto de la base de datos:",
    default: existing.DATABASE_PORT || "3306",
    validate: (val) =>
      !isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 65535
        ? true
        : "El puerto debe ser un número válido entre 1 y 65535.",
  });

  const user = await input({
    message: "Ingrese el usuario de la base de datos:",
    default: existing.DATABASE_USER || "root",
    validate: (val) => (val.trim().length > 0 ? true : "El usuario es obligatorio."),
  });

  const pass = await password({
    message: existing.DATABASE_PASSWORD
      ? "Ingrese la contraseña de la base de datos (Enter para mantener la actual):"
      : "Ingrese la contraseña de la base de datos:",
    mask: "*",
  });
  const finalPassword = pass !== "" ? pass : (existing.DATABASE_PASSWORD || "");

  const name = await input({
    message: "Ingrese el nombre de la base de datos:",
    default: existing.DATABASE_NAME || "nexus_core_api",
    validate: (val) =>
      val.trim().length > 0 ? true : "El nombre de la base de datos es obligatorio.",
  });

  const connectionLimit = await input({
    message: "Ingrese el límite de conexiones (DATABASE_CONNECTION_LIMIT):",
    default: existing.DATABASE_CONNECTION_LIMIT || "10",
    validate: (val) =>
      !isNaN(Number(val)) && Number(val) > 0
        ? true
        : "El límite de conexiones debe ser un número mayor a 0.",
  });

  const authPart = finalPassword ? `${user}:${finalPassword}` : user;
  const generatedUrl = `mysql://${authPart}@${host}:${port}/${name}`;
  const defaultUrl =
    existing.DATABASE_URL &&
    existing.DATABASE_URL.startsWith("mysql://") &&
    existing.DATABASE_HOST === host &&
    existing.DATABASE_PORT === port &&
    existing.DATABASE_USER === user &&
    existing.DATABASE_NAME === name &&
    existing.DATABASE_PASSWORD === finalPassword
      ? existing.DATABASE_URL
      : generatedUrl;

  const url = await input({
    message: "Ingrese la URL de conexión (DATABASE_URL):",
    default: defaultUrl,
    validate: (val) =>
      val.trim().length > 0 ? true : "La URL de la base de datos es obligatoria.",
  });

  const brevoApiKey = await input({
    message: "Ingrese la API Key de Brevo (BREVO_API_KEY, opcional):",
    default: existing.BREVO_API_KEY || "",
  });

  const nameSenderEmail = await input({
    message: "Ingrese el nombre del remitente de correos (NAME_SENDER_EMAIL, opcional):",
    default: existing.NAME_SENDER_EMAIL || "",
  });

  return {
    DATABASE_URL: url,
    DATABASE_USER: user,
    DATABASE_PASSWORD: finalPassword,
    DATABASE_NAME: name,
    DATABASE_HOST: host,
    DATABASE_PORT: port,
    DATABASE_CONNECTION_LIMIT: connectionLimit,
    DATABASE_DIALECT: "mysql",
    BREVO_API_KEY: brevoApiKey,
    NAME_SENDER_EMAIL: nameSenderEmail,
  };
};

const generateEnv = async (variables: EnvVariables): Promise<void> => {
  const lines = [
    `DATABASE_URL="${variables.DATABASE_URL}"`,
    `DATABASE_USER="${variables.DATABASE_USER || "root"}"`,
    `DATABASE_PASSWORD="${variables.DATABASE_PASSWORD || ""}"`,
    `DATABASE_NAME="${variables.DATABASE_NAME || ""}"`,
    `DATABASE_HOST="${variables.DATABASE_HOST || "localhost"}"`,
    `DATABASE_PORT=${variables.DATABASE_PORT || "3306"}`,
    `DATABASE_CONNECTION_LIMIT=${variables.DATABASE_CONNECTION_LIMIT || "10"}`,
    `DATABASE_DIALECT="${variables.DATABASE_DIALECT || "mysql"}"`,
    `BREVO_API_KEY="${variables.BREVO_API_KEY || ""}"`,
    `NAME_SENDER_EMAIL="${variables.NAME_SENDER_EMAIL || ""}"`,
  ];

  const content = lines.join("\n") + "\n";
  await fs.writeFile(ENV_PATH, content, "utf-8");
};

const setting = async () => {
  console.clear();
  console.log("=================================================");
  console.log("  Nexus Core - Configuración de Variables (.env) ");
  console.log("  Motor de Base de Datos: MySQL                  ");
  console.log("=================================================\n");

  const exists = await envExists();
  let existingEnv: Record<string, string> = {};

  if (exists) {
    existingEnv = await getExistingEnv();
    const overwrite = await confirm({
      message: "El archivo .env ya existe. ¿Desea sobrescribirlo?",
      default: false,
    });

    if (!overwrite) {
      console.log("\nOperación cancelada. El archivo .env no fue modificado.\n");
      return;
    }
    console.log("");
  }

  const variables = await promptEnvVariables(existingEnv);
  await generateEnv(variables);

  console.log("\n✔ Archivo .env generado exitosamente.\n");
};

setting().catch((error) => {
  if (error && error.name === "ExitPromptError") {
    console.log("\nOperación cancelada.\n");
  } else {
    console.error("\nError durante la configuración:", error);
  }
});
