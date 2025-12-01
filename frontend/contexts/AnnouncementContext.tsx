"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { DEV_MODE, mockDelay } from "@/lib/devMode";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Types
export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  author_id: string;
  author_name: string;
  target_year: number | null;
  target_branch: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AnnouncementContextType {
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
  fetchAnnouncements: (category?: string) => Promise<void>;
  getAnnouncementById: (id: string) => Promise<Announcement | null>;
  createAnnouncement: (data: {
    title: string;
    content: string;
    category: string;
    priority: string;
    target_year: number | null;
    target_branch: string | null;
  }) => Promise<Announcement | null>;
  updateAnnouncement: (id: string, data: Partial<Announcement>) => Promise<boolean>;
  deleteAnnouncement: (id: string) => Promise<boolean>;
}

const AnnouncementContext = createContext<AnnouncementContextType | undefined>(undefined);

export const AnnouncementProvider = ({ children }: { children: ReactNode }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch announcements
  const fetchAnnouncements = async (category?: string) => {
    if (DEV_MODE.useMockData) {
      await mockDelay();
      const mockAnnouncements = JSON.parse(localStorage.getItem("mock_announcements") || "[]");
      
      if (mockAnnouncements.length === 0) {
        // Initialize with sample announcements
        const sampleAnnouncements: Announcement[] = [
          {
            id: "ann-1",
            title: "Mid-term Exams Schedule Released",
            content: "The mid-term examinations will be held from November 20-25, 2025. Please check the detailed schedule on the academic portal. All students must report 15 minutes before the exam time.",
            category: "academic",
            priority: "high",
            author_id: "admin-1",
            author_name: "Academic Office",
            target_year: null,
            target_branch: null,
            is_active: true,
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "ann-2",
            title: "Tech Fest Registration Open",
            content: "TechFest 2025 registration is now open! Register your team for various competitions including hackathon, robotics, and design challenges. Last date: Nov 15.",
            category: "event",
            priority: "normal",
            author_id: "admin-2",
            author_name: "Tech Club",
            target_year: null,
            target_branch: null,
            is_active: true,
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "ann-3",
            title: "Hostel Timings Update",
            content: "Due to upcoming exams, hostel entry timings are extended till 11 PM for the next two weeks. Please cooperate with security staff.",
            category: "hostel",
            priority: "normal",
            author_id: "admin-3",
            author_name: "Hostel Administration",
            target_year: null,
            target_branch: null,
            is_active: true,
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "ann-4",
            title: "Placement Drive - Amazon",
            content: "Amazon is visiting campus for placement on Nov 18. Eligible students (CSE, ECE) should register on the placement portal by Nov 12.",
            category: "placement",
            priority: "high",
            author_id: "admin-4",
            author_name: "Placement Cell",
            target_year: 4,
            target_branch: "CSE",
            is_active: true,
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ];
        localStorage.setItem("mock_announcements", JSON.stringify(sampleAnnouncements));
        setAnnouncements(category ? sampleAnnouncements.filter(a => a.category === category) : sampleAnnouncements);
      } else {
        setAnnouncements(category ? mockAnnouncements.filter((a: Announcement) => a.category === category) : mockAnnouncements);
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("access_token");
      const url = category
        ? `${API_URL}/announcements?category=${category}`
        : `${API_URL}/announcements`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch announcements");

      const data = await response.json();
      setAnnouncements(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  // Get announcement by ID
  const getAnnouncementById = async (id: string): Promise<Announcement | null> => {
    if (DEV_MODE.useMockData) {
      await mockDelay();
      const mockAnnouncements: Announcement[] = JSON.parse(
        localStorage.getItem("mock_announcements") || "[]"
      );
      return mockAnnouncements.find((a) => a.id === id) || null;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch announcement");

      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching announcement:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create announcement (admin only)
  const createAnnouncement = async (data: {
    title: string;
    content: string;
    category: string;
    priority: string;
    target_year: number | null;
    target_branch: string | null;
  }): Promise<Announcement | null> => {
    if (DEV_MODE.useMockData) {
      await mockDelay();
      const newAnnouncement: Announcement = {
        id: `ann-${Date.now()}`,
        ...data,
        author_id: DEV_MODE.mockUser.id,
        author_name: DEV_MODE.mockUser.full_name,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockAnnouncements = JSON.parse(localStorage.getItem("mock_announcements") || "[]");
      mockAnnouncements.unshift(newAnnouncement);
      localStorage.setItem("mock_announcements", JSON.stringify(mockAnnouncements));
      setAnnouncements(mockAnnouncements);
      return newAnnouncement;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/announcements/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to create announcement");

      const newAnnouncement = await response.json();
      setAnnouncements((prev) => [newAnnouncement, ...prev]);
      return newAnnouncement;
    } catch (err: any) {
      setError(err.message);
      console.error("Error creating announcement:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update announcement (admin only)
  const updateAnnouncement = async (
    id: string,
    data: Partial<Announcement>
  ): Promise<boolean> => {
    if (DEV_MODE.useMockData) {
      await mockDelay();
      const mockAnnouncements: Announcement[] = JSON.parse(
        localStorage.getItem("mock_announcements") || "[]"
      );
      const index = mockAnnouncements.findIndex((a) => a.id === id);
      if (index !== -1) {
        mockAnnouncements[index] = {
          ...mockAnnouncements[index],
          ...data,
          updated_at: new Date().toISOString(),
        };
        localStorage.setItem("mock_announcements", JSON.stringify(mockAnnouncements));
        setAnnouncements(mockAnnouncements);
        return true;
      }
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/announcements/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update announcement");

      const updated = await response.json();
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? updated : a))
      );
      return true;
    } catch (err: any) {
      setError(err.message);
      console.error("Error updating announcement:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete announcement (admin only)
  const deleteAnnouncement = async (id: string): Promise<boolean> => {
    if (DEV_MODE.useMockData) {
      await mockDelay();
      const mockAnnouncements: Announcement[] = JSON.parse(
        localStorage.getItem("mock_announcements") || "[]"
      );
      const filtered = mockAnnouncements.filter((a) => a.id !== id);
      localStorage.setItem("mock_announcements", JSON.stringify(filtered));
      setAnnouncements(filtered);
      return true;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/announcements/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete announcement");

      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message);
      console.error("Error deleting announcement:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnnouncementContext.Provider
      value={{
        announcements,
        loading,
        error,
        fetchAnnouncements,
        getAnnouncementById,
        createAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
      }}
    >
      {children}
    </AnnouncementContext.Provider>
  );
};

export const useAnnouncements = () => {
  const context = useContext(AnnouncementContext);
  if (!context) {
    throw new Error("useAnnouncements must be used within an AnnouncementProvider");
  }
  return context;
};
