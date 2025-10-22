import { Spin } from 'antd';
import React from 'react';

// React.lazy<React.ComponentType<any>>(factory: () => Promise<{
//   default: React.ComponentType<any>;
// }>): React.LazyExoticComponent<React.ComponentType<any>>

function Dynamic({
  fallback,
  component: DynamicComponent,
}: {
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  fallback?: React.ReactNode;
}) {
  return (
    <React.Suspense
      fallback={
        fallback || (
          <div className="flex h-full items-center justify-center min-h-[45vh] w-full">
            <Spin spinning />
          </div>
        )
      }
    >
      <DynamicComponent />
    </React.Suspense>
  );
}

export default Dynamic;
