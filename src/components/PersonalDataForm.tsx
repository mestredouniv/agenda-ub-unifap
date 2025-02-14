
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PersonalDataFormProps } from "@/types/appointment";

export const PersonalDataForm = ({ formData, onChange, errors = {} }: PersonalDataFormProps) => {
  const isMinor = parseInt(formData.age) < 18;

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const utcDate = new Date(Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        12, 0, 0, 0
      ));
      onChange("birthDate", utcDate.toISOString());
    }
  };

  const getFormattedDate = (dateString: string) => {
    try {
      if (!dateString) return "";
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "";
    }
  };

  const maxDate = new Date();

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="patientName">Nome Completo</Label>
          <Input
            id="patientName"
            value={formData.patientName}
            onChange={(e) => onChange("patientName", e.target.value)}
            className={errors.patientName ? "border-red-500" : ""}
            required
          />
        </div>

        <div>
          <Label htmlFor="birthDate">Data de Nascimento</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.birthDate && "text-muted-foreground",
                  errors.birthDate ? "border-red-500" : ""
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.birthDate ? (
                  getFormattedDate(formData.birthDate)
                ) : (
                  <span>Selecione uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.birthDate ? new Date(formData.birthDate) : undefined}
                onSelect={handleDateSelect}
                disabled={(date) => date > maxDate}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            value={formData.cpf}
            onChange={(e) => onChange("cpf", e.target.value)}
            className={errors.cpf ? "border-red-500" : ""}
            required
          />
        </div>

        <div>
          <Label htmlFor="sus">Cartão SUS</Label>
          <Input
            id="sus"
            value={formData.sus}
            onChange={(e) => onChange("sus", e.target.value)}
            className={errors.sus ? "border-red-500" : ""}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone">Telefone de Contato</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            className={errors.phone ? "border-red-500" : ""}
            required
          />
        </div>

        <div>
          <Label htmlFor="age">Idade</Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => onChange("age", e.target.value)}
            className={errors.age ? "border-red-500" : ""}
            required
          />
        </div>
      </div>

      {isMinor && (
        <div>
          <Label htmlFor="responsible">Nome do Responsável</Label>
          <Input
            id="responsible"
            value={formData.responsible}
            onChange={(e) => onChange("responsible", e.target.value)}
            className={errors.responsible ? "border-red-500" : ""}
            required
          />
        </div>
      )}

      <div>
        <Label htmlFor="cep">CEP</Label>
        <Input
          id="cep"
          value={formData.cep}
          onChange={(e) => onChange("cep", e.target.value)}
          className={errors.cep ? "border-red-500" : ""}
          required
        />
      </div>

      <div>
        <Label htmlFor="address">Endereço Completo</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => onChange("address", e.target.value)}
          className={errors.address ? "border-red-500" : ""}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="neighborhood">Bairro</Label>
          <Input
            id="neighborhood"
            value={formData.neighborhood}
            onChange={(e) => onChange("neighborhood", e.target.value)}
            className={errors.neighborhood ? "border-red-500" : ""}
            required
          />
        </div>

        <div>
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => onChange("city", e.target.value)}
            className={errors.city ? "border-red-500" : ""}
            required
          />
        </div>
      </div>
    </div>
  );
};
