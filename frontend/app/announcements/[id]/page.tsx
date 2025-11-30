"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAnnouncements, useAuth } from "@/contexts";
import type { Announcement } from "@/contexts/AnnouncementContext";
import { formatDate, getPriorityColor } from "@/lib/utils";
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Announcement not found</p>
          <button
            onClick={() => router.push("/announcements")}
            className="btn-primary px-6 py-3"
          >
            Back to Announcements
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-white dark:bg-black px-4 py-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-slide-up">
          <button
            onClick={() => router.push("/announcements")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-card hover:bg-gray-200 dark:hover:bg-dark-hover rounded-button transition-colors text-gray-700 dark:text-gray-300"
          >
            <FiArrowLeft className="text-lg" />
            Back
          </button>

          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-button transition-colors"
              >
                <FiTrash2 className="text-lg" />
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Announcement Card */}
        <div className="card p-8">
          {/* Priority and Category */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span
              className={`text-xs font-semibold uppercase px-3 py-1.5 rounded ${getPriorityColor(
                announcement.priority
              )} bg-gray-100 dark:bg-dark-card`}
            >
              {announcement.priority}
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400 uppercase px-3 py-1.5 rounded bg-gray-100 dark:bg-dark-card">
              {announcement.category}
            </span>
            {announcement.target_year && (
              <span className="text-xs text-primary dark:text-secondary px-3 py-1.5 rounded bg-primary/10 dark:bg-secondary/10">
                Year {announcement.target_year}
              </span>
            )}
            {announcement.target_branch && (
              <span className="text-xs text-primary dark:text-secondary px-3 py-1.5 rounded bg-primary/10 dark:bg-secondary/10">
                {announcement.target_branch}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-6">
            {announcement.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 mb-8 pb-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <FiUser className="text-lg" />
              <span>{announcement.author_name}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <FiCalendar className="text-lg" />
              <span>{formatDate(announcement.created_at)}</span>
            </div>
          </div>

          {/* Content */}
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
              {announcement.content}
            </p>
          </div>

          {/* Updated Info */}
          {announcement.updated_at !== announcement.created_at && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Last updated: {formatDate(announcement.updated_at)}
              </p>
            </div>
          )}
        </div>

        {/* Action Hints for Students */}
        {!isAdmin && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-card">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="text-blue-600 dark:text-blue-400 text-xl mt-0.5" />
              <div>
                <p className="text-blue-600 dark:text-blue-400 font-medium mb-1">Important</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
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
