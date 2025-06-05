import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import jsPDF from 'jspdf';

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

interface ReceiptItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Receipt {
  id: string;
  customerName: string;
  date: string;
  items: ReceiptItem[];
  total: number;
  timestamp: Timestamp;
}

export default function Receipt() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<ReceiptItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [date] = useState(new Date().toISOString().split('T')[0]);
  const [receiptNumber, setReceiptNumber] = useState(1);

  useEffect(() => {
    loadProducts();
    generateReceiptNumber();
  }, []);

  useEffect(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const loadProducts = async () => {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const productsList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
    setProducts(productsList);
    setFilteredProducts(productsList);
  };

  const generateReceiptNumber = async () => {
    const receiptsSnapshot = await getDocs(collection(db, 'receipts'));
    setReceiptNumber(receiptsSnapshot.size + 1);
  };

  const addToReceipt = (product: Product) => {
    const existingItem = selectedProducts.find(item => item.productId === product.id);
    
    if (existingItem) {
      setSelectedProducts(selectedProducts.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setSelectedProducts([...selectedProducts, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      }]);
    }
  };

  const removeFromReceipt = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromReceipt(productId);
      return;
    }
    
    setSelectedProducts(selectedProducts.map(item =>
      item.productId === productId
        ? { ...item, quantity }
        : item
    ));
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const generatePDF = (receipt: Receipt) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(20);
    doc.text('Liquor Store Receipt', pageWidth / 2, 20, { align: 'center' });
    
    // Receipt Info
    doc.setFontSize(12);
    doc.text(`Receipt #: ${receipt.id}`, 20, 40);
    doc.text(`Date: ${receipt.date}`, 20, 50);
    doc.text(`Customer: ${receipt.customerName}`, 20, 60);
    
    // Items Table Header
    doc.setFontSize(10);
    doc.text('Item', 20, 80);
    doc.text('Qty', 100, 80);
    doc.text('Price', 130, 80);
    doc.text('Total', 160, 80);
    
    // Items
    let y = 90;
    receipt.items.forEach(item => {
      doc.text(item.name, 20, y);
      doc.text(item.quantity.toString(), 100, y);
      doc.text(`$${item.price.toFixed(2)}`, 130, y);
      doc.text(`$${(item.price * item.quantity).toFixed(2)}`, 160, y);
      y += 10;
    });
    
    // Total
    doc.setFontSize(12);
    doc.text(`Total: $${receipt.total.toFixed(2)}`, 20, y + 20);
    
    // Footer
    doc.setFontSize(10);
    doc.text('Thank you for your purchase!', pageWidth / 2, y + 40, { align: 'center' });
    
    // Save the PDF
    doc.save(`receipt-${receipt.id}.pdf`);
  };

  const generateReceipt = async () => {
    if (!customerName || selectedProducts.length === 0) {
      alert('Please enter customer name and select products');
      return;
    }

    try {
      const receipt: Omit<Receipt, 'id'> = {
        customerName,
        date,
        items: selectedProducts,
        total: calculateTotal(),
        timestamp: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'receipts'), receipt);
      const newReceipt: Receipt = {
        id: docRef.id,
        ...receipt
      };

      // Generate and download PDF
      generatePDF(newReceipt);

      alert('Receipt generated successfully!');
      setSelectedProducts([]);
      setCustomerName('');
      generateReceiptNumber();
    } catch (error) {
      console.error('Error generating receipt:', error);
      alert('Error generating receipt');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Selection */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Available Products</h3>
          
          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredProducts.map(product => (
              <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-500">{product.category}</div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">${product.price.toFixed(2)}</span>
                  <button
                    onClick={() => addToReceipt(product)}
                    className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Receipt Preview */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Receipt Preview</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="text"
                value={date}
                readOnly
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50"
              />
            </div>

            <div className="border-t pt-4">
              <div className="space-y-2">
                {selectedProducts.map(item => (
                  <div key={item.productId} className="flex items-center justify-between p-2 border rounded-lg">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">${item.price.toFixed(2)} each</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        +
                      </button>
                      <span className="ml-4 font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      <button
                        onClick={() => removeFromReceipt(item.productId)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={generateReceipt}
              className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Generate Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 