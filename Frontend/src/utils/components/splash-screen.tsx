import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';

const SplashScreen = () => (
  <div className=" flex flex-col flex-grow fixed h-full items-center justify-center w-full">
    <Spin indicator={<LoadingOutlined className="text-gray-500" />} spinning size="large" />
  </div>
);

export default SplashScreen;
