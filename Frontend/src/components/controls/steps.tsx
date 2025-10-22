import { Steps as AntdSteps } from 'antd';

import type { StepsProps } from 'antd';

export type StepsType = StepsProps;

export default function Steps({ ...props }: StepsType) {
  return <AntdSteps {...props} />;
}

Steps.Step = AntdSteps.Step;
