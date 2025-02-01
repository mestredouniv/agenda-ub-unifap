import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackToHomeButton } from "@/components/BackToHomeButton";

const Hanseniase = () => {
  return (
    <div className="container mx-auto p-6">
      <BackToHomeButton />
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Hanseníase</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Informações sobre Hanseníase serão exibidas aqui.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Hanseniase;