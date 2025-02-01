import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginCredentialsFormProps {
  formData: {
    username: string;
    password: string;
  };
  onChange: (field: string, value: string) => void;
}

export const LoginCredentialsForm = ({ formData, onChange }: LoginCredentialsFormProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="username">Nome de Usuário</Label>
        <Input
          id="username"
          type="text"
          value={formData.username}
          onChange={(e) => onChange("username", e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => onChange("password", e.target.value)}
          required
        />
      </div>
    </div>
  );
};