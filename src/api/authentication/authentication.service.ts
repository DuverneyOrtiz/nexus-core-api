import { db } from "@/infrastructure/database/connections/pool-connection";
import dayjs from "dayjs";
import {
  AuthenticationCreateDto,
  Session,
  TypeAuth,
} from "./authenticationDto.js";
import {
  accountsTable,
  authenticationTable,
  companiesTable,
  rolesTable,
  sessionsTable,
  usersTable,
} from "@/infrastructure/database/drizzle/schema";
import {
  generateAccessToken,
  generateHash,
  generateUUid,
  totp,
  validateCodeOTP,
  verifyHash,
} from "@/shared/utils/security.js";
import { eq, getTableColumns, or, and } from "drizzle-orm";
import { response, SUCCESS, ERROR } from "@/shared/utils/response.js";
import { CODE_RESPONSE } from "@/shared/enums/http-status.enum.js";
import { AccountCreateDto } from "../accounts/accountDto.js";
import { MySqlColumn } from "drizzle-orm/mysql-core";
import { sendEmail, templeteSendCode } from "@/shared/utils/sendEmail.js";
import { convertBase32 } from "../auth-method/auth-method.service.js";
import { DataBase32 } from "../auth-method/auth-methodDto.js";

export const createAuthenticaton = async (idAccount: number) => {
  const secretKeyOTP = generateUUid();
  const data: AuthenticationCreateDto = {
    accountId: idAccount,
    typeAuth: "EMAIL_OTP_MFA",
    secretKeyOTP,
  };

  await db.insert(authenticationTable).values(data);
};

export const authentication = async (
  emailOrUser: string,
): Promise<SUCCESS<any> | ERROR> => {
  // Check if an account exists with the provided email or username.
  const isValidateAccount = await validateAccount(emailOrUser);

  if (isValidateAccount.status === CODE_RESPONSE.UNAUTHORIZED)
    return isValidateAccount;

  // Validate whether an account exists with the email or username
  const { data: account } = isValidateAccount as SUCCESS<
    AccountCreateDto & { id: number }
  >;
  const accountId = account.id;
  // Check if an authentication record exists for the account ID.
  const isValidteAuth = await validateAuthentication(accountId);

  if (isValidteAuth.status === CODE_RESPONSE.UNAUTHORIZED) return isValidteAuth;

  // Validate the authentication type (type_auth) and determine whether the user provided an email or a username.
  const { data: authentication } = isValidteAuth as SUCCESS<
    AuthenticationCreateDto & { id: number; secretKeyOTP: string }
  >;
  const typeAuth = authentication.typeAuth;

  const isValidateAuth = await validateTypeAuth(typeAuth, emailOrUser);

  if (isValidateAuth.status === CODE_RESPONSE.UNAUTHORIZED)
    return isValidateAuth;

  // If validation succeeds, generate a 6-digit OTP, retrieve the secret_key_otp, encrypt the OTP, store the encrypted value in the otp_code_hash field, and set the is_verified field to 0.
  await modeAuth(typeAuth, authentication);

  return response.success(
    {
      message:
        "Check your email! We've sent you a verification code. Enter the code below to complete your sign in.",
      method: typeAuth,
    },
    "success!",
    CODE_RESPONSE.OK,
  );
};

