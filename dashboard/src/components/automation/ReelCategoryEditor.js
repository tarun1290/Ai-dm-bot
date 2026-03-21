"use client";

import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical, Tag, Hash, AtSign, Film, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toggle } from './UIHelpers';

const MAX_CATEGORIES = 5;

const EMPTY_CATEGORY = {
  name: "",
  enabled: true,
  priority: 0,
  detection: { keywords: [], hashtags: [], accountUsernames: [], specificReelIds: [] },
  matchMode: "any",
  reply: { message: "", linkUrl: "", buttonText: "Check it out 🚀" },
};

function TagInput({ values, onChange, placeholder, icon: Icon, prefix }) {
  const [input, setInput] = useState("");

  const addTag = (val) => {
    const cleaned = val.trim().replace(/^[#@]+/, '');
    if (cleaned && !values.includes(cleaned)) {
      onChange([...values, cleaned]);
    }
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (input.trim()) addTag(input);
    } else if (e.key === "Backspace" && !input && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  };

  return (
    <div
      className="flex flex-wrap gap-1.5 items-center min-h-[42px] rounded-xl px-3 py-2 text-sm transition-all"
      style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)' }}
    >
      {values.map((v, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold"
          style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary-medium)' }}
        >
          {prefix}{v}
          <button type="button" onClick={() => onChange(values.filter((_, j) => j !== i))} className="hover:opacity-70">
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (input.trim()) addTag(input); }}
        placeholder={values.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[80px] bg-transparent outline-none text-sm font-medium"
        style={{ color: 'var(--input-text)' }}
      />
    </div>
  );
}

function CategoryCard({ category, index, onUpdate, onRemove, isExpanded, onToggleExpand }) {
  const updateField = (path, value) => {
    const updated = JSON.parse(JSON.stringify(category));
    const keys = path.split('.');
    let obj = updated;
    for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
    obj[keys[keys.length - 1]] = value;
    onUpdate(updated);
  };

  const detection = category.detection || {};
  const hasAnyCriteria =
    (detection.keywords?.length || 0) +
    (detection.hashtags?.length || 0) +
    (detection.accountUsernames?.length || 0) +
    (detection.specificReelIds?.length || 0) > 0;

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{ backgroundColor: 'var(--surface-alt)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4 cursor-pointer"
        onClick={onToggleExpand}
      >
        <GripVertical size={16} style={{ color: 'var(--text-placeholder)' }} className="flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-black" style={{ color: 'var(--text-primary)' }}>
              {category.name || `Category ${index + 1}`}
            </span>
            {!hasAnyCriteria && category.name && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning-dark)' }}>
                No criteria
              </span>
            )}
          </div>
          {!isExpanded && hasAnyCriteria && (
            <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-placeholder)' }}>
              {[
                detection.keywords?.length && `${detection.keywords.length} keyword${detection.keywords.length > 1 ? 's' : ''}`,
                detection.hashtags?.length && `${detection.hashtags.length} hashtag${detection.hashtags.length > 1 ? 's' : ''}`,
                detection.accountUsernames?.length && `${detection.accountUsernames.length} account${detection.accountUsernames.length > 1 ? 's' : ''}`,
                detection.specificReelIds?.length && `${detection.specificReelIds.length} reel ID${detection.specificReelIds.length > 1 ? 's' : ''}`,
              ].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        <Toggle on={category.enabled} onClick={(e) => { e.stopPropagation(); updateField('enabled', !category.enabled); }} />
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="p-1.5 rounded-lg hover:opacity-80 transition-all"
          style={{ color: 'var(--error)' }}
        >
          <Trash2 size={14} />
        </button>
        {isExpanded ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
      </div>

      {/* Expanded body */}
      {isExpanded && (
        <div className="px-5 pb-5 space-y-5 border-t" style={{ borderColor: 'var(--border)' }}>
          {/* Name */}
          <div className="pt-4">
            <label className="text-[11px] font-black uppercase tracking-widest mb-2 block" style={{ color: 'var(--text-placeholder)' }}>
              Category Name
            </label>
            <input
              type="text"
              value={category.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
              style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--input-text)' }}
              placeholder="e.g. Fitness Reels, Product Demos"
              maxLength={50}
            />
          </div>

          {/* Detection Criteria */}
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest mb-3 block" style={{ color: 'var(--text-placeholder)' }}>
              Detection Criteria
            </label>
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Tag size={12} style={{ color: 'var(--text-muted)' }} />
                  <span className="text-[11px] font-bold" style={{ color: 'var(--text-muted)' }}>Keywords in caption</span>
                </div>
                <TagInput
                  values={detection.keywords || []}
                  onChange={(v) => updateField('detection.keywords', v)}
                  placeholder="Type keyword and press Enter"
                  prefix=""
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Hash size={12} style={{ color: 'var(--text-muted)' }} />
                  <span className="text-[11px] font-bold" style={{ color: 'var(--text-muted)' }}>Hashtags</span>
                </div>
                <TagInput
                  values={detection.hashtags || []}
                  onChange={(v) => updateField('detection.hashtags', v)}
                  placeholder="Type hashtag and press Enter"
                  prefix="#"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <AtSign size={12} style={{ color: 'var(--text-muted)' }} />
                  <span className="text-[11px] font-bold" style={{ color: 'var(--text-muted)' }}>Account usernames</span>
                </div>
                <TagInput
                  values={detection.accountUsernames || []}
                  onChange={(v) => updateField('detection.accountUsernames', v)}
                  placeholder="Type @username and press Enter"
                  prefix="@"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Film size={12} style={{ color: 'var(--text-muted)' }} />
                  <span className="text-[11px] font-bold" style={{ color: 'var(--text-muted)' }}>Specific reel IDs or URLs</span>
                </div>
                <TagInput
                  values={detection.specificReelIds || []}
                  onChange={(v) => updateField('detection.specificReelIds', v)}
                  placeholder="Paste reel ID or URL and press Enter"
                  prefix=""
                />
              </div>
            </div>
          </div>

          {/* Match Mode */}
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest mb-2 block" style={{ color: 'var(--text-placeholder)' }}>
              Match Mode
            </label>
            <div className="flex gap-2">
              {[
                { value: "any", label: "Match ANY criterion" },
                { value: "all", label: "Match ALL criteria" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateField('matchMode', opt.value)}
                  className={cn("flex-1 py-2.5 rounded-xl text-[12px] font-bold transition-all")}
                  style={
                    category.matchMode === opt.value
                      ? { backgroundColor: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary-medium)' }
                      : { backgroundColor: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--input-border)' }
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reply Config */}
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest mb-2 block" style={{ color: 'var(--text-placeholder)' }}>
              Auto-Reply
            </label>
            <div className="space-y-3">
              <div>
                <textarea
                  value={category.reply?.message || ""}
                  onChange={(e) => updateField('reply.message', e.target.value)}
                  rows={2}
                  className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all resize-none"
                  style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--input-text)' }}
                  placeholder="Reply message for this category..."
                />
                <p className="text-[11px] mt-1" style={{ color: 'var(--text-placeholder)' }}>
                  Use <span className="font-bold" style={{ color: 'var(--primary)' }}>{'{name}'}</span> for the sender&apos;s first name.
                </p>
              </div>
              <input
                type="url"
                value={category.reply?.linkUrl || ""}
                onChange={(e) => updateField('reply.linkUrl', e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--input-text)' }}
                placeholder="https://your-link.com"
              />
              <input
                type="text"
                value={category.reply?.buttonText || ""}
                onChange={(e) => updateField('reply.buttonText', e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--input-text)' }}
                placeholder="Button text (e.g. Check it out 🚀)"
                maxLength={20}
              />
            </div>
          </div>

          {/* Stats */}
          {(category.stats?.totalMatches > 0 || category.stats?.totalRepliesSent > 0) && (
            <div className="flex gap-4 pt-2">
              <div className="text-[11px]" style={{ color: 'var(--text-placeholder)' }}>
                <span className="font-black" style={{ color: 'var(--text-primary)' }}>{category.stats.totalMatches}</span> matches
              </div>
              <div className="text-[11px]" style={{ color: 'var(--text-placeholder)' }}>
                <span className="font-black" style={{ color: 'var(--success)' }}>{category.stats.totalRepliesSent}</span> replies sent
              </div>
              {category.stats.lastMatchedAt && (
                <div className="text-[11px]" style={{ color: 'var(--text-placeholder)' }}>
                  Last: {new Date(category.stats.lastMatchedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ReelCategoryEditor({ categories, defaultReply, onChange, onDefaultReplyChange }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const addCategory = () => {
    if (categories.length >= MAX_CATEGORIES) return;
    const newCat = {
      ...JSON.parse(JSON.stringify(EMPTY_CATEGORY)),
      priority: categories.length,
    };
    onChange([...categories, newCat]);
    setExpandedIndex(categories.length);
  };

  const updateCategory = (index, updated) => {
    const newList = [...categories];
    newList[index] = updated;
    onChange(newList);
  };

  const removeCategory = (index) => {
    onChange(categories.filter((_, i) => i !== index));
    if (expandedIndex === index) setExpandedIndex(null);
    else if (expandedIndex > index) setExpandedIndex(expandedIndex - 1);
  };

  return (
    <div className="space-y-4">
      {/* Category cards */}
      {categories.map((cat, i) => (
        <CategoryCard
          key={cat._id || i}
          category={cat}
          index={i}
          onUpdate={(updated) => updateCategory(i, updated)}
          onRemove={() => removeCategory(i)}
          isExpanded={expandedIndex === i}
          onToggleExpand={() => setExpandedIndex(expandedIndex === i ? null : i)}
        />
      ))}

      {/* Add button */}
      {categories.length < MAX_CATEGORIES && (
        <button
          onClick={addCategory}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-bold transition-all"
          style={{ border: '2px dashed var(--border)', color: 'var(--text-muted)' }}
        >
          <Plus size={16} />
          Add Category Rule ({categories.length}/{MAX_CATEGORIES})
        </button>
      )}

      {categories.length >= MAX_CATEGORIES && (
        <p className="text-[11px] text-center font-medium" style={{ color: 'var(--text-placeholder)' }}>
          Maximum {MAX_CATEGORIES} categories reached
        </p>
      )}

      {/* Default reply section */}
      <div
        className="rounded-2xl p-5 mt-4"
        style={{ backgroundColor: 'var(--surface-alt)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-[13px] font-black" style={{ color: 'var(--text-primary)' }}>Default Reply</h4>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-placeholder)' }}>
              Sent when no category matches. Falls back to the main Reel Share message if empty.
            </p>
          </div>
          <Toggle
            on={defaultReply?.enabled !== false}
            onClick={() => onDefaultReplyChange({ ...defaultReply, enabled: !(defaultReply?.enabled !== false) })}
          />
        </div>

        {defaultReply?.enabled !== false && (
          <div className="space-y-3">
            <textarea
              value={defaultReply?.message || ""}
              onChange={(e) => onDefaultReplyChange({ ...defaultReply, message: e.target.value })}
              rows={2}
              className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all resize-none"
              style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--input-text)' }}
              placeholder="Default reply when no category matches..."
            />
            <input
              type="url"
              value={defaultReply?.linkUrl || ""}
              onChange={(e) => onDefaultReplyChange({ ...defaultReply, linkUrl: e.target.value })}
              className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
              style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--input-text)' }}
              placeholder="https://default-link.com"
            />
            <input
              type="text"
              value={defaultReply?.buttonText || ""}
              onChange={(e) => onDefaultReplyChange({ ...defaultReply, buttonText: e.target.value })}
              className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
              style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--input-text)' }}
              placeholder="Button text"
              maxLength={20}
            />
          </div>
        )}
      </div>
    </div>
  );
}
