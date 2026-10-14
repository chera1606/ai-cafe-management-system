import { Star } from "lucide-react";

export interface RatingProps {
  score: number;
  totalReviews?: number;
  size?: "sm" | "md" | "lg";
  showNumber?: boolean;
  className?: string;
}

export function Rating({
  score,
  totalReviews,
  size = "md",
  showNumber = true,
  className = "",
}: RatingProps) {
  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base font-semibold",
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center text-amber">
        <Star className={`${iconSizes[size]} fill-amber`} />
      </div>

      {showNumber && (
        <span className={`font-bold text-forest ${textSizes[size]}`}>
          {score.toFixed(1)}
        </span>
      )}

      {totalReviews !== undefined && (
        <span className="text-xs text-sage font-medium">
          (
          {totalReviews >= 1000
            ? `${(totalReviews / 1000).toFixed(1)}k`
            : totalReviews}
          )
        </span>
      )}
    </div>
  );
}
