
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import VacationModal from "./VacationModal";
import { SystemUser } from "@/types/users";

interface VacationButtonProps {
  user: SystemUser;
}

const VacationButton = ({ user }: VacationButtonProps) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setShowModal(true)}
      >
        <Calendar className="h-4 w-4" />
        Férias
      </Button>

      <VacationModal
        user={user}
        open={showModal}
        onOpenChange={setShowModal}
      />
    </>
  );
};

export default VacationButton;
