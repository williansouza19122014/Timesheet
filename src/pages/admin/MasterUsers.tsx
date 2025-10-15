import Forbidden from "@/components/auth/Forbidden";
import { usePermission } from "@/hooks/usePermission";
import Users from "../Users";

const MasterUsers = () => {
  const { isAllowed: canListUsers, isMaster } = usePermission("users.list");

  if (!canListUsers && !isMaster) {
    return <Forbidden />;
  }

  return <Users />;
};

export default MasterUsers;
