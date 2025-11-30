"use client";

import React, { useState } from "react";
import { useMessReview, MealType } from "@/contexts/MessReviewContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiSun, FiCoffee, FiMoon, FiArrowLeft, FiPlus } from "react-icons/fi";

const mealTypes: MealType[] = ["breakfast", "lunch", "snack", "dinner"];

const mealTypeIcons: Record<MealType, React.ComponentType<{ className?: string }>> = {
  breakfast: FiSun,
  lunch: FiCoffee,
  snack: FiCoffee,
  dinner: FiMoon,
};

const StarSelector = ({ rating, onChange }: { rating: number; onChange: (rating: number) => void }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          className="text-3xl transition-all hover:scale-110"
        >
          <span className={star <= (hoverRating || rating) ? "text-primary dark:text-secondary" : "text-gray-300 dark:text-gray-700"}>★</span>
        </button>
      ))}
    </div>
  );
};

export default function NewReviewPage() {
  const { addReview, hasUserReviewedToday } = useMessReview();
  const router = useRouter();

  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [tasteRating, setTasteRating] = useState(0);
  const [quantityRating, setQuantityRating] = useState(0);
  const [hygieneRating, setHygieneRating] = useState(0);
  const [varietyRating, setVarietyRating] = useState(0);
  const [showDetailedRatings, setShowDetailedRatings] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      alert("Please provide a rating");
      return;
    }

    // Check if user already reviewed this meal today
    if (hasUserReviewedToday("current-user", mealType)) {
      if (!confirm(`You've already reviewed ${mealType} today. Do you want to submit another review?`)) {
        return;
      }
    }

    addReview({
      meal_type: mealType,
      rating,
      review_text: reviewText || undefined,
      taste_rating: showDetailedRatings && tasteRating > 0 ? tasteRating : undefined,
      quantity_rating: showDetailedRatings && quantityRating > 0 ? quantityRating : undefined,
      hygiene_rating: showDetailedRatings && hygieneRating > 0 ? hygieneRating : undefined,
      variety_rating: showDetailedRatings && varietyRating > 0 ? varietyRating : undefined,
      meal_date: new Date().toISOString().split("T")[0],
    });

    router.push("/mess-reviews");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black animate-fade-in p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/mess-reviews" className="text-primary dark:text-secondary hover:opacity-80 mb-4 inline-flex items-center gap-2">
            <FiArrowLeft className="w-4 h-4" />
            Back to Reviews
          </Link>
          <h1 className="text-4xl font-bold mb-2 text-black dark:text-white">Write a Review</h1>
          <p className="text-gray-600 dark:text-gray-400">Share your feedback about today&apos;s meal</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card p-8">
          {/* Meal Type Selection */}
          <div className="mb-8">
            <label className="text-lg font-semibold mb-4 block text-black dark:text-white">Select Meal Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {mealTypes.map((meal) => {
                const Icon = mealTypeIcons[meal];
                return (
                  <button
                    key={meal}
                    type="button"
                    onClick={() => setMealType(meal)}
                    className={`p-4 rounded-lg transition-all text-center ${
                      mealType === meal
                        ? "bg-primary text-white border-2 border-primary shadow-glow-primary"
                        : "bg-gray-50 dark:bg-dark-card border-2 border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-secondary"
                    }`}
                  >
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${mealType === meal ? "text-white" : "text-primary dark:text-secondary"}`} />
                    <div className={`text-sm font-semibold capitalize ${mealType === meal ? "text-white" : "text-black dark:text-white"}`}>
                      {meal}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Overall Rating */}
          <div className="mb-8">
            <label className="text-lg font-semibold mb-4 block text-black dark:text-white">Overall Rating *</label>
            <div className="flex items-center gap-4">
              <StarSelector rating={rating} onChange={setRating} />
              <span className="text-3xl font-bold text-primary dark:text-secondary">{rating > 0 ? rating : "-"}/5</span>
            </div>
          </div>

          {/* Review Text */}
          <div className="mb-8">
            <label className="text-lg font-semibold mb-4 block text-black dark:text-white">Your Review (Optional)</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your thoughts about the meal..."
              className="input-field resize-none"
              rows={4}
            />
          </div>

          {/* Detailed Ratings Toggle */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setShowDetailedRatings(!showDetailedRatings)}
              className="text-primary dark:text-secondary hover:opacity-80 font-semibold flex items-center gap-2"
            >
              {showDetailedRatings ? "− Hide" : "+ Add"} Detailed Ratings
            </button>
          </div>

          {/* Detailed Ratings */}
          {showDetailedRatings && (
            <div className="mb-8 space-y-6 bg-gray-50 dark:bg-dark-card rounded-lg p-6 border border-gray-200 dark:border-gray-800">
              {/* Taste */}
              <div>
                <label className="text-sm font-semibold mb-3 block text-black dark:text-white">Taste</label>
                <div className="flex items-center gap-4">
                  <StarSelector rating={tasteRating} onChange={setTasteRating} />
                  <span className="text-xl font-bold text-primary dark:text-secondary w-12">{tasteRating > 0 ? tasteRating : "-"}/5</span>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="text-sm font-semibold mb-3 block text-black dark:text-white">Quantity</label>
                <div className="flex items-center gap-4">
                  <StarSelector rating={quantityRating} onChange={setQuantityRating} />
                  <span className="text-xl font-bold text-primary dark:text-secondary w-12">{quantityRating > 0 ? quantityRating : "-"}/5</span>
                </div>
              </div>

              {/* Hygiene */}
              <div>
                <label className="text-sm font-semibold mb-3 block text-black dark:text-white">Hygiene</label>
                <div className="flex items-center gap-4">
                  <StarSelector rating={hygieneRating} onChange={setHygieneRating} />
                  <span className="text-xl font-bold text-primary dark:text-secondary w-12">{hygieneRating > 0 ? hygieneRating : "-"}/5</span>
                </div>
              </div>

              {/* Variety */}
              <div>
                <label className="text-sm font-semibold mb-3 block text-black dark:text-white">Variety</label>
                <div className="flex items-center gap-4">
                  <StarSelector rating={varietyRating} onChange={setVarietyRating} />
                  <span className="text-xl font-bold text-primary dark:text-secondary w-12">{varietyRating > 0 ? varietyRating : "-"}/5</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={rating === 0}
              className="btn-primary flex-1 font-bold py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Review
            </button>
            <Link
              href="/mess-reviews"
              className="btn-secondary px-8 py-4 font-semibold text-center"
            >
              Cancel
            </Link>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Your review helps improve the mess service for everyone!</p>
        </div>
      </div>
    </div>
  );
}
