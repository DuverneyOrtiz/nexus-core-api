import { newEnforcer, newModel } from "casbin";
import DrizzleAdapter,  { casbinRuleMysql,  } from "drizzle-adapter";
import { sql } from "drizzle-orm";
import { PoolConnection } from "@/infrastructure/database/connections/pool-connection";
import path from "path";
import { rbac } from "./rbac";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

const casbi_rules = async () => {
  const db = new PoolConnection().mysql();

  const a = await DrizzleAdapter.newAdapter({
    db: db,
    table: casbinRuleMysql,
  });

  // Create the casbin_rule table if it doesn't exist
  await db.execute(sql`
        CREATE TABLE IF NOT EXISTS casbin_rule (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            ptype VARCHAR(255),
            v0 VARCHAR(255),
            v1 VARCHAR(255),
            v2 VARCHAR(255),
            v3 VARCHAR(255),
            v4 VARCHAR(255),
            v5 VARCHAR(255)
        )
        `);

  const e = await newEnforcer(path.resolve(__dirname, "basic_model.conf"), a);

  await e.loadPolicy();

  const query = rbac.map((policy) => e.addPolicy(...policy));

  await Promise.all(query);

  await db.$client.end();

  return e;
};

const db = new PoolConnection().mysql();

const enforcerPromise = async () => {
  
  const DrizzleAdapterModule = (DrizzleAdapter as any).default || DrizzleAdapter;
  const a = await DrizzleAdapterModule.newAdapter({
    db: db,
    table: casbinRuleMysql,
  });

  const e = await newEnforcer(path.resolve(__dirname, "basic_model.conf"), a);
  await e.loadPolicy();
  

  return e;
};

export const addPolicyCasbi = async (...params: string[]) => {
  const e = await enforcerPromise();
  await e.addPolicy(...params);
  await db.$client.end();
};

export const removePolicyCasbi = async (...params: string[]) => {
  const e = await enforcerPromise();
  await e.removePolicy(...params);
  await db.$client.end();
} 


casbi_rules();

// Documentación para revisar:
/**
 * https://dev.to/matttyler/how-to-add-role-based-access-control-to-your-serverless-http-api-on-aws-17bk
 * https://github.com/apache/casbin-node-casbin
 * https://casbin.apache.org/docs/supported-models/#examples
 * https://casbin.apache.org/docs/adapters/
 * https://github.com/apache/casbin-node-casbin-drizzle-adapter
 */
