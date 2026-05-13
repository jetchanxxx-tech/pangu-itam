import React, { useState, useEffect } from 'react';
import {
  Table, Tag, Space, Button, Input, Typography, Modal, Form, Select,
  InputNumber, DatePicker, message, Popconfirm, Upload, List,
} from 'antd';
import {
  SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  DownloadOutlined, UploadOutlined, FileTextOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getContracts, createContract, updateContract, deleteContract,
  getContractFiles, uploadContractFile, downloadContractFile, deleteContractFile,
  Contract, ContractFile,
} from '../services/api';

const { Title } = Typography;

const statusColors: Record<string, string> = {
  draft: 'default',
  active: 'green',
  expired: 'volcano',
  terminated: 'red',
};

const Contracts: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [fileModal, setFileModal] = useState<{ open: boolean; contractId: number; name: string }>({ open: false, contractId: 0, name: '' });
  const [files, setFiles] = useState<ContractFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();

  const fetchContracts = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const res = await getContracts({ page, limit: pageSize, search: searchText || undefined });
      setContracts(res.data);
      setPagination(prev => ({ ...prev, current: page, total: res.pagination.total }));
    } catch {
      message.error('Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContracts(); }, []);

  const handleTableChange = (pag: { current?: number; pageSize?: number }) => {
    fetchContracts(pag.current || 1, pag.pageSize || 20);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    const data = {
      ...values,
      start_date: values.start_date ? dayjs(values.start_date as string).format('YYYY-MM-DD') : '',
      end_date: values.end_date ? dayjs(values.end_date as string).format('YYYY-MM-DD') : '',
      sign_date: values.sign_date ? dayjs(values.sign_date as string).format('YYYY-MM-DD') : '',
      asset_id: values.asset_id || null,
    };
    try {
      if (editingContract) {
        await updateContract(editingContract.id, data as Partial<Contract>);
        message.success('Contract updated');
      } else {
        await createContract(data as Partial<Contract>);
        message.success('Contract created');
      }
      setIsModalOpen(false);
      setEditingContract(null);
      form.resetFields();
      fetchContracts(pagination.current, pagination.pageSize);
    } catch {
      message.error('Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteContract(id);
      message.success('Contract deleted');
      fetchContracts(pagination.current, pagination.pageSize);
    } catch {
      message.error('Delete failed');
    }
  };

  const openEdit = (c: Contract) => {
    setEditingContract(c);
    form.setFieldsValue({
      ...c,
      start_date: c.start_date ? dayjs(c.start_date) : null,
      end_date: c.end_date ? dayjs(c.end_date) : null,
      sign_date: c.sign_date ? dayjs(c.sign_date) : null,
    });
    setIsModalOpen(true);
  };

  const openFiles = async (id: number, name: string) => {
    setFileModal({ open: true, contractId: id, name });
    try {
      const res = await getContractFiles(id);
      setFiles(res.data);
    } catch {
      setFiles([]);
    }
  };

  const handleUpload = async (options: any) => {
    setUploading(true);
    try {
      if (options.file instanceof File) {
        await uploadContractFile(fileModal.contractId, options.file);
      }
      message.success('File uploaded');
      const res = await getContractFiles(fileModal.contractId);
      setFiles(res.data);
      options.onSuccess();
    } catch {
      options.onError(new Error('Upload failed'));
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (fileId: number, fileName: string) => {
    try {
      const blob = await downloadContractFile(fileId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      message.error('Download failed');
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    try {
      await deleteContractFile(fileId);
      message.success('File deleted');
      const res = await getContractFiles(fileModal.contractId);
      setFiles(res.data);
    } catch {
      message.error('Delete failed');
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name', width: 200 },
    { title: 'Code', dataIndex: 'code', key: 'code', width: 120 },
    {
      title: 'Type', dataIndex: 'type', key: 'type', width: 100,
      render: (t: string) => (
        <Tag>{t === 'procurement' ? '采购' : t === 'maintenance' ? '维保' : t === 'lease' ? '租赁' : t}</Tag>
      ),
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status', width: 100,
      render: (s: string) => <Tag color={statusColors[s] || 'default'}>{s?.toUpperCase()}</Tag>,
    },
    { title: 'Vendor', dataIndex: 'vendor', key: 'vendor', width: 150 },
    {
      title: 'Amount', dataIndex: 'amount', key: 'amount', width: 120,
      render: (v: number) => v ? `${v.toLocaleString()} CNY` : '-',
    },
    {
      title: 'Period', key: 'period', width: 180,
      render: (_: unknown, r: Contract) =>
        r.start_date && r.end_date ? `${r.start_date} ~ ${r.end_date}` : '-',
    },
    {
      title: 'Files', key: 'files', width: 80,
      render: (_: unknown, r: Contract) => (
        <Button size="small" icon={<FileTextOutlined />} onClick={() => openFiles(r.id, r.name)} />
      ),
    },
    {
      title: 'Action', key: 'action', width: 120,
      render: (_: unknown, r: Contract) => (
        <Space>
          <a onClick={() => openEdit(r)}><EditOutlined /></a>
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
        <Title level={2} style={{ margin: 0 }}>Contracts</Title>
        <Space>
          <Input
            placeholder="Search contracts..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onPressEnter={() => fetchContracts(1, pagination.pageSize)}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => {
            setEditingContract(null);
            form.resetFields();
            setIsModalOpen(true);
          }}>Add Contract</Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={contracts}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1300 }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total}`,
        }}
        onChange={handleTableChange}
      />

      {/* Contract Form Modal */}
      <Modal
        title={editingContract ? 'Edit Contract' : 'New Contract'}
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); setEditingContract(null); form.resetFields(); }}
        footer={null}
        width={640}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ status: 'draft', currency: 'CNY' }}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="Code">
            <Input />
          </Form.Item>
          <Space style={{ display: 'flex' }}>
            <Form.Item name="type" label="Type">
              <Select style={{ width: 140 }}>
                <Select.Option value="procurement">采购</Select.Option>
                <Select.Option value="maintenance">维保</Select.Option>
                <Select.Option value="lease">租赁</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="status" label="Status">
              <Select style={{ width: 140 }}>
                <Select.Option value="draft">Draft</Select.Option>
                <Select.Option value="active">Active</Select.Option>
                <Select.Option value="expired">Expired</Select.Option>
                <Select.Option value="terminated">Terminated</Select.Option>
              </Select>
            </Form.Item>
          </Space>
          <Form.Item name="vendor" label="Vendor">
            <Input />
          </Form.Item>
          <Space style={{ display: 'flex' }}>
            <Form.Item name="amount" label="Amount">
              <InputNumber min={0} style={{ width: 180 }} />
            </Form.Item>
            <Form.Item name="currency" label="Currency">
              <Select style={{ width: 100 }}>
                <Select.Option value="CNY">CNY</Select.Option>
                <Select.Option value="USD">USD</Select.Option>
              </Select>
            </Form.Item>
          </Space>
          <Space style={{ display: 'flex' }}>
            <Form.Item name="start_date" label="Start Date">
              <DatePicker />
            </Form.Item>
            <Form.Item name="end_date" label="End Date">
              <DatePicker />
            </Form.Item>
            <Form.Item name="sign_date" label="Sign Date">
              <DatePicker />
            </Form.Item>
          </Space>
          <Form.Item name="owner" label="Owner">
            <Input />
          </Form.Item>
          <Form.Item name="contact_info" label="Contact Info">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="asset_id" label="Asset ID">
            <InputNumber min={0} style={{ width: 120 }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingContract ? 'Update' : 'Create'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Files Modal */}
      <Modal
        title={`Files: ${fileModal.name}`}
        open={fileModal.open}
        onCancel={() => setFileModal({ open: false, contractId: 0, name: '' })}
        footer={null}
        width={600}
      >
        <Upload customRequest={handleUpload} showUploadList={false} accept="*" disabled={uploading}>
          <Button icon={<UploadOutlined />} loading={uploading}>Upload File (max 10MB)</Button>
        </Upload>
        <List
          style={{ marginTop: 16 }}
          dataSource={files}
          locale={{ emptyText: 'No files' }}
          renderItem={(f: ContractFile) => (
            <List.Item
              actions={[
                <Button icon={<DownloadOutlined />} size="small" onClick={() => handleDownload(f.id, f.file_name)}>Download</Button>,
                <Popconfirm title="Delete this file?" onConfirm={() => handleDeleteFile(f.id)}>
                  <Button danger size="small" icon={<DeleteOutlined />} />
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                avatar={<FileTextOutlined style={{ fontSize: 24 }} />}
                title={`${f.file_name} (v${f.version})`}
                description={`${(f.file_size / 1024).toFixed(1)} KB · ${f.file_type || 'unknown'} · by ${f.uploaded_by} · ${f.created_at}`}
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

export default Contracts;
