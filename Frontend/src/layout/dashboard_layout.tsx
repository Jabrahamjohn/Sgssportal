import { Button, Drawer, Flex, Layout, Skeleton } from 'antd';
import { BiLogOut } from 'react-icons/bi';
import { useLocation, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { IoIosClose } from 'react-icons/io';
import { RiMenu3Fill } from 'react-icons/ri';
import Logo from '~/components/common/logo';
import { nav_items } from '~/components/dummy_data/general';
import { useAuth } from '~/store/contexts/AuthContext';

const { Header, Content, Sider } = Layout;

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [openSidebar, setOpenSidebar] = useState(false);
  const { auth, logout, loading } = useAuth();

  const { user } = auth;

  const showSidebar = () => {
    setOpenSidebar(true);
  };

  const closeSidebar = () => {
    setOpenSidebar(false);
  };

  const siderStyle: React.CSSProperties = {
    overflow: 'auto',
    height: '100vh',
    position: 'fixed',
    zIndex: 2,
    insetInlineStart: 0,
    top: '5rem',
    bottom: 0,
    scrollbarWidth: 'thin',
    scrollbarGutter: 'stable',
  };

  const sidebarWidth = '16rem';

  return (
    <>
      <Sidebar open={openSidebar} closeSidebar={closeSidebar} />
      <Layout>
        <Header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            width: '100%',
            height: '5rem',
            display: 'flex',
            alignItems: 'center',
          }}
          className='px-6 md:px-8'
        >
          <Flex
            className='w-full text-white'
            justify='space-between'
            align='center'
          >
            <Logo className='text-gray-300' />

            <div
              className='md:hidden flex items-center justify-center'
              onClick={showSidebar}
            >
              <RiMenu3Fill size={23} />
            </div>

            <div className='hidden md:block'>
              <Button
                type='primary'
                style={{
                  background: 'red',
                }}
                size='large'
                onClick={logout}
              >
                <span className='font-medium'>Logout</span>
                <BiLogOut size={23} />
              </Button>
            </div>
          </Flex>
        </Header>
        <Layout hasSider>
          <Sider
            width={sidebarWidth}
            style={siderStyle}
            className='hidden md:block'
          >
            <section className='flex flex-col justify-between h-4/5'>
              <div className='mt-14 text-base px-6 flex flex-col gap-4'>
                {nav_items.map((item, i) => {
                  return (
                    <div
                      onClick={() => navigate(item.link)}
                      key={i}
                      className={`cursor-pointer text-gray-300 py-2 px-3 flex items-center gap-4 rounded-lg transition-all hover:bg-blue-700 hover:text-white ${
                        pathname === item.link
                          ? 'bg-blue-700 text-white'
                          : 'bg-transparent'
                      }`}
                    >
                      <item.icon className='text-xl' />
                      <span>{item.name}</span>
                    </div>
                  );
                })}
              </div>
              <Flex
                style={{
                  padding: '0 24px',
                }}
                align='center'
              >
                <Flex vertical style={{ color: 'white' }}>
                  <h3 className='text-base font-medium'>
                    {loading ? (
                      <Skeleton.Input active />
                    ) : (
                      user?.full_name || 'Mahmud Abdulazeez'
                    )}
                  </h3>
                  <div className='text-gray-400 italic text-sm'>
                    {loading ? (
                      <Skeleton.Input active />
                    ) : (
                      user?.email || 'mahmud@mailinator.com'
                    )}
                  </div>
                </Flex>
              </Flex>
            </section>
          </Sider>
          <Layout>
            <Content
              style={{
                padding: 24,
                margin: 0,
                minHeight: '100vh',
                overflow: 'initial',
              }}
              className='relative md:left-[16rem] md:w-[80%]'
            >
              {children}
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </>
  );
};

const Sidebar = ({
  closeSidebar,
  open,
}: {
  open: boolean;
  closeSidebar: () => void;
}) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { loading, auth } = useAuth();
  const { user } = auth;

  return (
    <Drawer
      width={'75%'}
      open={open}
      onClose={closeSidebar}
      title={
        <Flex justify='space-between' align='center'>
          <Logo className='text-gray-700' />
          <IoIosClose color='red' size={35} onClick={closeSidebar} />
        </Flex>
      }
      className='md:hidden'
      closable={false}
    >
      <section className='flex flex-col justify-between w-full h-full'>
        <div className='mt-5 px-1 flex flex-col gap-4'>
          {nav_items.map((item, i) => {
            return (
              <div
                key={i}
                className={`py-3 px-3 flex items-center gap-4 rounded-lg cursor-pointer ${
                  pathname === item.link
                    ? 'bg-blue-700 text-white'
                    : 'bg-transparent'
                }`}
                onClick={() => {
                  closeSidebar();
                  navigate(item.link);
                }}
              >
                <item.icon className='text-lg' />
                <span>{item.name}</span>
              </div>
            );
          })}
        </div>

        <Flex
          style={{
            padding: '0 24px',
          }}
          align='center'
        >
          <Flex vertical>
            <h3 className='text-base font-medium'>
              {loading ? (
                <Skeleton.Input active />
              ) : (
                user?.full_name || 'Mahmud Abdulazeez'
              )}
            </h3>
            <div className='text-gray-400 italic text-sm'>
              {loading ? (
                <Skeleton.Input active />
              ) : (
                user?.email || 'mahmud@mailinator.com'
              )}
            </div>
          </Flex>
        </Flex>
      </section>
    </Drawer>
  );
};

export default DashboardLayout;
