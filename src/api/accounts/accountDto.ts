export interface AccountCreateDto {
  userId: number;
  roleId: number;
  email: string;
  username: string;
}

export interface AccountUpdateDto {
  roleId?: number;
  email?: string;
  username?: string;
}

export interface AccountData {
    companyName?: string;
    id: number;
    userId: number;
    email: string | null;
    username: string | null;
    role: string;
    user: {
      firstName: string;
      lastName: string;
    };
    updatedAt: Date;
    createdAt: Date;
  }