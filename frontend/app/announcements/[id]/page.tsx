"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAnnouncements, useAuth } from "@/contexts";
import type { Announcement } from "@/contexts/AnnouncementContext";
import {
  FiArrowLeft,
  FiEdit,
  FiTrash2,
  FiUser,
  FiCalendar,
  FiAlertCircle,
} from "react-icons/fi";

export default function AnnouncementDetailPage() {
  const router = useRouter();
  const params = useParams();
  const announcementId = params.id as string;
  const { user } = useAuth();
  const { getAnnouncementById, deleteAnnouncement } = useAnnouncements();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnnouncement();
  }, [announcementId]);

  const loadAnnouncement = async () => {
    setLoading(true);
    const data = await getAnnouncementById(announcementId);
    setAnnouncement(data);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    const success = await deleteAnnouncement(announcementId);
    if (success) {
      router.push("/announcements");
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-400 bg-red-500/10";
      case "high":
        return "text-orange-400 bg-orange-500/10";
      case "normal":
        return "text-blue-400 bg-blue-500/10";
      case "low":
        return "text-gray-400 bg-gray-500/10";
      default:
        return "text-gray-400 bg-gray-500/10";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Announcement not found</p>
          <button
            onClick={() => router.push("/announcements")}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl"
          >
            Back to Announcements
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/announcements")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <FiArrowLeft className="text-lg" />
            Back
          </button>

          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
              >
                <FiTrash2 className="text-lg" />
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Announcement Card */}
        <div className="bg-dark-secondary/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-8">
          {/* Priority and Category */}
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`text-xs font-semibold uppercase px-3 py-1.5 rounded ${getPriorityColor(
                announcement.priority
              )}`}
            >
              {announcement.priority}
            </span>
            <span className="text-xs text-gray-400 uppercase px-3 py-1.5 rounded bg-gray-800/50">
              {announcement.category}
            </span>
            {announcement.target_year && (
              <span className="text-xs text-blue-400 px-3 py-1.5 rounded bg-blue-500/10">
                Year {announcement.target_year}
              </span>
            )}
            {announcement.target_branch && (
              <span className="text-xs text-cyan-400 px-3 py-1.5 rounded bg-cyan-500/10">
                {announcement.target_branch}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-100 mb-6">
            {announcement.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 mb-8 pb-6 border-b border-gray-800">
            <div className="flex items-center gap-2 text-gray-400">
              <FiUser className="text-lg" />
              <span>{announcement.author_name}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <FiCalendar className="text-lg" />
              <span>{formatDate(announcement.created_at)}</span>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
              {announcement.content}
            </p>
          </div>

          {/* Updated Info */}
          {announcement.updated_at !== announcement.created_at && (
            <div className="mt-8 pt-6 border-t border-gray-800">
              <p className="text-sm text-gray-500">
                Last updated: {formatDate(announcement.updated_at)}
              </p>
            </div>
          )}
        </div>

        {/* Action Hints for Students */}
        {!isAdmin && (
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="text-blue-400 text-xl mt-0.5" />
              <div>
                <p className="text-blue-400 font-medium mb-1">Important</p>
                <p className="text-gray-400 text-sm">
                  Please make note of this announcement. Contact the author if you have any questions.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
