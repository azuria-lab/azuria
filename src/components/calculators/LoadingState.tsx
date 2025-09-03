
import React from "react";

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = "Carregando..." }: LoadingStateProps) {
  return (
    <div className="animate-pulse flex flex-col items-center py-8">
      <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-36"></div>
      {message && (
        <p className="text-sm text-gray-600 mt-3 text-center">{message}</p>
      )}
    </div>
  );
}
