
import { useEffect, useState } from "react";
import { DisplayHeader } from "@/components/DisplayHeader";
import { useDisplayState } from "@/hooks/useDisplayState";
import { useDisplayContent, DisplayContent } from "@/hooks/useDisplayContent";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { DisplayEditPanel } from "@/components/DisplayEditPanel";

const Display = () => {
  const currentPatient = useDisplayState((state) => state.currentPatient);
  const { contents, settings, loading, updateSettings } = useDisplayContent();
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [displayClass, setDisplayClass] = useState("");
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);

  const getNextContentIndex = (current: number, total: number, mode: 'sequential' | 'random') => {
    if (mode === 'random') {
      let next = Math.floor(Math.random() * total);
      while (next === current && total > 1) {
        next = Math.floor(Math.random() * total);
      }
      return next;
    }
    return (current + 1) % total;
  };

  useEffect(() => {
    if (contents.length === 0) return;

    const content = contents[currentContentIndex];
    const timer = setTimeout(() => {
      setCurrentContentIndex(current => 
        getNextContentIndex(current, contents.length, settings?.rotation_mode || 'sequential')
      );
    }, content.display_time * 1000);

    return () => clearTimeout(timer);
  }, [currentContentIndex, contents, settings?.rotation_mode]);

  useEffect(() => {
    setDisplayClass("animate-fade-in");
    const timer = setTimeout(() => setDisplayClass(""), 500);
    return () => clearTimeout(timer);
  }, [currentPatient, currentContentIndex]);

  const toggleEditMode = () => {
    setIsEditPanelOpen(!isEditPanelOpen);
    if (settings) {
      updateSettings({ is_edit_mode: !settings.is_edit_mode });
    }
  };

  const renderContent = (content: DisplayContent) => {
    switch (content.type) {
      case 'text':
        return <div className="text-2xl" dangerouslySetInnerHTML={{ __html: content.content }} />;
      case 'image':
        return <img src={content.content} alt="Display content" className="max-h-[50vh] object-contain" />;
      case 'youtube':
        return (
          <iframe
            width="100%"
            height="400"
            src={`https://www.youtube.com/embed/${content.content}?autoplay=1&mute=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        );
      case 'last_calls':
        return (
          <div className="text-4xl font-bold">
            Últimas Chamadas
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
        <div className="text-4xl font-bold">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 relative">
      <DisplayHeader />
      
      {/* Edit Button - Always visible but conditionally enabled */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 right-4 z-50 bg-white shadow-md hover:bg-gray-100"
        onClick={toggleEditMode}
      >
        <Settings2 className="h-6 w-6" />
      </Button>

      {/* Edit Panel */}
      {isEditPanelOpen && <DisplayEditPanel onClose={() => setIsEditPanelOpen(false)} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-2 text-gray-700">Paciente</h2>
          <p className="text-3xl font-bold text-gray-900">
            {currentPatient?.name || "Aguardando..."}
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-2 text-gray-700">Consultório</h2>
          <p className="text-3xl font-bold text-gray-900">
            {currentPatient?.professional || "Aguardando..."}
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-2 text-gray-700">Status</h2>
          <p className="text-3xl font-bold text-gray-900">
            {currentPatient?.status === "waiting" && "Aguardando"}
            {currentPatient?.status === "triage" && "Em Triagem"}
            {currentPatient?.status === "in_progress" && "Em Atendimento"}
          </p>
        </div>

        <div className={`col-span-1 md:col-span-3 bg-white border border-gray-200 p-6 rounded-lg shadow-sm min-h-[50vh] flex items-center justify-center ${displayClass}`}>
          {contents.length > 0 ? (
            renderContent(contents[currentContentIndex])
          ) : (
            <div className="text-2xl text-gray-400">
              Nenhum conteúdo configurado
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Display;
