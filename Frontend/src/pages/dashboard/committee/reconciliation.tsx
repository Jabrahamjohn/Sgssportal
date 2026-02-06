// Frontend/src/pages/dashboard/committee/reconciliation.tsx

import React, { useEffect, useState } from "react";
import { 
  Table, Tag, Button, Card, Typography, 
  Space, Badge, Modal, Form, Input, Select, 
  message, Descriptions, Divider, DatePicker, Statistic, Row, Col
} from "antd";
import { 
  DollarOutlined, CheckCircleOutlined, 
  HistoryOutlined, BankOutlined, PlusOutlined,
  SearchOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import api from "~/config/api";

const { Title, Text } = Typography;
const { Option } = Select;

export default function TreasurerReconciliation() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchReconciliationData = async () => {
    try {
      setLoading(true);
      // Fetch Approved claims waiting for payment/reconciliation
      const res = await api.get("/claims/?status=approved");
      setClaims(res.data.results || res.data);
    } catch (err) {
      message.error("Failed to load reconciliation data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReconciliationData();
  }, []);

  const handleReconcile = async (values: any) => {
    try {
      setIsSubmitting(true);
      
      // 1. Create Payment Record
      const payRes = await api.post("/payment-records/", {
        claim: selectedClaim.id,
        payment_method: values.payment_method,
        reference_number: values.reference_number,
        amount: selectedClaim.total_payable,
        payment_date: values.payment_date.toISOString()
      });

      // 2. Reconcile it
      await api.post(`/payment-records/${payRes.data.id}/reconcile/`);

      // 3. Mark claim as PAID
      await api.post(`/claims/${selectedClaim.id}/set_status/`, {
        status: "paid",
        note: `Reconciled via ${values.payment_method} Ref: ${values.reference_number}`
      });

      message.success("Payment reconciled and claim marked as PAID");
      setIsModalVisible(false);
      form.resetFields();
      fetchReconciliationData();
    } catch (err: any) {
      console.error(err);
      message.error(err.response?.data?.detail || "Failed to reconcile payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      title: "Claim ID",
      dataIndex: "claim_number",
      key: "claim_number",
      render: (text: string) => <Text strong className="text-[var(--sgss-navy)]">{text}</Text>
    },
    {
      title: "Member",
      dataIndex: "member_name",
      key: "member",
    },
    {
      title: "Payable",
      dataIndex: "total_payable",
      key: "payable",
      render: (amount: number) => <Text strong className="text-emerald-700">KSh {Number(amount).toLocaleString()}</Text>
    },
    {
      title: "Approved On",
      dataIndex: "submitted_at",
      key: "date",
      render: (date: string) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record: any) => (
        <Button 
          type="primary" 
          icon={<DollarOutlined />} 
          onClick={() => {
            setSelectedClaim(record);
            setIsModalVisible(true);
          }}
          className="bg-emerald-600 border-none hover:bg-emerald-700 rounded-lg flex items-center"
        >
          Reconcile Payout
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <Title level={2} className="!mb-0">Financial Reconciliation</Title>
           <Text type="secondary">Treasurer's portal for verifying bank/M-Pesa payments against approved claims.</Text>
        </div>
        <div className="flex gap-4">
           <Card className="rounded-xl border-emerald-100 bg-emerald-50 px-6 py-2">
              <Statistic 
                title={<Text className="text-emerald-600 text-xs font-bold uppercase">Pending Payouts</Text>} 
                value={claims.reduce((acc, c: any) => acc + Number(c.total_payable), 0)} 
                prefix={<BankOutlined className="text-emerald-500 mr-2" />}
                formatter={(val) => `KSh ${Number(val).toLocaleString()}`}
                valueStyle={{ color: '#065f46', fontWeight: '800', fontSize: '1.5rem' }}
              />
           </Card>
        </div>
      </div>

      <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
        <Table 
          columns={columns} 
          dataSource={claims} 
          loading={loading}
          rowKey="id"
          locale={{ emptyText: "No pending reconciliations found. All approved claims are paid." }}
        />
      </Card>

      {/* RECONCILIATION MODAL */}
      <Modal
        title={
          <Space>
            <BankOutlined className="text-[var(--sgss-gold)]" />
            <span>Authorize Payout: {selectedClaim?.claim_number}</span>
          </Space>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedClaim && (
          <Form form={form} layout="vertical" onFinish={handleReconcile} initialValues={{ payment_date: dayjs() }}>
            <div className="bg-gray-50 p-6 rounded-2xl mb-6">
               <Row gutter={[16, 16]}>
                  <Col span={12}>
                     <Text type="secondary" className="text-[10px] uppercase font-bold tracking-widest">Payee</Text>
                     <Title level={5} className="!mt-0">{selectedClaim.member_name}</Title>
                  </Col>
                  <Col span={12}>
                     <Text type="secondary" className="text-[10px] uppercase font-bold tracking-widest">Total Payable</Text>
                     <Title level={4} className="!mt-0 text-emerald-700">KSh {Number(selectedClaim.total_payable).toLocaleString()}</Title>
                  </Col>
               </Row>
            </div>

            <Divider orientation="left" className="!text-xs !font-bold !uppercase !tracking-widest !text-gray-400">Payment Reference</Divider>

            <Form.Item 
              name="payment_method" 
              label="Payment Channel" 
              rules={[{ required: true }]}
            >
              <Select size="large" className="rounded-xl overflow-hidden">
                <Option value="mpesa">M-Pesa B2C Payout</Option>
                <Option value="eft">Bank Transfer (EFT)</Option>
                <Option value="cheque">Physical Cheque</Option>
              </Select>
            </Form.Item>

            <Form.Item 
              name="reference_number" 
              label="Transaction Reference / Receipt #" 
              rules={[{ required: true, message: 'Reference number is required for audit' }]}
            >
              <Input size="large" placeholder="e.g. RDR2X89J4L or CHQ-00123" className="rounded-xl" />
            </Form.Item>

            <Form.Item 
              name="payment_date" 
              label="Date of Payment" 
              rules={[{ required: true }]}
            >
              <DatePicker size="large" className="w-full rounded-xl" />
            </Form.Item>

            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 mt-4">
               <CheckCircleOutlined className="text-amber-600 mt-1" />
               <Text className="text-xs text-amber-700">
                  By clicking "Confirm & Reconcile", you certify that you have verified this transaction on our bank or M-Pesa statement. This action will finalize the claim.
               </Text>
            </div>

            <div className="flex justify-end gap-3 pt-8">
              <Button onClick={() => setIsModalVisible(false)} size="large" className="rounded-xl px-8">Cancel</Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={isSubmitting}
                size="large"
                className="bg-[var(--sgss-navy)] border-none hover:bg-[var(--sgss-navy-light)] px-10 rounded-xl font-bold shadow-lg shadow-blue-500/20"
              >
                Confirm & Reconcile
              </Button>
            </div>
          </Form>
        )}
      </Modal>
    </div>
  );
}
