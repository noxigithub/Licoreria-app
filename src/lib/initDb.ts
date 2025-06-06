import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

const sampleCategories = [
  { name: 'Whiskey', description: 'Various types of whiskey' },
  { name: 'Vodka', description: 'Premium and standard vodkas' },
  { name: 'Rum', description: 'White, dark, and spiced rums' },
  { name: 'Gin', description: 'London dry and flavored gins' },
  { name: 'Tequila', description: 'Blanco, reposado, and añejo tequilas' }
];

const sampleProducts = [
  {
    name: 'Jack Daniel\'s',
    price: 29.99,
    quantity: 10,
    categoryName: 'Whiskey'
  },
  {
    name: 'Absolut Vodka',
    price: 24.99,
    quantity: 15,
    categoryName: 'Vodka'
  },
  {
    name: 'Bacardi Superior',
    price: 19.99,
    quantity: 20,
    categoryName: 'Rum'
  },
  {
    name: 'Bombay Sapphire',
    price: 27.99,
    quantity: 12,
    categoryName: 'Gin'
  },
  {
    name: 'Patrón Silver',
    price: 49.99,
    quantity: 8,
    categoryName: 'Tequila'
  }
];

export async function initializeDatabase() {
  try {
    // Clear existing data
    await clearCollections();

    // Add categories
    const categoryRefs = await Promise.all(
      sampleCategories.map(category => 
        addDoc(collection(db, 'categories'), category)
      )
    );

    // Create a map of category names to their IDs
    const categoryMap = new Map();
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    categoriesSnapshot.forEach(doc => {
      const data = doc.data();
      categoryMap.set(data.name, doc.id);
    });

    // Add products with proper category references
    await Promise.all(
      sampleProducts.map(product => 
        addDoc(collection(db, 'products'), {
          ...product,
          categoryId: categoryMap.get(product.categoryName)
        })
      )
    );

    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

async function clearCollections() {
  try {
    // Clear products
    const productsSnapshot = await getDocs(collection(db, 'products'));
    await Promise.all(
      productsSnapshot.docs.map(doc => deleteDoc(doc.ref))
    );

    // Clear categories
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    await Promise.all(
      categoriesSnapshot.docs.map(doc => deleteDoc(doc.ref))
    );

    console.log('Collections cleared successfully');
  } catch (error) {
    console.error('Error clearing collections:', error);
    throw error;
  }
} 