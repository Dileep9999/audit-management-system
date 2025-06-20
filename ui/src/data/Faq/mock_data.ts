import { FAQItem, FAQCategory } from "@src/dtos/apps/faq";

export const mockFAQCategories: FAQCategory[] = [
  {
    id: "cat-1",
    name: "General",
    description: "General questions about the audit management system",
    order: 1,
  },
  {
    id: "cat-2",
    name: "Audit Process",
    description: "Questions about the audit process and workflow",
    order: 2,
  },
  {
    id: "cat-3",
    name: "Technical",
    description: "Technical questions about using the system",
    order: 3,
  },
];

export const mockFAQItems: FAQItem[] = [
  {
    id: "faq-1",
    question: "What is an audit?",
    answer: "An audit is a systematic examination of records, procedures, and activities of an organization to ensure compliance with established standards and regulations.",
    category: "cat-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    order: 1,
  },
  {
    id: "faq-2",
    question: "How do I request an audit?",
    answer: "You can request an audit by navigating to the Audits section and clicking the 'New Audit' button. Fill out the required information in the form and submit your request.",
    category: "cat-2",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    order: 1,
  },
  {
    id: "faq-3",
    question: "How long does an audit typically take?",
    answer: "The duration of an audit varies depending on its scope and complexity. Simple audits may take a few days, while comprehensive audits could take several weeks.",
    category: "cat-2",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    order: 2,
  },
  {
    id: "faq-4",
    question: "What browser is recommended for using the system?",
    answer: "Our system works best with modern browsers like Chrome, Firefox, Safari, or Edge. Make sure to keep your browser updated to the latest version for optimal performance.",
    category: "cat-3",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    order: 1,
  },
]; 