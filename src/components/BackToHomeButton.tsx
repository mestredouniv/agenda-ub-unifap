import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const BackToHomeButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => navigate("/")}
      className="absolute left-4 top-4 hover:bg-primary/10"
    >
      <Home className="h-5 w-5" />
    </Button>
  );
};