// Frontend/src/pages/dashboard/trustee/appeals.tsx

import React, { useEffect, useState } from "react";
import { 
  Table, Tag, Button, Card, Typography, 
  Space, Badge, Modal, Form, Input, Select, 
  message, Descriptions, Divider, Alert
} from "antd";
import { 
  EyeOutlined, AuditOutlined, CheckCircleOutlined, 
  CloseCircleOutlined, SafetyCertificateOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import api from "~/config/api";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;


export default function TrusteeAppeals() {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppeal, setSelectedAppeal] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [form] = Form.useForm();

  const fetchAppeals = async () => {
    try {
      setLoading(true);
      const res = await api.get("/appeals/");
      setAppeals(res.data.results || res.data);
    } catch (err) {
      message.error("Failed to load appeals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppeals();
  }, []);

  const handleResolve = async (values: any) => {
    try {
      setIsResolving(true);
      await api.post(`/appeals/${selectedAppeal.id}/resolve/`, {
        decision: values.decision,
        notes: values.notes
      });
      message.success("Appeal resolution recorded");
      setIsModalVisible(false);
      form.resetFields();
      fetchAppeals();
    } catch (err) {
      message.error("Failed to resolve appeal");
    } finally {
      setIsResolving(false);
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "created_at",
      key: "date",
      render: (date: string) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: "Member",
      dataIndex: "member_name",
      key: "member",
      render: (name: string) => <Text strong>{name}</Text>
    },
    {
      title: "Claim Type",
      dataIndex: "claim_type",
      key: "type",
      render: (type: string) => <Tag className="uppercase font-bold">{type}</Tag>
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Badge 
          status={status === 'resolved' ? 'success' : 'processing'} 
          text={status.toUpperCase()} 
          className="font-bold"
        />
      )
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => {
              setSelectedAppeal(record);
              setIsModalVisible(true);
            }}
          >
            Review
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
           <Title level={2} className="!mb-0">Trustee Adjudication</Title>
           <Text type="secondary">Review and resolve final appeals from members.</Text>
        </div>
        <Card className="bg-blue-50 border-blue-100 p-2 rounded-xl">
           <Space>
              <SafetyCertificateOutlined className="text-blue-600 text-xl" />
              <div>
                 <Text strong className="text-blue-800 block leading-none">Legal Finality</Text>
                 <Text className="text-[10px] text-blue-600">Trustee decisions are final and binding.</Text>
              </div>
           </Space>
        </Card>
      </div>

      <Alert
        message="Governance Notice"
        description="As a Trustee, you serve as the final arbiter for disputes. Your resolutions must be based on the Fund's Byelaws and Constitution."
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        className="rounded-2xl border-none shadow-sm bg-white"
      />

      <Card className="rounded-2xl border-none shadow-sm">
        <Table 
          columns={columns} 
          dataSource={appeals} 
          loading={loading}
          rowKey="id"
        />
      </Card>

      {/* RESOLUTION MODAL */}
      <Modal
        title={
          <Space>
            <AuditOutlined className="text-[var(--sgss-gold)]" />
            <span>Appeal Adjudication: {selectedAppeal?.member_name}</span>
          </Space>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
        className="trustee-modal"
      >
        {selectedAppeal && (
          <div className="space-y-6 pt-4">
            <Card className="bg-gray-50 border-none rounded-xl">
               <Descriptions title="Appeal Information" column={2} size="small">
                  <Descriptions.Item label="Claim ID">{selectedAppeal.claim.substring(0,8).toUpperCase()}</Descriptions.Item>
                  <Descriptions.Item label="Claim Type"><Tag className="m-0 uppercase">{selectedAppeal.claim_type}</Tag></Descriptions.Item>
                  <Descriptions.Item label="Reason for Appeal" span={2}>
                     <Paragraph className="mt-2 p-3 bg-white rounded-lg border border-gray-100 italic">
                        "{selectedAppeal.reason}"
                     </Paragraph>
                  </Descriptions.Item>
               </Descriptions>
            </Card>

            {selectedAppeal.status === 'pending' ? (
              <Form form={form} layout="vertical" onFinish={handleResolve}>
                <Divider orientation="left" className="!text-xs !font-bold !uppercase !tracking-widest !text-gray-400">Final Resolution</Divider>
                
                <Form.Item 
                  name="decision" 
                  label="Trustee Decision" 
                  rules={[{ required: true, message: 'Please select a decision' }]}
                >
                  <Select placeholder="Select final ruling..." size="large" className="rounded-xl">
                    <Select.Option value="upheld"><Space><CheckCircleOutlined className="text-green-500" /> Upheld (Approve Claim)</Space></Select.Option>
                    <Select.Option value="dismissed"><Space><CloseCircleOutlined className="text-red-500" /> Dismissed (Reject Claim)</Space></Select.Option>
                    <Select.Option value="partial"><Space><InfoCircleOutlined className="text-blue-500" /> Partial Approval</Space></Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item 
                  name="notes" 
                  label="Resolution Notes & Constitutional Basis" 
                  rules={[{ required: true, message: 'Please provide notes for the record' }]}
                >
                  <TextArea rows={6} placeholder="Detailed notes on why this appeal was upheld or dismissed..." className="rounded-xl" />
                </Form.Item>

                <div className="flex justify-end gap-3 pt-4">
                  <Button onClick={() => setIsModalVisible(false)} className="rounded-lg h-10 px-6">Cancel</Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={isResolving}
                    className="bg-[var(--sgss-navy)] border-none hover:bg-[var(--sgss-navy-light)] h-10 px-8 rounded-lg font-bold"
                  >
                    Authorize Resolution
                  </Button>
                </div>
              </Form>
            ) : (
              <Card className="bg-green-50 border-green-100 rounded-xl">
                 <Title level={5} className="!text-green-800">✅ Resolution Recorded</Title>
                 <Text strong>Decision: {selectedAppeal.trustee_decision?.toUpperCase()}</Text>
                 <Paragraph className="mt-2 text-green-700 italic">
                    "{selectedAppeal.trustee_notes}"
                 </Paragraph>
                  <Text type="secondary" className="text-xs">Decided on: {dayjs(selectedAppeal.decided_at).format("DD MMM YYYY HH:mm")}</Text>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
