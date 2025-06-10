// products list

export interface ProductListItem {
  _id: any;
  productId: string;
  productName: string;
  description: string;
  category: string;
  price: number;
  discount: number;
  count: number;
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

// product category
export interface ProductCategory {
  _id: any;
  CategoryId: string;
  category: string;
  products: number;
  image: string;
  status: string;
  description: string;
}

export interface CategoryItems {
  _id: any;
  categoryID?: string;
  category: string;
  products: number;
  image: string;
  status: string;
  description: string;
}
