import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Input, Select, Typography, Modal, Form, message, Popconfirm } from 'antd';
import { SearchOutlined, PlusOutlined, DesktopOutlined, CloudServerOutlined, AppstoreOutlined, CodeOutlined, LinkOutlined, WindowsOutlined, EditOutlined, DeleteOutlined, FolderOpenOutlined, UndoOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getAssets, createAsset, updateAsset, deleteAsset, archiveAsset, unarchiveAsset, Asset } from '../services/api';

const { Title } = Typography;

const AssetList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState('All');
  const [showArchived, setShowArchived] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [currentAsset, setCurrentAsset] = useState<Asset | null>(null);
  const [form] = Form.useForm();

  const fetchAssets = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const res = await getAssets({
        page, limit: pageSize,
        search: searchText || undefined,
        archived: showArchived ? '1' : undefined,
      });
      setAssets(res.data);
      setPagination(prev => ({ ...prev, current: page, total: res.pagination.total }));
    } catch {
      message.error(t('asset_list.messages.load_failed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets(1, pagination.pageSize);
  }, []);

  const handleTableChange = (pag: { current?: number; pageSize?: number }) => {
    fetchAssets(pag.current || 1, pag.pageSize || 20);
  };

  const handleCreate = async (values: Record<string, unknown>) => {
    try {
      if (editingAsset) {
        await updateAsset(editingAsset.id, values as Partial<Asset>);
        message.success('Asset updated');
      } else {
        await createAsset(values as Partial<Asset>);
        message.success('Asset created');
      }
      setIsModalOpen(false);
      setEditingAsset(null);
      form.resetFields();
      fetchAssets(pagination.current, pagination.pageSize);
    } catch {
      message.error(editingAsset ? 'Update failed' : 'Create failed');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAsset(id);
      message.success('Asset deleted');
      fetchAssets(pagination.current, pagination.pageSize);
    } catch {
      message.error('Delete failed');
    }
  };

  const openEdit = (asset: Asset) => {
    setEditingAsset(asset);
    form.setFieldsValue(asset);
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingAsset(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleConnect = (record: Asset) => {
    setCurrentAsset(record);
    setIsConnectModalOpen(true);
  };

  const sortedAssets = typeFilter === 'All' ? assets : assets.filter(a => a.type === typeFilter);

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
            <div style={{ fontSize: 12, color: '#888' }}>{record.platform || record.ip}</div>
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
        const color = status === 'Online' ? 'green' : status === 'Offline' ? 'volcano' : 'geekblue';
        return <Tag color={color}>{status?.toUpperCase()}</Tag>;
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
      render: (_: unknown, record: Asset) => (
        <Space size="middle">
          <a onClick={() => handleConnect(record)}>{t('asset_list.connect')}</a>
          <a onClick={() => openEdit(record)}><EditOutlined /></a>
          {showArchived ? (
            <Popconfirm title="取消归档？" onConfirm={async () => { await unarchiveAsset(record.id); fetchAssets(pagination.current, pagination.pageSize); }}>
              <a style={{ color: 'green' }}><UndoOutlined /></a>
            </Popconfirm>
          ) : (
            <Popconfirm title="归档此资产？" onConfirm={async () => { await archiveAsset(record.id); fetchAssets(pagination.current, pagination.pageSize); }}>
              <a style={{ color: 'orange' }}><FolderOpenOutlined /></a>
            </Popconfirm>
          )}
          <Popconfirm title="删除此资产？" onConfirm={() => handleDelete(record.id)}>
            <a style={{ color: 'red' }}><DeleteOutlined /></a>
          </Popconfirm>
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
            onPressEnter={() => fetchAssets(1, pagination.pageSize)}
          />
          <Select value={typeFilter} style={{ width: 120 }} onChange={setTypeFilter}>
            <Select.Option value="All">{t('asset_list.all_types')}</Select.Option>
            <Select.Option value="Server">{t('asset_list.asset_types.server')}</Select.Option>
            <Select.Option value="VM">{t('asset_list.asset_types.vm')}</Select.Option>
            <Select.Option value="Container">{t('asset_list.asset_types.container')}</Select.Option>
            <Select.Option value="Software">{t('asset_list.asset_types.software')}</Select.Option>
          </Select>
          <Button onClick={() => setShowArchived(!showArchived)} type={showArchived ? 'primary' : 'default'}>
            {showArchived ? '查看活跃资产' : '查看归档'}
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>{t('asset_list.add_asset')}</Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={sortedAssets}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total}`,
        }}
        onChange={handleTableChange}
      />

      <Modal
        title={editingAsset ? 'Edit Asset' : t('asset_list.create_new_asset')}
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); setEditingAsset(null); form.resetFields(); }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} initialValues={{ status: 'Online' }}>
          <Form.Item name="name" label={t('asset_list.asset_name')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label={t('asset_list.type')} rules={[{ required: true }]}>
            <Select>
              <Select.Option value="Server">{t('asset_list.asset_types.server')}</Select.Option>
              <Select.Option value="VM">{t('asset_list.asset_types.vm')}</Select.Option>
              <Select.Option value="Container">{t('asset_list.asset_types.container')}</Select.Option>
              <Select.Option value="Software">{t('asset_list.asset_types.software')}</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="platform" label={t('asset_list.platform')}>
            <Input placeholder={t('asset_list.placeholders.platform')} />
          </Form.Item>
          <Form.Item name="ip" label={t('asset_list.ip_endpoint')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="status" label={t('asset_list.status')}>
            <Select>
              <Select.Option value="Online">Online</Select.Option>
              <Select.Option value="Offline">Offline</Select.Option>
              <Select.Option value="Maintenance">Maintenance</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="owner" label={t('asset_list.owner')}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="specs" label="Specs">
            <Input placeholder="e.g. 4vCPU/16GB" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingAsset ? 'Update' : t('asset_list.create')}
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
          <Button block icon={<CodeOutlined />} onClick={() => { setIsConnectModalOpen(false); navigate(`/terminal?host=${encodeURIComponent(currentAsset?.ip || '')}`); }}>
            {t('asset_list.connect_modal.ssh_terminal_proxy')}
          </Button>
          <Button block icon={<WindowsOutlined />} disabled={currentAsset?.type !== 'VM' && currentAsset?.type !== 'Server'}>
            {t('asset_list.connect_modal.rdp_connection')}
          </Button>
          <Button block icon={<LinkOutlined />} onClick={() => currentAsset?.ip && window.open(`http://${currentAsset.ip}`, '_blank')}>
            {t('asset_list.connect_modal.open_browser')}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AssetList;
