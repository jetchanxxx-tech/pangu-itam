import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Input, Select, Typography, Modal, Dropdown, MenuProps, Tooltip, Form, message } from 'antd';
import { SearchOutlined, PlusOutlined, DesktopOutlined, CloudServerOutlined, AppstoreOutlined, CodeOutlined, LinkOutlined, WindowsOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getAssets, createAsset, Asset } from '../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

const AssetList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [currentAsset, setCurrentAsset] = useState<Asset | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const data = await getAssets();
      setAssets(data);
    } catch (error) {
      message.error(t('asset_list.messages.load_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values: any) => {
    try {
      await createAsset(values);
      message.success(t('asset_list.messages.create_success'));
      setIsAddModalOpen(false);
      form.resetFields();
      fetchAssets();
    } catch (error) {
      message.error(t('asset_list.messages.create_failed'));
    }
  };

  const handleConnect = (record: Asset) => {
    setCurrentAsset(record);
    setIsConnectModalOpen(true);
  };

  const connectOptions: MenuProps['items'] = [
    {
      key: 'ssh',
      label: t('asset_list.connect_modal.ssh_terminal'),
      icon: <CodeOutlined />,
      onClick: () => {
        setIsConnectModalOpen(false);
        navigate('/terminal'); // Navigate to Web Terminal
      }
    },
    {
      key: 'rdp',
      label: t('asset_list.connect_modal.rdp_connection'),
      icon: <WindowsOutlined />,
      disabled: currentAsset?.type !== 'VM' // Example logic
    },
    {
      key: 'web',
      label: t('asset_list.connect_modal.web_console'),
      icon: <LinkOutlined />,
    },
  ];

  const columns = [
    {
      title: t('asset_list.name'),
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Asset) => (
        <Space>
          {record.type === 'Server' ? <CloudServerOutlined /> : 
           record.type === 'Software' ? <AppstoreOutlined /> : <DesktopOutlined />}
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{record.platform}</div>
          </div>
        </Space>
      ),
    },
    {
      title: t('asset_list.type'),
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: t('asset_list.ip_endpoint'),
      dataIndex: 'ip',
      key: 'ip',
    },
    {
      title: t('asset_list.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = status === 'Running' || status === 'Online' ? 'green' : status === 'Stopped' || status === 'Offline' ? 'volcano' : 'geekblue';
        return (
          <Tag color={color} key={status}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: t('asset_list.owner'),
      dataIndex: 'owner',
      key: 'owner',
    },
    {
      title: t('asset_list.action'),
      key: 'action',
      render: (_: any, record: Asset) => (
        <Space size="middle">
          <a onClick={() => handleConnect(record)}>{t('asset_list.connect')}</a>
          <a>{t('asset_list.edit')}</a>
          <a style={{ color: 'red' }}>{t('asset_list.delete')}</a>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>{t('menu.assets')}</Title>
        <Space>
          <Input 
            placeholder={t('asset_list.search_placeholder')} 
            prefix={<SearchOutlined />} 
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
          <Select defaultValue="All" style={{ width: 120 }}>
            <Option value="All">{t('asset_list.all_types')}</Option>
            <Option value="Server">{t('asset_list.asset_types.server')}</Option>
            <Option value="VM">{t('asset_list.asset_types.vm')}</Option>
            <Option value="Container">{t('asset_list.asset_types.container')}</Option>
            <Option value="Software">{t('asset_list.asset_types.software')}</Option>
          </Select>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalOpen(true)}>{t('asset_list.add_asset')}</Button>
        </Space>
      </div>
      <Table columns={columns} dataSource={assets} rowKey="ID" loading={loading} />

      <Modal
        title={t('asset_list.create_new_asset')}
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label={t('asset_list.asset_name')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label={t('asset_list.type')} rules={[{ required: true }]}>
            <Select>
              <Option value="Server">{t('asset_list.asset_types.server')}</Option>
              <Option value="VM">{t('asset_list.asset_types.vm')}</Option>
              <Option value="Container">{t('asset_list.asset_types.container')}</Option>
              <Option value="Software">{t('asset_list.asset_types.software')}</Option>
            </Select>
          </Form.Item>
          <Form.Item name="platform" label={t('asset_list.platform')}>
            <Input placeholder={t('asset_list.placeholders.platform')} />
          </Form.Item>
          <Form.Item name="ip" label={t('asset_list.ip_endpoint')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="status" label={t('asset_list.status')} initialValue="Online">
            <Select>
              <Option value="Online">Online</Option>
              <Option value="Offline">Offline</Option>
              <Option value="Maintenance">Maintenance</Option>
            </Select>
          </Form.Item>
          <Form.Item name="owner" label={t('asset_list.owner')}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {t('asset_list.create')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal 
        title={`${t('asset_list.connect_modal.title')} ${currentAsset?.name}`} 
        open={isConnectModalOpen} 
        onCancel={() => setIsConnectModalOpen(false)}
        footer={null}
      >
        <div style={{ display: 'grid', gap: 10 }}>
          <Button block icon={<CodeOutlined />} onClick={() => { setIsConnectModalOpen(false); navigate('/terminal'); }}>
            {t('asset_list.connect_modal.ssh_terminal_proxy')}
          </Button>
          <Button block icon={<WindowsOutlined />} disabled={currentAsset?.type !== 'VM' && currentAsset?.type !== 'Server'}>
            {t('asset_list.connect_modal.rdp_connection')}
          </Button>
          <Button block icon={<LinkOutlined />} onClick={() => window.open(`http://${currentAsset?.ip}`, '_blank')}>
            {t('asset_list.connect_modal.open_browser')}
          </Button>
        </div>
        <div style={{ marginTop: 20 }}>
          <Text type="secondary">
            <SearchOutlined /> {t('asset_list.connect_modal.knowledge_base')}: 
            <a href="#" style={{ marginLeft: 8 }}>{t('asset_list.connect_modal.how_to_connect')}</a> | 
            <a href="#" style={{ marginLeft: 8 }}>{t('asset_list.connect_modal.reset_password')}</a>
          </Text>
        </div>
      </Modal>
    </div>
  );
};

export default AssetList;
