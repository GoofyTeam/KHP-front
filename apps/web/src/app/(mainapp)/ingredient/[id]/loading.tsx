export default function Loading() {
  return (
    <div className="flex flex-col md:flex-row gap-12">
      {/* Left Column */}
      <div className="w-full md:w-1/2 md:pl-12 lg:pl-24">
        <div className="w-4/5 space-y-6">
          {/* Select skeleton */}
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />

          {/* Image skeleton */}
          <div className="w-full flex justify-center items-center">
            <div className="w-80 h-80 bg-gray-200 rounded-lg animate-pulse" />
          </div>

          {/* Button skeleton */}
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-6 w-full md:w-1/2">
        {/* Product Info skeleton */}
        <div className="md:pr-12 lg:pr-24">
          {/* Title skeleton */}
          <div className="h-8 bg-gray-200 rounded-lg animate-pulse w-3/4 mb-2" />

          {/* Category skeleton */}
          <div className="h-6 bg-gray-200 rounded-lg animate-pulse w-1/3 mb-6" />

          {/* Description skeleton */}
          <div className="space-y-2 mb-6">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6" />
          </div>
        </div>

        {/* Carousel skeleton */}
        <div className="w-full">
          <div className="flex gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="w-40 aspect-square bg-gray-200 rounded-xl animate-pulse flex-shrink-0"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
