import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Request {
  id: string;
  patientName: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
}

export const ConsultaRequestsList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [requests, setRequests] = useState(() => {
    const stored = localStorage.getItem("appointments");
    return stored ? JSON.parse(stored) : [];
  });

  const filteredRequests = requests.filter(
    (request: Request) =>
      request.patientName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      new Date(request.preferredDate) >= new Date()
  );

  const formatPhone = (phone: string) => {
    return phone.slice(0, 4) + "****" + phone.slice(-4);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Solicitações</CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar solicitação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredRequests.map((request: Request) => (
            <div
              key={request.id}
              className="flex justify-between items-center p-4 border rounded-lg hover:bg-primary/5 transition-colors"
            >
              <div>
                <p className="font-medium">
                  {request.patientName.split(" ")[0]}
                </p>
                <p className="text-sm text-muted-foreground">
                  Tel: {formatPhone(request.phone)}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm">
                  {new Date(request.preferredDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {request.preferredTime}
                </p>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Aguardando Aprovação
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};