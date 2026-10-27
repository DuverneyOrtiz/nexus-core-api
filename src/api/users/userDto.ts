export interface UserCreateDto {
  companyId?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isActive?: boolean;  
}

export interface User {
    id:          number;
    companyId:   number;
    firstName:   string;
    lastName:    string;
    email:       string;
    phone:       string | null;
    createdAt:   Date | null;
    updatedAt:   Date | null;
    companyName?: string;
}


