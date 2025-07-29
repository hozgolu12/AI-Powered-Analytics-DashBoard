import axios from 'axios';

const BASE_URL = 'https://dummyjson.com';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  gender: string;
  university: string;
  company: { name: string; department: string; title: string };
}

export interface Product {
  id: number;
  title: string;
  price: number;
  category: string;
  brand: string;
  rating: number;
  stock: number;
}

export interface Cart {
  id: number;
  products: Array<{
    id: number;
    title: string;
    price: number;
    quantity: number;
    total: number;
  }>;
  total: number;
  discountedTotal: number;
  userId: number;
  totalProducts: number;
  totalQuantity: number;
}

export interface AnalyticsData {
  metrics: {
    revenue: number;
    users: number;
    conversions: number;
    growthRate: number;
  };
  revenueOverTime: Array<{
    date: string;
    revenue: number;
    users: number;
  }>;
  channelData: Array<{
    channel: string;
    spend: number;
    conversions: number;
  }>;
  audienceSegments: Array<{
    segment: string;
    value: number;
    percentage: number;
  }>;
  tableData: Array<{
    id: number;
    campaign: string;
    channel: string;
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    roi: number;
    date: string;
  }>;
}

export const fetchUsers = async (limit = 100): Promise<{ users: User[] }> => {
  const response = await axios.get(`${BASE_URL}/users?limit=${limit}`);
  return response.data;
};

export const fetchProducts = async (limit = 100): Promise<{ products: Product[] }> => {
  const response = await axios.get(`${BASE_URL}/products?limit=${limit}`);
  return response.data;
};

export const fetchCarts = async (limit = 100): Promise<{ carts: Cart[] }> => {
  const response = await axios.get(`${BASE_URL}/carts?limit=${limit}`);
  return response.data;
};

export const fetchAnalyticsData = async (): Promise<AnalyticsData> => {
  try {
    const [usersData, productsData, cartsData] = await Promise.all([
      fetchUsers(50),
      fetchProducts(100),
      fetchCarts(50)
    ]);

    // Transform real API data into analytics format
    const totalRevenue = cartsData.carts.reduce((sum, cart) => sum + cart.total, 0);
    const totalUsers = usersData.users.length;
    const totalOrders = cartsData.carts.length;
    const conversionRate = (totalOrders / totalUsers) * 100;

    // Generate revenue over time data
    const revenueOverTime = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const baseRevenue = Math.random() * 5000 + 10000;
      const users = Math.floor(Math.random() * 200 + 100);
      
      return {
        date: date.toISOString().split('T')[0],
        revenue: Math.round(baseRevenue),
        users: users
      };
    });

    // Generate channel data
    const channels = ['Google Ads', 'Facebook', 'Instagram', 'LinkedIn', 'Twitter', 'Email'];
    const channelData = channels.map(channel => ({
      channel,
      spend: Math.round(Math.random() * 5000 + 1000),
      conversions: Math.round(Math.random() * 100 + 20)
    }));

    // Generate audience segments
    const segments = ['Desktop', 'Mobile', 'Tablet'];
    const audienceSegments = segments.map(segment => {
      const value = Math.round(Math.random() * 40 + 20);
      return {
        segment,
        value,
        percentage: value
      };
    });

    // Generate table data
    const campaignNames = ['Summer Sale', 'Black Friday', 'Holiday Special', 'New Year', 'Spring Launch', 'Back to School'];
    const tableData = Array.from({ length: 50 }, (_, i) => {
      const spend = Math.round(Math.random() * 3000 + 500);
      const impressions = Math.round(Math.random() * 100000 + 10000);
      const clicks = Math.round(impressions * (Math.random() * 0.05 + 0.01));
      const conversions = Math.round(clicks * (Math.random() * 0.1 + 0.02));
      const roi = Number(((conversions * 50 - spend) / spend * 100).toFixed(1));
      
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));

      return {
        id: i + 1,
        campaign: campaignNames[Math.floor(Math.random() * campaignNames.length)],
        channel: channels[Math.floor(Math.random() * channels.length)],
        spend,
        impressions,
        clicks,
        conversions,
        roi,
        date: date.toISOString().split('T')[0]
      };
    });

    return {
      metrics: {
        revenue: Math.round(totalRevenue),
        users: totalUsers,
        conversions: Math.round(conversionRate),
        growthRate: Number((Math.random() * 20 + 5).toFixed(1))
      },
      revenueOverTime,
      channelData,
      audienceSegments,
      tableData
    };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }
};