export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  order: number;
}

export interface FAQCategory {
  id: string;
  name: string;
  description: string;
  order: number;
}

export interface FAQState {
  items: FAQItem[];
  categories: FAQCategory[];
  isLoading: boolean;
  error: string | null;
} 