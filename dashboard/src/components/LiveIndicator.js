"use client";

export default function LiveIndicator({ isConnected }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="w-2 h-2 rounded-full"
        style={{
          backgroundColor: isConnected ? "#059669" : "#F87171",
          animation: isConnected ? "pulse 2s infinite" : "none",
        }}
      />
      <span className="text-xs font-medium" style={{ color: isConnected ? "#059669" : "#EF4444" }}>
        {isConnected ? "Live" : "Reconnecting..."}
      </span>
    </div>
  );
}
