import React from "react";

export const DisplayHeader = () => {
  return (
    <div className="mb-8 flex flex-col items-center gap-4">
      <img 
        src="unifap-logo.png" 
        alt="UNIFAP Logo" 
        className="h-24 w-auto"
      />
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-1">
          UNIVERSIDADE FEDERAL DO AMAPÁ
        </h1>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">
          UNIDADE BÁSICA DE SAÚDE
        </h2>
      </div>
    </div>
  );
};