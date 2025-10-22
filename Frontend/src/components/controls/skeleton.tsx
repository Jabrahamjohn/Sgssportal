import { Skeleton as AntdSkeleton } from 'antd';

import type { SkeletonProps } from 'antd';

type SkeletonType = SkeletonProps;

function Skeleton(props: SkeletonType) {
  return <AntdSkeleton {...props} />;
}

Skeleton.Avatar = AntdSkeleton.Avatar;
Skeleton.Button = AntdSkeleton.Button;
Skeleton.Input = AntdSkeleton.Input;

export default Skeleton;
