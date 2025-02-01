import { useDisplayState } from "@/hooks/useDisplayState";
import { DisplayHeader } from "@/components/DisplayHeader";

const Display = () => {
  const currentPatient = useDisplayState((state) => state.currentPatient);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <DisplayHeader />
      
      <div className="max-w-4xl mx-auto mt-8">
        {currentPatient ? (
          <div className="bg-white p-8 rounded-lg shadow-lg text-center animate-fade-in">
            <h2 className="text-3xl font-bold mb-4">
              {currentPatient.status === 'waiting' && 'Próximo Paciente'}
              {currentPatient.status === 'triage' && 'Paciente para Triagem'}
              {currentPatient.status === 'in_progress' && 'Em Atendimento'}
            </h2>
            <p className="text-2xl mb-2">{currentPatient.name}</p>
            <p className="text-xl text-gray-600">
              {currentPatient.professional}
            </p>
          </div>
        ) : (
          <div className="text-center text-gray-500 text-xl">
            Aguardando próximo paciente...
          </div>
        )}
      </div>
    </div>
  );
};

export default Display;