"use client";

import React, { useState } from "react";
import { useMessReview, MealType } from "@/contexts/MessReviewContext";
import Link from "next/link";
import { FiSun, FiCoffee, FiMoon, FiPlus, FiUser } from "react-icons/fi";
import Navbar from "@/components/Navbar";

const mealTypes: MealType[] = ["breakfast", "lunch", "snack", "dinner"];

const mealTypeIcons: Record<MealType, React.ComponentType<{ className?: string }>> = {
  breakfast: FiSun,
  lunch: FiCoffee,
  snack: FiCoffee,
  dinner: FiMoon,
};

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating ? "text-primary dark:text-secondary" : "text-gray-300 dark:text-gray-700"}>
          ★
        </span>
      ))}
    </div>
  );
};

export default function MessReviewsPage() {
  const { reviews, getReviewsByMealType, getTodayReviews, getAverageRating } = useMessReview();
  const [selectedMealType, setSelectedMealType] = useState<MealType | "all">("all");
  const [selectedDate, setSelectedDate] = useState<string>("today");

  const filteredReviews = (() => {
    if (selectedDate === "today") {
      const todayReviews = getTodayReviews();
      return selectedMealType === "all" ? todayReviews : todayReviews.filter((r) => r.meal_type === selectedMealType);
    }
    
    if (selectedDate === "all") {
      return selectedMealType === "all" ? reviews : getReviewsByMealType(selectedMealType);
    }
    
    const dateFiltered = reviews.filter((r) => r.meal_date === selectedDate);
    return selectedMealType === "all" ? dateFiltered : dateFiltered.filter((r) => r.meal_type === selectedMealType);
  })();

  const todayAverages = {
    overall: getAverageRating(),
    breakfast: getAverageRating("breakfast", new Date().toISOString().split("T")[0]),
    lunch: getAverageRating("lunch", new Date().toISOString().split("T")[0]),
    snack: getAverageRating("snack", new Date().toISOString().split("T")[0]),
    dinner: getAverageRating("dinner", new Date().toISOString().split("T")[0]),
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-black">
      <Navbar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto scrollbar-custom bg-white dark:bg-black animate-fade-in p-6">
          <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-black dark:text-white">Mess Reviews</h1>
              <p className="text-gray-600 dark:text-gray-400">Share your feedback about mess meals</p>
            </div>
            <Link
              href="/mess-reviews/new"
              className="btn-primary px-6 py-3 font-semibold flex items-center gap-2"
            >
              <FiPlus className="w-5 h-5" />
              Write Review
            </Link>
          </div>

          {/* Today's Averages */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="card p-4 text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Overall Today</div>
              <div className="text-3xl font-bold text-primary dark:text-secondary">{todayAverages.overall || "N/A"}</div>
              <StarRating rating={Math.round(todayAverages.overall)} />
            </div>
            {mealTypes.map((meal) => {
              const Icon = mealTypeIcons[meal];
              return (
                <div key={meal} className="card p-4 text-center">
                  <Icon className="w-6 h-6 mx-auto mb-1 text-primary dark:text-secondary" />
                  <div className="text-sm text-gray-600 dark:text-gray-400 capitalize mb-1">{meal}</div>
                  <div className="text-2xl font-bold text-primary dark:text-secondary">{todayAverages[meal] || "N/A"}</div>
                </div>
              );
            })}
          </div>

          {/* Filters */}
          <div className="card p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Meal Type Filter */}
              <div className="flex-1">
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">Meal Type</label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedMealType("all")}
                    className={`px-4 py-2 rounded-button transition-all ${
                      selectedMealType === "all"
                        ? "bg-primary text-white shadow-glow-primary font-semibold"
                        : "bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-hover border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    All
                  </button>
                  {mealTypes.map((meal) => {
                    const Icon = mealTypeIcons[meal];
                    return (
                      <button
                        key={meal}
                        onClick={() => setSelectedMealType(meal)}
                        className={`px-4 py-2 rounded-button transition-all capitalize flex items-center gap-2 ${
                          selectedMealType === meal
                            ? "bg-primary text-white shadow-glow-primary font-semibold"
                            : "bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-hover border border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {meal}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Filter */}
              <div className="flex-1">
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">Date</label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedDate("today")}
                    className={`px-4 py-2 rounded-button transition-all ${
                      selectedDate === "today"
                        ? "bg-primary text-white shadow-glow-primary font-semibold"
                        : "bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-hover border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setSelectedDate("all")}
                    className={`px-4 py-2 rounded-button transition-all ${
                      selectedDate === "all"
                        ? "bg-primary text-white shadow-glow-primary font-semibold"
                        : "bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-hover border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    All Time
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <div className="card p-12 text-center">
              <FiCoffee className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
              <h3 className="text-xl font-semibold mb-2 text-black dark:text-white">No reviews yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Be the first to review this meal!</p>
              <Link
                href="/mess-reviews/new"
                className="btn-primary inline-block px-6 py-3 font-semibold"
              >
                Write a Review
              </Link>
            </div>
          ) : (
            filteredReviews.map((review) => {
              const MealIcon = mealTypeIcons[review.meal_type];
              return (
                <div key={review.id} className="card card-glow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 dark:from-primary/30 dark:to-secondary/30 flex items-center justify-center">
                        <FiUser className="w-6 h-6 text-primary dark:text-secondary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-black dark:text-white">{review.user_name}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 capitalize bg-gray-100 dark:bg-dark-card px-3 py-1 rounded-full">
                            <MealIcon className="w-4 h-4" />
                            {review.meal_type}
                          </div>
                        </div>
                      <div className="flex items-center gap-2">
                        <StarRating rating={review.rating} />
                        <span className="text-sm text-gray-500 dark:text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()} • {new Date(review.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-primary dark:text-secondary">{review.rating.toFixed(1)}</div>
                </div>

                {review.review_text && (
                  <p className="text-gray-700 dark:text-gray-300 mb-4 ml-16">{review.review_text}</p>
                )}

                {/* Detailed Ratings */}
                {(review.taste_rating || review.quantity_rating || review.hygiene_rating || review.variety_rating) && (
                  <div className="ml-16 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {review.taste_rating && (
                      <div className="bg-gray-50 dark:bg-dark-card rounded-lg p-3">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Taste</div>
                        <div className="flex items-center gap-2">
                          <span className="text-primary dark:text-secondary font-semibold">{review.taste_rating}</span>
                          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-primary dark:bg-secondary" style={{ width: `${(review.taste_rating / 5) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    )}
                    {review.quantity_rating && (
                      <div className="bg-gray-50 dark:bg-dark-card rounded-lg p-3">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Quantity</div>
                        <div className="flex items-center gap-2">
                          <span className="text-primary dark:text-secondary font-semibold">{review.quantity_rating}</span>
                          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-primary dark:bg-secondary" style={{ width: `${(review.quantity_rating / 5) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    )}
                    {review.hygiene_rating && (
                      <div className="bg-gray-50 dark:bg-dark-card rounded-lg p-3">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Hygiene</div>
                        <div className="flex items-center gap-2">
                          <span className="text-primary dark:text-secondary font-semibold">{review.hygiene_rating}</span>
                          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-primary dark:bg-secondary" style={{ width: `${(review.hygiene_rating / 5) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    )}
                    {review.variety_rating && (
                      <div className="bg-gray-50 dark:bg-dark-card rounded-lg p-3">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Variety</div>
                        <div className="flex items-center gap-2">
                          <span className="text-primary dark:text-secondary font-semibold">{review.variety_rating}</span>
                          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-primary dark:bg-secondary" style={{ width: `${(review.variety_rating / 5) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}  
              </div>
              );
            })
          )}
        </div>
          </div>
        </main>
      </div>
    </div>
  );
}
