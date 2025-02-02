import { useEffect, useState } from "react";
import { DisplayHeader } from "@/components/DisplayHeader";
import { useDisplayState } from "@/hooks/useDisplayState";

const Display = () => {
  const currentPatient = useDisplayState((state) => state.currentPatient);
  const [displayClass, setDisplayClass] = useState("");

  useEffect(() => {
    // Add animation class when patient changes
    setDisplayClass("animate-fade-in");
    const timer = setTimeout(() => setDisplayClass(""), 500);
    return () => clearTimeout(timer);
  }, [currentPatient]);

  if (!currentPatient) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center text-4xl font-bold">
        Aguardando próximo paciente...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <DisplayHeader />
      <div className={`flex flex-col items-center justify-center min-h-[calc(100vh-80px)] ${displayClass}`}>
        <h1 className="text-6xl font-bold mb-8">{currentPatient.name}</h1>
        <div className="text-3xl text-gray-300">
          {currentPatient.professional && (
            <p className="mb-4">Dr(a). {currentPatient.professional}</p>
          )}
          <p>
            Status:{" "}
            {currentPatient.status === "waiting" && "Aguardando"}
            {currentPatient.status === "triage" && "Em Triagem"}
            {currentPatient.status === "in_progress" && "Em Atendimento"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Display;