import { TypeAuth } from "../authentication/authenticationDto";

export interface AuthChangeMethod {
  methodAuth: TypeAuth
  password?: string;
}

export interface DataBase32 {
  accountId: number;
  companyId: number;
  userId: number;
  firstName: string;
  lastName: string;
  roleId: number;
  role: string;
}

