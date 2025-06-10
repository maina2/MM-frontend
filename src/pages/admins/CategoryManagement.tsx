import { useState, useCallback } from "react";
import {
  useGetAdminCategoriesQuery,
  useCreateAdminCategoryMutation,
  useUpdateAdminCategoryMutation,
  useDeleteAdminCategoryMutation,
} from "../../api/apiSlice";
import { Edit3, Trash2, Plus, X, Save } from "lucide-react";
import { Category } from "../../types";

// Define API error type
interface ApiError {
  data?: { detail?: string; error?: string };
  status?: number;
}

const CategoryManagement = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null as File | null,
  });
  const [formError, setFormError] = useState("");

  const {
    data: categoriesData,
    isLoading,
    error,
  } = useGetAdminCategoriesQuery({
    page,
    page_size: 12,
    search: search || undefined,
  });
  const [createCategory, { isLoading: isCreating }] = useCreateAdminCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateAdminCategoryMutation();
  const [deleteCategory] = useDeleteAdminCategoryMutation();

  const handleEdit = useCallback((category: Category) => {
    setEditCategory(category);
    setFormData({
      name: category.name || "",
      description: category.description || "",
      image: null,
    });
    setOpenModal(true);
  }, []);

  const handleDelete = useCallback(
    async (id: number) => {
      if (window.confirm("Delete this category?")) {
        try {
          await deleteCategory(id).unwrap();
          alert("Category deleted successfully!");
        } catch (err: unknown) {
          const apiError = err as ApiError;
          alert(apiError.data?.error || apiError.data?.detail || "Failed to delete category");
        }
      }
    },
    [deleteCategory]
  );

  const handleModalOpen = useCallback(() => {
    setEditCategory(null);
    setFormData({
      name: "",
      description: "",
      image: null,
    });
    setOpenModal(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setOpenModal(false);
    setFormError("");
  }, []);

  const handleFormChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    },
    []
  );

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) setFormData((prev) => ({ ...prev, image: file }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError("");
      if (!formData.name) {
        setFormError("Name is required");
        return;
      }
      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        image: formData.image || undefined,
      };
      try {
        if (editCategory) {
          await updateCategory({ id: editCategory.id, ...payload }).unwrap();
          alert("Category updated successfully!");
        } else {
          await createCategory(payload).unwrap();
          alert("Category created successfully!");
        }
        handleModalClose();
      } catch (err: unknown) {
        const apiError = err as ApiError;
        setFormError(apiError.data?.error || apiError.data?.detail || "Failed to save category");
      }
    },
    [formData, editCategory, createCategory, updateCategory, handleModalClose]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      setPage(1);
    },
    []
  );

  if (isLoading || !categoriesData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    const apiError = error as ApiError;
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {apiError.data?.error || apiError.data?.detail || "Failed to fetch categories"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between h-auto sm:h-16 py-4 sm:py-0">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            </div>
            <button
              onClick={handleModalOpen}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesData.results.map((category: Category) => (
            <div
              key={category.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {category.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-1">
                        <h3 className="font-bold text-gray-900 text-base">
                          {category.name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          #{category.id}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <span className="text-sm font-medium">Description:</span>
                    <span className="text-sm">
                      {category.description || "None"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <span className="text-sm font-medium">Image:</span>
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="text-sm text-gray-400">None</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Category"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
            style={{ marginTop: "10vh" }}
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {editCategory ? "Edit Category" : "Add Category"}
              </h2>
              <button
                onClick={handleModalClose}
                className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {formError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-lg">
                  {formError}
                </div>
              )}
              <input
                type="text"
                placeholder="Name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors"
                required
              />
              <textarea
                placeholder="Description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors"
                rows={3}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors"
                />
                {formData.image && (
                  <img
                    src={URL.createObjectURL(formData.image)}
                    alt="Preview"
                    className="mt-2 w-20 h-20 rounded-lg object-cover"
                  />
                )}
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-end space-x-3">
              <button
                onClick={handleModalClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isCreating || isUpdating}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                {isCreating || isUpdating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : editCategory ? (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Update</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Create</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;