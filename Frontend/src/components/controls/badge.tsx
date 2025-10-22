import { Badge as AntdBadge, type BadgeProps } from 'antd';

type BadgeType = BadgeProps;

export default function Badge(props: BadgeType) {
  return <AntdBadge {...props} />;
}
