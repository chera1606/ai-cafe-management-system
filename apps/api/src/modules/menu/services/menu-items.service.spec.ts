import type { Database } from "@cafe/db";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MenuItemsService } from "./menu-items.service";

describe("MenuItemsService", () => {
  let service: MenuItemsService;
  let mockDb: {
    select: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    transaction: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockDb = {
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      transaction: vi.fn(),
    };

    service = new MenuItemsService(mockDb as unknown as Database);
  });

  describe("findAll", () => {
    it("should return menu items list with category and department joins", async () => {
      const mockItems = [
        {
          id: "m1",
          name: "Signature Espresso",
          categoryName: "Signature Espresso",
          departmentName: "Espresso Bar",
          price: "3.50",
          availabilityStatus: "AVAILABLE",
        },
      ];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue(mockItems),
            }),
          }),
        }),
      });

      const result = await service.findAll();
      expect(result).toEqual(mockItems);
    });

    it("should apply query filters", async () => {
      const mockItems = [
        {
          id: "m1",
          name: "Signature Espresso",
          categoryId: "c1",
          departmentId: "d1",
          availabilityStatus: "AVAILABLE",
        },
      ];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                orderBy: vi.fn().mockResolvedValue(mockItems),
              }),
            }),
          }),
        }),
      });

      const result = await service.findAll({
        categoryId: "c1",
        departmentId: "d1",
        availabilityStatus: "AVAILABLE",
        search: "Espresso",
      });
      expect(result).toEqual(mockItems);
    });
  });

  describe("findById", () => {
    it("should return item with recipe and ingredients when found", async () => {
      const mockItem = {
        id: "m1",
        name: "Signature Espresso",
        categoryId: "c1",
        departmentId: "d1",
      };
      const mockRecipe = {
        id: "r1",
        menuItemId: "m1",
        name: "Espresso Recipe",
        version: 1,
        status: "active",
      };
      const mockIngredients = [
        {
          ingredientId: "i1",
          ingredientName: "Arabica Beans",
          quantity: "18.000",
          unitOfMeasure: "g",
        },
      ];

      // 1. menuItem query
      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              innerJoin: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue([mockItem]),
                }),
              }),
            }),
          }),
        })
        // 2. active recipe query
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([mockRecipe]),
              }),
            }),
          }),
        })
        // 3. recipe items query
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue(mockIngredients),
            }),
          }),
        });

      const result = await service.findById("m1");
      expect(result.id).toBe("m1");
      expect(result.recipe).toBeDefined();
      expect(result.recipe?.ingredients).toHaveLength(1);
    });

    it("should throw NotFoundException when item does not exist", async () => {
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      });

      await expect(service.findById("m99")).rejects.toThrow(NotFoundException);
    });
  });

  describe("create", () => {
    it("should create menu item inside transaction", async () => {
      const dto = {
        name: "Mocha",
        categoryId: "c1",
        departmentId: "d1",
        price: "4.50",
      };

      // Check category exists
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: "c1" }]),
          }),
        }),
      });

      // Check department exists
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: "d1" }]),
          }),
        }),
      });

      // Check unique name
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      mockDb.transaction.mockImplementation(
        async (cb: (tx: unknown) => Promise<unknown>) => {
          const mockTx = {
            insert: vi.fn().mockReturnValue({
              values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([{ id: "m2", ...dto }]),
              }),
            }),
          };
          return cb(mockTx);
        },
      );

      const result = await service.create(dto);
      expect(result.id).toBe("m2");
    });

    it("should throw ConflictException if item name already exists", async () => {
      // Category exists
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: "c1" }]),
          }),
        }),
      });

      // Department exists
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: "d1" }]),
          }),
        }),
      });

      // Name conflict found
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi
              .fn()
              .mockResolvedValue([{ id: "m-existing", name: "Mocha" }]),
          }),
        }),
      });

      await expect(
        service.create({
          name: "Mocha",
          categoryId: "c1",
          departmentId: "d1",
          price: "4.50",
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("updateAvailability", () => {
    it("should toggle availability status", async () => {
      const mockItem = { id: "m1", availabilityStatus: "AVAILABLE" };

      // findById mock
      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              innerJoin: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue([mockItem]),
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
        });

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi
              .fn()
              .mockResolvedValue([
                { ...mockItem, availabilityStatus: "UNAVAILABLE" },
              ]),
          }),
        }),
      });

      const result = await service.updateAvailability("m1", "UNAVAILABLE");
      expect(result.availabilityStatus).toBe("UNAVAILABLE");
    });
  });

  describe("setRecipe", () => {
    it("should archive old recipes and insert new version with ingredients", async () => {
      const mockItem = { id: "m1", name: "Espresso" };

      // findById mock
      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              innerJoin: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue([mockItem]),
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
        })
        // check ingredient exists
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ id: "i1", name: "Beans" }]),
            }),
          }),
        });

      mockDb.transaction.mockImplementation(
        async (cb: (tx: unknown) => Promise<unknown>) => {
          const mockTx = {
            select: vi
              .fn()
              .mockReturnValueOnce({
                from: vi.fn().mockReturnValue({
                  where: vi.fn().mockReturnValue({
                    orderBy: vi.fn().mockReturnValue({
                      limit: vi.fn().mockResolvedValue([{ version: 1 }]),
                    }),
                  }),
                }),
              })
              .mockReturnValueOnce({
                from: vi.fn().mockReturnValue({
                  innerJoin: vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValue([
                      {
                        ingredientId: "i1",
                        ingredientName: "Beans",
                        quantity: "18.000",
                        unitOfMeasure: "g",
                      },
                    ]),
                  }),
                }),
              }),
            update: vi.fn().mockReturnValue({
              set: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue([]),
              }),
            }),
            insert: vi.fn().mockReturnValue({
              values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([
                  {
                    id: "r2",
                    menuItemId: "m1",
                    version: 2,
                    status: "active",
                  },
                ]),
              }),
            }),
          };
          return cb(mockTx);
        },
      );

      const result = await service.setRecipe("m1", {
        ingredients: [
          { ingredientId: "i1", quantity: "18.000", unitOfMeasure: "g" },
        ],
      });

      expect(result.version).toBe(2);
      expect(result.ingredients).toHaveLength(1);
    });
  });

  describe("delete", () => {
    it("should delete item and recipe history in transaction", async () => {
      const mockItem = { id: "m1" };

      // findById mock
      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              innerJoin: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue([mockItem]),
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
        });

      mockDb.transaction.mockImplementation(
        async (cb: (tx: unknown) => Promise<unknown>) => {
          const mockTx = {
            select: vi.fn().mockReturnValue({
              from: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue([{ id: "r1" }]),
              }),
            }),
            delete: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([]),
            }),
          };
          return cb(mockTx);
        },
      );

      const result = await service.delete("m1");
      expect(result.message).toContain("deleted successfully");
    });
  });
});
