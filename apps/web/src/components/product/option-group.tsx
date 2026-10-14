"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { type KeyboardEvent, useId } from "react";
import type { OptionGroup as OptionGroupType, OptionItem } from "@/data/types";

interface OptionGroupProps {
  group: OptionGroupType;
  selectedIds: string[];
  onChange: (groupId: string, newSelectedIds: string[]) => void;
  hasError?: boolean;
}

export function OptionGroup({
  group,
  selectedIds,
  onChange,
  hasError = false,
}: OptionGroupProps) {
  const legendId = useId();

  const isSingle = group.type === "single";
  const selectedCount = selectedIds.length;
  const maxSelectCount = group.maxSelect ?? group.maxSelections;
  const maxLimit = maxSelectCount ?? 99;
  const optionsList = group.items || group.options || [];

  const handleSelectSingle = (item: OptionItem) => {
    onChange(group.id, [item.id]);
  };

  const handleToggleMulti = (item: OptionItem) => {
    const isAlreadySelected = selectedIds.includes(item.id);

    if (isAlreadySelected) {
      onChange(
        group.id,
        selectedIds.filter((id) => id !== item.id),
      );
    } else {
      // Check maxSelect limit
      if (group.maxSelect && selectedCount >= group.maxSelect) {
        return;
      }
      onChange(group.id, [...selectedIds, item.id]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent, item: OptionItem) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (isSingle) {
        handleSelectSingle(item);
      } else {
        handleToggleMulti(item);
      }
    }
  };

  return (
    <motion.fieldset
      id={`option-group-${group.id}`}
      animate={hasError ? { x: [-6, 6, -4, 4, -2, 2, 0] } : {}}
      transition={{ duration: 0.4 }}
      className={`p-4 rounded-2xl border transition-colors ${
        hasError
          ? "border-red-500 bg-red-50/30 ring-1 ring-red-400"
          : "border-border/80 bg-stone-50/50 hover:bg-stone-50/80"
      }`}
      aria-labelledby={legendId}
      aria-invalid={hasError}
    >
      {/* Legend & Header Information */}
      <legend id={legendId} className="w-full px-1 float-left mb-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-serif text-base font-bold text-forest">
              {group.name}
            </span>
            {group.required ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-meadow-tint text-meadow-dark">
                Required
              </span>
            ) : (
              <span className="text-[11px] font-medium text-sage">
                Optional
              </span>
            )}
          </div>

          {/* Hint / Count for multi-selection */}
          {!isSingle && group.maxSelect && (
            <span
              className={`text-xs font-semibold ${
                selectedCount >= maxLimit ? "text-amber-700" : "text-sage"
              }`}
            >
              {selectedCount} of {group.maxSelect} selected
            </span>
          )}
        </div>

        {group.description && (
          <p className="text-xs text-sage mt-0.5">{group.description}</p>
        )}

        {hasError && (
          <p className="text-xs font-semibold text-red-600 mt-1" role="alert">
            Please make a selection to continue.
          </p>
        )}
      </legend>

      {/* Segmented / Card Options Grid */}
      <div
        role={isSingle ? "radiogroup" : "group"}
        className="clear-both grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1"
      >
        {optionsList.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          const isDisabled =
            !isSingle &&
            !isSelected &&
            group.maxSelect !== undefined &&
            selectedCount >= group.maxSelect;

          return (
            <button
              type="button"
              key={item.id}
              aria-pressed={isSelected}
              disabled={isDisabled}
              onClick={() => {
                if (isDisabled) return;
                if (isSingle) {
                  handleSelectSingle(item);
                } else {
                  handleToggleMulti(item);
                }
              }}
              onKeyDown={(e) => {
                if (!isDisabled) handleKeyDown(e, item);
              }}
              className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-meadow focus:ring-offset-1 text-left ${
                isDisabled
                  ? "opacity-45 cursor-not-allowed bg-stone-100 border-border"
                  : isSelected
                    ? "bg-white border-meadow shadow-xs ring-1 ring-meadow/40"
                    : "bg-white border-border hover:border-meadow/60 hover:bg-white"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Custom Indicator Circle / Check */}
                <div
                  className={`w-4 h-4 shrink-0 flex items-center justify-center transition-all ${
                    isSingle ? "rounded-full" : "rounded-md"
                  } ${
                    isSelected
                      ? "bg-meadow text-white"
                      : "border border-stone-300 group-hover:border-meadow"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 450,
                        damping: 25,
                      }}
                    >
                      {isSingle ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      ) : (
                        <Check className="w-3 h-3 stroke-[3]" />
                      )}
                    </motion.div>
                  )}
                </div>

                <span
                  className={`text-xs font-semibold truncate ${
                    isSelected ? "text-forest font-bold" : "text-stone-700"
                  }`}
                >
                  {item.name}
                </span>
              </div>

              {/* Price Delta Badge */}
              <span
                className={`text-xs shrink-0 font-medium ml-2 ${
                  isSelected ? "text-meadow-dark font-bold" : "text-sage"
                }`}
              >
                {item.priceDelta === 0
                  ? "Free"
                  : `+${item.priceDelta.toFixed(2)}`}
              </span>
            </button>
          );
        })}
      </div>
    </motion.fieldset>
  );
}
