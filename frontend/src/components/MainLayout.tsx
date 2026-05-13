import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Dropdown } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  DesktopOutlined,
  DeploymentUnitOutlined,
  ImportOutlined,
  SettingOutlined,
  ReadOutlined,
  FileTextOutlined,
  ApiOutlined,
  UserOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../store/themeStore';

const { Header, Sider, Content } = Layout;

// Sidebar uses fixed dark purple regardless of theme
const SIDEBAR_BG = '#1E1235';

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { mode, toggleTheme } = useThemeStore();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const username = localStorage.getItem('username') || '用户';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const changeLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en');
  };

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: t('menu.dashboard') },
    { key: '/assets', icon: <DesktopOutlined />, label: t('menu.assets') },
    { key: '/contracts', icon: <FileTextOutlined />, label: '合同管理' },
    { key: '/interfaces', icon: <ApiOutlined />, label: '系统接口' },
    { key: '/topology', icon: <DeploymentUnitOutlined />, label: t('menu.topology') },
    { key: '/wiki', icon: <ReadOutlined />, label: '知识库' },
    { key: '/import', icon: <ImportOutlined />, label: t('menu.import') },
    { key: '/settings', icon: <SettingOutlined />, label: t('menu.settings') },
    { key: '/help', icon: <QuestionCircleOutlined />, label: t('menu.help') },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        style={{
          background: SIDEBAR_BG,
          borderRight: '1px solid rgba(187, 134, 252, 0.1)',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: 64, margin: '16px 16px 8px',
        }}>
          {collapsed ? (
            <img src="/logo.png" alt="ITAM" style={{ height: 32 }} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src="/logo.png" alt="ITAM" style={{ height: 36 }} />
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 18, letterSpacing: 1 }}>
                PANGU ITAM
              </span>
            </div>
          )}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            background: 'transparent',
            borderRight: 'none',
            marginTop: 8,
          }}
          theme="dark"
          // Inject custom colors via CSS variables handled by Ant Design dark menu
        />
      </Sider>

      <Layout>
        <Header style={{
          padding: '0 24px',
          background: mode === 'dark' ? '#2A1B4D' : '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${mode === 'dark' ? '#3D2B66' : '#E8DCF8'}`,
          boxShadow: '0 1px 4px rgba(98, 0, 238, 0.06)',
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16, width: 48, height: 48, color: mode === 'dark' ? '#B8A9D4' : '#6200EE' }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button onClick={toggleTheme} type="text" style={{ fontSize: 16 }}>
              {mode === 'dark' ? '☀️' : '🌙'}
            </Button>
            <Button onClick={changeLanguage} type="text" style={{ fontSize: 14, fontWeight: 500 }}>
              {i18n.language === 'en' ? '中文' : 'EN'}
            </Button>
            <Dropdown menu={{
              items: [
                { key: 'user', icon: <UserOutlined />, label: username, disabled: true },
                { type: 'divider' },
                { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true, onClick: handleLogout },
              ],
            }}>
              <Button icon={<UserOutlined />} type="text" style={{ color: mode === 'dark' ? '#B8A9D4' : '#6200EE' }}>
                {username}
              </Button>
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            margin: 24,
            padding: 24,
            minHeight: 280,
            background: mode === 'dark' ? '#2A1B4D' : '#FFFFFF',
            borderRadius: 12,
            boxShadow: mode === 'dark'
              ? '0 2px 8px rgba(0,0,0,0.3)'
              : '0 2px 8px rgba(98, 0, 238, 0.06)',
            border: `1px solid ${mode === 'dark' ? '#3D2B66' : '#E8DCF8'}`,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