export const signInService = async (
  emailOrUser: string,
  authCredential: number | string,
) => {
 
  // Check if an account exists with the provided email or username.
  const isValidateAccount = await validateAccount(emailOrUser);

  if (isValidateAccount.status === CODE_RESPONSE.UNAUTHORIZED)
    return isValidateAccount;

  // Validate whether an account exists with the email or username
  const { data: account } = isValidateAccount as SUCCESS<
    AccountCreateDto & { id: number }
  >;
  const accountId = account.id;

  // Check if an authentication record exists for the account ID.
  const isValidteAuth = await validateAuthentication(accountId);

  if (isValidteAuth.status === CODE_RESPONSE.UNAUTHORIZED) return isValidteAuth;
  console.log("valdiación 2");
  // Validate the authentication type (type_auth) and determine whether the user provided an email or a username.
  const { data: authentication } = isValidteAuth as SUCCESS<
    AuthenticationCreateDto & {
      id: number;
      secretKeyOTP: string;
      otpExpiresAt: Date;
    }
  >;
  const typeAuth = authentication.typeAuth;

  const isValidateAuth = await validateTypeAuth(typeAuth, emailOrUser);

  if (isValidateAuth.status === CODE_RESPONSE.UNAUTHORIZED)
    return isValidateAuth;
  console.log("valdiación 3");
  let session = null;

  switch (typeAuth) {
    case "EMAIL_OTP_MFA":
    case "USERNAME_OTP_MFA":
      {
        // Validate the 6-digit code.
        if (isNaN(Number(authCredential)))
          return response.error(
            "Sign-in failed. Please check your credentials and try again.",
            CODE_RESPONSE.UNAUTHORIZED,
          );
        const isValidOTP = await validateOTP(
          Number(authCredential),
          authentication,
        );

        if (isValidOTP.status === CODE_RESPONSE.UNAUTHORIZED) return isValidOTP;
        await codeIsVerify(authentication.id);
      }
      break;
    case "EMAIL_PASSWORD":
    case "USERNAME_PASSWORD":
      {
        // Validate the password.
        if (typeof authCredential === "number")
          return response.error(
            "Sign-in failed. Please check your credentials and try again.",
            CODE_RESPONSE.UNAUTHORIZED,
          );

        const isValidPassword = await validatePassword(
          authCredential,
          authentication,
        );

        if (isValidPassword.status === CODE_RESPONSE.UNAUTHORIZED)
          return isValidPassword;
      }
      break;
    case "EMAIL_OTP_2FA":
    case "USERNAME_OTP_2FA": {
      // Validate the 6-digit code.
      if (isNaN(Number(authCredential)) || typeof authCredential === "string")
        return response.error(
          "Sign-in failed. Please check your credentials and try again.",
          CODE_RESPONSE.UNAUTHORIZED,
        );

      session = await generateDataTosession(accountId);
      const { companyId, userId, firstName, lastName, roleId, role } =
        session as DataBase32;
      const secret = convertBase32({
        accountId,
        companyId,
        userId,
        firstName,
        lastName,
        roleId,
        role,
      });

      const isValid = await validateCodeOTP(
        String(authCredential),
        secret,
        role,
        `${firstName}-${lastName}`,
      );

      if (isValid === null || isValid === -1)
        return response.error(
          "Sign-in failed. Please check your credentials and try again.",
          CODE_RESPONSE.UNAUTHORIZED,
        );
    }
  }

  // If validation succeeds, generate the token with all user information and the permissions associated with their role.
  if (session === null) session = await generateDataTosession(accountId);
  const token = await generateAccessToken(
    {
      sub: session.userId,
      companyId: session.companyId,
      accountId: session.accountId,
      rolId: session.roleId,
      rol: session.role,
    },
    "9h",
  );

  // Create a session of type "session" with an expiration time of 9 hours.
  const payload: Session = {
    accountId: account.id,
    permissionsSnapshot: [],
    tokenHash: token,
    tokenType: "SESSION",
    expiresAt: new Date(),
  };

  const isValidSession = await generateSession(payload);
  if (
    (isValidSession as ERROR) &&
    (isValidSession as ERROR).status &&
    (isValidSession as ERROR).status === CODE_RESPONSE.UNAUTHORIZED
  )
    return isValidSession as ERROR;

  return response.success(
    { accessToken: token, ...session },
    "success!",
    CODE_RESPONSE.OK,
  );
};

const validateAccount = async (
  emailOrUser: string,
): Promise<SUCCESS<AuthenticationCreateDto[]> | ERROR> => {
  try {
    const query = await db
      .select({ ...getTableColumns(accountsTable) })
      .from(accountsTable)
      .innerJoin(usersTable, eq(usersTable.id, accountsTable.userId))
      .where(
        and(
          or(
            eq(accountsTable.email, emailOrUser),
            eq(accountsTable.username, emailOrUser),
          ),
          eq(usersTable.isActive, true),
        ),
      );

    if (Array.isArray(query) && !query.length) {
      return response.error(
        "The specified account or associated user could not be found.",
        CODE_RESPONSE.UNAUTHORIZED,
      );
    }

    return response.success(query[0], "Data success", CODE_RESPONSE.OK);
  } catch (error) {
    return response.error(
      "The provided account identifier was not found.",
      CODE_RESPONSE.UNAUTHORIZED,
    );
  }
};

const validateAuthentication = async (
  accountId: number,
): Promise<SUCCESS<AuthenticationCreateDto> | ERROR> => {
  const query = (await db
    .select()
    .from(authenticationTable)
    .where(
      eq(authenticationTable.accountId, accountId),
    )) as AuthenticationCreateDto[];

  if (Array.isArray(query) && !query.length) {
    return response.error(
      "The provided account identifier was not found.",
      CODE_RESPONSE.UNAUTHORIZED,
    );
  }
  return response.success(query[0], "Data success", CODE_RESPONSE.OK);
};

const validateTypeAuth = async (typeAuth: TypeAuth, emailOrUser: string) => {
  let column: MySqlColumn = accountsTable.email;

  switch (typeAuth) {
    case "USERNAME_OTP_MFA":
    case "USERNAME_OTP_2FA":
    case "USERNAME_PASSWORD":
      {
        column = accountsTable.username;
      }
      break;
  }
  const query = await db
    .select()
    .from(accountsTable)
    .where(eq(column, emailOrUser));

  if (Array.isArray(query) && !query.length) {
    return response.error(
      "The provided account identifier was not found.",
      CODE_RESPONSE.UNAUTHORIZED,
    );
  }
  return response.success(query[0], "Data success", CODE_RESPONSE.OK);
};

