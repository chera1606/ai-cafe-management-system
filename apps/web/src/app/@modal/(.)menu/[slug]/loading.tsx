export default function ModalLoadingSkeleton() {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Loading product details"
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
    >
      <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-[960px] h-[80vh] bg-white rounded-t-[28px] md:rounded-[28px] overflow-hidden p-6 md:p-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-full">
          <div className="md:col-span-5 bg-stone-100 rounded-2xl h-72 md:h-96" />
          <div className="md:col-span-7 space-y-4">
            <div className="w-24 h-6 bg-stone-200 rounded-full" />
            <div className="w-3/4 h-8 bg-stone-200 rounded-xl" />
            <div className="w-1/3 h-6 bg-stone-200 rounded-lg" />
            <div className="w-full h-16 bg-stone-100 rounded-xl" />
            <div className="flex gap-2">
              <div className="w-20 h-8 bg-stone-100 rounded-lg" />
              <div className="w-20 h-8 bg-stone-100 rounded-lg" />
              <div className="w-20 h-8 bg-stone-100 rounded-lg" />
            </div>
            <div className="w-full h-32 bg-stone-100 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
