"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { DEV_MODE, mockDelay } from "@/lib/devMode";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Types
export interface ChatGroup {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  member_count: number;
  last_message: string | null;
  last_message_at: string | null;
}

export interface ChatMember {
  user_id: string;
  full_name: string;
  email: string;
  year: number | null;
  branch: string | null;
  role: "admin" | "member";
  joined_at: string;
}

export interface ChatGroupDetail extends ChatGroup {
  members: ChatMember[];
}

export interface ChatMessage {
  id: string;
  group_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name: string;
  user_year: number | null;
  user_branch: string | null;
}

interface ChatContextType {
  groups: ChatGroup[];
  activeGroup: ChatGroupDetail | null;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  fetchGroups: () => Promise<void>;
  fetchGroupDetail: (groupId: string) => Promise<void>;
  fetchMessages: (groupId: string, before?: string) => Promise<void>;
  createGroup: (name: string, description: string, memberIds: string[]) => Promise<ChatGroup | null>;
  sendMessage: (groupId: string, content: string) => Promise<ChatMessage | null>;
  addMembers: (groupId: string, userIds: string[]) => Promise<boolean>;
  leaveGroup: (groupId: string) => Promise<boolean>;
  clearActiveGroup: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [activeGroup, setActiveGroup] = useState<ChatGroupDetail | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's groups
  const fetchGroups = async () => {
    if (DEV_MODE.useMockData) {
      await mockDelay();
      const mockGroups = JSON.parse(localStorage.getItem("mock_groups") || "[]");
      if (mockGroups.length === 0) {
        // Initialize with sample groups
        const sampleGroups: ChatGroup[] = [
          {
            id: "group-1",
            name: "CSE Year 2",
            description: "Computer Science 2nd year students",
            created_by: DEV_MODE.mockUser.id,
            is_active: true,
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
            member_count: 12,
            last_message: "See you all at the library!",
            last_message_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          },
          {
            id: "group-2",
            name: "Project Team Alpha",
            description: "Software Engineering project team",
            created_by: "user-123",
            is_active: true,
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            member_count: 4,
            last_message: "Updated the code, check GitHub",
            last_message_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
        ];
        localStorage.setItem("mock_groups", JSON.stringify(sampleGroups));
        setGroups(sampleGroups);
      } else {
        setGroups(mockGroups);
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/chat/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch groups");

      const data = await response.json();
      setGroups(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching groups:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch group details
  const fetchGroupDetail = async (groupId: string) => {
    if (DEV_MODE.useMockData) {
      await mockDelay();
      const mockGroups: ChatGroup[] = JSON.parse(localStorage.getItem("mock_groups") || "[]");
      const group = mockGroups.find((g) => g.id === groupId);
      
      if (group) {
        const mockMembers: ChatMember[] = [
          {
            user_id: DEV_MODE.mockUser.id,
            full_name: DEV_MODE.mockUser.full_name,
            email: DEV_MODE.mockUser.email,
            year: DEV_MODE.mockUser.year,
            branch: DEV_MODE.mockUser.branch,
            role: "admin",
            joined_at: group.created_at,
          },
          {
            user_id: "user-456",
            full_name: "Alice Johnson",
            email: "alice@plaksha.edu.in",
            year: 2,
            branch: "CSE",
            role: "member",
            joined_at: group.created_at,
          },
          {
            user_id: "user-789",
            full_name: "Bob Smith",
            email: "bob@plaksha.edu.in",
            year: 2,
            branch: "ECE",
            role: "member",
            joined_at: group.created_at,
          },
        ];

        setActiveGroup({ ...group, members: mockMembers });
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/chat/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch group details");

      const data = await response.json();
      setActiveGroup(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching group detail:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages
  const fetchMessages = async (groupId: string, before?: string) => {
    if (DEV_MODE.useMockData) {
      await mockDelay();
      const mockMessages = JSON.parse(localStorage.getItem(`mock_messages_${groupId}`) || "[]");
      
      if (mockMessages.length === 0) {
        // Initialize with sample messages
        const sampleMessages: ChatMessage[] = [
          {
            id: "msg-1",
            group_id: groupId,
            user_id: "user-456",
            content: "Hey everyone! How's the project going?",
            created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            user_name: "Alice Johnson",
            user_year: 2,
            user_branch: "CSE",
          },
          {
            id: "msg-2",
            group_id: groupId,
            user_id: DEV_MODE.mockUser.id,
            content: "Going well! Just finished the backend API.",
            created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
            user_name: DEV_MODE.mockUser.full_name,
            user_year: DEV_MODE.mockUser.year,
            user_branch: DEV_MODE.mockUser.branch,
          },
          {
            id: "msg-3",
            group_id: groupId,
            user_id: "user-789",
            content: "Awesome! I'll start on the frontend today.",
            created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            user_name: "Bob Smith",
            user_year: 2,
            user_branch: "ECE",
          },
        ];
        localStorage.setItem(`mock_messages_${groupId}`, JSON.stringify(sampleMessages));
        setMessages(sampleMessages);
      } else {
        setMessages(mockMessages);
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("access_token");
      const url = new URL(`${API_URL}/chat/groups/${groupId}/messages`);
      if (before) url.searchParams.set("before", before);

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch messages");

      const data = await response.json();
      setMessages(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create group
  const createGroup = async (
    name: string,
    description: string,
    memberIds: string[]
  ): Promise<ChatGroup | null> => {
    if (DEV_MODE.useMockData) {
      await mockDelay();
      const newGroup: ChatGroup = {
        id: `group-${Date.now()}`,
        name,
        description,
        created_by: DEV_MODE.mockUser.id,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        member_count: memberIds.length + 1,
        last_message: null,
        last_message_at: null,
      };

      const mockGroups = JSON.parse(localStorage.getItem("mock_groups") || "[]");
      mockGroups.push(newGroup);
      localStorage.setItem("mock_groups", JSON.stringify(mockGroups));
      setGroups(mockGroups);
      return newGroup;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/chat/groups`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description, member_ids: memberIds }),
      });

      if (!response.ok) throw new Error("Failed to create group");

      const data = await response.json();
      setGroups((prev) => [...prev, data]);
      return data;
    } catch (err: any) {
      setError(err.message);
      console.error("Error creating group:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const sendMessage = async (groupId: string, content: string): Promise<ChatMessage | null> => {
    if (DEV_MODE.useMockData) {
      await mockDelay();
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        group_id: groupId,
        user_id: DEV_MODE.mockUser.id,
        content,
        created_at: new Date().toISOString(),
        user_name: DEV_MODE.mockUser.full_name,
        user_year: DEV_MODE.mockUser.year,
        user_branch: DEV_MODE.mockUser.branch,
      };

      const mockMessages = JSON.parse(localStorage.getItem(`mock_messages_${groupId}`) || "[]");
      mockMessages.push(newMessage);
      localStorage.setItem(`mock_messages_${groupId}`, JSON.stringify(mockMessages));
      setMessages(mockMessages);

      // Update group's last message
      const mockGroups: ChatGroup[] = JSON.parse(localStorage.getItem("mock_groups") || "[]");
      const updatedGroups = mockGroups.map((g) =>
        g.id === groupId
          ? { ...g, last_message: content, last_message_at: newMessage.created_at, updated_at: newMessage.created_at }
          : g
      );
      localStorage.setItem("mock_groups", JSON.stringify(updatedGroups));
      setGroups(updatedGroups);

      return newMessage;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/chat/groups/${groupId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json();
      setMessages((prev) => [...prev, data]);
      return data;
    } catch (err: any) {
      setError(err.message);
      console.error("Error sending message:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Add members
  const addMembers = async (groupId: string, userIds: string[]): Promise<boolean> => {
    if (DEV_MODE.useMockData) {
      await mockDelay();
      // In mock mode, just return success
      return true;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/chat/groups/${groupId}/members`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_ids: userIds }),
      });

      if (!response.ok) throw new Error("Failed to add members");

      return true;
    } catch (err: any) {
      setError(err.message);
      console.error("Error adding members:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Leave group
  const leaveGroup = async (groupId: string): Promise<boolean> => {
    if (DEV_MODE.useMockData) {
      await mockDelay();
      const mockGroups: ChatGroup[] = JSON.parse(localStorage.getItem("mock_groups") || "[]");
      const updatedGroups = mockGroups.filter((g) => g.id !== groupId);
      localStorage.setItem("mock_groups", JSON.stringify(updatedGroups));
      setGroups(updatedGroups);
      
      // Clear messages for this group
      localStorage.removeItem(`mock_messages_${groupId}`);
      
      if (activeGroup?.id === groupId) {
        setActiveGroup(null);
        setMessages([]);
      }
      
      return true;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/chat/groups/${groupId}/leave`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to leave group");

      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      if (activeGroup?.id === groupId) {
        setActiveGroup(null);
        setMessages([]);
      }

      return true;
    } catch (err: any) {
      setError(err.message);
      console.error("Error leaving group:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Clear active group
  const clearActiveGroup = () => {
    setActiveGroup(null);
    setMessages([]);
  };

  return (
    <ChatContext.Provider
      value={{
        groups,
        activeGroup,
        messages,
        loading,
        error,
        fetchGroups,
        fetchGroupDetail,
        fetchMessages,
        createGroup,
        sendMessage,
        addMembers,
        leaveGroup,
        clearActiveGroup,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
