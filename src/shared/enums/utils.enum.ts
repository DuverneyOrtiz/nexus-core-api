export enum ROL_APP {
    SUPER_ADMIN = "super administrador",
    ADMIN = "administrador"
}

export enum SCOPE {
    SYSTEM = "SYSTEM",
    GLOBAL = "GLOBAL",
    ORGANIZATION = "ORGANIZATION"
}

export interface PayloadLocals {
    idUser: number;
    companyId: number;
    accountId: number;
    rolId: number;
    rol: ROL_APP
}