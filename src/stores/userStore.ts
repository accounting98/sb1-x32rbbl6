import { create } from 'zustand';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
}

interface UserState {
  profile: UserProfile;
  updateProfile: (profile: Partial<UserProfile>) => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: {
    firstName: 'أحمد',
    lastName: 'محمد',
    email: 'ahmed@example.com',
    phone: '+962 7777 77777',
    role: 'مدير المخزن'
  },
  updateProfile: (newProfile) => set((state) => ({
    profile: { ...state.profile, ...newProfile }
  }))
}));