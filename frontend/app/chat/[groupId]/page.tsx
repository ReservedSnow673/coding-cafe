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
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!activeGroup) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Group not found</p>
          <button
            onClick={() => router.push("/chat")}
            className="btn-primary px-6 py-3 font-semibold"
          >
            Back to Groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white dark:bg-black flex flex-col">
      {/* Header */}
      <div className="bg-light-card dark:bg-dark-card/30 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => router.push("/chat")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors"
            >
              <FiArrowLeft className="text-xl text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-black dark:text-white">{activeGroup.name}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {activeGroup.member_count} members
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors"
          >
            <FiInfo className="text-xl text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-custom">
            <div className="max-w-4xl mx-auto space-y-6">
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-card">
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {Object.entries(groupedMessages).map(([date, msgs]) => (
                <div key={date}>
                  {/* Date Divider */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800"></div>
                    <span className="text-xs text-gray-500 dark:text-gray-500 font-medium">{date}</span>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800"></div>
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
                                ? "bg-primary text-white"
                                : "bg-gray-100 dark:bg-dark-card"
                            } rounded-2xl px-4 py-3 shadow-sm`}
                          >
                            {!isOwnMessage && (
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-primary dark:text-secondary">
                                  {message.user_name}
                                </span>
                                {message.user_year && message.user_branch && (
                                  <span className="text-xs text-gray-500 dark:text-gray-500">
                                    {message.user_branch} Y{message.user_year}
                                  </span>
                                )}
                              </div>
                            )}
                            <p className={`text-sm break-words ${isOwnMessage ? "text-white" : "text-black dark:text-white"}`}>
                              {message.content}
                            </p>
                            <p
                              className={`text-xs mt-1 ${
                                isOwnMessage ? "text-white/70" : "text-gray-500 dark:text-gray-500"
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
                  <p className="text-gray-500 dark:text-gray-500">No messages yet. Start the conversation!</p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-4 bg-light-card dark:bg-dark-card/30">
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
                    className="input-field resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending || !messageText.trim()}
                  className="btn-primary p-4"
                >
                  <FiSend className="text-xl" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Info Sidebar (Desktop) */}
        {showInfo && (
          <div className="hidden lg:block w-80 border-l border-gray-200 dark:border-gray-800 bg-light-card dark:bg-dark-card/30 overflow-y-auto scrollbar-custom">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-black dark:text-white">Group Info</h2>
                <button
                  onClick={() => setShowInfo(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors"
                >
                  <FiX className="text-xl text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Group Description */}
              {activeGroup.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Description</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{activeGroup.description}</p>
                </div>
              )}

              {/* Members List */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                  Members ({activeGroup.members.length})
                </h3>
                <div className="space-y-2">
                  {activeGroup.members.map((member) => (
                    <div
                      key={member.user_id}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-hover rounded-lg"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-secondary/10 flex items-center justify-center">
                        <span className="text-primary dark:text-secondary font-semibold text-sm">
                          {member.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-black dark:text-white truncate">
                          {member.full_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {member.branch && member.year
                            ? `${member.branch} Year ${member.year}`
                            : member.email}
                        </p>
                      </div>
                      {member.role === "admin" && (
                        <span className="text-xs px-2 py-1 bg-primary/20 dark:bg-secondary/20 text-primary dark:text-secondary rounded">
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
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-button font-medium transition-colors"
              >
                <FiLogOut className="text-lg" />
                Leave Group
              </button>
            </div>
          </div>
        )}

        {/* Info Modal (Mobile) */}
        {showInfo && (
          <div className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end animate-fade-in">
            <div className="bg-white dark:bg-dark-card border-t border-gray-200 dark:border-gray-800 rounded-t-3xl w-full max-h-[80vh] overflow-y-auto scrollbar-custom animate-slide-up">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-black dark:text-white">Group Info</h2>
                  <button
                    onClick={() => setShowInfo(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors"
                  >
                    <FiX className="text-xl text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                {activeGroup.description && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Description</h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{activeGroup.description}</p>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                    Members ({activeGroup.members.length})
                  </h3>
                  <div className="space-y-2">
                    {activeGroup.members.map((member) => (
                      <div
                        key={member.user_id}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-hover rounded-lg"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-secondary/10 flex items-center justify-center">
                          <span className="text-primary dark:text-secondary font-semibold text-sm">
                            {member.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-black dark:text-white truncate">
                            {member.full_name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {member.branch && member.year
                              ? `${member.branch} Year ${member.year}`
                              : member.email}
                          </p>
                        </div>
                        {member.role === "admin" && (
                          <span className="text-xs px-2 py-1 bg-primary/20 dark:bg-secondary/20 text-primary dark:text-secondary rounded">
                            Admin
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleLeaveGroup}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-button font-medium transition-colors"
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
