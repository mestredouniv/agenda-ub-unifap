
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { ConsultaHeader } from "@/components/ConsultaHeader";
import { Download, Share2 } from "lucide-react";
import { SearchResultsTable } from "@/components/hanseniase/SearchResultsTable";
import { PatientDetails } from "@/components/hanseniase/PatientDetails";
import { PatientRegistrationDialog } from "@/components/hanseniase/PatientRegistrationDialog";
import { SearchBar } from "@/components/hanseniase/SearchBar";
import { useHanseniasePatient } from "@/hooks/useHanseniasePatient";
import { usePatientSearch } from "@/hooks/usePatientSearch";
import { usePatientRegistration } from "@/hooks/usePatientRegistration";

const Hanseniase = () => {
  const {
    selectedPatient,
    treatmentData,
    handleTreatmentDataChange,
    handleSelectPatient,
    handleDownload,
    handleShare,
  } = useHanseniasePatient();

  const {
    searchTerm,
    setSearchTerm,
    patients,
    showSearchResults,
    setShowSearchResults,
    handleSearch,
  } = usePatientSearch();

  const {
    personalData,
    treatmentData: registrationTreatmentData,
    handlePersonalDataChange,
    handleTreatmentDataChange: handleRegistrationTreatmentDataChange,
    handleRegisterPatient,
  } = usePatientRegistration();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <BackToHomeButton />
      <ConsultaHeader />
      
      {selectedPatient && (
        <div className="flex gap-2 mb-4">
          <Button onClick={handleDownload} variant="outline">
            <Download className="mr-2" />
            Baixar Relatório
          </Button>
          <Button onClick={handleShare} variant="outline">
            <Share2 className="mr-2" />
            Compartilhar Relatório
          </Button>
        </div>
      )}

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <SearchBar
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            onSearch={handleSearch}
          />
        </div>
        <PatientRegistrationDialog
          personalData={personalData}
          treatmentData={registrationTreatmentData}
          onPersonalDataChange={handlePersonalDataChange}
          onTreatmentDataChange={handleRegistrationTreatmentDataChange}
          onSubmit={handleRegisterPatient}
        />
      </div>

      {showSearchResults && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados da Busca</CardTitle>
          </CardHeader>
          <CardContent>
            <SearchResultsTable
              patients={patients}
              onSelectPatient={handleSelectPatient}
              onDeletePatient={() => {}}
            />
          </CardContent>
        </Card>
      )}

      {selectedPatient && (
        <PatientDetails
          patient={selectedPatient}
          treatmentData={treatmentData}
          onTreatmentDataChange={handleTreatmentDataChange}
          onPersonalDataChange={handlePersonalDataChange}
          onBack={() => {
            setShowSearchResults(true);
          }}
        />
      )}
    </div>
  );
};

export default Hanseniase;
