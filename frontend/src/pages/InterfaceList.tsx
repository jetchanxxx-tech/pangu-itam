import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Typography, Modal, Form, message, Input, Select } from 'antd';
import { PlusOutlined, ApiOutlined } from '@ant-design/icons';
import { getInterfaces, createInterface, deleteInterface, updateInterface, SystemInterface } from '../services/api';

const { Title } = Typography;
const { Option } = Select;

const InterfaceList: React.FC = () => {
  const [interfaces, setInterfaces] = useState<SystemInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInterface, setEditingInterface] = useState<SystemInterface | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchInterfaces();
  }, []);

  const fetchInterfaces = async () => {
    setLoading(true);
    try {
      const data = await getInterfaces();
      setInterfaces(data);
    } catch (error) {
      message.error('Failed to load interfaces');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (values: any) => {
    try {
      if (editingInterface) {
        await updateInterface(editingInterface.ID, values);
        message.success('Interface updated successfully');
      } else {
        await createInterface(values);
        message.success('Interface created successfully');
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingInterface(null);
      fetchInterfaces();
    } catch (error) {
      message.error('Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteInterface(id);
      message.success('Interface deleted successfully');
      fetchInterfaces();
    } catch (error) {
      message.error('Failed to delete interface');
    }
  };

  const openEditModal = (record: SystemInterface) => {
    setEditingInterface(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <ApiOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      render: (method: string) => {
        let color = 'blue';
        if (method === 'GET') color = 'green';
        if (method === 'POST') color = 'orange';
        if (method === 'DELETE') color = 'red';
        return <Tag color={color}>{method}</Tag>;
      },
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Active' ? 'success' : 'warning'}>{status}</Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: SystemInterface) => (
        <Space size="middle">
          <a onClick={() => openEditModal(record)}>Edit</a>
          <a onClick={() => handleDelete(record.ID)} style={{ color: 'red' }}>Delete</a>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2}>Interface List Management</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => {
            setEditingInterface(null);
            form.resetFields();
            setIsModalOpen(true);
          }}
        >
          New Interface
        </Button>
      </div>

      <Table columns={columns} dataSource={interfaces} rowKey="ID" loading={loading} />

      <Modal
        title={editingInterface ? "Edit Interface" : "Create New Interface"}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateOrUpdate}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="method" label="Method" initialValue="GET" rules={[{ required: true }]}>
            <Select>
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="DELETE">DELETE</Option>
            </Select>
          </Form.Item>
          <Form.Item name="url" label="URL" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Status" initialValue="Active">
            <Select>
              <Option value="Active">Active</Option>
              <Option value="Deprecated">Deprecated</Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InterfaceList;
