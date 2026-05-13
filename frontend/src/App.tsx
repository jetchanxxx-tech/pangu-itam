import React from 'react';
import { ConfigProvider, theme as antTheme } from 'antd';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useThemeStore } from './store/themeStore';
import './i18n';

import MainLayout from './components/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AssetList from './pages/AssetList';
import Topology from './pages/Topology';
import Wiki from './pages/Wiki';
import Contracts from './pages/Contracts';
import Interfaces from './pages/Interfaces';
import ImportData from './pages/ImportData';
import Settings from './pages/Settings';
import Help from './pages/Help';
import WebTerminal from './pages/WebTerminal';

const App: React.FC = () => {
  const { mode } = useThemeStore();

  const lightTokens = {
    colorPrimary: '#6200EE',
    colorInfo: '#6200EE',
    colorSuccess: '#03DAC6',
    colorWarning: '#FFB74D',
    colorError: '#EF5350',
    colorLink: '#6200EE',
    colorTextBase: '#1E1235',
    colorBgBase: '#FFFFFF',
    colorBgContainer: '#FFFFFF',
    colorBgLayout: '#F5F0FF',
    colorBorder: '#E8DCF8',
    borderRadius: 8,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
    colorPrimaryBg: '#F3E8FF',
    colorPrimaryBorder: '#BB86FC',
    colorPrimaryHover: '#7C4DFF',
    colorPrimaryActive: '#3700B3',
  };

  const darkTokens = {
    colorPrimary: '#BB86FC',
    colorInfo: '#BB86FC',
    colorSuccess: '#03DAC6',
    colorWarning: '#FFB74D',
    colorError: '#EF5350',
    colorLink: '#BB86FC',
    colorTextBase: '#E8E0F0',
    colorBgBase: '#1E1235',
    colorBgContainer: '#2A1B4D',
    colorBgLayout: '#160D2B',
    colorBorder: '#3D2B66',
    borderRadius: 8,
    colorPrimaryBg: '#2A1040',
    colorPrimaryBorder: '#6200EE',
    colorPrimaryHover: '#CBA6FA',
    colorPrimaryActive: '#6200EE',
  };

  return (
    <ConfigProvider
      theme={{
        ...(mode === 'dark'
          ? { algorithm: antTheme.darkAlgorithm, token: darkTokens }
          : { algorithm: antTheme.defaultAlgorithm, token: lightTokens }),
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/terminal" element={<WebTerminal />} />
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="assets" element={<AssetList />} />
            <Route path="contracts" element={<Contracts />} />
            <Route path="interfaces" element={<Interfaces />} />
            <Route path="topology" element={<Topology />} />
            <Route path="wiki" element={<Wiki />} />
            <Route path="import" element={<ImportData />} />
            <Route path="settings" element={<Settings />} />
            <Route path="help" element={<Help />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
