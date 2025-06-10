// wishlist product
export interface WishListProduct {
  _id: any;
  productId: string;
  productName: string;
  description: string;
  category: string;
  count: number;
  price: number;
  discount: number;
  selling_price: number;
  revenue: any;
  color: string;
  size: string[];
  colors: string[];
  gender: string;
  stock: number;
  qty: number;
  image1: string;
  image2: string;
  image3: string;
  status: string;
  payment_method: string;
  brand: string;
  activeColor: string;
  activeSize: string;
}
