import { Spin as AntdSpin } from 'antd';

import type { SpinProps } from 'antd';

type SpinType = SpinProps;

function Spin(props: SpinType) {
  return <AntdSpin {...props} />;
}

export default Spin;
