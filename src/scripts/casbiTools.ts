import { PoolConnection } from "@/infrastructure/database/connections/pool-connection";
import { newEnforcer } from "casbin";
import DrizzleAdapter, { casbinRuleMysql } from "drizzle-adapter";
import path from "path";
const __dirname = import.meta.dirname;


const enforcerPromise = async () => {
  const db = new PoolConnection().mysql();
  const DrizzleAdapterModule = (DrizzleAdapter as any).default || DrizzleAdapter;
  const a = await DrizzleAdapterModule.newAdapter({
    db: db,
    table: casbinRuleMysql,
  });

  const e = await newEnforcer(path.resolve(__dirname, "basic_model.conf"), a);
  await e.loadPolicy();

  return {e, db};
};

export const enforce = async (
  sub: string,
  obj: string,
  act: string,
): Promise<Boolean> => {
  const {e, db} = await enforcerPromise();
  await db.$client.end();
  return await e.enforce(sub, obj, act);
};

export const addPolicyCasbi = async (...params: string[]) => {
  const {e, db} = await enforcerPromise();
  await e.addPolicy(...params);
  db.$client.end();
};

export const removePolicyCasbi = async (...params: string[]) => {
  const {e, db} = await enforcerPromise();
  await e.removePolicy(...params);
  db.$client.end();
}

export const getPolicyForUser = async (user: string) => {
  const {e, db} = await enforcerPromise();
  const roles = await e.getFilteredPolicy(0, user);
  db.$client.end();
  return roles.sort();
}

//========================

/*
export const enforce2 = async (
  sub: string,
  obj: string,
  act: string,
): Promise<Boolean> => {

  const e = await enforcerPromise();
  return await e.enforce(sub, obj, act);
};
*/
