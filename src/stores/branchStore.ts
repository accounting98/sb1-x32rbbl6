import { create } from 'zustand';
import { Branch, BranchRepresentative } from '../types/branch';

interface BranchState {
  branches: Branch[];
  
  // Actions
  initBranches: (branches: Branch[]) => void;
  addBranch: (branch: Branch) => void;
  updateBranch: (branch: Branch) => void;
  addRepresentative: (branchId: string, representative: BranchRepresentative) => void;
  getBranchById: (id: string) => Branch | undefined;
}

export const useBranchStore = create<BranchState>((set, get) => ({
  branches: [],
  
  initBranches: (branches) => {
    set({ branches });
  },
  
  addBranch: (branch) => {
    set((state) => ({
      branches: [...state.branches, branch]
    }));
  },
  
  updateBranch: (updatedBranch) => {
    set((state) => ({
      branches: state.branches.map((branch) => 
        branch.id === updatedBranch.id ? updatedBranch : branch
      )
    }));
  },
  
  addRepresentative: (branchId, representative) => {
    set((state) => {
      const updatedBranches = [...state.branches];
      const branchIndex = updatedBranches.findIndex(b => b.id === branchId);
      
      if (branchIndex !== -1) {
        updatedBranches[branchIndex] = {
          ...updatedBranches[branchIndex],
          representatives: [...updatedBranches[branchIndex].representatives, representative]
        };
      }
      
      return { branches: updatedBranches };
    });
  },
  
  getBranchById: (id) => {
    return get().branches.find(branch => branch.id === id);
  }
}));