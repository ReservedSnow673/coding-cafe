"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type MealType = "breakfast" | "lunch" | "snack" | "dinner";

export interface MessReview {
  id: string;
  user_id: string;
  user_name: string;
  meal_type: MealType;
  rating: number; // 1-5
  review_text?: string;
  taste_rating?: number;
  quantity_rating?: number;
  hygiene_rating?: number;
  variety_rating?: number;
  meal_date: string; // ISO date string
  created_at: string;
  updated_at?: string;
}

export interface DailyAverage {
  date: string;
  meal_type: MealType;
  average_rating: number;
  review_count: number;
  avg_taste?: number;
  avg_quantity?: number;
  avg_hygiene?: number;
  avg_variety?: number;
}

interface MessReviewContextType {
  reviews: MessReview[];
  dailyAverages: DailyAverage[];
  addReview: (review: Omit<MessReview, "id" | "user_id" | "user_name" | "created_at">) => void;
  updateReview: (id: string, updates: Partial<MessReview>) => void;
  deleteReview: (id: string) => void;
  getReviewsByMealType: (mealType: MealType) => MessReview[];
  getReviewsByDate: (date: string) => MessReview[];
  getTodayReviews: () => MessReview[];
  getUserReviews: (userId: string) => MessReview[];
  hasUserReviewedToday: (userId: string, mealType: MealType) => boolean;
  getAverageRating: (mealType?: MealType, date?: string) => number;
}

const MessReviewContext = createContext<MessReviewContextType | undefined>(undefined);

