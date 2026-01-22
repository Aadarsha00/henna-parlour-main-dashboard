import { Search, Filter, RefreshCw } from "lucide-react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import type {
  ServiceCategory,
  ServiceFilter,
} from "@/interface/Service.interface";

interface ServiceFiltersProps {
  filters: ServiceFilter;
  onFiltersChange: (filters: ServiceFilter) => void;
  isLoading: boolean;
}

const ServiceFilters = ({
  filters,
  onFiltersChange,
  isLoading,
}: ServiceFiltersProps) => {
  const { register, handleSubmit, reset } = useForm<ServiceFilter>({
    defaultValues: filters,
  });

  const onSubmit: SubmitHandler<ServiceFilter> = (data) => {
    onFiltersChange(data);
  };

  const handleReset = () => {
    const defaultFilters: ServiceFilter = {
      category: "lashes", // Changed from "all" to default to "hair"
      search: "",
    };
    reset(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      search: e.target.value,
    });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      category: e.target.value as ServiceCategory | "all",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
      <div className="space-y-4">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              {...register("search")}
              type="text"
              placeholder="Search services..."
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              {...register("category")}
              onChange={handleCategoryChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 appearance-none"
            >
              <option value="all">All Categories</option>
              <option value="lashes">Lash Services</option>
              <option value="threading">Threading Services</option>
              <option value="party">Party Services</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                "Apply"
              )}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceFilters;
