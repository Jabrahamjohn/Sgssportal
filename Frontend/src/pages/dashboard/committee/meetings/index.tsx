// Frontend/src/pages/dashboard/committee/meetings/index.tsx

import React, { useEffect, useState } from "react";
import { Table, Tag, Button, Card, Space, Typography, Breadcrumb, message } from "antd";
import { PlusOutlined, EyeOutlined, LockOutlined, CalendarOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import api from "~/config/api";

const { Title, Text } = Typography;

export default function MeetingList() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/meetings/");
      setMeetings(res.data.results || res.data);
    } catch (err) {
      console.error(err);
      message.error("Failed to load meetings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => (
        <Space>
          <CalendarOutlined className="text-[var(--sgss-gold)]" />
          <span className="font-semibold">{dayjs(date).format("DD MMM YYYY")}</span>
        </Space>
      ),
    },
    {
      title: "Type",
      dataIndex: "meeting_type",
      key: "meeting_type",
      render: (type: string) => (
        <Tag color={type === "emergency" ? "volcano" : "blue"} className="uppercase font-bold">
          {type}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "default";
        let icon = null;
        if (status === "draft") color = "processing";
        if (status === "ratified") color = "success";
        if (status === "locked") {
          color = "gold";
          icon = <LockOutlined />;
        }
        return (
          <Tag color={color} icon={icon} className="uppercase font-bold px-3 py-0.5 rounded-full">
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Quorum",
      dataIndex: "quorum_confirmed",
      key: "quorum",
      render: (confirmed: boolean) => (
        <span className={confirmed ? "text-green-600 font-medium" : "text-gray-400"}>
          {confirmed ? "Confirmed" : "Pending"}
        </span>
      ),
    },
    {
      title: "Claims",
      key: "claims_count",
      render: (_: any, record: any) => record.claim_links?.length || 0,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Button 
          type="primary" 
          icon={<EyeOutlined />} 
          onClick={() => nav(`/dashboard/committee/meetings/${record.id}`)}
          className="bg-[var(--sgss-navy)] border-none hover:bg-[var(--sgss-navy-light)] rounded-lg"
        >
          Manage
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Breadcrumb 
            items={[
              { title: "Committee" },
              { title: "Meetings" }
            ]} 
          />
          <Title level={2} className="!mt-2 !mb-0 font-bold text-[var(--sgss-navy)]">
            Committee Sessions
          </Title>
          <Text type="secondary">Manage meeting agendas, attendance, and ratified decisions.</Text>
        </div>
        <Button 
          type="primary" 
          size="large" 
          icon={<PlusOutlined />} 
          className="bg-[var(--sgss-gold)] border-none hover:bg-[var(--sgss-gold-dark)] h-12 px-8 rounded-xl shadow-lg shadow-yellow-500/20 font-bold"
          onClick={() => message.info("Feature: Create Meeting Coming Up")}
        >
          New Session
        </Button>
      </div>

      <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
        <Table 
          dataSource={meetings} 
          columns={columns} 
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          className="sgss-table"
        />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 border-none rounded-2xl p-4 text-white">
          <div className="flex justify-between items-start">
            <div>
              <Text className="text-white/70 text-xs font-bold uppercase tracking-wider">Active Cycle</Text>
              <Title level={3} className="!text-white !mt-1 !mb-0">Q1 2026</Title>
            </div>
            <UsergroupAddOutlined className="text-white/20 text-3xl" />
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-400 to-orange-500 border-none rounded-2xl p-4 text-white">
          <div className="flex justify-between items-start">
            <div>
              <Text className="text-white/70 text-xs font-bold uppercase tracking-wider">Pending Ratification</Text>
              <Title level={3} className="!text-white !mt-1 !mb-0">
                {meetings.filter((m: any) => m.status === 'draft').length} Sessions
              </Title>
            </div>
            <LockOutlined className="text-white/20 text-3xl" />
          </div>
        </Card>
      </div>
    </div>
  );
}
