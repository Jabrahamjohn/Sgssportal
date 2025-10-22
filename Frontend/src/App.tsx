import '@ant-design/v5-patch-for-react-19';
import { ConfigProvider } from 'antd';
import { RouterProvider } from 'react-router-dom';

import theme from './config/theme';
import router from './router';
import GlobalContextProvider from './store/contexts/provider';

function App() {
  return (
    <ConfigProvider theme={theme({ themeValue: 'light' })}>
      <GlobalContextProvider>
        <RouterProvider router={router} />
      </GlobalContextProvider>
    </ConfigProvider>
  );
}

export default App;
