"use client";

import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Mail,
  MapPin,
  Package,
  Phone,
  PlusCircle,
  Search,
  Truck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SupplierEntity } from "@/lib/procurement-api";

interface SupplierDirectoryProps {
  suppliers: SupplierEntity[];
  onSelectSupplierForPo: (supplier: SupplierEntity) => void;
  onOpenAddSupplier: () => void;
}

const CATEGORIES = [
  "ALL",
  "Specialty Coffee",
  "Dairy & Milk",
  "Spices & Seasoning",
  "Traditional Flours",
  "Honey & Sweeteners",
];

export function SupplierDirectory({
  suppliers,
  onSelectSupplierForPo,
  onOpenAddSupplier,
}: SupplierDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const matchesCategory =
        selectedCategory === "ALL" || s.category === selectedCategory;
      const term = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !term ||
        s.name.toLowerCase().includes(term) ||
        s.category.toLowerCase().includes(term) ||
        (s.address && s.address.toLowerCase().includes(term)) ||
        (s.email && s.email.toLowerCase().includes(term));
      return matchesCategory && matchesSearch;
    });
  }, [suppliers, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Search and Category Filter Bar */}
      <div className="bg-white rounded-3xl border border-border p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-sage absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search cooperative, region, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-border bg-cream/30 text-forest placeholder:text-sage focus:outline-none focus:ring-2 focus:ring-meadow/20 focus:border-meadow transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-sage font-medium">
              Showing {filteredSuppliers.length} of {suppliers.length} suppliers
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenAddSupplier}
              leftIcon={<PlusCircle className="w-3.5 h-3.5 text-meadow" />}
            >
              Add Partner
            </Button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/60">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-forest text-white shadow-sm"
                  : "bg-cream/60 text-sage hover:text-forest hover:bg-cream"
              }`}
            >
              {cat === "ALL" ? "All Categories" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Supplier Grid */}
      {filteredSuppliers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-border p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-cream-alt flex items-center justify-center mx-auto mb-3 text-sage">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-forest mb-1">
            No suppliers found
          </h3>
          <p className="text-xs text-sage max-w-sm mx-auto mb-4">
            No cooperatives or vendors match your active filter criteria. Clear
            filters or register a new sourcing partner.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("ALL");
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSuppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="bg-white rounded-3xl border border-border p-6 shadow-sm hover:border-meadow/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <Badge variant="meadow" size="sm" className="mb-2">
                      {supplier.category}
                    </Badge>
                    <h3 className="text-base font-black text-forest leading-tight">
                      {supplier.name}
                    </h3>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      supplier.status === "ACTIVE"
                        ? "bg-meadow-tint text-meadow-dark border border-meadow/30"
                        : "bg-stone-100 text-stone-500 border border-stone-200"
                    }`}
                  >
                    {supplier.status}
                  </span>
                </div>

                {/* Location & Details */}
                <div className="space-y-1.5 text-xs text-sage mb-5">
                  {supplier.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-meadow" />
                      <span className="truncate">{supplier.address}</span>
                    </div>
                  )}
                  {supplier.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 shrink-0 text-meadow" />
                      <span>{supplier.phone}</span>
                    </div>
                  )}
                  {supplier.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 shrink-0 text-meadow" />
                      <span className="truncate">{supplier.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 shrink-0 text-amber" />
                    <span>
                      {supplier.leadTimeDays}{" "}
                      {supplier.leadTimeDays === 1 ? "day" : "days"} lead time
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Stats & Actions */}
              <div className="pt-4 border-t border-border/80">
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="p-2.5 rounded-2xl bg-cream/40">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sage block">
                      Lifetime Spend
                    </span>
                    <span className="text-sm font-black text-forest">
                      ${supplier.totalSpend.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-cream/40">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sage block">
                      Total Orders
                    </span>
                    <span className="text-sm font-black text-forest">
                      {supplier.totalOrdersCount} orders
                    </span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  className="w-full justify-center"
                  onClick={() => onSelectSupplierForPo(supplier)}
                  leftIcon={<Package className="w-3.5 h-3.5" />}
                >
                  Create Purchase Order
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
