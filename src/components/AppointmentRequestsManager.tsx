
import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAppointmentRequests } from '@/hooks/useAppointmentRequests';
import { Check, Clock, X } from 'lucide-react';

export const AppointmentRequestsManager = () => {
  const { requests, loading, professionals, handleApprove, handleReject, refreshRequests } = useAppointmentRequests();
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>(undefined);
  const [appointmentTime, setAppointmentTime] = useState<string>('');
  const [professionalId, setProfessionalId] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const resetForm = () => {
    setSelectedRequest(null);
    setAppointmentDate(undefined);
    setAppointmentTime('');
    setProfessionalId('');
  };

  const openApprovalDialog = (requestId: string) => {
    setSelectedRequest(requestId);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    resetForm();
  };

  const handleApproveRequest = async () => {
    if (!selectedRequest || !appointmentDate || !appointmentTime || !professionalId) {
      return;
    }

    const formattedDate = format(appointmentDate, 'yyyy-MM-dd');
    const success = await handleApprove(selectedRequest, formattedDate, appointmentTime, professionalId);
    
    if (success) {
      closeDialog();
      refreshRequests();
    }
  };

  const confirmReject = async (requestId: string) => {
    if (window.confirm('Tem certeza que deseja rejeitar esta solicitação?')) {
      await handleReject(requestId);
      refreshRequests();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Solicitações de Agendamento (Bolsa Família)</CardTitle>
          <CardDescription>
            Gerencie as solicitações de agendamento para o Bolsa Família
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <p>Carregando solicitações...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Nenhuma solicitação encontrada.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div 
                  key={request.id} 
                  className={`border rounded-lg p-4 ${
                    request.status === 'approved' 
                      ? 'border-green-300 bg-green-50' 
                      : request.status === 'rejected'
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{request.beneficiary_name}</h3>
                      <p className="text-sm text-gray-600">CPF: {request.cpf}</p>
                      <p className="text-sm text-gray-600">SUS: {request.sus_number}</p>
                      <p className="text-sm text-gray-600">Telefone: {request.phone}</p>
                      <p className="text-sm text-gray-600">
                        Nascimento: {
                          request.birth_date 
                            ? new Date(request.birth_date).toLocaleDateString('pt-BR') 
                            : '-'
                        } ({request.age} anos)
                      </p>
                      <p className="text-sm text-gray-600">Endereço: {request.address}</p>
                      <p className="text-sm text-gray-600">
                        Solicitado em: {
                          new Date(request.created_at).toLocaleDateString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        }
                      </p>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
                        request.status === 'approved' 
                          ? 'bg-green-200 text-green-800' 
                          : request.status === 'rejected'
                          ? 'bg-red-200 text-red-800'
                          : 'bg-yellow-200 text-yellow-800'
                      }`}>
                        {request.status === 'approved' 
                          ? <><Check className="w-4 h-4 mr-1" /> Aprovado</> 
                          : request.status === 'rejected'
                          ? <><X className="w-4 h-4 mr-1" /> Rejeitado</>
                          : <><Clock className="w-4 h-4 mr-1" /> Pendente</>}
                      </span>

                      {request.status === 'approved' && (
                        <div className="text-right mt-2">
                          <p className="text-sm font-medium">Agendado para:</p>
                          <p className="text-sm">
                            {new Date(request.appointment_date!).toLocaleDateString('pt-BR')} às {request.appointment_time}
                          </p>
                          <p className="text-sm">
                            Profissional: {request.professional_name}
                          </p>
                        </div>
                      )}

                      {request.status === 'pending' && (
                        <div className="flex space-x-2 mt-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-green-500 text-green-600 hover:bg-green-50"
                            onClick={() => openApprovalDialog(request.id)}
                          >
                            <Check className="w-4 h-4 mr-1" /> Aprovar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-red-500 text-red-600 hover:bg-red-50"
                            onClick={() => confirmReject(request.id)}
                          >
                            <X className="w-4 h-4 mr-1" /> Rejeitar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Aprovar Solicitação</DialogTitle>
                <DialogDescription>
                  Defina a data, hora e profissional para o agendamento.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Data da Consulta</Label>
                  <Calendar
                    mode="single"
                    selected={appointmentDate}
                    onSelect={setAppointmentDate}
                    locale={ptBR}
                    className="rounded-md border w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="appointmentTime">Horário da Consulta</Label>
                  <Input
                    id="appointmentTime"
                    type="time"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="professional">Profissional</Label>
                  <Select value={professionalId} onValueChange={setProfessionalId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um profissional" />
                    </SelectTrigger>
                    <SelectContent>
                      {professionals.map((prof) => (
                        <SelectItem key={prof.id} value={prof.id}>
                          {prof.name} - {prof.profession}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
                <Button
                  onClick={handleApproveRequest}
                  disabled={!appointmentDate || !appointmentTime || !professionalId}
                >
                  Confirmar Agendamento
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};
