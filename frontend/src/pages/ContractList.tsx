import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Typography, Modal, Form, message, Input, DatePicker, InputNumber, Select } from 'antd';
import { PlusOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getContracts, createContract, deleteContract, Contract } from '../services/api';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

const ContractList: React.FC = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const data = await getContracts();
      setContracts(data);
    } catch (error) {
      message.error('Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values: any) => {
    try {
      // Format dates
      const formattedValues = {
        ...values,
        sign_date: values.sign_date ? values.sign_date.toISOString() : null,
        expire_date: values.expire_date ? values.expire_date.toISOString() : null,
      };
      await createContract(formattedValues);
      message.success('Contract created successfully');
      setIsAddModalOpen(false);
      form.resetFields();
      fetchContracts();
    } catch (error) {
      message.error('Failed to create contract');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteContract(id);
      message.success('Contract deleted successfully');
      fetchContracts();
    } catch (error) {
      message.error('Failed to delete contract');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Contract) => (
        <Space>
          <FileTextOutlined />
          <a onClick={() => navigate(`/contracts/${record.ID}`)}>{text}</a>
        </Space>
      ),
    },
    {
      title: 'Number',
      dataIndex: 'number',
      key: 'number',
    },
    {
      title: 'Amount',
      key: 'amount',
      render: (_: any, record: Contract) => (
        <span>{record.amount} {record.currency}</span>
      ),
    },
    {
      title: 'Vendor',
      dataIndex: 'vendor',
      key: 'vendor',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'geekblue';
        if (status === 'Active') color = 'green';
        if (status === 'Expired') color = 'red';
        if (status === 'Terminated') color = 'gray';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Sign Date',
      dataIndex: 'sign_date',
      key: 'sign_date',
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : '-',
    },
    {
      title: 'Expire Date',
      dataIndex: 'expire_date',
      key: 'expire_date',
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : '-',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Contract) => (
        <Space size="middle">
          <a onClick={() => handleDelete(record.ID)} style={{ color: 'red' }}>Delete</a>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2}>Contract Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalOpen(true)}>
          New Contract
        </Button>
      </div>

      <Table columns={columns} dataSource={contracts} rowKey="ID" loading={loading} />

      <Modal
        title="Create New Contract"
        open={isAddModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsAddModalOpen(false)}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="number" label="Contract Number" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Space style={{ display: 'flex', marginBottom: 8 }} align="baseline">
            <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
              <InputNumber style={{ width: 200 }} />
            </Form.Item>
            <Form.Item name="currency" label="Currency" initialValue="CNY" rules={[{ required: true }]}>
              <Select style={{ width: 100 }}>
                <Option value="CNY">CNY</Option>
                <Option value="USD">USD</Option>
                <Option value="EUR">EUR</Option>
              </Select>
            </Form.Item>
          </Space>
          <Form.Item name="vendor" label="Vendor" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Status" initialValue="Active">
            <Select>
              <Option value="Active">Active</Option>
              <Option value="Expired">Expired</Option>
              <Option value="Terminated">Terminated</Option>
            </Select>
          </Form.Item>
          <Space style={{ display: 'flex', marginBottom: 8 }} align="baseline">
            <Form.Item name="sign_date" label="Sign Date">
              <DatePicker />
            </Form.Item>
            <Form.Item name="expire_date" label="Expire Date">
              <DatePicker />
            </Form.Item>
          </Space>
          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ContractList;
