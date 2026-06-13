
import type { Category } from "@/Types";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { useCategories } from "@/hooks/useCategories";
import { useState } from "react";
import Loader from "../ui/Loader";

type CategoryFormInputs = {
  categoryName: string;
  categoryDescription: string;
  icon: string;
  color: string;
  initialBudget?: number;
};

type CategoryFormProps = {
  onClose: () => void;
  category?: Category | null;
  month:number;
  year:number
};

const ICONS = [
  { value: "🍔", label: "Food" },
  { value: "🚗", label: "Transport" },
  { value: "🏠", label: "Housing" },
  { value: "💊", label: "Health" },
  { value: "🎮", label: "Gaming" },
  { value: "👗", label: "Clothing" },
  { value: "📚", label: "Education" },
  { value: "✈️", label: "Travel" },
  { value: "💡", label: "Utilities" },
  { value: "🎬", label: "Entertainment" },
  { value: "🏋️", label: "Fitness" },
  { value: "🛒", label: "Shopping" },
  { value: "💰", label: "Savings" },
  { value: "🐾", label: "Pets" },
  { value: "🎁", label: "Gifts" },
  { value: "📱", label: "Tech" },
];

const COLORS = [
  "#6366F1", // indigo
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#EF4444", // red
  "#F97316", // orange
  "#EAB308", // yellow
  "#22C55E", // green
  "#14B8A6", // teal
  "#3B82F6", // blue
  "#06B6D4", // cyan
  "#84CC16", // lime
  "#F43F5E", // rose
];

export default function CategoryForm({ onClose, category , month, year }: CategoryFormProps) {
  const isEdit = !!category;
  const { createCategory, updateCategory, isCreating, isUpdating } = useCategories();

  const [selectedIcon, setSelectedIcon] = useState(category?.icon ?? "🍔");
  const [selectedColor, setSelectedColor] = useState(category?.color ?? COLORS[0]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormInputs>({
    defaultValues: {
      categoryName: category?.categoryName ?? "",
      categoryDescription: category?.categoryDescription ?? "",
    },
  });

  const onSubmit = (data: CategoryFormInputs) => {
    const payload = { ...data, icon: selectedIcon, color: selectedColor, month, year };
    if (isEdit) {
      updateCategory(
        { ...category!, ...payload },
        { onSuccess: () => { reset(); onClose(); } }
      );
    } else {
      createCategory(payload, {
        onSuccess: () => { reset(); onClose(); }
      });
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header preview */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm transition-all"
            style={{ backgroundColor: selectedColor + "22", border: `2px solid ${selectedColor}` }}
          >
            {selectedIcon}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {isEdit ? "Edit Category" : "New Category"}
            </h2>
            <p className="text-xs text-gray-400">Pick an icon and color below</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Name</label>
            <input
              {...register("categoryName", { required: "Category name is required" })}
              placeholder="e.g. Food & Dining"
              className="w-full border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            {errors.categoryName && (
              <p className="text-xs text-red-500 mt-1">{errors.categoryName.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
            <input
              {...register("categoryDescription", { required: "Description is required" })}
              placeholder="e.g. Restaurants, groceries"
              className="w-full border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            {errors.categoryDescription && (
              <p className="text-xs text-red-500 mt-1">{errors.categoryDescription.message}</p>
            )}
          </div>

          {/* Icon picker */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Icon</label>
            <div className="grid grid-cols-8 gap-1.5">
              {ICONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  title={label}
                  onClick={() => setSelectedIcon(value)}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                    selectedIcon === value
                      ? "ring-2 ring-offset-1 scale-110"
                      : "hover:bg-gray-100"
                  }`}
                  style={
                    selectedIcon === value
                      ? { ringColor: selectedColor, backgroundColor: selectedColor + "22" }
                      : {}
                  }
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-7 h-7 rounded-full transition-all ${
                    selectedColor === color
                      ? "ring-2 ring-offset-2 scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{
                    backgroundColor: color,
                    ringColor: color,
                  }}
                />
              ))}
            </div>
          </div>
{!isEdit && (
  <div>
    <label className="text-sm font-medium text-gray-700 mb-1 block">
      Monthly Budget
      <span className="text-gray-400 font-normal ml-1">(optional)</span>
    </label>
    <input
      type="number"
      min={0}
      {...register("initialBudget", { min: 0 })}
      placeholder="e.g. 500"
      className="w-full border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
    />
  </div>
)}
          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating || isUpdating}
              className="px-4 py-2 text-white rounded-xl"
              style={{ backgroundColor: selectedColor }}
            >
              {isEdit
                ? isUpdating ? <Loader variant="inline" size="sm" /> : "Update"
                : isCreating ? <Loader variant="inline" size="sm" /> : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}