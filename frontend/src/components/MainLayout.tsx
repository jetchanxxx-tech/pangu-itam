import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, theme as antTheme, Dropdown } from 'antd';
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
const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { mode, toggleTheme } = useThemeStore();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const username = localStorage.getItem('username') || 'User';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const {
    token: { colorBgContainer },
  } = antTheme.useToken();

  const changeLanguage = () => {
    const newLang = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(newLang);
  };

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: t('menu.dashboard'),
    },
    {
      key: '/assets',
      icon: <DesktopOutlined />,
      label: t('menu.assets'),
    },
    {
      key: '/topology',
      icon: <DeploymentUnitOutlined />,
      label: t('menu.topology'),
    },
    {
      key: '/wiki',
      icon: <ReadOutlined />,
      label: t('menu.wiki'),
    },
    {
      key: '/contracts',
      icon: <FileTextOutlined />,
      label: 'Contracts',
    },
    {
      key: '/interfaces',
      icon: <ApiOutlined />,
      label: 'Interfaces',
    },
    {
      key: '/import',
      icon: <ImportOutlined />,
      label: t('menu.import'),
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: t('menu.settings'),
    },
    {
      key: '/help',
      icon: <QuestionCircleOutlined />,
      label: t('menu.help'),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme={mode}>
        <div className="demo-logo-vertical" style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', borderRadius: 6 }} />
        <Menu
          theme={mode}
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <div style={{ marginRight: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button onClick={toggleTheme} type="text">
              {mode === 'dark' ? '🌞' : '🌙'}
            </Button>
            <Button onClick={changeLanguage} type="text">
              {i18n.language === 'en' ? '🇨🇳' : '🇺🇸'}
            </Button>
            <Dropdown menu={{
              items: [
                { key: 'user', icon: <UserOutlined />, label: username, disabled: true },
                { type: 'divider' },
                { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true, onClick: handleLogout },
              ]
            }}>
              <Button icon={<UserOutlined />} type="text">{username}</Button>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
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
