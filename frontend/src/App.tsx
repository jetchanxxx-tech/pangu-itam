import React from 'react';
import { ConfigProvider, theme as antTheme } from 'antd';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useThemeStore } from './store/themeStore';
import './i18n';

import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import AssetList from './pages/AssetList';
import Topology from './pages/Topology';
import ImportData from './pages/ImportData';
import Settings from './pages/Settings';
import Wiki from './pages/Wiki';
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
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="assets" element={<AssetList />} />
            <Route path="topology" element={<Topology />} />
            <Route path="import" element={<ImportData />} />
            <Route path="settings" element={<Settings />} />
            <Route path="wiki" element={<Wiki />} />
          </Route>
          <Route path="/terminal" element={<WebTerminal />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
