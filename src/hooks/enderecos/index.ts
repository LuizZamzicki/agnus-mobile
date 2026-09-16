import { useQuery } from "@tanstack/react-query";

import { getUserAddresses } from "../../actions/account";
import { useAuth } from "../../contexts/AuthContext";

export function useAddresses() {
  const { user } = useAuth();
  const userId = user?.id_usuario ?? 0;
  return useQuery({
    queryKey: ["addresses", userId],
    queryFn: () => getUserAddresses(userId),
    enabled: userId > 0,
  });
}