const modeAuth = async (
  typeAuth: TypeAuth,
  authentication: AuthenticationCreateDto & {
    id: number;
    secretKeyOTP: string;
  },
) => {
  switch (typeAuth) {
    case "EMAIL_OTP_MFA":
    case "USERNAME_OTP_MFA":
      {
        const { id } = authentication;
        const OTP = await totp();
        const hash = await generateHash(OTP.token);
        await saveOTPEncrypt(hash, id);

        const data = await getDataUser(id);

        const dataEmail = {
          code: OTP.token,
          company: data?.companies ? data.companies.name : null,
          user: `${data?.users.firstName} ${data?.users.lastName}`,
        };
        await sendEmail(
          "OTP generated",
          [
            {
              email: data?.accounts.email || "",
              name: `${data?.users.firstName} ${data?.users.lastName}`,
            },
          ],
          templeteSendCode(dataEmail),
        );
      }
      break;
  }
};

const saveOTPEncrypt = async (otpHas: string, idAuth: number) => {
  const expired_at = dayjs().add(5, "minute").toDate();
  await db
    .update(authenticationTable)
    .set({ otpCodeHash: otpHas, isVerified: false, otpExpiresAt: expired_at })
    .where(eq(authenticationTable.id, idAuth));
};

const getDataUser = async (idAuth: number) => {
  const query = await db
    .select()
    .from(authenticationTable)
    .innerJoin(
      accountsTable,
      eq(accountsTable.id, authenticationTable.accountId),
    )
    .innerJoin(usersTable, eq(usersTable.id, accountsTable.userId))
    .innerJoin(companiesTable, eq(usersTable.companyId, companiesTable.id))
    .where(eq(authenticationTable.id, idAuth));

  return query[0];
};

const validateOTP = async (
  code: number,
  authentication: AuthenticationCreateDto & { id: number; otpExpiresAt: Date },
) => {
  try {
    // Retrieve otpExpiresAt and otp_code_hash.
    const { otpCodeHash, otpExpiresAt, isVerified } = authentication;

    // Validate the verification code.
    const isValidCode = await verifyHash(otpCodeHash || "", code.toString());
    if (!isValidCode) throw Error;

    // Check whether the verification code has already been used.
    if (isVerified) throw Error;

    // If validation succeeds, check whether the verification code has expired.
    const currentDate = dayjs().isAfter(dayjs(otpExpiresAt));

    if (currentDate) throw Error;

    return response.success([], "Data success", CODE_RESPONSE.OK);
  } catch (error) {
    return response.error(
      "Sign-in failed. Please check your credentials and try again.",
      CODE_RESPONSE.UNAUTHORIZED,
    );
  }
};

const codeIsVerify = async (idAuthentication: number) => {
  await db
    .update(authenticationTable)
    .set({ isVerified: true })
    .where(eq(authenticationTable.id, idAuthentication));
};

const validatePassword = async (
  password: string,
  authentication: AuthenticationCreateDto & { id: number; otpExpiresAt: Date },
) => {
  try {
    const { passwordHash } = authentication;

    // Verify the password
    const isValidPassword = await verifyHash(passwordHash || "", password);

    // Validate the password.
    if (!isValidPassword) throw Error;

    return response.success([], "Data success", CODE_RESPONSE.OK);
  } catch (error) {
    return response.error(
      "Sign-in failed. Please check your credentials and try again.",
      CODE_RESPONSE.UNAUTHORIZED,
    );
  }
};

export const generateDataTosession = async (accountIdP: number) => {
  const {
    id: accountId,
    isActive: isActiveAccounts,
    createdAt: createdAtAccounts,
    updatedAt: updatedAtAccounts,
    ...accounts
  } = getTableColumns(accountsTable);
  const {
    id,
    createdAt: createdAtUser,
    updatedAt: updatedAtUser,
    isActive: isActiveUser,
    ...user
  } = getTableColumns(usersTable);
  const {
    id: rolId,
    createdAt: createdAtRol,
    updatedAt: updatedAtRol,
    isActive: isActiveRol,
    scope,
    ...rol
  } = getTableColumns(rolesTable);
  const {
    id: companyId,
    createdAt,
    updatedAt,
    name: companyName,
    expiresAt,
    trialExpiresAt,
    email: emailCompany,
    status,
    ...company
  } = getTableColumns(companiesTable);

  const query = await db
    .select({
      accountId,
      ...accounts,
      ...user,
      ...rol,
      companyName,
      companyId,
      ...company,
      emailCompany,
    })
    .from(accountsTable)
    .innerJoin(usersTable, eq(accountsTable.userId, usersTable.id))
    .innerJoin(rolesTable, eq(accountsTable.roleId, rolesTable.id))
    .innerJoin(companiesTable, eq(companiesTable.id, usersTable.companyId))
    .where(eq(accountsTable.id, accountIdP));


  return { ...query[0] };
};

const generateSession = async (session: Session): Promise<number | ERROR> => {
  try {
    const { insertId } = (await db.insert(sessionsTable).values(session))[0];
    return insertId;
  } catch (error) {
    console.log(error);
    return response.error("Sign-in faile", CODE_RESPONSE.UNAUTHORIZED);
  }
};
