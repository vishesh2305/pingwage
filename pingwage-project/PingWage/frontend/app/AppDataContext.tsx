import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppDataContextType {
  isDataLoaded: boolean;
  setIsDataLoaded: (value: boolean) => void;
  employeeName: string;
  setEmployeeName: (name: string) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [employeeName, setEmployeeName] = useState('Nathan');

  return (
    <AppDataContext.Provider
      value={{
        isDataLoaded,
        setIsDataLoaded,
        employeeName,
        setEmployeeName,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider');
  }
  return context;
}
