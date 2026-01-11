import React from 'react';
import { Upload, Button, Typography, Steps, Card, Alert } from 'antd';
import { UploadOutlined, FileExcelOutlined, CloudUploadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const ImportData: React.FC = () => {
  const { t } = useTranslation();

  const handleDownloadTemplate = () => {
    // CSV with BOM for Excel UTF-8 compatibility
    const headers = "Name,Type,Platform,IP,Status,Owner,Region,Description,Specs\n";
    const example = "Server-01,Server,AWS,192.168.1.100,Online,Admin,us-east-1,Main App Server,4vCPU/16GB\n"
      + "DB-Main,VM,VMware,10.0.0.50,Online,DBA,local,Primary DB,8vCPU/32GB";
    
    const csvContent = "\uFEFF" + headers + example;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "asset_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <Title level={2}>{t('menu.import')}</Title>
      
      <Card style={{ marginBottom: 24 }}>
        <Steps
          current={0}
          items={[
            { title: t('import.steps.download_template'), description: t('import.step_descriptions.download_template') },
            { title: t('import.steps.upload_file'), description: t('import.step_descriptions.upload_file') },
            { title: t('import.steps.verification'), description: t('import.step_descriptions.verification') },
            { title: t('import.steps.done'), description: t('import.step_descriptions.done') },
          ]}
        />
      </Card>

      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Alert
          message={t('import.instructions_title')}
          description={t('import.instructions_desc')}
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Card title={t('import.step1_title')} bordered={false} style={{ marginBottom: 24 }}>
          <Text>{t('import.step1_desc')}</Text>
          <br /><br />
          <Button icon={<FileExcelOutlined />} onClick={handleDownloadTemplate}>
            {t('import.download_btn')}
          </Button>
        </Card>

        <Card title={t('import.step2_title')} bordered={false}>
          <Dragger>
            <p className="ant-upload-drag-icon">
              <CloudUploadOutlined />
            </p>
            <p className="ant-upload-text">{t('import.upload_text')}</p>
            <p className="ant-upload-hint">
              {t('import.upload_hint')}
            </p>
          </Dragger>
        </Card>
      </div>
    </div>
  );
};

export default ImportData;
