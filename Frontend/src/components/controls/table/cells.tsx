import { Tooltip } from 'antd';
import React from 'react';

import Button from '../button';
import Link from '../link';
import { DisplayImage } from '../image';

import type { ButtonProps } from 'antd';

export type TableActionType = Omit<ButtonProps, 'icon'> & {
  container?: React.ComponentType<any>;
  keepButtonContainer?: boolean;
  title?: string;
  href?: string;
  icon: React.ComponentType<any>;
  color?: ColorType;
};

export type TableActionComponentType = {
  component: React.ComponentType<unknown>;
  title?: string;
};

type ColorType = 'success' | 'error' | 'warning' | 'info' | 'primary';

function getColor(color: ColorType | undefined) {
  switch (color) {
    case 'success':
      return 'text-green-600';
    case 'error':
      return 'text-red-600';
    case 'info':
      return 'text-gray-600';
    case 'warning':
      return 'text-yellow-600';
    case 'primary':
      return 'text-primary-500';
    default:
      return 'text-primary-500';
  }
}

export function TableActionsCell({ actions }: { actions: (TableActionType | TableActionComponentType | null)[] }) {
  const ctas = React.useMemo(() => actions.filter((item) => item !== null), [actions]);

  return (
    <div className="flex items-center whitespace-nowrap">
      {(ctas as TableActionType[]).map((action, index: number) => {
        if ('component' in action) {
          const { component: Action, title = 'Button' } = action as TableActionComponentType;
          return (
            <span className="px-2" key={index}>
              <Tooltip title={title || 'Button'}>
                <div>
                  <Action />
                </div>
              </Tooltip>
            </span>
          );
        }
        const { container: Container, keepButtonContainer = true, title, href, icon: Icon, color, ...props } = action;
        return (
          <span className="px-2" key={index}>
            <Tooltip title={title || 'Button'}>
              <div>
                {Container ? (
                  keepButtonContainer ? (
                    <Container>
                      <Button
                        className="flex items-center justify-center"
                        icon={() => (
                          <span className={`${getColor(color)} text-sm md:text-base`}>
                            <Icon />
                          </span>
                        )}
                        shape="circle"
                        type="default"
                        {...props}
                      />{' '}
                    </Container>
                  ) : (
                    <Container>
                      <span className={`${getColor(color)} text-sm md:text-base`}>
                        <Icon />
                      </span>
                    </Container>
                  )
                ) : href ? (
                  <Link to={href}>
                    <Button
                      className="flex items-center justify-center"
                      icon={() => (
                        <span className={`${getColor(color)} text-sm md:text-base`}>
                          <Icon />
                        </span>
                      )}
                      shape="circle"
                      type="default"
                      {...props}
                    />
                  </Link>
                ) : (
                  <Button
                    className="flex items-center justify-center"
                    icon={() => (
                      <span className={`${getColor(color)} text-sm md:text-base`}>
                        <Icon />
                      </span>
                    )}
                    shape="circle"
                    type="default"
                    {...props}
                  />
                )}
              </div>
            </Tooltip>
          </span>
        );
      })}
    </div>
  );
}

export function TableAvatarTitleCell({
  titleClass = '',
  image,
  title,
}: {
  titleClass?: string;
  image?: string | null;
  title: string;
}) {
  return (
    <div className="table-avatar-title-sub-cell">
      {image ? (
        <section className="table-avatar-title-sub-cell-image">
          <div>
            <DisplayImage alt={title} src={image} />
          </div>
        </section>
      ) : (
        <span className="table-avatar-title-sub-cell-image-placeholder">
          <span>{title[0]}</span>
        </span>
      )}
      <section className="table-avatar-title-sub-cell-title">
        <p className={'title ' + titleClass}>{title}</p>
      </section>
    </div>
  );
}

export function TableAvatarTitleSubCell({
  className,
  image,
  subtitle = '----- -----',
  titleClass = '',
  title,
}: {
  className?: string;
  image?: string | null | React.ReactNode;
  titleClass?: string;
  title: string;
  subtitle?: React.ReactNode | null;
}) {
  return (
    <div className={`table-avatar-title-sub-cell ${className || ''}`}>
      {typeof image === 'string' ? (
        <section className="table-avatar-title-sub-cell-image">
          <div>
            <DisplayImage alt={title} src={image} />
          </div>
        </section>
      ) : image !== null && typeof image !== 'undefined' ? (
        image
      ) : (
        <span className="table-avatar-title-sub-cell-image-placeholder">
          <span>{title[0]}</span>
        </span>
      )}
      <section className="table-avatar-title-sub-cell-title">
        <p className={'title ' + titleClass}>{title}</p>
        <p className="subtitle">{subtitle}</p>
      </section>
    </div>
  );
}

export function TableTitleSubCell({
  className,
  subtitle = '----- -----',
  titleClass = '',
  title,
}: {
  className?: string;
  titleClass?: string;
  title: string;
  subtitle?: React.ReactNode | null;
}) {
  return (
    <div className={`table-avatar-title-sub-cell ${className || ''}`}>
      <section className="table-avatar-title-sub-cell-title !pl-0">
        <p className={'title ' + titleClass}>{title}</p>
        <p className="subtitle">{subtitle}</p>
      </section>
    </div>
  );
}

export function TableIconTitleSubCell({
  bg = 'table-icon-bg',
  title,
  subtitle,
  icon: Icon,
  titleClassName = '',
}: {
  bg?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  titleClassName?: string;
  icon: React.ComponentType<any>;
}) {
  return (
    <span className="flex items-start no-underline py-2">
      <section className="flex-shrink-0 h-10 w-10">
        <span
          className={`${bg} h-10 inline-flex items-center justify-center relative rounded-full dark-text-color w-10`}
        >
          <Icon />
        </span>
      </section>
      <section className="ml-2 text-left">
        <div className={`normal-case text-sm font-medium dark-text-color ${titleClassName}`}>{title}</div>
        {subtitle && <div className="font-normal text-xs table-data-color">{subtitle}</div>}
      </section>
    </span>
  );
}

export function TableAvatarEmailNameCell({ email, image, name }: { name: string; email: string; image?: string }) {
  return (
    <div className="flex items-center py-2">
      {image && (
        <section className="flex-shrink-0 h-10 w-10">
          <div className="h-10 relative rounded-full w-10">
            <DisplayImage alt="" className="rounded-full h-full w-full" src={image} />
          </div>
        </section>
      )}
      <section className={`${image ? 'ml-4' : ''} text-left`}>
        <div className="text-sm font-medium text-gray-900">{name}</div>
        <div className="normal-case font-normal text-sm text-gray-500">{email}</div>
      </section>
    </div>
  );
}
