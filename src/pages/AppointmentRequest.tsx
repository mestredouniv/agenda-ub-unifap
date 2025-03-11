
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { AppointmentRequestFormData } from "@/types/appointmentRequest";
import { createAppointmentRequest, fetchPublicAppointmentRequests } from "@/services/appointment/appointmentRequest";

const calculateAge = (birthDate: string) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

const formatCPF = (cpf: string) => {
  if (!cpf) return '';
  const firstDigits = cpf.slice(0, 3);
  const lastDigits = cpf.slice(-2);
  return `${firstDigits}...${lastDigits}`;
};

const formatSUS = (sus: string) => {
  if (!sus) return '';
  const firstDigits = sus.slice(0, 3);
  const lastDigits = sus.slice(-2);
  return `${firstDigits}...${lastDigits}`;
};

const formatName = (name: string) => {
  if (!name) return '';
  const firstName = name.split(' ')[0];
  return firstName;
};

const AppointmentRequest = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<AppointmentRequestFormData>({
    beneficiary_name: '',
    cpf: '',
    sus_number: '',
    phone: '',
    address: '',
    birth_date: '',
    age: 0
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [publicRequests, setPublicRequests] = useState<any[]>([]);

  useEffect(() => {
    loadPublicRequests();
  }, []);

  const loadPublicRequests = async () => {
    const requests = await fetchPublicAppointmentRequests();
    setPublicRequests(requests);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'birth_date') {
      // Handle date input manually
      if (value && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
        const [day, month, year] = value.split('/');
        const dateObj = new Date(`${year}-${month}-${day}`);
        
        if (!isNaN(dateObj.getTime())) {
          const age = calculateAge(`${year}-${month}-${day}`);
          setFormData(prev => ({ ...prev, [name]: value, age }));
        }
      } else {
        setFormData(prev => ({ ...prev, [name]: value, age: 0 }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.beneficiary_name.trim()) {
      newErrors.beneficiary_name = 'Nome do beneficiário é obrigatório';
    }
    
    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(formData.cpf)) {
      newErrors.cpf = 'CPF inválido. Use o formato: 000.000.000-00';
    }
    
    if (!formData.sus_number.trim()) {
      newErrors.sus_number = 'Número SUS é obrigatório';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Endereço é obrigatório';
    }
    
    if (!formData.birth_date.trim()) {
      newErrors.birth_date = 'Data de nascimento é obrigatória';
    } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(formData.birth_date)) {
      newErrors.birth_date = 'Data inválida. Use o formato: DD/MM/AAAA';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const result = await createAppointmentRequest(formData);
      
      if (result.success) {
        toast({
          title: "Solicitação enviada",
          description: "Sua solicitação de agendamento foi enviada com sucesso.",
        });
        
        // Reset form
        setFormData({
          beneficiary_name: '',
          cpf: '',
          sus_number: '',
          phone: '',
          address: '',
          birth_date: '',
          age: 0
        });
        
        // Reload public requests
        loadPublicRequests();
      } else {
        toast({
          title: "Erro",
          description: result.error || "Não foi possível enviar sua solicitação.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar sua solicitação.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Bolsa Família - Solicitação de Agendamento</h1>
          <p className="text-gray-600 mt-2">Preencha o formulário abaixo para solicitar seu agendamento</p>
        </div>
        
        <Tabs defaultValue="form" className="max-w-3xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">Solicitar Agendamento</TabsTrigger>
            <TabsTrigger value="status">Consultar Status</TabsTrigger>
          </TabsList>
          
          <TabsContent value="form">
            <Card>
              <CardHeader>
                <CardTitle>Formulário de Solicitação</CardTitle>
                <CardDescription>
                  Preencha todos os campos para solicitar um agendamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="beneficiary_name">Nome Completo do Beneficiário</Label>
                    <Input
                      id="beneficiary_name"
                      name="beneficiary_name"
                      value={formData.beneficiary_name}
                      onChange={handleInputChange}
                      placeholder="Nome completo"
                      className={errors.beneficiary_name ? "border-red-500" : ""}
                    />
                    {errors.beneficiary_name && (
                      <p className="text-red-500 text-sm">{errors.beneficiary_name}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleInputChange}
                      placeholder="000.000.000-00"
                      className={errors.cpf ? "border-red-500" : ""}
                    />
                    {errors.cpf && (
                      <p className="text-red-500 text-sm">{errors.cpf}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sus_number">Número do SUS</Label>
                    <Input
                      id="sus_number"
                      name="sus_number"
                      value={formData.sus_number}
                      onChange={handleInputChange}
                      placeholder="Número do cartão SUS"
                      className={errors.sus_number ? "border-red-500" : ""}
                    />
                    {errors.sus_number && (
                      <p className="text-red-500 text-sm">{errors.sus_number}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(00) 00000-0000"
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm">{errors.phone}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Seu endereço completo"
                      className={errors.address ? "border-red-500" : ""}
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm">{errors.address}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="birth_date">Data de Nascimento</Label>
                      <Input
                        id="birth_date"
                        name="birth_date"
                        value={formData.birth_date}
                        onChange={handleInputChange}
                        placeholder="DD/MM/AAAA"
                        className={errors.birth_date ? "border-red-500" : ""}
                      />
                      {errors.birth_date && (
                        <p className="text-red-500 text-sm">{errors.birth_date}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="age">Idade</Label>
                      <Input
                        id="age"
                        value={formData.age || ''}
                        readOnly
                        className="bg-gray-100"
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? "Enviando..." : "Enviar Solicitação"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="status">
            <Card>
              <CardHeader>
                <CardTitle>Status das Solicitações</CardTitle>
                <CardDescription>
                  Confira o status da sua solicitação abaixo
                </CardDescription>
              </CardHeader>
              <CardContent>
                {publicRequests.length === 0 ? (
                  <p className="text-center text-gray-500">Nenhuma solicitação encontrada.</p>
                ) : (
                  <div className="space-y-4">
                    {publicRequests.map((request) => (
                      <div key={request.id} className="border rounded-lg p-4">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">{formatName(request.beneficiary_name)}</p>
                            <p className="text-sm text-gray-500">
                              CPF: {formatCPF(request.cpf)} | SUS: {formatSUS(request.sus_number)}
                            </p>
                          </div>
                          <div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              request.status === 'approved' 
                                ? 'bg-green-100 text-green-800' 
                                : request.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {request.status === 'approved' 
                                ? 'Aprovado' 
                                : request.status === 'rejected'
                                ? 'Rejeitado'
                                : 'Pendente'}
                            </span>
                          </div>
                        </div>
                        
                        {request.status === 'approved' && (
                          <div className="mt-3 bg-blue-50 p-3 rounded">
                            <p className="text-blue-800 font-medium">Agendamento confirmado:</p>
                            <p className="text-sm">
                              Data: {new Date(request.appointment_date).toLocaleDateString('pt-BR')} às {request.appointment_time}
                            </p>
                            <p className="text-sm">
                              Profissional: {request.professionals?.name}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AppointmentRequest;