// Mock data for development mode
const mockReviews: MessReview[] = [
  {
    id: "1",
    user_id: "user1",
    user_name: "Rahul Kumar",
    meal_type: "breakfast",
    rating: 4,
    review_text: "Great aloo paratha today! Fresh and hot.",
    taste_rating: 5,
    quantity_rating: 4,
    hygiene_rating: 4,
    variety_rating: 3,
    meal_date: new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    user_id: "user2",
    user_name: "Priya Singh",
    meal_type: "breakfast",
    rating: 3,
    review_text: "Poha was okay, could use more spices.",
    taste_rating: 3,
    quantity_rating: 4,
    hygiene_rating: 4,
    variety_rating: 3,
    meal_date: new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    user_id: "user3",
    user_name: "Arjun Patel",
    meal_type: "lunch",
    rating: 5,
    review_text: "Excellent dal makhani and jeera rice combo!",
    taste_rating: 5,
    quantity_rating: 5,
    hygiene_rating: 5,
    variety_rating: 4,
    meal_date: new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    user_id: "user1",
    user_name: "Rahul Kumar",
    meal_type: "lunch",
    rating: 4,
    review_text: "Good variety today. Paneer sabzi was delicious.",
    taste_rating: 4,
    quantity_rating: 4,
    hygiene_rating: 5,
    variety_rating: 5,
    meal_date: new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString(),
  },
  {
    id: "5",
    user_id: "user4",
    user_name: "Ananya Reddy",
    meal_type: "snack",
    rating: 4,
    review_text: "Samosas were crispy and fresh!",
    taste_rating: 5,
    quantity_rating: 3,
    hygiene_rating: 4,
    variety_rating: 3,
    meal_date: new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString(),
  },
  {
    id: "6",
    user_id: "user5",
    user_name: "Vikram Sharma",
    meal_type: "dinner",
    rating: 3,
    review_text: "Roti was a bit hard. Dal was good though.",
    taste_rating: 3,
    quantity_rating: 4,
    hygiene_rating: 4,
    variety_rating: 3,
    meal_date: new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString(),
  },
  // Yesterday's reviews
  {
    id: "7",
    user_id: "user2",
    user_name: "Priya Singh",
    meal_type: "breakfast",
    rating: 4,
    review_text: "Idli sambhar was excellent!",
    taste_rating: 4,
    quantity_rating: 4,
    hygiene_rating: 5,
    variety_rating: 4,
    meal_date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "8",
    user_id: "user3",
    user_name: "Arjun Patel",
    meal_type: "lunch",
    rating: 3,
    review_text: "Average meal. Could be better.",
    taste_rating: 3,
    quantity_rating: 3,
    hygiene_rating: 4,
    variety_rating: 2,
    meal_date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "9",
    user_id: "user4",
    user_name: "Ananya Reddy",
    meal_type: "dinner",
    rating: 5,
    review_text: "Amazing chicken curry! Best meal this week.",
    taste_rating: 5,
    quantity_rating: 5,
    hygiene_rating: 5,
    variety_rating: 5,
    meal_date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  // Two days ago
  {
    id: "10",
    user_id: "user1",
    user_name: "Rahul Kumar",
    meal_type: "breakfast",
    rating: 3,
    review_text: "Upma needs more flavor.",
    taste_rating: 2,
    quantity_rating: 4,
    hygiene_rating: 4,
    variety_rating: 3,
    meal_date: new Date(Date.now() - 172800000).toISOString().split("T")[0],
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "11",
    user_id: "user5",
    user_name: "Vikram Sharma",
    meal_type: "lunch",
    rating: 4,
    review_text: "Chole bhature was fantastic!",
    taste_rating: 5,
    quantity_rating: 4,
    hygiene_rating: 4,
    variety_rating: 4,
    meal_date: new Date(Date.now() - 172800000).toISOString().split("T")[0],
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "12",
    user_id: "user2",
    user_name: "Priya Singh",
    meal_type: "snack",
    rating: 5,
    review_text: "Pakoras were perfect! Crispy and delicious.",
    taste_rating: 5,
    quantity_rating: 4,
    hygiene_rating: 5,
    variety_rating: 4,
    meal_date: new Date(Date.now() - 172800000).toISOString().split("T")[0],
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "13",
    user_id: "user3",
    user_name: "Arjun Patel",
    meal_type: "dinner",
    rating: 4,
    review_text: "Good biryani, could use more pieces though.",
    taste_rating: 5,
    quantity_rating: 3,
    hygiene_rating: 4,
    variety_rating: 4,
    meal_date: new Date(Date.now() - 172800000).toISOString().split("T")[0],
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  // Three days ago
  {
    id: "14",
    user_id: "user4",
    user_name: "Ananya Reddy",
    meal_type: "breakfast",
    rating: 4,
    review_text: "Masala dosa was good, chutney was excellent!",
    taste_rating: 4,
    quantity_rating: 4,
    hygiene_rating: 5,
    variety_rating: 4,
    meal_date: new Date(Date.now() - 259200000).toISOString().split("T")[0],
    created_at: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: "15",
    user_id: "user5",
    user_name: "Vikram Sharma",
    meal_type: "lunch",
    rating: 2,
    review_text: "Not up to the mark today. Hope it improves.",
    taste_rating: 2,
    quantity_rating: 3,
    hygiene_rating: 3,
    variety_rating: 2,
    meal_date: new Date(Date.now() - 259200000).toISOString().split("T")[0],
    created_at: new Date(Date.now() - 259200000).toISOString(),
  },
];

export const MessReviewProvider = ({ children }: { children: ReactNode }) => {
  const [reviews, setReviews] = useState<MessReview[]>([]);
  const [dailyAverages] = useState<DailyAverage[]>([]);

  const addReview = (newReview: Omit<MessReview, "id" | "user_id" | "user_name" | "created_at">) => {
    const review: MessReview = {
      ...newReview,
      id: `review-${Date.now()}`,
      user_id: "current-user",
      user_name: "You",
      created_at: new Date().toISOString(),
    };
    setReviews([review, ...reviews]);
  };

  const updateReview = (id: string, updates: Partial<MessReview>) => {
    setReviews(reviews.map((review) => (review.id === id ? { ...review, ...updates, updated_at: new Date().toISOString() } : review)));
  };

  const deleteReview = (id: string) => {
    setReviews(reviews.filter((review) => review.id !== id));
  };

  const getReviewsByMealType = (mealType: MealType) => {
    return reviews.filter((review) => review.meal_type === mealType);
  };

  const getReviewsByDate = (date: string) => {
    return reviews.filter((review) => review.meal_date === date);
  };

  const getTodayReviews = () => {
    const today = new Date().toISOString().split("T")[0];
    return reviews.filter((review) => review.meal_date === today);
  };

  const getUserReviews = (userId: string) => {
    return reviews.filter((review) => review.user_id === userId);
  };

  const hasUserReviewedToday = (userId: string, mealType: MealType) => {
    const today = new Date().toISOString().split("T")[0];
    return reviews.some((review) => review.user_id === userId && review.meal_type === mealType && review.meal_date === today);
  };

  const getAverageRating = (mealType?: MealType, date?: string) => {
    let filtered = reviews;
    if (mealType) filtered = filtered.filter((r) => r.meal_type === mealType);
    if (date) filtered = filtered.filter((r) => r.meal_date === date);
    
    if (filtered.length === 0) return 0;
    const sum = filtered.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / filtered.length) * 10) / 10;
  };

  return (
    <MessReviewContext.Provider
      value={{
        reviews,
        dailyAverages,
        addReview,
        updateReview,
        deleteReview,
        getReviewsByMealType,
        getReviewsByDate,
        getTodayReviews,
        getUserReviews,
        hasUserReviewedToday,
        getAverageRating,
      }}
    >
      {children}
    </MessReviewContext.Provider>
  );
};

export const useMessReview = () => {
  const context = useContext(MessReviewContext);
  if (!context) {
    throw new Error("useMessReview must be used within a MessReviewProvider");
  }
  return context;
};
