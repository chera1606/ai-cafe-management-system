import { describe, expect, it } from "vitest";
import type { MenuItem } from "@/data/types";
import {
  calculateLineTotal,
  getDefaultSelections,
  validateOptionSelections,
} from "./line-total";

const mockItem: MenuItem = {
  id: "test-latte",
  slug: "spanish-latte",
  name: "Spanish Latte",
  description: "Espresso with condensed milk",
  price: 6.0,
  categoryId: "coffee",
  categoryName: "Coffee",
  rating: 4.9,
  reviewCount: 120,
  image: "https://example.com/latte.jpg",
  available: true,
  discountPercent: 10, // 10% off -> $5.40 base
  tags: ["Signature"],
  optionGroups: [
    {
      id: "grp-size",
      name: "Cup Size",
      type: "single",
      required: true,
      options: [
        {
          id: "sz-reg",
          name: "Regular (12oz)",
          priceDelta: 0,
          isDefault: true,
        },
        { id: "sz-lg", name: "Large (16oz)", priceDelta: 1.5 },
      ],
    },
    {
      id: "grp-milk",
      name: "Milk Choice",
      type: "single",
      required: true,
      options: [
        { id: "mk-whole", name: "Whole Milk", priceDelta: 0, isDefault: true },
        { id: "mk-oat", name: "Oat Milk", priceDelta: 0.8 },
      ],
    },
    {
      id: "grp-extras",
      name: "Extras",
      type: "multiple",
      required: false,
      maxSelections: 2,
      options: [
        { id: "ex-shot", name: "Extra Shot", priceDelta: 1.25 },
        { id: "ex-cardamom", name: "Cardamom Spice", priceDelta: 0.5 },
        { id: "ex-vanilla", name: "Vanilla Bean", priceDelta: 0.75 },
      ],
    },
  ],
};

describe("calculateLineTotal", () => {
  it("calculates discounted base price with default options for qty 1", () => {
    const defaults = getDefaultSelections(mockItem);
    // Base $5.40 + 0 + 0 = $5.40
    expect(calculateLineTotal(mockItem, defaults, 1)).toBe(5.4);
  });

  it("adds modifier price deltas correctly", () => {
    const selections = {
      "grp-size": ["sz-lg"], // +$1.50
      "grp-milk": ["mk-oat"], // +$0.80
      "grp-extras": ["ex-shot", "ex-cardamom"], // +$1.25 + $0.50 = +$1.75
    };
    // Base $5.40 + $1.50 + $0.80 + $1.75 = $9.45
    expect(calculateLineTotal(mockItem, selections, 1)).toBe(9.45);
  });

  it("multiplies total by quantity accurately", () => {
    const selections = {
      "grp-size": ["sz-lg"], // +$1.50
    };
    // ($5.40 + $1.50) * 3 = $6.90 * 3 = $20.70
    expect(calculateLineTotal(mockItem, selections, 3)).toBe(20.7);
  });

  it("returns 0 when quantity is 0", () => {
    expect(calculateLineTotal(mockItem, {}, 0)).toBe(0);
  });
});

describe("validateOptionSelections", () => {
  it("passes when all required option groups are satisfied", () => {
    const selections = {
      "grp-size": ["sz-reg"],
      "grp-milk": ["mk-whole"],
    };
    const validation = validateOptionSelections(mockItem, selections);
    expect(validation.isValid).toBe(true);
  });

  it("fails when a required option group is missing", () => {
    const selections = {
      "grp-size": ["sz-reg"],
      // missing grp-milk
    };
    const validation = validateOptionSelections(mockItem, selections);
    expect(validation.isValid).toBe(false);
    expect(validation.missingGroupId).toBe("grp-milk");
  });

  it("fails when maxSelections constraint is exceeded", () => {
    const selections = {
      "grp-size": ["sz-reg"],
      "grp-milk": ["mk-whole"],
      "grp-extras": ["ex-shot", "ex-cardamom", "ex-vanilla"], // 3 chosen, max is 2
    };
    const validation = validateOptionSelections(mockItem, selections);
    expect(validation.isValid).toBe(false);
    expect(validation.missingGroupId).toBe("grp-extras");
  });
});
