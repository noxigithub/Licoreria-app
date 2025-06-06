import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Inventory from './components/Inventory';
import Categories from './components/Categories';
import Receipt from './components/Receipt';
import Reports from './components/Reports';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('inventory');

  if (!currentUser) {
    return <Login />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold text-indigo-600">Licorera</h1>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    to="/inventory"
                    className={`${
                      activeTab === 'inventory'
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    onClick={() => setActiveTab('inventory')}
                  >
                    Inventory
                  </Link>
                  <Link
                    to="/categories"
                    className={`${
                      activeTab === 'categories'
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    onClick={() => setActiveTab('categories')}
                  >
                    Categories
                  </Link>
                  <Link
                    to="/receipt"
                    className={`${
                      activeTab === 'receipt'
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    onClick={() => setActiveTab('receipt')}
                  >
                    Receipt
                  </Link>
                  <Link
                    to="/reports"
                    className={`${
                      activeTab === 'reports'
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    onClick={() => setActiveTab('reports')}
                  >
                    Reports
                  </Link>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-gray-500 text-sm mr-4">{currentUser.email}</span>
                <button
                  onClick={() => {/* Add logout handler */}}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Navigate to="/inventory" replace />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/receipt" element={<Receipt />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 