import React from 'react';

export type AlertContextType = {
  close: () => void;
  open: (options: AlertContextHandlerType) => void;
  success: (message: string, options?: AlertContextSpecificHandlerType) => void;
  error: (message: string, options?: AlertContextSpecificHandlerType) => void;
};

export type AlertContextHandlerType = {
  duration?: number;
  message: string;
  icon?: 'check' | 'close' | 'exclamation';
  rootClassName?: string;
  type?: 'success' | 'danger' | 'error';
  wrapperClassName?: string;
};

export type AlertContextSpecificHandlerType = Omit<AlertContextHandlerType, 'type' | 'message'>;

export const AlertContext = React.createContext<AlertContextType>({
  open: () => {},
  close: () => {},
  success: () => {},
  error: () => {},
});

export const useAlertContext = () => {
  return React.useContext(AlertContext) as AlertContextType;
};
