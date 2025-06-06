import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { initializeDatabase } from '../lib/initDb';

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  categoryId: string;
  categoryName: string;
}

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: 0,
    quantity: 0,
    categoryId: '',
    categoryName: ''
  });
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const loadCategories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      const categoriesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      }));
      setCategories(categoriesList);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsList);
      setFilteredProducts(productsList);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const createCategory = async (name: string): Promise<Category> => {
    try {
      // Check if category already exists
      const categoriesQuery = query(collection(db, 'categories'), where('name', '==', name));
      const existingCategories = await getDocs(categoriesQuery);
      
      if (!existingCategories.empty) {
        const existingCategory = existingCategories.docs[0];
        return { id: existingCategory.id, name: existingCategory.data().name };
      }

      // Create new category
      const categoryData = { name };
      const docRef = await addDoc(collection(db, 'categories'), categoryData);
      const newCategory = { id: docRef.id, name };
      
      // Update local state
      setCategories(prev => [...prev, newCategory]);
      
      return newCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  };

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newProduct.categoryId) {
        alert('Please select or create a category');
        return;
      }

      // Verify category exists
      const categoryRef = doc(db, 'categories', newProduct.categoryId);
      const categoryDoc = await getDoc(categoryRef);
      
      if (!categoryDoc.exists()) {
        alert('Selected category does not exist. Please select a valid category.');
        return;
      }

      const categoryData = categoryDoc.data();
      const productData = {
        name: newProduct.name,
        price: newProduct.price,
        quantity: newProduct.quantity,
        categoryId: newProduct.categoryId,
        categoryName: categoryData.name
      };
      
      await addDoc(collection(db, 'products'), productData);
      
      // Reset form
      setNewProduct({ name: '', price: 0, quantity: 0, categoryId: '', categoryName: '' });
      setIsAddingProduct(false);
      setIsAddingNewCategory(false);
      setNewCategory('');
      
      // Reload data
      await loadProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product. Please try again.');
    }
  };

  const handleNewCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      const addedCategory = await createCategory(newCategory.trim());
      
      // Update product form with new category
      setNewProduct(prev => ({
        ...prev,
        categoryId: addedCategory.id,
        categoryName: addedCategory.name
      }));
      
      // Reset category form
      setIsAddingNewCategory(false);
      setNewCategory('');
      
      // Reload categories
      await loadCategories();
    } catch (error) {
      console.error('Error adding new category:', error);
      alert('Error adding new category. Please try again.');
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === 'new') {
      setIsAddingNewCategory(true);
    } else {
      setIsAddingNewCategory(false);
      const selectedCategory = categories.find(cat => cat.id === e.target.value);
      if (selectedCategory) {
        setNewProduct({
          ...newProduct,
          categoryId: selectedCategory.id,
          categoryName: selectedCategory.name
        });
      }
    }
  };

  const updateProduct = async (id: string, updatedData: Partial<Product>) => {
    try {
      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, updatedData);
      loadProducts();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const deleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        loadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleInitializeDb = async () => {
    try {
      await initializeDatabase();
      await loadCategories();
      await loadProducts();
      alert('Database initialized successfully!');
    } catch (error) {
      console.error('Error initializing database:', error);
      alert('Error initializing database. Please check the console for details.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
        <button
          onClick={handleInitializeDb}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Initialize Database
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search products by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          onClick={() => setIsAddingProduct(!isAddingProduct)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {isAddingProduct ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {/* Add Product Form */}
      {isAddingProduct && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Add New Product</h3>
          <form onSubmit={addProduct} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Name</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  value={newProduct.quantity}
                  onChange={(e) => setNewProduct({...newProduct, quantity: Number(e.target.value)})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                {isAddingNewCategory ? (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Enter new category"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleNewCategorySubmit}
                      className="mt-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewCategory(false);
                        setNewCategory('');
                      }}
                      className="mt-1 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <select
                    value={newProduct.categoryId}
                    onChange={handleCategoryChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                    <option value="new">+ Add New Category</option>
                  </select>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.categoryName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateProduct(product.id, { quantity: product.quantity + 1 })}
                        className="text-green-600 hover:text-green-900"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => updateProduct(product.id, { quantity: Math.max(0, product.quantity - 1) })}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        -1
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 