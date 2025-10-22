import { Switch as AntdSwitch } from 'antd';

import type { SwitchProps } from 'antd';

export type SwitchType = SwitchProps;

function Switch(props: SwitchType) {
  return <AntdSwitch {...props} />;
}

export default Switch;
