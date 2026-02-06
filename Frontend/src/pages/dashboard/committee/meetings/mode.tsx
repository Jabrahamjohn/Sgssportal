// Frontend/src/pages/dashboard/committee/meetings/mode.tsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Layout, Menu, Typography, Card, Space, Button, 
  Tag, Descriptions, Divider, message, Empty, Spin,
  Input, Form
} from "antd";
import { 
  ArrowLeftOutlined, CheckOutlined, CloseOutlined, 
  PauseOutlined, RightOutlined, FileSearchOutlined,
  DollarOutlined, MedicineBoxOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import api from "~/config/api";

const { Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function MeetingMode() {
  const { id } = useParams();
  const nav = useNavigate();
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchMeeting = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/meetings/${id}/`);
      setMeeting(res.data);
    } catch (err) {
      message.error("Failed to load meeting");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeeting();
  }, [id]);

  const currentLink = meeting?.claim_links?.[currentIndex];
  
  const handleDecision = async (decision: string) => {
    if (!currentLink) return;
    
    try {
      setIsSubmitting(true);
      const values = form.getFieldsValue();
      
      await api.patch(`/meeting-claims/${currentLink.id}/`, {
        decision,
        notes: values.notes
      });
      
      message.success(`Claim ${decision}`);
      
      // Move to next
      if (currentIndex < meeting.claim_links.length - 1) {
        setCurrentIndex(currentIndex + 1);
        form.resetFields();
      } else {
        message.info("Reached the end of the agenda");
        nav(`/dashboard/committee/meetings/${id}`);
      }
      
      // Refresh local data to show updated decisions in sidebar
      fetchMeeting(); 
    } catch (err) {
      message.error("Failed to save decision");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><Spin size="large" /></div>;
  if (!meeting || !meeting.claim_links?.length) return <Empty description="No claims to review in this session" />;

  return (
    <Layout className="h-screen bg-white">
      {/* LEFT SIDEBAR - Agenda */}
      <Sider width={320} className="bg-white border-r border-gray-100 flex flex-col pt-4">
        <div className="px-6 mb-6">
           <Button icon={<ArrowLeftOutlined />} onClick={() => nav(`/dashboard/committee/meetings/${id}`)} className="mb-4">Exit Mode</Button>
           <Title level={4} className="!mb-0">Session Agenda</Title>
           <Text type="secondary" className="text-xs uppercase font-bold tracking-widest">{currentIndex + 1} of {meeting.claim_links.length} Claims</Text>
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={[currentLink?.id]}
          className="flex-1 overflow-y-auto border-none"
          onClick={({ key }) => {
            const idx = meeting.claim_links.findIndex((l: any) => l.id === key);
            setCurrentIndex(idx);
          }}
        >
          {meeting.claim_links.map((link: any, idx: number) => (
            <Menu.Item key={link.id} className="!h-auto !py-4 transition-all !line-height-1.2 border-b border-gray-50">
               <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                     <Text strong className={idx === currentIndex ? "text-[var(--sgss-gold)]" : "text-[var(--sgss-navy)]"}>
                        {link.claim_details?.claim_number || `Claim ${idx + 1}`}
                     </Text>
                     <Text className="text-[10px] text-gray-400">{link.claim_details?.member_name}</Text>
                  </div>
                  <Tag className="rounded-full text-[9px] uppercase font-bold" color={link.decision === 'approved' ? 'success' : link.decision === 'rejected' ? 'error' : 'default'}>
                     {link.decision}
                  </Tag>
               </div>
            </Menu.Item>
          ))}
        </Menu>
      </Sider>

      {/* MAIN CONTENT - Claim View */}
      <Content className="overflow-y-auto bg-[var(--sgss-bg)] p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <Card className="rounded-2xl border-none shadow-xl shadow-blue-900/5 transition-all">
             <div className="flex justify-between items-start mb-6">
                <Space direction="vertical" size={2}>
                   <Title level={2} className="!mb-0 text-[var(--sgss-navy)]">
                      {currentLink.claim_details?.claim_number}
                   </Title>
                   <Space>
                      <Tag color="blue" className="rounded-full uppercase font-bold">{currentLink.claim_details?.claim_type}</Tag>
                      <Text type="secondary" className="text-sm">Submitted {dayjs(currentLink.claim_details?.created_at).format("DD MMM YYYY")}</Text>
                   </Space>
                </Space>
                <div className="text-right">
                   <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest">Requested Total</Text>
                   <Title level={2} className="!mt-0 !mb-0 text-[var(--sgss-gold)]">
                      KSh {Number(currentLink.claim_details?.total_claimed).toLocaleString()}
                   </Title>
                </div>
             </div>

             <Descriptions bordered column={2} size="small" className="sgss-descriptions-modern">
                <Descriptions.Item label="Member">{currentLink.claim_details?.member_name}</Descriptions.Item>
                <Descriptions.Item label="Hospital">{currentLink.claim_details?.hospital_name || "N/A"}</Descriptions.Item>
                <Descriptions.Item label="Items">{currentLink.claim_details?.items_count || 0} Line Items</Descriptions.Item>
                <Descriptions.Item label="Attachments">{currentLink.claim_details?.attachments_count || 0} Files</Descriptions.Item>
             </Descriptions>

             <Divider />
             
             <Space direction="vertical" className="w-full" size="middle">
                <div>
                   <Space className="mb-2">
                      <MedicineBoxOutlined className="text-indigo-600" />
                      <Text strong className="text-[var(--sgss-navy)] uppercase tracking-wider text-xs">Clinical Status / Notes</Text>
                   </Space>
                   <Paragraph className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50 italic text-indigo-900">
                      {currentLink.claim_details?.notes || "No additional clinical notes provided by the member."}
                   </Paragraph>
                </div>
             </Space>
          </Card>

          {/* DECISION PANEL */}
          <Card className="rounded-2xl border-none shadow-2xl shadow-blue-900/10 p-2">
             <Form form={form} layout="vertical">
                <Form.Item name="notes" label={<Text strong className="text-xs uppercase tracking-widest text-gray-500">Board Deliberation Notes</Text>}>
                   <TextArea rows={4} placeholder="Enter any specific committee observations for this decision..." className="rounded-xl border-gray-100 bg-gray-50/50" />
                </Form.Item>

                <div className="grid grid-cols-3 gap-6 pt-2">
                   <Button 
                      loading={isSubmitting}
                      onClick={() => handleDecision("approved")}
                      className="h-16 rounded-2xl border-none bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 flex flex-col items-center justify-center gap-1 font-bold group"
                   >
                      <CheckOutlined className="text-xl group-hover:scale-110 transition-transform" />
                      APPROVE
                   </Button>
                   <Button 
                      loading={isSubmitting}
                      onClick={() => handleDecision("rejected")}
                      className="h-16 rounded-2xl border-none bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 flex flex-col items-center justify-center gap-1 font-bold group"
                   >
                      <CloseOutlined className="text-xl group-hover:scale-110 transition-transform" />
                      REJECT
                   </Button>
                   <Button 
                      loading={isSubmitting}
                      onClick={() => handleDecision("deferred")}
                      className="h-16 rounded-2xl border-none bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 flex flex-col items-center justify-center gap-1 font-bold group"
                   >
                      <PauseOutlined className="text-xl group-hover:scale-110 transition-transform" />
                      DEFER
                   </Button>
                </div>
             </Form>
          </Card>
          
          <div className="flex justify-center">
             <Button type="link" icon={<FileSyncOutlined />} onClick={() => nav(`/dashboard/committee/claims/${currentLink.claim}`)}>
                Open Full Claim View in New Tab
             </Button>
          </div>
        </div>
      </Content>
    </Layout>
  );
}

// Icons
function FileSyncOutlined() {
  return <FileSearchOutlined />;
}
