import { Progress as AntdProgress, type ProgressProps } from 'antd';

type ProgressType = ProgressProps;

export default function Progress({ ...props }: ProgressType) {
	return <AntdProgress {...props} />;
}
