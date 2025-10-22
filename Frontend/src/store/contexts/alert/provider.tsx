import { CheckCircleFilled, CloseCircleFilled, ExclamationCircleFilled } from '@ant-design/icons';
import React from 'react';

import { AlertContext, type AlertContextHandlerType } from './context';

const AlertProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const timeoutRef = React.useRef<any>(null);
  const [alert, setAlert] = React.useState<AlertContextHandlerType | null>(null);

  const colors = React.useMemo(() => {
    let data = {
      icon: <ExclamationCircleFilled />,
    };
    if (alert?.type === 'danger' || alert?.type === 'error') {
      data = {
        icon: <CloseCircleFilled />,
      };
    } else if (alert?.type === 'success') {
      data = {
        icon: <CheckCircleFilled />,
      };
    } else if (alert?.type === 'warning') {
      data = {
        icon: <ExclamationCircleFilled />,
      };
    }

    return data;
  }, [alert?.type]);

  const open = React.useCallback((data: AlertContextHandlerType) => {
    setAlert(data);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setAlert(null);
    }, data.duration || 5000);
  }, []);

  const close = React.useCallback(() => {
    setAlert(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <AlertContext.Provider
      value={{
        open,
        close,
        success: (message, options) => open({ message, type: 'success', ...options }),
        error: (message, options) => open({ message, type: 'error', ...options }),
      }}
    >
      <div
        className={`${alert ? 'translate-y-0 z-[9999]' : 'translate-y-full -z-10'} ${
          alert?.rootClassName || ''
        } duration-700 notification-alert`}
      >
        <div className={`notification-alert-wrapper ${alert?.wrapperClassName || ''}`}>
          {alert && (
            <div className={`notification-alert-msg-container ${alert.type || 'default'}`}>
              <span className="notification-alert-icon">{colors.icon}</span>
              <span className="notification-alert-message">{alert.message}</span>
            </div>
          )}
        </div>
      </div>

      {children}
    </AlertContext.Provider>
  );
};

export default AlertProvider;
