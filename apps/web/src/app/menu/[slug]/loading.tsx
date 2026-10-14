import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export default function ProductPageLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-pulse">
        <div className="w-48 h-5 bg-stone-200 rounded-lg" />
        <div className="bg-white rounded-[32px] border border-border p-6 sm:p-8 min-h-[600px]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5 bg-stone-100 rounded-2xl h-80 md:h-[450px]" />
            <div className="md:col-span-7 space-y-5">
              <div className="w-28 h-6 bg-stone-200 rounded-full" />
              <div className="w-4/5 h-10 bg-stone-200 rounded-xl" />
              <div className="w-1/3 h-7 bg-stone-200 rounded-lg" />
              <div className="w-full h-20 bg-stone-100 rounded-xl" />
              <div className="flex gap-2">
                <div className="w-24 h-8 bg-stone-100 rounded-xl" />
                <div className="w-24 h-8 bg-stone-100 rounded-xl" />
                <div className="w-24 h-8 bg-stone-100 rounded-xl" />
              </div>
              <div className="w-full h-40 bg-stone-100 rounded-2xl" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
