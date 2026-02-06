// Frontend/src/pages/dashboard/committee/meetings/detail.tsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Card, Typography, Tag, Space, Button, Table, Tabs, 
  List, Avatar, Badge, message, Descriptions, Divider,
  Popconfirm, Select, Modal, Empty
} from "antd";
import { 
  ArrowLeftOutlined, UserOutlined, FileSyncOutlined, 
  CheckCircleOutlined, LockOutlined, PlusOutlined,
  ThunderboltOutlined, CheckOutlined, CloseOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import api from "~/config/api";

const { Title, Text } = Typography;
const { Option } = Select;

export default function MeetingDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("1");
  
  // States for modals
  const [isAddClaimModalVisible, setIsAddClaimModalVisible] = useState(false);
  const [pendingClaims, setPendingClaims] = useState([]);
  const [loadingClaims, setLoadingClaims] = useState(false);

  const fetchMeeting = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/meetings/${id}/`);
      setMeeting(res.data);
    } catch (err) {
      console.error(err);
      message.error("Failed to load meeting details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeeting();
  }, [id]);

  const handleRatify = async () => {
    try {
      await api.post(`/meetings/${id}/ratify/`);
      message.success("Meeting ratified successfully");
      fetchMeeting();
    } catch (err) {
      message.error("Quorum not confirmed or other error");
    }
  };

  const handleLock = async () => {
    try {
      await api.post(`/meetings/${id}/lock/`);
      message.success("Meeting LOCKED. Decisions are now final.");
      fetchMeeting();
    } catch (err) {
      message.error("Failed to lock meeting");
    }
  };

  const fetchPendingClaims = async () => {
    try {
      setLoadingClaims(true);
      const res = await api.get("/claims/?status=submitted");
      // Filter out claims already linked
      const linkedIds = meeting.claim_links?.map((l: any) => l.claim) || [];
      setPendingClaims(res.data.results?.filter((c: any) => !linkedIds.includes(c.id)) || []);
      setIsAddClaimModalVisible(true);
    } catch (err) {
      message.error("Failed to load pending claims");
    } finally {
      setLoadingClaims(false);
    }
  };

  const addClaimToMeeting = async (claimId: string) => {
    try {
      await api.post("/meeting-claims/", {
        meeting: id,
        claim: claimId,
        decision: "deferred" // Default
      });
      message.success("Claim linked to meeting");
      setIsAddClaimModalVisible(false);
      fetchMeeting();
    } catch (err) {
      message.error("Failed to link claim");
    }
  };

  if (loading) return <Card loading />;
  if (!meeting) return <Empty description="Meeting not found" />;

  const isLocked = meeting.status === "locked";

  const claimColumns = [
    {
      title: "Claim ID",
      dataIndex: "claim_id_display",
      key: "id",
      render: (text: string, record: any) => (
        <Space direction="vertical" size={0}>
          <Text strong className="text-[var(--sgss-navy)]">{record.claim_details?.claim_number || "CN-" + record.claim.substring(0,8).toUpperCase()}</Text>
          <Text type="secondary" className="text-[10px]">{record.claim_details?.member_name}</Text>
        </Space>
      )
    },
    {
      title: "Amount",
      key: "amount",
      render: (_, record: any) => (
        <Text strong>KSh {Number(record.claim_details?.total_claimed || 0).toLocaleString()}</Text>
      )
    },
    {
      title: "Decision",
      dataIndex: "decision",
      key: "decision",
      render: (decision: string) => (
        <Tag color={decision === 'approved' ? 'success' : decision === 'rejected' ? 'error' : 'warning'} className="uppercase font-bold">
          {decision}
        </Tag>
      )
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record: any) => (
        <Button 
          type="link" 
          icon={<EyeOutlined />} 
          onClick={() => nav(`/dashboard/committee/claims/${record.claim}`)}
          className="text-[var(--sgss-gold)] hover:text-[var(--sgss-gold-dark)]"
        >
          View
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between">
        <Space size="middle">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => nav("/dashboard/committee/meetings")} 
            className="rounded-full shadow-sm"
          />
          <div>
            <Title level={3} className="!mb-0">Meeting: {dayjs(meeting.date).format("DD MMMM YYYY")}</Title>
            <Space className="mt-1">
              <Tag color={meeting.meeting_type === "emergency" ? "volcano" : "blue"} className="uppercase font-bold">
                {meeting.meeting_type}
              </Tag>
              <Tag 
                color={meeting.status === 'locked' ? 'gold' : meeting.status === 'ratified' ? 'success' : 'processing'} 
                icon={meeting.status === 'locked' ? <LockOutlined /> : null}
                className="uppercase font-bold"
              >
                {meeting.status}
              </Tag>
            </Space>
          </div>
        </Space>

        <Space>
          {!isLocked && (
            <>
              {meeting.status === "draft" && (
                <Popconfirm title="Ratify results?" onConfirm={handleRatify}>
                   <Button type="primary" className="bg-green-600 border-none hover:bg-green-700 h-10 px-6 rounded-lg font-bold">
                     Ratify Decisions
                   </Button>
                </Popconfirm>
              )}
              {meeting.status === "ratified" && (
                <Popconfirm title="Locking is permanent. Proceed?" onConfirm={handleLock}>
                   <Button type="primary" icon={<LockOutlined />} className="bg-[var(--sgss-gold)] border-none hover:bg-[var(--sgss-gold-dark)] h-10 px-6 rounded-lg font-bold shadow-md shadow-yellow-500/20">
                     Lock Meeting
                   </Button>
                </Popconfirm>
              )}
            </>
          )}
          {isLocked && (
            <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-lg flex items-center gap-2">
                 <LockOutlined className="text-amber-600" />
                 <Text strong className="text-amber-800 text-sm">Forensically Locked</Text>
            </div>
          )}
        </Space>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* INFO COLUMN */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="rounded-2xl shadow-sm border-none overflow-hidden">
            <Descriptions title="Session Meta" column={1} size="small" className="sgss-descriptions">
              <Descriptions.Item label="Chaired By">
                <Space>
                   <Avatar size="small" icon={<UserOutlined />} />
                   <Text strong>{meeting.created_by_name || "Admin"}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Quorum">
                <Badge status={meeting.quorum_confirmed ? "success" : "default"} text={meeting.quorum_confirmed ? "Confirmed" : "Not Met"} />
              </Descriptions.Item>
              <Descriptions.Item label="Minutes">
                {meeting.minutes_file ? (
                  <Button type="link" size="small" className="p-0">Download PDF</Button>
                ) : (
                  <Text type="secondary" italic>No minutes uploaded</Text>
                )}
              </Descriptions.Item>
            </Descriptions>
            
            <Divider className="my-4" />
            
            <Title level={5}>Attendance</Title>
            <List
              size="small"
              dataSource={meeting.attendance || []}
              renderItem={(item: any) => (
                <List.Item>
                   <Space className="w-full justify-between">
                     <Space>
                        <Avatar size="small" className="bg-indigo-100 text-indigo-600">{item.member_name?.charAt(0)}</Avatar>
                        <Text className="text-sm">{item.member_name}</Text>
                     </Space>
                     {item.attended ? <CheckOutlined className="text-green-500" /> : <CloseOutlined className="text-red-300" />}
                   </Space>
                </List.Item>
              )}
              locale={{ emptyText: "Attendance not recorded" }}
            />
          </Card>

          <Button 
             block 
             icon={< ThunderboldOutlined />} 
             size="large"
             onClick={() => nav(`/dashboard/committee/meetings/${id}/mode`)}
             className="bg-[var(--sgss-navy)] text-white hover:bg-[var(--sgss-navy-light)] border-none h-14 rounded-2xl font-bold shadow-xl shadow-blue-900/10 flex items-center justify-center gap-3 uppercase tracking-wider"
          >
             Enter Meeting Mode
          </Button>
        </div>

        {/* CLAIMS COLUMN */}
        <div className="lg:col-span-2">
          <Card 
            className="rounded-2xl shadow-sm border-none min-h-[500px]"
            title={<Title level={4} className="!mb-0">Linked Claims</Title>}
            extra={!isLocked && (
              <Button 
                type="dashed" 
                icon={<PlusOutlined />} 
                onClick={fetchPendingClaims}
                className="hover:border-[var(--sgss-gold)] hover:text-[var(--sgss-gold)]"
              >
                Add Claim
              </Button>
            )}
          >
            <Table 
              dataSource={meeting.claim_links || []} 
              columns={claimColumns} 
              rowKey="id"
              pagination={false}
              locale={{ emptyText: <Empty description="No claims linked to this agenda yet." /> }}
            />
          </Card>
        </div>
      </div>

      {/* SELECT CLAIM MODAL */}
      <Modal
        title="Link Claim to Agenda"
        open={isAddClaimModalVisible}
        onCancel={() => setIsAddClaimModalVisible(false)}
        footer={null}
        width={700}
      >
        <List
          loading={loadingClaims}
          dataSource={pendingClaims}
          renderItem={(claim: any) => (
            <List.Item
              actions={[
                <Button key="add" type="primary" onClick={() => addClaimToMeeting(claim.id)}>Link</Button>
              ]}
            >
              <List.Item.Meta
                title={<Text strong>{claim.claim_number} - KSh {Number(claim.total_claimed).toLocaleString()}</Text>}
                description={
                  <Space split={<Divider type="vertical" />}>
                    <span>{claim.member_name}</span>
                    <span className="capitalize">{claim.claim_type}</span>
                    <span>{dayjs(claim.created_at).format("DD MMM YYYY")}</span>
                  </Space>
                }
              />
            </List.Item>
          )}
          locale={{ emptyText: "No pending claims found" }}
        />
      </Modal>
    </div>
  );
}

// Fixed icons
function ThunderboldOutlined() {
  return <ThunderboltOutlined />;
}

function EyeOutlined() {
  return <FileSyncOutlined />; // Better icon for file/review
}
