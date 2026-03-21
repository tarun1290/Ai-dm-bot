"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FileText, Globe, Loader2, Trash2, RefreshCw, Upload, Plus, ChevronDown, ChevronUp, Send, X, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { getKnowledgeDocuments, addKnowledgeUrl, deleteKnowledgeDocument, refreshKnowledgeUrl, searchKnowledge } from "@/app/dashboard/smart-actions";

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="p-6 rounded-[24px]" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} style={{ color: "var(--text-placeholder)" }} />
        <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-placeholder)" }}>{label}</p>
      </div>
      <h3 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>{value}</h3>
    </div>
  );
}

function DocumentRow({ doc, onDelete, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete "${doc.fileName}"? This will remove ${doc.chunkCount || 0} chunks.`)) return;
    setDeleting(true);
    const res = await deleteKnowledgeDocument(doc._id);
    if (res.success) { toast.success("Document deleted"); onDelete(); }
    else toast.error(res.error);
    setDeleting(false);
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--surface-alt)", border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: doc.fileType === "pdf" ? "var(--error-light)" : "var(--info-light)" }}>
          {doc.fileType === "pdf" ? <FileText size={18} style={{ color: "var(--error)" }} /> : <Globe size={18} style={{ color: "var(--info)" }} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold truncate" style={{ color: "var(--text-primary)" }}>{doc.fileName || doc.fileUrl}</p>
          <p className="text-[11px]" style={{ color: "var(--text-placeholder)" }}>
            {doc.chunkCount || 0} chunks · {doc.totalTokens || 0} tokens · {new Date(doc.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full`}
          style={{
            backgroundColor: doc.status === "ready" ? "var(--success-light)" : doc.status === "processing" ? "var(--warning-light)" : "var(--error-light)",
            color: doc.status === "ready" ? "var(--success)" : doc.status === "processing" ? "var(--warning)" : "var(--error)",
          }}>
          {doc.status}
        </span>
        <div className="flex items-center gap-1">
          {doc.fileType === "url" && doc.status === "ready" && (
            <button onClick={() => { onRefresh(doc._id); toast.success("Refreshing..."); }} className="p-1.5 rounded-lg" style={{ color: "var(--primary)" }} title="Refresh"><RefreshCw size={12} /></button>
          )}
          <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg" style={{ color: "var(--text-muted)" }}>
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <button onClick={handleDelete} disabled={deleting} className="p-1.5 rounded-lg" style={{ color: "var(--error)" }} title="Delete">
            {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
          </button>
        </div>
      </div>
      {expanded && doc.status === "failed" && (
        <div className="px-5 pb-4">
          <p className="text-[11px] p-3 rounded-xl" style={{ backgroundColor: "var(--error-light)", color: "var(--error)" }}>{doc.processingError}</p>
        </div>
      )}
    </div>
  );
}

