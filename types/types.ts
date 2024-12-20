export interface AppointmentParams {
  name: string;
  phone: string;
  address?: string;
  subject: string;
  budget: string;
  email: string;
  message?: string;
}

export interface CreateUserParams {
  clerkId: string;
  email: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  photo: string;
}

export interface UpdateUserParams {
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  photo: string;
}
