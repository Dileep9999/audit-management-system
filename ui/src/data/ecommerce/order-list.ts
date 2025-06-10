export interface OptionType {
  label: string
  value: string
}

const paymentOptions: OptionType[] = [
  { label: 'Paid', value: 'Paid' },
  { label: 'Unpaid', value: 'Unpaid' },
  { label: 'COD', value: 'COD' },
]

const statusOptions: OptionType[] = [
  { label: 'New', value: 'New' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Shipping', value: 'Shipping' },
  { label: 'Delivered', value: 'Delivered' },
]

const paymentNameOptions: OptionType[] = [
  { label: 'Denim Jacket', value: 'Denim Jacket' },
  { label: 'Leather Wallet', value: 'Leather Wallet' },
  { label: 'Wireless Headphones', value: 'Wireless Headphones' },
  { label: 'Sunglasses', value: 'Sunglasses' },
  { label: 'Backpack', value: 'Backpack' },
  { label: 'Winter Coat', value: 'Winter Coat' },
  { label: 'Handbag', value: 'Handbag' },
  { label: 'Sweater', value: 'Sweater' },
  { label: 'Sports Watch', value: 'Sports Watch' },
]
export { paymentOptions, statusOptions, paymentNameOptions }
