import React from "react";
import { useSelector } from "react-redux";
import { TrendingUp, TrendingDown } from "lucide-react";

const StatsCard = ({
  title,
  value,
  icon: Icon,
  change,
  changeText,
  subtitle,
  trend = "up",
  color = "blue",
}) => {
  const { isRTL } = useSelector((state) => state.language);

  const colorClasses = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      icon: "text-blue-600 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-800",
    },
    green: {
      bg: "bg-green-50 dark:bg-green-900/20",
      icon: "text-green-600 dark:text-green-400",
      border: "border-green-200 dark:border-green-800",
    },
    yellow: {
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      icon: "text-yellow-600 dark:text-yellow-400",
      border: "border-yellow-200 dark:border-yellow-800",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-900/20",
      icon: "text-purple-600 dark:text-purple-400",
      border: "border-purple-200 dark:border-purple-800",
    },
    indigo: {
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
      icon: "text-indigo-600 dark:text-indigo-400",
      border: "border-indigo-200 dark:border-indigo-800",
    },
    pink: {
      bg: "bg-pink-50 dark:bg-pink-900/20",
      icon: "text-pink-600 dark:text-pink-400",
      border: "border-pink-200 dark:border-pink-800",
    },
    red: {
      bg: "bg-red-50 dark:bg-red-900/20",
      icon: "text-red-600 dark:text-red-400",
      border: "border-red-200 dark:border-red-800",
    },
  };

  const selectedColor = colorClasses[color] || colorClasses.blue;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
      <div
        className={`flex items-center justify-between ${
          isRTL ? "flex-row" : ""
        }`}
      >
        <div className="flex-1">
          <p
            className={`text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            {title}
          </p>
          <p
            className={`text-2xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform duration-200 ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            {value}
          </p>
          {(change !== undefined || subtitle) && (
            <div
              className={`flex items-center mt-2 ${
                isRTL ? "flex-row" : ""
              }`}
            >
              {change !== undefined && (
                <div
                  className={`flex items-center ${
                    isRTL ? "flex-row" : ""
                  } ${
                    trend === "up"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {trend === "up" ? (
                    <TrendingUp
                      className={`w-4 h-4 ${isRTL ? "ml-1" : "mr-1"}`}
                    />
                  ) : (
                    <TrendingDown
                      className={`w-4 h-4 ${isRTL ? "ml-1" : "mr-1"}`}
                    />
                  )}
                  <span className="text-sm font-medium">
                    {typeof change === "number"
                      ? `${Math.abs(change).toFixed(1)}%`
                      : change}
                  </span>
                </div>
              )}
              {(changeText || subtitle) && (
                <span
                  className={`text-xs text-gray-500 dark:text-gray-400 ${
                    isRTL ? "mr-2" : "ml-2"
                  }`}
                >
                  {changeText || subtitle}
                </span>
              )}
            </div>
          )}
        </div>
        <div
          className={`p-3 rounded-xl ${selectedColor.bg} ${
            selectedColor.border
          } border group-hover:scale-110 transition-all duration-300 ${
            isRTL ? "ml-4" : "mr-4"
          }`}
        >
          <Icon className={`w-6 h-6 ${selectedColor.icon}`} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
