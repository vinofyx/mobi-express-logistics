import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

interface CenterContextValue {
  centerId: string | null;
  centerName: string | null;
  loading: boolean;
}

const CenterContext = createContext<CenterContextValue | undefined>(undefined);

export function CenterProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [centerId, setCenterId] = useState<string | null>(null);
  const [centerName, setCenterName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data: agent } = await supabase
        .from("agents")
        .select("assigned_center_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (agent?.assigned_center_id) {
        setCenterId(agent.assigned_center_id);
        const { data: c } = await supabase
          .from("centers")
          .select("name")
          .eq("id", agent.assigned_center_id)
          .maybeSingle();
        setCenterName(c?.name ?? null);
      }
      setLoading(false);
    })();
  }, [user]);

  return (
    <CenterContext.Provider value={{ centerId, centerName, loading }}>
      {children}
    </CenterContext.Provider>
  );
}

export function useCenter() {
  const ctx = useContext(CenterContext);
  if (!ctx) throw new Error("useCenter requires CenterProvider");
  return ctx;
}
