"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useChat, useAuth } from "@/contexts";
import {
  FiArrowLeft,
  FiSend,
  FiUsers,
  FiInfo,
  FiLogOut,
  FiX,
  FiUser,
} from "react-icons/fi";

export default function ChatRoomPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.groupId as string;
  const { user } = useAuth();
  const {
    activeGroup,
    messages,
    loading,
    error,
    fetchGroupDetail,
    fetchMessages,
    sendMessage,
    leaveGroup,
    clearActiveGroup,
  } = useChat();

  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (groupId) {
      fetchGroupDetail(groupId);
      fetchMessages(groupId);
    }

    return () => {
      clearActiveGroup();
    };
  }, [groupId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || sending) return;

    setSending(true);
    const success = await sendMessage(groupId, messageText.trim());
    setSending(false);

    if (success) {
      setMessageText("");
    }
  };

  const handleLeaveGroup = async () => {
    if (!confirm("Are you sure you want to leave this group?")) return;

    const success = await leaveGroup(groupId);
    if (success) {
      router.push("/chat");
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const formatMessageDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((acc, message) => {
    const date = formatMessageDate(message.created_at);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(message);
    return acc;
  }, {} as Record<string, typeof messages>);

  if (!activeGroup && loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-lime"></div>
      </div>
    );
  }

  if (!activeGroup) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Group not found</p>
          <button
            onClick={() => router.push("/chat")}
            className="px-6 py-3 bg-accent-lime hover:bg-accent-lime/90 text-dark rounded-xl font-semibold"
          >
            Back to Groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-dark flex flex-col">
      {/* Header */}
      <div className="bg-dark-secondary/30 backdrop-blur-xl border-b border-dark-secondary px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => router.push("/chat")}
              className="p-2 hover:bg-dark-secondary rounded-lg transition-colors"
            >
              <FiArrowLeft className="text-xl text-gray-400" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">{activeGroup.name}</h1>
              <p className="text-sm text-gray-400">
                {activeGroup.member_count} members
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 hover:bg-dark-secondary rounded-lg transition-colors"
          >
            <FiInfo className="text-xl text-gray-400" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              {Object.entries(groupedMessages).map(([date, msgs]) => (
                <div key={date}>
                  {/* Date Divider */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 h-px bg-dark-secondary"></div>
                    <span className="text-xs text-gray-500 font-medium">{date}</span>
                    <div className="flex-1 h-px bg-dark-secondary"></div>
                  </div>

                  {/* Messages for this date */}
                  <div className="space-y-3">
                    {msgs.map((message) => {
                      const isOwnMessage = message.user_id === user?.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] ${
                              isOwnMessage
                                ? "bg-accent-lime text-dark"
                                : "bg-dark-secondary"
                            } rounded-2xl px-4 py-3`}
                          >
                            {!isOwnMessage && (
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-accent-lime">
                                  {message.user_name}
                                </span>
                                {message.user_year && message.user_branch && (
                                  <span className="text-xs text-gray-500">
                                    {message.user_branch} Y{message.user_year}
                                  </span>
                                )}
                              </div>
                            )}
                            <p className={`text-sm break-words ${isOwnMessage ? "text-dark" : "text-white"}`}>
                              {message.content}
                            </p>
                            <p
                              className={`text-xs mt-1 ${
                                isOwnMessage ? "text-dark/70" : "text-gray-500"
                              }`}
                            >
                              {formatMessageTime(message.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {messages.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No messages yet. Start the conversation!</p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Input */}
          <div className="border-t border-dark-secondary px-4 py-4 bg-dark-secondary/30">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                <div className="flex-1">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    rows={1}
                    maxLength={5000}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    className="w-full px-4 py-3 bg-dark-secondary border border-dark-secondary rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent-lime transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending || !messageText.trim()}
                  className="p-4 bg-accent-lime hover:bg-accent-lime/90 text-dark rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiSend className="text-xl" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Info Sidebar (Desktop) */}
        {showInfo && (
          <div className="hidden lg:block w-80 border-l border-dark-secondary bg-dark-secondary/30 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Group Info</h2>
                <button
                  onClick={() => setShowInfo(false)}
                  className="p-2 hover:bg-dark-secondary rounded-lg transition-colors"
                >
                  <FiX className="text-xl text-gray-400" />
                </button>
              </div>

              {/* Group Description */}
              {activeGroup.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
                  <p className="text-gray-300 text-sm">{activeGroup.description}</p>
                </div>
              )}

              {/* Members List */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-400 mb-3">
                  Members ({activeGroup.members.length})
                </h3>
                <div className="space-y-2">
                  {activeGroup.members.map((member) => (
                    <div
                      key={member.user_id}
                      className="flex items-center gap-3 p-3 bg-dark-secondary rounded-lg"
                    >
                      <div className="w-10 h-10 rounded-full bg-accent-lime/10 flex items-center justify-center">
                        <span className="text-accent-lime font-semibold text-sm">
                          {member.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {member.full_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {member.branch && member.year
                            ? `${member.branch} Year ${member.year}`
                            : member.email}
                        </p>
                      </div>
                      {member.role === "admin" && (
                        <span className="text-xs px-2 py-1 bg-accent-lime/20 text-accent-lime rounded">
                          Admin
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Leave Group Button */}
              <button
                onClick={handleLeaveGroup}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium transition-colors"
              >
                <FiLogOut className="text-lg" />
                Leave Group
              </button>
            </div>
          </div>
        )}

        {/* Info Modal (Mobile) */}
        {showInfo && (
          <div className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end">
            <div className="bg-dark-secondary border-t border-dark-secondary rounded-t-3xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white">Group Info</h2>
                  <button
                    onClick={() => setShowInfo(false)}
                    className="p-2 hover:bg-dark rounded-lg transition-colors"
                  >
                    <FiX className="text-xl text-gray-400" />
                  </button>
                </div>

                {activeGroup.description && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
                    <p className="text-gray-300 text-sm">{activeGroup.description}</p>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">
                    Members ({activeGroup.members.length})
                  </h3>
                  <div className="space-y-2">
                    {activeGroup.members.map((member) => (
                      <div
                        key={member.user_id}
                        className="flex items-center gap-3 p-3 bg-dark rounded-lg"
                      >
                        <div className="w-10 h-10 rounded-full bg-accent-lime/10 flex items-center justify-center">
                          <span className="text-accent-lime font-semibold text-sm">
                            {member.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {member.full_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {member.branch && member.year
                              ? `${member.branch} Year ${member.year}`
                              : member.email}
                          </p>
                        </div>
                        {member.role === "admin" && (
                          <span className="text-xs px-2 py-1 bg-accent-lime/20 text-accent-lime rounded">
                            Admin
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleLeaveGroup}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium transition-colors"
                >
                  <FiLogOut className="text-lg" />
                  Leave Group
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
