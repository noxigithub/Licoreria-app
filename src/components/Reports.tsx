import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Receipt {
  id: string;
  customerName: string;
  date: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    categoryName: string;
  }[];
  total: number;
  timestamp: Timestamp;
}

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  categoryId: string;
  categoryName: string;
}

interface SalesSummary {
  totalSales: number;
  totalItems: number;
  categoryBreakdown: {
    [key: string]: {
      quantity: number;
      revenue: number;
    };
  };
  topProducts: {
    name: string;
    quantity: number;
    revenue: number;
  }[];
}

export default function Reports() {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [salesSummary, setSalesSummary] = useState<SalesSummary>({
    totalSales: 0,
    totalItems: 0,
    categoryBreakdown: {},
    topProducts: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSalesData();
  }, [dateRange]);

  const loadSalesData = async () => {
    setIsLoading(true);
    try {
      // Get all receipts within date range
      const receiptsQuery = query(
        collection(db, 'receipts'),
        where('timestamp', '>=', Timestamp.fromDate(new Date(dateRange.start))),
        where('timestamp', '<=', Timestamp.fromDate(new Date(dateRange.end + 'T23:59:59')))
      );
      
      const receiptsSnapshot = await getDocs(receiptsQuery);
      const receipts = receiptsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Receipt[];

      // Calculate sales summary
      const summary: SalesSummary = {
        totalSales: 0,
        totalItems: 0,
        categoryBreakdown: {},
        topProducts: []
      };

      // Process each receipt
      receipts.forEach(receipt => {
        summary.totalSales += receipt.total;
        
        receipt.items.forEach(item => {
          summary.totalItems += item.quantity;
          
          // Update category breakdown
          if (!summary.categoryBreakdown[item.categoryName]) {
            summary.categoryBreakdown[item.categoryName] = {
              quantity: 0,
              revenue: 0
            };
          }
          summary.categoryBreakdown[item.categoryName].quantity += item.quantity;
          summary.categoryBreakdown[item.categoryName].revenue += item.price * item.quantity;
        });
      });

      // Calculate top products
      const productSales = new Map<string, { quantity: number; revenue: number }>();
      receipts.forEach(receipt => {
        receipt.items.forEach(item => {
          const current = productSales.get(item.name) || { quantity: 0, revenue: 0 };
          productSales.set(item.name, {
            quantity: current.quantity + item.quantity,
            revenue: current.revenue + (item.price * item.quantity)
          });
        });
      });

      summary.topProducts = Array.from(productSales.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setSalesSummary(summary);
    } catch (error) {
      console.error('Error loading sales data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Sales Reports</h2>
        <div className="flex space-x-4">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Summary Cards */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Summary</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold">${salesSummary.totalSales.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Items Sold</p>
                <p className="text-2xl font-bold">{salesSummary.totalItems}</p>
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Top Products</h3>
            <div className="space-y-4">
              {salesSummary.topProducts.map((product, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.quantity} units</p>
                  </div>
                  <p className="font-bold">${product.revenue.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units Sold</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(salesSummary.categoryBreakdown).map(([category, data]) => (
                    <tr key={category}>
                      <td className="px-6 py-4 whitespace-nowrap">{category}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{data.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap">${data.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 