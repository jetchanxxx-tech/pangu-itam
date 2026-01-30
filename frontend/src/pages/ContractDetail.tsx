import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Card, Descriptions, Table, Button, Upload, message, Space, Tag, Divider } from 'antd';
import { UploadOutlined, DownloadOutlined, ArrowLeftOutlined, FileOutlined } from '@ant-design/icons';
import { getContract, getContractFiles, uploadContractFile, getContractFileDownloadUrl, Contract, ContractFile } from '../services/api';
import dayjs from 'dayjs';

const { Title } = Typography;

const ContractDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Contract | null>(null);
  const [files, setFiles] = useState<ContractFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchData(parseInt(id));
    }
  }, [id]);

  const fetchData = async (contractId: number) => {
    setLoading(true);
    try {
      const [contractData, filesData] = await Promise.all([
        getContract(contractId),
        getContractFiles(contractId),
      ]);
      setContract(contractData);
      setFiles(filesData);
    } catch (error) {
      message.error('Failed to load contract details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    if (!id) return;
    setUploading(true);
    try {
      await uploadContractFile(parseInt(id), file);
      message.success('File uploaded successfully');
      fetchData(parseInt(id));
    } catch (error) {
      message.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
    return false; // Prevent auto upload
  };

  const fileColumns = [
    {
      title: 'File Name',
      dataIndex: 'file_name',
      key: 'file_name',
      render: (text: string) => (
        <Space>
          <FileOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      render: (v: number) => <Tag color="blue">v{v}</Tag>,
    },
    {
      title: 'Uploaded By',
      dataIndex: 'uploaded_by',
      key: 'uploaded_by',
    },
    {
      title: 'Upload Date',
      dataIndex: 'CreatedAt',
      key: 'CreatedAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: ContractFile) => (
        <Button 
          type="link" 
          icon={<DownloadOutlined />} 
          href={getContractFileDownloadUrl(record.ID)}
          target="_blank"
        >
          Download
        </Button>
      ),
    },
  ];

  if (loading || !contract) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/contracts')} style={{ marginBottom: 16 }}>
        Back to List
      </Button>
      
      <Card title={<Title level={3}>{contract.name}</Title>}>
        <Descriptions bordered>
          <Descriptions.Item label="Number">{contract.number}</Descriptions.Item>
          <Descriptions.Item label="Vendor">{contract.vendor}</Descriptions.Item>
          <Descriptions.Item label="Amount">{contract.amount} {contract.currency}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={contract.status === 'Active' ? 'green' : 'red'}>{contract.status}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Sign Date">{dayjs(contract.sign_date).format('YYYY-MM-DD')}</Descriptions.Item>
          <Descriptions.Item label="Expire Date">{dayjs(contract.expire_date).format('YYYY-MM-DD')}</Descriptions.Item>
          <Descriptions.Item label="Description" span={3}>{contract.description}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Divider />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={4}>Contract Files & Versions</Title>
        <Upload beforeUpload={handleUpload} showUploadList={false}>
          <Button icon={<UploadOutlined />} loading={uploading}>Upload New Version</Button>
        </Upload>
      </div>

      <Table columns={fileColumns} dataSource={files} rowKey="ID" />
    </div>
  );
};

export default ContractDetail;
