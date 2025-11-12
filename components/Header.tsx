
import React from 'react';
import { PhoenixIcon } from './icons/PhoenixIcon';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900/70 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-800">
      <div className="container mx-auto px-4 py-3 flex items-center justify-center">
        <PhoenixIcon className="h-8 w-8 text-amber-500 mr-3" />
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Zenthflow
        </h1>
      </div>
    </header>
  );
};
