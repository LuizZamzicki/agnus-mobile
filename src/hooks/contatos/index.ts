import { useQuery } from "@tanstack/react-query";

import { getUserContacts } from "../../actions/account";
import { useAuth } from "../../contexts/AuthContext";

export function useContacts() {
  const { user } = useAuth();
  const userId = user?.id_usuario ?? 0;
  return useQuery({
    queryKey: ["contacts", userId],
    queryFn: () => getUserContacts(userId),
    enabled: userId > 0,
  });
}