export default function KnowledgeBasePage() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [urlInput, setUrlInput] = useState("");
  const [addingUrl, setAddingUrl] = useState(false);
  const [testQuery, setTestQuery] = useState("");
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const loadDocs = useCallback(async () => {
    const res = await getKnowledgeDocuments();
    if (res.success) setDocs(res.documents);
    setLoading(false);
  }, []);

  useEffect(() => { loadDocs(); }, [loadDocs]);

  const handleAddUrl = async () => {
    if (!urlInput.trim()) return;
    setAddingUrl(true);
    const res = await addKnowledgeUrl(null, urlInput.trim());
    if (res.success) { toast.success("URL added! Processing..."); setUrlInput(""); loadDocs(); }
    else toast.error(res.error);
    setAddingUrl(false);
  };

  const handleRefresh = async (docId) => {
    await refreshKnowledgeUrl(docId);
    setTimeout(loadDocs, 2000);
  };

  const handleTest = async () => {
    if (!testQuery.trim()) return;
    setTesting(true);
    setTestResult(null);
    const res = await searchKnowledge(null, testQuery.trim());
    if (res.success) setTestResult(res.chunks);
    setTesting(false);
  };

  const totalChunks = docs.reduce((s, d) => s + (d.chunkCount || 0), 0);
  const lastUpdated = docs.length > 0 ? new Date(Math.max(...docs.map(d => new Date(d.updatedAt || d.createdAt)))).toLocaleDateString() : "—";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>Knowledge Base</h1>
        <p className="text-sm font-medium mt-1" style={{ color: "var(--text-muted)" }}>Upload documents and URLs to teach the AI about your business</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={FileText} label="Documents" value={docs.length} />
        <StatCard icon={CheckCircle2} label="Total Chunks" value={totalChunks} />
        <StatCard icon={RefreshCw} label="Last Updated" value={lastUpdated} />
      </div>

      {/* Limits */}
      <div className="flex gap-4 text-[11px] font-medium" style={{ color: "var(--text-placeholder)" }}>
        <span>{docs.length} of 10 documents</span>
        <span>·</span>
        <span>{totalChunks} of 500 chunks</span>
      </div>

      {/* Add URL */}
      <div className="rounded-[24px] p-6" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
        <h3 className="text-sm font-black mb-3" style={{ color: "var(--text-primary)" }}>Add Website URL</h3>
        <div className="flex gap-3">
          <input type="url" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://your-website.com/about"
            className="flex-1 rounded-xl px-4 py-3 text-sm font-medium outline-none"
            style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }}
            onKeyDown={(e) => e.key === "Enter" && handleAddUrl()} />
          <button onClick={handleAddUrl} disabled={addingUrl || docs.length >= 10}
            className="px-6 py-3 rounded-xl font-bold text-sm text-white flex items-center gap-2"
            style={{ backgroundColor: "var(--primary)" }}>
            {addingUrl ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Add
          </button>
        </div>
        <p className="text-[11px] mt-2" style={{ color: "var(--text-placeholder)" }}>We&apos;ll extract text content from this page and add it to your knowledge base</p>
      </div>

      {/* Documents list */}
      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 size={24} className="animate-spin" style={{ color: "var(--primary)" }} /></div>
      ) : docs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText size={40} style={{ color: "var(--text-placeholder)" }} className="mb-4" />
          <h3 className="text-lg font-black mb-2" style={{ color: "var(--text-primary)" }}>Your knowledge base is empty</h3>
          <p className="text-sm max-w-xs mb-6" style={{ color: "var(--text-muted)" }}>Upload a PDF or add a website URL to teach the AI about your business.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-black" style={{ color: "var(--text-primary)" }}>Documents ({docs.length})</h3>
          {docs.map((doc) => <DocumentRow key={doc._id} doc={doc} onDelete={loadDocs} onRefresh={handleRefresh} />)}
        </div>
      )}

      {/* Test chat */}
      <div className="rounded-[24px] p-6" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
        <h3 className="text-sm font-black mb-1" style={{ color: "var(--text-primary)" }}>Test your knowledge base</h3>
        <p className="text-[11px] mb-4" style={{ color: "var(--text-placeholder)" }}>See how the AI would answer questions from your customers</p>
        <div className="flex gap-3">
          <input type="text" value={testQuery} onChange={(e) => setTestQuery(e.target.value)} placeholder="Ask a test question..."
            className="flex-1 rounded-xl px-4 py-3 text-sm font-medium outline-none"
            style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }}
            onKeyDown={(e) => e.key === "Enter" && handleTest()} />
          <button onClick={handleTest} disabled={testing} className="px-4 py-3 rounded-xl text-white" style={{ backgroundColor: "var(--primary)" }}>
            {testing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
        {testResult && (
          <div className="mt-4 space-y-2">
            <p className="text-[11px] font-bold" style={{ color: "var(--text-placeholder)" }}>Retrieved {testResult.length} chunks:</p>
            {testResult.map((chunk, i) => (
              <div key={i} className="p-3 rounded-xl text-[12px]" style={{ backgroundColor: "var(--surface-alt)", color: "var(--text-muted)" }}>
                {chunk.content?.substring(0, 200)}...
                {chunk.score && <span className="ml-2 font-bold" style={{ color: "var(--success)" }}>Score: {chunk.score.toFixed(3)}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
