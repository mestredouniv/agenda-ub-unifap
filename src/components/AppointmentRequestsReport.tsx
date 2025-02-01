import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface AppointmentRequest {
  id: string;
  professionalId: string;
  patientName: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  status: "pending" | "approved" | "rejected" | "rescheduled";
}

export const AppointmentRequestsReport = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);

  useEffect(() => {
    const loadRequests = () => {
      const storedRequests = JSON.parse(localStorage.getItem("appointments") || "[]");
      setRequests(storedRequests);
    };

    loadRequests();
    window.addEventListener("storage", loadRequests);
    return () => window.removeEventListener("storage", loadRequests);
  }, []);

  const filteredRequests = requests.filter(
    (request) =>
      request.patientName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      new Date(request.preferredDate) >= new Date()
  );

  const formatPhone = (phone: string) => {
    return phone.slice(0, 4) + "****" + phone.slice(-4);
  };

  const getStatusBadge = (status: AppointmentRequest["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Aguardando Aprovação</Badge>;
      case "approved":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Aprovada</Badge>;
      case "rejected":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Rejeitada</Badge>;
      case "rescheduled":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Remarcada</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar solicitação..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Nenhuma solicitação encontrada
          </p>
        ) : (
          filteredRequests.map((request) => (
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
                {getStatusBadge(request.status)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};