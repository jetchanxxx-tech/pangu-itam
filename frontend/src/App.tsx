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

  return (
    <ConfigProvider
      theme={{
        algorithm: mode === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
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
