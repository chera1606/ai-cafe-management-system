import type {
  MenuItem,
  OptionGroup,
  OptionItem,
  SelectedOptionsMap,
} from "@/data/types";

function getGroupOptions(group: OptionGroup): OptionItem[] {
  return group.items || group.options || [];
}

/**
 * Pure price calculation function (SRS BR-001).
 * Calculates line total for a menu item with custom selected options and quantity.
 */
export function calculateLineTotal(
  item: MenuItem,
  selections: SelectedOptionsMap = {},
  quantity = 1,
): number {
  if (quantity <= 0) return 0;

  // 1. Base price with optional discount percent
  const basePrice = item.discountPercent
    ? item.price * (1 - item.discountPercent / 100)
    : item.price;

  // 2. Sum option price deltas from optionGroups
  let optionsDelta = 0;

  if (item.optionGroups && item.optionGroups.length > 0) {
    for (const group of item.optionGroups) {
      const selectedOptionIds = selections[group.id] || [];
      const opts = getGroupOptions(group);
      for (const optId of selectedOptionIds) {
        const option = opts.find((o) => o.id === optId);
        if (option) {
          optionsDelta += option.priceDelta;
        }
      }
    }
  } else if (item.options) {
    // Legacy options compatibility fallback
    const allOptions = [
      ...(item.options.sizes || []),
      ...(item.options.milks || []),
      ...(item.options.extras || []),
    ];
    for (const selectedIds of Object.values(selections)) {
      for (const optId of selectedIds) {
        const opt = allOptions.find((o) => o.id === optId);
        if (opt) {
          optionsDelta += opt.priceDelta;
        }
      }
    }
  }

  const unitTotal = Math.max(0, basePrice + optionsDelta);
  const rawTotal = unitTotal * quantity;

  // Round accurately to 2 decimal places
  return Math.round(rawTotal * 100) / 100;
}

/**
 * Validates that all required option groups are selected and adhere to min/max constraints.
 */
export function validateOptionSelections(
  item: MenuItem,
  selections: SelectedOptionsMap = {},
): {
  isValid: boolean;
  missingGroupId?: string;
  missingRequiredGroups: string[];
  errorMessage?: string;
} {
  if (!item.optionGroups || item.optionGroups.length === 0) {
    return { isValid: true, missingRequiredGroups: [] };
  }

  const missingGroups: string[] = [];
  let firstErrorMessage: string | undefined;

  for (const group of item.optionGroups) {
    const selected = selections[group.id] || [];

    // Required single/multi check
    if (group.required && selected.length === 0) {
      missingGroups.push(group.id);
      if (!firstErrorMessage) {
        firstErrorMessage = `Please choose a ${group.name.toLowerCase()}`;
      }
    }

    // Min selections check
    const min = group.minSelect ?? group.minSelections;
    if (min && selected.length < min) {
      missingGroups.push(group.id);
      if (!firstErrorMessage) {
        firstErrorMessage = `Please select at least ${min} option(s) for ${group.name}`;
      }
    }

    // Max selections check
    const max = group.maxSelect ?? group.maxSelections;
    if (max && selected.length > max) {
      missingGroups.push(group.id);
      if (!firstErrorMessage) {
        firstErrorMessage = `You can select up to ${max} option(s) for ${group.name}`;
      }
    }
  }

  return {
    isValid: missingGroups.length === 0,
    missingGroupId: missingGroups[0],
    missingRequiredGroups: missingGroups,
    errorMessage: firstErrorMessage,
  };
}

/**
 * Returns preselected default options for an item.
 */
export function getDefaultSelections(item: MenuItem): SelectedOptionsMap {
  const defaults: SelectedOptionsMap = {};

  if (item.optionGroups) {
    for (const group of item.optionGroups) {
      const opts = getGroupOptions(group);
      const isSingle = group.type === "single";

      if (isSingle) {
        const defaultOpt = opts.find((o) => o.isDefault) || opts[0];
        if (defaultOpt) {
          defaults[group.id] = [defaultOpt.id];
        }
      } else {
        const defaultOpts = opts.filter((o) => o.isDefault).map((o) => o.id);
        if (defaultOpts.length > 0) {
          defaults[group.id] = defaultOpts;
        }
      }
    }
  } else if (item.options) {
    if (item.options.sizes?.[0]) {
      defaults.size = [item.options.sizes[0].id];
    }
    if (item.options.milks?.[0]) {
      defaults.milk = [item.options.milks[0].id];
    }
  }

  return defaults;
}
