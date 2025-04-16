
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppointmentRequestsManager } from '@/components/AppointmentRequestsManager';
import { BackToHomeButton } from '@/components/BackToHomeButton';

const RequestsManager = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Solicitações</h1>
        <BackToHomeButton />
      </div>
      
      <Tabs defaultValue="bolsa-familia">
        <TabsList className="mb-4">
          <TabsTrigger value="bolsa-familia">Bolsa Família</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bolsa-familia">
          <AppointmentRequestsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RequestsManager;
