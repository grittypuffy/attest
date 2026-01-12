type UserRole = "Government" | "Agent" 

interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  address: string;
}
