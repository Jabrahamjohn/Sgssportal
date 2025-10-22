import { ArrowRightOutlined } from '@ant-design/icons';
import React from 'react';

import { IconButton, Link } from '~/components/controls';
import { useNavigate } from '~/hooks';

type ContainerProps = {
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  backButton?: boolean | string;
};

export default function Container({
  actions,
  backButton,
  children,
  className = '',
  description,
  title,
}: ContainerProps) {
  const { goBack } = useNavigate();

  return (
    <div className={`container-wrapper ${className}`}>
      {(backButton || title || description || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 w-full">
          <div className="flex">
            {backButton && (
              <div className="mr-4">
                {typeof backButton === 'string' ? (
                  <Link to={backButton}>
                    <IconButton
                      className="bg-white"
                      icon={() => <ArrowRightOutlined className="rotate-180 text-xs" />}
                    />
                  </Link>
                ) : (
                  <IconButton
                    className="bg-white"
                    onClick={() => goBack()}
                    icon={() => <ArrowRightOutlined className="rotate-180 text-xs" />}
                  />
                )}
              </div>
            )}
            {(title || description) && (
              <div>
                {title && <h1 className="secondary-text-color font-medium mb-1 text-base md:text-lg">{title}</h1>}
                {description && <p className="secondary-text-color leading-6 text-sm">{description}</p>}
              </div>
            )}
          </div>
          {actions ? <div className="flex items-center flex-wrap gap-4">{actions}</div> : null}
        </div>
      )}
      {children}
    </div>
  );
}
