import type { Session, User } from "@supabase/supabase-js";
import toast from "react-hot-toast";
import { create } from "zustand";
import { supabase } from "src/lib/api/supabase";
import { gaEvent } from "src/lib/utils/gaEvent";

interface UserActions {
  logout: () => void;
  setSession: (session: Session) => void;
}

interface UserStates {
  user: User | null;
  isAuthenticated: boolean;
}

const initialStates: UserStates = {
  user: null,
  isAuthenticated: false,
};

const useUser = create<UserStates & UserActions>()(set => ({
  ...initialStates,
  setSession: async session => {
    gaEvent("engagement", "login");
    set({ user: session.user, isAuthenticated: true });
  },
  logout: async () => {
    toast.loading("Logging out...", { id: "logout" });
    await supabase.auth.signOut();
    set(initialStates);
    toast.success("Logged out.", { id: "logout" });
  },
}));

export default useUser;
