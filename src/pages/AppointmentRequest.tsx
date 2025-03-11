
import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { differenceInYears, parse } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  createAppointmentRequest, 
  fetchPublicAppointmentRequests 
} from '@/services/appointment/appointmentRequest';
import { AppointmentRequest } from '@/types/appointmentRequest';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

// Esquema de validação
const formSchema = z.object({
  beneficiary_name: z.string().min(3, { message: 'Nome completo é obrigatório' }),
  cpf: z.string().min(11, { message: 'CPF inválido' }).max(14, { message: 'CPF inválido' }),
  sus_number: z.string().min(15, { message: 'Número do SUS inválido' }),
  phone: z.string().min(10, { message: 'Telefone inválido' }),
  address: z.string().min(5, { message: 'Endereço é obrigatório' }),
  birth_date: z.string().refine(
    (date) => {
      try {
        const parsedDate = parse(date, 'dd/MM/yyyy', new Date());
        return !isNaN(parsedDate.getTime());
      } catch {
        return false;
      }
    },
    {
      message: 'Data inválida. Use o formato DD/MM/AAAA',
    }
  ),
});

// Componente principal
const AppointmentRequest = () => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [publicRequests, setPublicRequests] = useState<AppointmentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Configuração do formulário
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      beneficiary_name: '',
      cpf: '',
      sus_number: '',
      phone: '',
      address: '',
      birth_date: '',
    },
  });

  // Carregar solicitações públicas
  const loadPublicRequests = async () => {
    setLoading(true);
    const data = await fetchPublicAppointmentRequests();
    setPublicRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPublicRequests();
  }, []);

  // Função para calcular a idade com base na data de nascimento
  const calculateAge = (birthDateStr: string): number => {
    try {
      const birthDate = parse(birthDateStr, 'dd/MM/yyyy', new Date());
      return differenceInYears(new Date(), birthDate);
    } catch {
      return 0;
    }
  };

  // Submissão do formulário
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setSubmitting(true);

    try {
      // Converter data de nascimento para formato ISO
      const birthDateParts = data.birth_date.split('/');
      const isoDate = `${birthDateParts[2]}-${birthDateParts[1]}-${birthDateParts[0]}`;
      
      // Calcular idade
      const age = calculateAge(data.birth_date);

      const result = await createAppointmentRequest({
        ...data,
        birth_date: isoDate,
        age
      });

      if (result.success) {
        toast({
          title: "Solicitação enviada",
          description: "Sua solicitação foi enviada com sucesso. Acompanhe o status abaixo.",
        });
        form.reset();
        loadPublicRequests();
      } else {
        toast({
          title: "Erro",
          description: result.error || "Ocorreu um erro ao enviar sua solicitação.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar sua solicitação.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Função para mascarar o CPF
  const maskCpf = (cpf: string): string => {
    return cpf.slice(0, 3) + '.***.***-**';
  };

  // Função para mascarar o número do SUS
  const maskSusNumber = (sus: string): string => {
    return sus.slice(0, 3) + ' **** **** ****';
  };

  // Função para obter o primeiro nome
  const getFirstName = (fullName: string): string => {
    return fullName.split(' ')[0];
  };

  // Função para formatar a data
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Solicitação de Agendamento - Bolsa Família</h1>
        <p className="text-gray-600">
          Preencha o formulário abaixo para solicitar um agendamento no programa Bolsa Família.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Formulário de Solicitação</CardTitle>
          <CardDescription>
            Todos os campos são obrigatórios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="beneficiary_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo do Beneficiário</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="000.000.000-00" 
                        {...field}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length > 3) {
                            value = value.replace(/^(\d{3})(\d)/, '$1.$2');
                          }
                          if (value.length > 7) {
                            value = value.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
                          }
                          if (value.length > 11) {
                            value = value.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
                          }
                          field.onChange(value);
                        }}
                        maxLength={14}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sus_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número do SUS</FormLabel>
                    <FormControl>
                      <Input placeholder="000 0000 0000 0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua, número, bairro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birth_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Nascimento</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="DD/MM/AAAA" 
                        {...field}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length > 2) {
                            value = value.replace(/^(\d{2})(\d)/, '$1/$2');
                          }
                          if (value.length > 5) {
                            value = value.replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
                          }
                          field.onChange(value);
                          
                          // Se a data está no formato correto, calcular e mostrar a idade
                          if (value.length === 10) {
                            const age = calculateAge(value);
                            if (age > 0) {
                              form.setValue('birth_date', value);
                            }
                          }
                        }}
                        maxLength={10}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Enviando...' : 'Enviar Solicitação'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Solicitações Recentes</CardTitle>
          <CardDescription>
            Acompanhe o status da sua solicitação. Apenas dados parciais são exibidos por segurança.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <p>Carregando solicitações...</p>
            </div>
          ) : publicRequests.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Nenhuma solicitação encontrada.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>SUS</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Profissional</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {publicRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{getFirstName(request.beneficiary_name)}</TableCell>
                      <TableCell>{maskCpf(request.cpf)}</TableCell>
                      <TableCell>{maskSusNumber(request.sus_number)}</TableCell>
                      <TableCell>
                        {request.status === 'approved' ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center gap-1 whitespace-nowrap">
                            <CheckCircle2 className="h-3 w-3" /> Aprovado
                          </Badge>
                        ) : request.status === 'rejected' ? (
                          <Badge variant="outline" className="bg-red-100 text-red-800 flex items-center gap-1 whitespace-nowrap">
                            <XCircle className="h-3 w-3" /> Rejeitado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 flex items-center gap-1 whitespace-nowrap">
                            <Clock className="h-3 w-3" /> Pendente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {request.appointment_date ? formatDate(request.appointment_date) : '-'}
                        {request.appointment_time ? ` ${request.appointment_time.substring(0, 5)}` : ''}
                      </TableCell>
                      <TableCell>{request.professional_name || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500 italic">
            Quando sua solicitação for aprovada, a data e o profissional serão exibidos nesta lista.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AppointmentRequest;
