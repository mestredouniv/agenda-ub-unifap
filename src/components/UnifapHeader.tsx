import { Image } from "@/components/ui/image";

export const UnifapHeader = () => {
  return (
    <div className="flex items-center justify-center gap-4 text-center mb-8">
      <img
        src="/unifap-logo.png"
        alt="UNIFAP Logo"
        className="h-16 w-auto object-contain"
      />
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          UNIVERSIDADE FEDERAL DO AMAPÁ
        </h1>
        <h2 className="text-xl font-semibold text-gray-800">
          UNIDADE BÁSICA DE SAÚDE
        </h2>
        <h3 className="text-lg font-medium text-gray-700">
          AGENDA UBS UNIFAP
        </h3>
      </div>
    </div>
  );
};