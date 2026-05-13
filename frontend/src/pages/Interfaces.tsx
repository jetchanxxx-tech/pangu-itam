import React, { useState, useEffect } from 'react';
import {
  Table, Tag, Space, Button, Input, Typography, Modal, Form, Select,
  message, Popconfirm,
} from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ApiOutlined } from '@ant-design/icons';
import {
  getInterfaces, createInterface, updateInterface, deleteInterface,
  SystemInterface,
} from '../services/api';

const { Title } = Typography;

const methodColors: Record<string, string> = {
  GET: 'green', POST: 'blue', PUT: 'orange', DELETE: 'red', PATCH: 'purple',
};

const Interfaces: React.FC = () => {
  const [items, setItems] = useState<SystemInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SystemInterface | null>(null);
  const [form] = Form.useForm();

  const fetchData = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const res = await getInterfaces({ page, limit: pageSize, search: searchText || undefined });
      setItems(res.data);
      setPagination(prev => ({ ...prev, current: page, total: res.pagination.total }));
    } catch {
      message.error('Failed to load interfaces');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      if (editingItem) {
        await updateInterface(editingItem.id, values as Partial<SystemInterface>);
        message.success('Interface updated');
      } else {
        await createInterface(values as Partial<SystemInterface>);
        message.success('Interface created');
      }
      setIsModalOpen(false);
      setEditingItem(null);
      form.resetFields();
      fetchData(pagination.current, pagination.pageSize);
    } catch {
      message.error('Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteInterface(id);
      message.success('Interface deleted');
      fetchData(pagination.current, pagination.pageSize);
    } catch {
      message.error('Delete failed');
    }
  };

  const columns = [
    {
      title: 'Name', dataIndex: 'name', key: 'name',
      render: (text: string) => <Space><ApiOutlined />{text}</Space>,
    },
    {
      title: 'Method', dataIndex: 'method', key: 'method', width: 100,
      render: (m: string) => <Tag color={methodColors[m] || 'default'}>{m}</Tag>,
    },
    { title: 'URL', dataIndex: 'url', key: 'url' },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: 'Status', dataIndex: 'status', key: 'status', width: 110,
      render: (s: string) => (
        <Tag color={s === 'Active' ? 'green' : 'volcano'}>{s}</Tag>
      ),
    },
    {
      title: 'Action', key: 'action', width: 120,
      render: (_: unknown, r: SystemInterface) => (
        <Space>
          <a onClick={() => {
            setEditingItem(r);
            form.setFieldsValue(r);
            setIsModalOpen(true);
          }}><EditOutlined /></a>
          <Popconfirm title="Delete?" onConfirm={() => handleDelete(r.id)}>
            <a style={{ color: 'red' }}><DeleteOutlined /></a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Interfaces</Title>
        <Space>
          <Input
            placeholder="搜索接口..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onPressEnter={() => fetchData(1, pagination.pageSize)}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => {
            setEditingItem(null);
            form.resetFields();
            setIsModalOpen(true);
          }}>Add Interface</Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={items}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total}`,
        }}
        onChange={(pag) => fetchData(pag.current || 1, pag.pageSize || 20)}
      />

      <Modal
        title={editingItem ? 'Edit Interface' : 'New Interface'}
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); setEditingItem(null); form.resetFields(); }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ method: 'GET', status: 'Active' }}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Space style={{ display: 'flex' }}>
            <Form.Item name="method" label="Method">
              <Select style={{ width: 110 }}>
                <Select.Option value="GET">GET</Select.Option>
                <Select.Option value="POST">POST</Select.Option>
                <Select.Option value="PUT">PUT</Select.Option>
                <Select.Option value="DELETE">DELETE</Select.Option>
                <Select.Option value="PATCH">PATCH</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="status" label="Status">
              <Select style={{ width: 130 }}>
                <Select.Option value="Active">Active</Select.Option>
                <Select.Option value="Deprecated">Deprecated</Select.Option>
              </Select>
            </Form.Item>
          </Space>
          <Form.Item name="url" label="URL">
            <Input placeholder="https://api.example.com/v1/resource" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Interfaces;
