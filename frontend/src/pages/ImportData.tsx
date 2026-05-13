import React, { useState } from 'react';
import { Upload, Button, Typography, Steps, Card, Alert, Table, message, Space } from 'antd';
import { FileExcelOutlined, CloudUploadOutlined, DownloadOutlined, CheckCircleOutlined, InboxOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { importAssetsCsv } from '../services/api';

const { Title } = Typography;
const { Dragger } = Upload;

const ImportData: React.FC = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ imported: number; total: number; errors?: string[] } | null>(null);

  const downloadTemplate = () => {
    const BOM = '﻿';
    const csv = BOM + '名称,类型,平台,IP地址,状态,区域,负责人,描述,规格\n' +
      '生产服务器01,Server,AWS,10.0.1.100,Online,us-east-1,张三,核心业务服务器,4vCPU/16GB/500GB\n' +
      '开发虚拟机01,VM,VMware,192.168.1.50,Online,local,李四,开发环境,2vCPU/8GB/200GB\n' +
      '数据库服务器01,Server,Azure,10.0.2.200,Online,us-west-2,王五,MySQL主库,8vCPU/32GB/1TB';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'asset_import_template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (file: File) => {
    setUploading(true);
    setStep(2);
    try {
      const res = await importAssetsCsv(file);
      setResult(res.data);
      setStep(3);
      message.success(`成功导入 ${res.data.imported} / ${res.data.total} 条记录`);
    } catch {
      message.error('导入失败，请检查 CSV 格式');
      setStep(1);
    } finally {
      setUploading(false);
    }
    return false; // prevent default upload behavior
  };

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>{t('menu.import')}</Title>

      <Steps
        current={step}
        items={[
          { title: '下载模板', icon: <DownloadOutlined /> },
          { title: '填写数据', icon: <FileExcelOutlined /> },
          { title: '上传导入', icon: <CloudUploadOutlined /> },
          { title: '完成', icon: <CheckCircleOutlined /> },
        ]}
        style={{ marginBottom: 32 }}
      />

      <Card>
        {step <= 1 && (
          <div>
            <Alert
              message="导入前请先下载 CSV 模板，按照模板格式填写数据后上传。"
              description="支持中英文列名：名称/name, 类型/type, 平台/platform, IP地址/ip, 状态/status, 区域/region, 负责人/owner, 描述/description, 规格/specs"
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                size="large"
                onClick={downloadTemplate}
              >
                下载 CSV 导入模板
              </Button>

              <Dragger
                accept=".csv"
                showUploadList={false}
                beforeUpload={handleImport}
                disabled={uploading}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">点击或拖拽 CSV 文件到此区域上传</p>
                <p className="ant-upload-hint">支持 .csv 格式，最大 5MB</p>
              </Dragger>
            </Space>
          </div>
        )}

        {step === 2 && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <CloudUploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
            <Title level={4} style={{ marginTop: 16 }}>正在导入数据...</Title>
          </div>
        )}

        {step === 3 && result && (
          <div>
            <Alert
              message={`导入完成：成功 ${result.imported} 条，总计 ${result.total} 条`}
              type={result.errors?.length ? 'warning' : 'success'}
              showIcon
              style={{ marginBottom: 16 }}
            />
            {result.errors && result.errors.length > 0 && (
              <Table
                dataSource={result.errors.map((e, i) => ({ key: i, error: e }))}
                columns={[{ title: '错误详情', dataIndex: 'error', key: 'error' }]}
                size="small"
                pagination={false}
              />
            )}
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Button type="primary" onClick={() => { setStep(0); setResult(null); }}>
                继续导入
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={() => window.location.href = '/assets'}>
                查看资产列表
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ImportData;
