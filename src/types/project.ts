export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;   // ISO date string from the API
  updatedAt: string;
  isActive: boolean;
}