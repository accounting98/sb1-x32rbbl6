export interface BranchRepresentative {
  id: string;
  name: string;
  phone: string;
  role: string;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  phone: string;
  manager: string;
  representatives: BranchRepresentative[];
}