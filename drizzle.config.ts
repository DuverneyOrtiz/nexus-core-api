import "dotenv/config";

import { Drizzle } from "./src/infrastructure/database/drizzle/drizzle";

const drizzle = new Drizzle();
const config = drizzle.defineConfiguration();

export default config;
