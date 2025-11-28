"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@/contexts";
import { formatRelativeTime } from "@/lib/utils";
import { FiMessageCircle, FiUsers, FiPlus, FiClock, FiX } from "react-icons/fi";

export default function ChatPage() {
  const router = useRouter();
  const { groups, loading, error, fetchGroups, createGroup } = useChat();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    setCreating(true);
    const newGroup = await createGroup(groupName, groupDescription, []);
    setCreating(false);

    if (newGroup) {
      setGroupName("");
      setGroupDescription("");
      setShowCreateModal(false);
      router.push(`/chat/${newGroup.id}`);
    }
  };

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return "";
    return formatRelativeTime(timestamp);
  };

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-dark-secondary flex items-center justify-center">
              <FiMessageCircle className="text-2xl text-accent-lime" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Group Chats
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {groups.length} {groups.length === 1 ? "group" : "groups"}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-accent-lime hover:bg-accent-lime/90 text-dark rounded-xl font-semibold transition-all"
          >
            <FiPlus className="text-lg" />
            New Group
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && groups.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-lime"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && groups.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="p-6 bg-dark-secondary/50 rounded-full mb-6">
              <FiMessageCircle className="text-6xl text-gray-600" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">No groups yet</h2>
            <p className="text-gray-400 mb-6 text-center max-w-md">
              Create your first group chat to start collaborating with your classmates
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-accent-lime hover:bg-accent-lime/90 text-dark rounded-xl font-semibold transition-all"
            >
              <FiPlus className="text-lg" />
              Create Group
            </button>
          </div>
        )}

        {/* Groups Grid */}
        {groups.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <div
                key={group.id}
                onClick={() => router.push(`/chat/${group.id}`)}
                className="group cursor-pointer bg-dark-secondary/50 backdrop-blur-xl border border-dark-secondary rounded-2xl p-6 hover:border-accent-lime/30 hover:bg-dark-secondary transition-all"
              >
                {/* Group Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white group-hover:text-accent-lime transition-colors line-clamp-1">
                      {group.name}
                    </h3>
                    {group.description && (
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                        {group.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Member Count */}
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                  <FiUsers className="text-base" />
                  <span>{group.member_count} members</span>
                </div>

                {/* Last Message Preview */}
                {group.last_message && (
                  <div className="bg-dark-secondary rounded-lg p-3 mb-3">
                    <p className="text-sm text-gray-300 line-clamp-2">
                      {group.last_message}
                    </p>
                  </div>
                )}

                {/* Timestamp */}
                {group.last_message_at && (
                  <div className="flex items-center gap-2 text-gray-500 text-xs">
                    <FiClock className="text-sm" />
                    <span>{formatTimestamp(group.last_message_at)}</span>
                  </div>
                )}

                {group.last_message === null && (
                  <p className="text-sm text-gray-500 italic">No messages yet</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Create Group Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-dark-secondary border border-dark-secondary rounded-2xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Create Group</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-dark rounded-lg transition-colors"
                >
                  <FiX className="text-xl text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="e.g., CSE Year 2"
                    required
                    maxLength={255}
                    className="w-full px-4 py-3 bg-dark border border-dark-secondary rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent-lime transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    placeholder="What's this group about?"
                    maxLength={1000}
                    rows={3}
                    className="w-full px-4 py-3 bg-dark border border-dark-secondary rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent-lime transition-colors resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-3 bg-dark-secondary/50 hover:bg-dark-secondary rounded-xl font-medium text-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !groupName.trim()}
                    className="flex-1 px-4 py-3 bg-accent-lime hover:bg-accent-lime/90 text-dark rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? "Creating..." : "Create Group"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
