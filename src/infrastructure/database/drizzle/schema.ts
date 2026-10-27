import { relations, sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  mysqlTable,
  timestamp,
  varchar,
  mysqlEnum,
  json,
  unique,
  text
} from "drizzle-orm/mysql-core";

export const casbinRuleTable = mysqlTable("casbin_rule", {
  id: bigint("id", { mode: "number", unsigned: true })
    .autoincrement()
    .primaryKey(),

  ptype: varchar("ptype", { length: 255 }),
  v0: varchar("v0", { length: 255 }),
  v1: varchar("v1", { length: 255 }),
  v2: varchar("v2", { length: 255 }),
  v3: varchar("v3", { length: 255 }),
  v4: varchar("v4", { length: 255 }),
  v5: varchar("v5", { length: 255 }),
});

export const companiesTable = mysqlTable("companies", {
  id: bigint({ mode: "number" }).autoincrement().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  expiresAt: timestamp("expires_at"),
  contactPerson: varchar("contact_person", { length: 255 }),
  address: varchar({ length: 255 }),
  phone: varchar({ length: 30 }),
  taxId: varchar("tax_id", { length: 30 }),
  email: varchar({ length: 255 }).unique(),
  trialExpiresAt: timestamp("trial_expires_at"),
  status: boolean("status").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const usersTable = mysqlTable("users", {
  id: bigint({ mode: "number" }).autoincrement().primaryKey(),
  companyId: bigint("company_id", { mode: "number" })
    .notNull()
    .references(() => companiesTable.id, { onDelete: "cascade" }),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  phone: varchar({ length: 30 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const accountsTable = mysqlTable(
  "accounts",
  {
    id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),

    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => usersTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    roleId: bigint("role_id", { mode: "number" })
      .notNull()
      .references(() => rolesTable.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),

    email: varchar("email", { length: 255 }).unique(),
    username: varchar("username", { length: 100 }).unique(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().default(sql`(UTC_TIMESTAMP())`),
    updatedAt: timestamp("updated_at").notNull().default(sql`(UTC_TIMESTAMP())`),
  },
  (table) => [
    unique("accounts_user_role_unique").on(table.userId, table.roleId),
  ],
);

export const authenticationTable = mysqlTable("authentication", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  accountId: bigint("account_id", { mode: "number" })
    .notNull()
    .references(() => accountsTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  typeAuth: mysqlEnum("type_auth", [
    "USERNAME_PASSWORD",
    "EMAIL_PASSWORD",
    "USERNAME_OTP_MFA",
    "EMAIL_OTP_MFA",
    "EMAIL_OTP_2FA",
    "USERNAME_OTP_2FA"
  ]).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }),
  otpCodeHash: varchar("otp_code_hash", { length: 255 }),
  otpExpiresAt: timestamp("otp_expires_at"),
  secretKeyOTP: varchar("secret_key_otp", { length: 255 }),
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`(UTC_TIMESTAMP())`),
  updatedAt: timestamp("updated_at").notNull().default(sql`(UTC_TIMESTAMP())`),
});

export const sessionsTable = mysqlTable("sessions", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  accountId: bigint("account_id", { mode: "number" })
    .notNull()
    .references(() => accountsTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),

  tokenHash: text("token_hash").notNull(),
  tokenType: mysqlEnum("token_type", ["API", "SESSION"]).notNull(), 
  permissionsSnapshot: json("permissions_snapshot"),
  createdAt: timestamp("created_at").notNull().default(sql`(UTC_TIMESTAMP())`),
  updatedAt: timestamp("updated_at").notNull().default(sql`(UTC_TIMESTAMP())`),
});

export const roleScopeEnum = mysqlEnum("scope", [
  "SYSTEM",
  "GLOBAL",
  "ORGANIZATION",
]);

export const rolesTable = mysqlTable("roles", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  role: varchar("role", { length: 100 }).notNull(),
  scope: roleScopeEnum.notNull().default("GLOBAL"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`(UTC_TIMESTAMP())`),
  updatedAt: timestamp("updated_at").notNull().default(sql`(UTC_TIMESTAMP())`),
});

export const roleCompaniesTable = mysqlTable(
  "role_companies",
  {
    id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
    roleId: bigint("role_id", { mode: "number" })
      .notNull()
      .references(() => rolesTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    companyId: bigint("company_id", { mode: "number" })
      .notNull()
      .references(() => companiesTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    createdAt: timestamp("created_at").notNull().default(sql`(UTC_TIMESTAMP())`),
    updatedAt: timestamp("updated_at").notNull().default(sql`(UTC_TIMESTAMP())`),
  },
  (table) => [
    unique("role_companies_role_id_company_id_unique").on(
      table.roleId,
      table.companyId,
    ),
  ],
);

// ================RELATIONS=========================

export const roleCompaniesRelations = relations(roleCompaniesTable, ({ one }) => ({
  role: one(rolesTable, {
    fields: [roleCompaniesTable.roleId],
    references: [rolesTable.id],
  }),
  company: one(companiesTable, {
    fields: [roleCompaniesTable.companyId],
    references: [companiesTable.id],
  }),
}));

export const accountsRelations = relations(accountsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [accountsTable.userId],
    references: [usersTable.id],
  }),

  role: one(rolesTable, {
    fields: [accountsTable.roleId],
    references: [rolesTable.id],
  }),

  authentications: many(authenticationTable),
}));

export const authenticationRelations = relations(
  authenticationTable,
  ({ one }) => ({
    account: one(accountsTable, {
      fields: [authenticationTable.accountId],
      references: [accountsTable.id],
    }),
  }),
);

export const companyRelations = relations(companiesTable, ({ many }) => ({
  roleCompanies: many(roleCompaniesTable),
}));
