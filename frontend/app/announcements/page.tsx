"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAnnouncements, useAuth } from "@/contexts";
import { formatRelativeTime, getPriorityColor } from "@/lib/utils";
import {
  FiMic,
  FiPlus,
  FiAlertCircle,
  FiCalendar,
  FiUser,
  FiFilter,
  FiX,
} from "react-icons/fi";

const CATEGORIES = [
  { value: "", label: "All Categories", icon: FiMic },
  { value: "general", label: "General", icon: FiMic },
  { value: "academic", label: "Academic", icon: FiCalendar },
  { value: "event", label: "Events", icon: FiCalendar },
  { value: "emergency", label: "Emergency", icon: FiAlertCircle },
  { value: "hostel", label: "Hostel", icon: FiUser },
  { value: "placement", label: "Placement", icon: FiUser },
  { value: "club", label: "Clubs", icon: FiUser },
];

const PRIORITIES = [
  { value: "low", label: "Low", color: "text-gray-400" },
  { value: "normal", label: "Normal", color: "text-blue-400" },
  { value: "high", label: "High", color: "text-orange-400" },
  { value: "urgent", label: "Urgent", color: "text-red-400" },
];

export default function AnnouncementsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { announcements, loading, error, fetchAnnouncements, createAnnouncement } =
    useAnnouncements();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("normal");
  const [targetYear, setTargetYear] = useState<number | null>(null);
  const [targetBranch, setTargetBranch] = useState<string | null>(null);

  useEffect(() => {
    fetchAnnouncements(selectedCategory);
  }, [selectedCategory]);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setCreating(true);
    const newAnnouncement = await createAnnouncement({
      title,
      content,
      category,
      priority,
      target_year: targetYear,
      target_branch: targetBranch,
    });
    setCreating(false);

    if (newAnnouncement) {
      setTitle("");
      setContent("");
      setCategory("general");
      setPriority("normal");
      setTargetYear(null);
      setTargetBranch(null);
      setShowCreateModal(false);
    }
  };

  const formatTime = formatRelativeTime;

  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-dark-secondary flex items-center justify-center">
              <FiMic className="text-2xl text-accent-lime" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Announcements
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {announcements.length} {announcements.length === 1 ? "announcement" : "announcements"}
              </p>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-accent-lime hover:bg-accent-lime/90 text-dark rounded-xl font-semibold transition-all"
            >
              <FiPlus className="text-lg" />
              New Announcement
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.value
                  ? "bg-accent-lime text-dark"
                  : "bg-dark-secondary/50 text-gray-400 hover:bg-dark-secondary"
              }`}
            >
              <cat.icon className="text-lg" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && announcements.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-lime"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && announcements.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="p-6 bg-dark-secondary/50 rounded-full mb-6">
              <FiMic className="text-6xl text-gray-600" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">No announcements</h2>
            <p className="text-gray-400 mb-6 text-center max-w-md">
              {selectedCategory ? "No announcements in this category yet" : "No announcements posted yet"}
            </p>
          </div>
        )}

        {/* Announcements List */}
        {announcements.length > 0 && (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                onClick={() => router.push(`/announcements/${announcement.id}`)}
                className="group cursor-pointer bg-dark-secondary/50 backdrop-blur-xl border border-dark-secondary rounded-2xl p-6 hover:border-accent-lime/30 hover:bg-dark-secondary transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`text-xs font-semibold uppercase px-2 py-1 rounded ${getPriorityColor(
                          announcement.priority
                        )} bg-dark-secondary`}
                      >
                        {announcement.priority}
                      </span>
                      <span className="text-xs text-gray-500 uppercase px-2 py-1 rounded bg-dark-secondary">
                        {announcement.category}
                      </span>
                      {announcement.target_year && (
                        <span className="text-xs text-accent-lime px-2 py-1 rounded bg-accent-lime/10">
                          Year {announcement.target_year}
                        </span>
                      )}
                      {announcement.target_branch && (
                        <span className="text-xs text-accent-lime px-2 py-1 rounded bg-accent-lime/10">
                          {announcement.target_branch}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-white group-hover:text-accent-lime transition-colors mb-2">
                      {announcement.title}
                    </h3>
                    <p className="text-gray-400 line-clamp-2 mb-3">{announcement.content}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <FiUser className="text-base" />
                    <span>{announcement.author_name}</span>
                  </div>
                  <span className="text-gray-500">{formatTimestamp(announcement.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Announcement Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-dark-secondary border border-dark-secondary rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Create Announcement</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-dark rounded-lg transition-colors"
                >
                  <FiX className="text-xl text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Announcement title"
                    required
                    maxLength={255}
                    className="w-full px-4 py-3 bg-dark border border-dark-secondary rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent-lime transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Announcement details..."
                    required
                    maxLength={5000}
                    rows={6}
                    className="w-full px-4 py-3 bg-dark border border-dark-secondary rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent-lime transition-colors resize-none"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-100 focus:outline-none focus:border-purple-500 transition-colors"
                    >
                      {CATEGORIES.filter((c) => c.value).map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Priority *
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-100 focus:outline-none focus:border-purple-500 transition-colors"
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Target Year (optional)
                    </label>
                    <select
                      value={targetYear || ""}
                      onChange={(e) =>
                        setTargetYear(e.target.value ? parseInt(e.target.value) : null)
                      }
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-100 focus:outline-none focus:border-purple-500 transition-colors"
                    >
                      <option value="">All Years</option>
                      <option value="1">Year 1</option>
                      <option value="2">Year 2</option>
                      <option value="3">Year 3</option>
                      <option value="4">Year 4</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Target Branch (optional)
                    </label>
                    <input
                      type="text"
                      value={targetBranch || ""}
                      onChange={(e) => setTargetBranch(e.target.value || null)}
                      placeholder="e.g., CSE, ECE"
                      maxLength={50}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
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
                    disabled={creating || !title.trim() || !content.trim()}
                    className="flex-1 px-4 py-3 bg-accent-lime hover:bg-accent-lime/90 text-dark rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? "Creating..." : "Create Announcement"}
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
