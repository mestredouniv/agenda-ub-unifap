import React from "react";
import { Card } from "@/components/ui/card";

interface Patient {
  password: string;
  name: string;
  room: string;
  professional: string;
}

interface PatientCardProps {
  patient: Patient;
}

export const PatientCard = ({ patient }: PatientCardProps) => {
  return (
    <Card className="mb-8 p-8 bg-white shadow-lg rounded-xl border-2 border-primary/20">
      <div className="grid grid-cols-2 gap-8 text-center">
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-primary">SENHA</h3>
          <p className="text-5xl font-bold text-gray-800">{patient.password}</p>
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-primary">SALA</h3>
          <p className="text-5xl text-gray-800">{patient.room}</p>
        </div>
        <div className="col-span-2 mt-6">
          <h3 className="text-2xl font-bold text-primary">PACIENTE</h3>
          <p className="text-4xl mt-3 text-gray-800">{patient.name}</p>
        </div>
        <div className="col-span-2">
          <h3 className="text-2xl font-bold text-primary">PROFISSIONAL</h3>
          <p className="text-4xl mt-3 text-gray-800">{patient.professional}</p>
        </div>
      </div>
    </Card>
  );
};