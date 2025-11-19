// frontend/src/pages/dashboard/committee/claims-table.tsx
import React, { useEffect, useState } from "react";
import api from "~/config/api";
import { Link } from "react-router-dom";

const [status, setStatus] = useState("");
const [type, setType] = useState("");
const [query, setQuery] = useState("");

useEffect(() => {
  listCommitteeClaims({ status, type, q: query })
    .then(setData)
    .finally(() => setLoading(false));
}, [status, type, query]);


export default function ClaimsTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  return (
    <div className="grid grid-cols-3 gap-3 mb-4">
  <select className="border p-2" value={status} onChange={e => setStatus(e.target.value)}>
    <option value="">All Status</option>
    <option value="submitted">Submitted</option>
    <option value="reviewed">Reviewed</option>
    <option value="approved">Approved</option>
    <option value="rejected">Rejected</option>
    <option value="paid">Paid</option>
  </select>

  <select className="border p-2" value={type} onChange={e => setType(e.target.value)}>
    <option value="">All Types</option>
    <option value="outpatient">Outpatient</option>
    <option value="inpatient">Inpatient</option>
    <option value="chronic">Chronic</option>
  </select>

  <input
    className="border p-2"
    placeholder="Search name or claim ID…"
    value={query}
    onChange={e => setQuery(e.target.value)}
  />
</div>
<div className="flex gap-6 p-3 bg-gray-100 rounded mb-3 text-sm">
  <div>Total Claims: {data.length}</div>
  <div>Approved: {data.filter(x => x.status === "approved").length}</div>
  <div>Pending: {data.filter(x => x.status === "submitted").length}</div>
  <div>Paid: {data.filter(x => x.status === "paid").length}</div>
</div>
