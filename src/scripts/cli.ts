import { input, password, select } from "@inquirer/prompts";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const setting = async () => {
  console.clear();

  const model = await businessModel();
  const db = await database();

  switch (db) {
    case "mysql":
      await generateSchemaMysql(model, db);
      break;
    case "postgres":
      await generateSchemaPosgres(model, db);
      break;
  }

  if(!await envExists())
    await generateEnv(db);
};

const businessModel = async () => {
  const answer = await select({
    message: "Seleccione el modelo de negocio",
    choices: [
      {
        name: "B2B - Vigencia por compañías",
        value: "b2b",
      },
      {
        name: "B2C - Vigencia por usuarios",
        value: "b2c",
      },
      {
        name: "Suscripción + Trial",
        value: "trial",
      },
      {
        name: "Modelo híbrido",
        value: "hybrid",
      },
      {
        name: "Personalizado",
        value: "custom",
      },
    ],
  });

  return answer;
};

const database = async () => {
  const answer = await select({
    message: "Seleccione base de datos",
    choices: [
      {
        name: "MySQL",
        value: "mysql",
      },
      {
        name: "PostgreSQL",
        value: "postgres",
      },
    ],
  });

  return answer;
};

const dialectDB = async (db: string) => {
  switch (db) {
    case "mysql": {
      return "mysql";
    }
    case "postgres": {
      const answer = await select({
        message: "Seleccione el proveedor",
        choices: [
          {
            name: "Postgresql",
            value: "postgresql",
          },
          {
            name: "Supabase",
            value: "supabase",
          },
          {
            name: "Neon",
            value: "neon",
          },
        ],
      });

      return answer;
    }
  }
};

const settingDB = async (db: string) => {
  let settingDatabase: any = {};

  switch (db) {
    case "mysql":
      {
        settingDatabase.DATABASE_URL = await input({
          message: "Ingrese la url de la base de datos: ",
        });
        settingDatabase.DATABASE_NAME = await input({
          message: "Ingrese el nombre de la base de datos: ",
        });
        settingDatabase.DATABASE_USER = await input({
          message: "Ingrese el usuario de la base de datos: ",
        });
        settingDatabase.DATABASE_PASSWORD = await password({
          message: "Ingrese el password de la base de datos: ",
        });
        settingDatabase.DATABASE_HOST = await input({
          message: "Ingrese el host de la base de datos: ",
        });
        settingDatabase.DATABASE_PORT = await input({
          message: "Ingrese el número de puerto de la base de datos: ",
        });
      }
      break;
    case "postgres":
      {
        settingDatabase.DATABASE_URL = await input({
          message: "Ingrese la url de la base de datos:",
        });
      }
      break;
  }

  return settingDatabase;
};

const generateSchemaMysql = async (
  model: string = "b2b",
  db: string = "mysql",
) => {
  try {
    const source = `${__dirname}/../../templates/${db}/${model}.ts`;
    const destination = path.resolve(
      __dirname,
      `../infrastructure/database/drizzle/schema.ts`,
    );
    await fs.cp(source, destination, { recursive: true });
  } catch (error) {
    console.log("Error ", error);
  }
};

const generateSchemaPosgres = async (
  model: string = "b2b",
  db: string = "mysql",
) => {
  try {
    const source = `${__dirname}/../../templates/${db}/${model}.ts`;
    const destination = path.resolve(
      __dirname,
      `../infrastructure/database/drizzle/schema.ts`,
    );
    await fs.cp(source, destination, { recursive: true });
  } catch (error) {
    console.log("Error ", error);
  }
};

const generateEnv = async (db: string) => {
  const source = `${__dirname}/../../templates/${db}/env`;
  const destination = path.resolve(__dirname, `../../.env`);
  await fs.cp(source, destination, { recursive: true });

  const dialect = await dialectDB(db);
  if (!dialect) {
    throw new Error(`Dialect not found for database "${db}"`);
  }

  const varaiblesSetting = await settingDB(db);

  await updateVariablesEnv(source, destination, dialect, varaiblesSetting);
};

const envExists = async () => {
  try {
    const path = `${__dirname}/../../.env`;
     await fs.access(path);
    return true;
    
  } catch (error) {
    return false;
  }
}

const updateVariablesEnv = async (
  source: string,
  destination: string,
  dialect: string,
  varaiblesSetting: any,
) => {
  let content = await fs.readFile(source, "utf-8");

  for (const [key, value] of Object.entries(varaiblesSetting)) {
    const regex = new RegExp(`{{${key}}}`, "g");

    content = content.replace(
      regex,
      !isNaN(Number(value)) ? (value as string) : `"${value as string}"`,
    );
  }

  const regex = new RegExp(`{{DATABASE_DIALECT}}`, "g");

  content = content.replaceAll(regex, `"${dialect}"`);

  await fs.writeFile(destination, content);
};

setting();
