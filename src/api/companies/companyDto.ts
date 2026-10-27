export interface CompanyCreateDto {
  name: string;
  expiresAt: Date;
  contactPerson: string;
  address: string;
  phone: string;
  taxId: string;
  email: string;
  trialExpiresAt: Date
}

export interface CompanyUpdateDto {
  companyId?: number;
  name?: string;
  expiresAt?: Date;
  contactPerson?: string;
  address?: string;
  phone?: string;
  taxId?: string;
  email?: string;
  trialExpiresAt?: Date
}