"use client";

import { AlertCircle, Building2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/toast";
import { createSupplier } from "@/lib/procurement-api";

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORY_OPTIONS = [
  "Specialty Coffee",
  "Dairy & Milk",
  "Spices & Seasoning",
  "Traditional Flours",
  "Honey & Sweeteners",
  "Fresh Bakery & Pastry",
  "Packaging & Eco Supplies",
];

export function AddSupplierModal({
  isOpen,
  onClose,
  onSuccess,
}: AddSupplierModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]!);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [leadTimeDays, setLeadTimeDays] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Supplier name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createSupplier({
        name: name.trim(),
        category,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        leadTimeDays: Number(leadTimeDays) || 3,
      });

      showToast(
        "success",
        "Supplier Registered",
        `${name.trim()} added to the verified partner directory.`,
      );
      setName("");
      setPhone("");
      setEmail("");
      setAddress("");
      setLeadTimeDays(3);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to register supplier";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl border border-border shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-cream/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-meadow-tint text-meadow-dark">
              <Building2 className="w-5 h-5 text-meadow" />
            </div>
            <div>
              <h3 className="text-base font-black text-forest">
                Add Sourcing Partner
              </h3>
              <p className="text-xs text-sage">
                Register a certified regional cooperative or producer
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-sage hover:text-forest hover:bg-cream transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-forest block mb-1">
              Cooperative or Producer Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Harar Highland Coffee Growers Union"
              className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-white text-forest focus:outline-none focus:ring-2 focus:ring-meadow/20 focus:border-meadow"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-forest block mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-white text-forest focus:outline-none focus:ring-2 focus:ring-meadow/20 focus:border-meadow"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-forest block mb-1">
                Avg Lead Time (Days)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-white text-forest focus:outline-none focus:ring-2 focus:ring-meadow/20 focus:border-meadow"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-forest block mb-1">
              Region / Sourcing Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Dilla, Gedeo Zone, Southern Ethiopia"
              className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-white text-forest focus:outline-none focus:ring-2 focus:ring-meadow/20 focus:border-meadow"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-forest block mb-1">
                Phone Contact
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+251 11 662 4589"
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-white text-forest focus:outline-none focus:ring-2 focus:ring-meadow/20 focus:border-meadow"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-forest block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="orders@hararcoop.et"
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-white text-forest focus:outline-none focus:ring-2 focus:ring-meadow/20 focus:border-meadow"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registering..." : "Add Partner"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
