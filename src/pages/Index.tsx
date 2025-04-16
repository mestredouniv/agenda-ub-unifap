
import { Header } from "@/components/Header";
import { DailyAnnouncements } from "@/components/DailyAnnouncements";
import { NetworkStatus } from "@/components/NetworkStatus";
import { ProfessionalsManager } from "@/components/professionals/ProfessionalsManager";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header onAddClick={() => {}} />
      
      <main className="container mx-auto px-4 py-6">
        <NetworkStatus showSuccessAlert={false} />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <DailyAnnouncements />
        </div>

        <div className="mt-8">
          <ProfessionalsManager />
        </div>
      </main>
    </div>
  );
};

export default Index;
