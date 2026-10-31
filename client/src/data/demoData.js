export const DEMO_DATA = {
  plans: [
    { id: 'plan-01', name: 'Growth Monthly', product: 'Brightloop CRM', billing: 'Monthly', price: 2499, trial: '14 days', status: 'Active', customers: 42 },
    { id: 'plan-02', name: 'Scale Annual', product: 'Brightloop CRM', billing: 'Annual', price: 23990, trial: '30 days', status: 'Active', customers: 18 },
    { id: 'plan-03', name: 'Support Add-on', product: 'Priority Support', billing: 'Monthly', price: 899, trial: 'No trial', status: 'Draft', customers: 0 },
  ],
  quotations: [
    { id: 'Q/2026/0042', customer: 'Ananya Stores', email: 'billing@ananyastores.in', total: 35388, validUntil: '14 Nov 2026', status: 'Sent' },
    { id: 'Q/2026/0041', customer: 'Kaveri Logistics', email: 'accounts@kaverilogistics.in', total: 28308, validUntil: '09 Nov 2026', status: 'Draft' },
    { id: 'Q/2026/0039', customer: 'Tamil Tech Works', email: 'finance@tamiltech.in', total: 70776, validUntil: '02 Nov 2026', status: 'Confirmed' },
  ],
  subscriptions: [
    { id: 'SUB/2026/0108', customer: 'Ananya Stores', plan: 'Growth Monthly', start: '01 Oct 2026', renewal: '01 Nov 2026', amount: 2499, status: 'Active' },
    { id: 'SUB/2026/0107', customer: 'Kaveri Logistics', plan: 'Scale Annual', start: '15 Oct 2026', renewal: '15 Oct 2027', amount: 23990, status: 'Active' },
    { id: 'SUB/2026/0106', customer: 'Tamil Tech Works', plan: 'Growth Monthly', start: '01 Sep 2026', renewal: '01 Nov 2026', amount: 4998, status: 'Paused' },
    { id: 'SUB/2026/0105', customer: 'Nila Retail', plan: 'Support Add-on', start: '12 Sep 2026', renewal: '12 Oct 2026', amount: 899, status: 'Closed' },
  ],
  invoices: [
    { id: 'INV/2026/0087', customer: 'Ananya Stores', issueDate: '01 Oct 2026', dueDate: '15 Oct 2026', total: 2949, due: 0, status: 'Paid' },
    { id: 'INV/2026/0086', customer: 'Kaveri Logistics', issueDate: '15 Oct 2026', dueDate: '30 Oct 2026', total: 28308, due: 28308, status: 'Overdue' },
    { id: 'INV/2026/0085', customer: 'Tamil Tech Works', issueDate: '01 Oct 2026', dueDate: '15 Oct 2026', total: 5898, due: 2949, status: 'Partial' },
  ],
  payments: [
    { id: 'PAY/2026/0092', invoice: 'INV/2026/0087', customer: 'Ananya Stores', date: '03 Oct 2026', method: 'UPI', amount: 2949, status: 'Received' },
    { id: 'PAY/2026/0091', invoice: 'INV/2026/0083', customer: 'Malar Fashions', date: '02 Oct 2026', method: 'Bank transfer', amount: 11796, status: 'Received' },
    { id: 'PAY/2026/0090', invoice: 'INV/2026/0081', customer: 'Sri Lakshmi Foods', date: '29 Sep 2026', method: 'Card', amount: 2499, status: 'Pending' },
  ],
  discounts: [
    { id: 'DISC-10', code: 'WELCOME10', name: 'First subscription', type: 'Percentage', value: '10%', validity: '01 Oct – 31 Dec 2026', usage: '18 / 100', status: 'Active' },
    { id: 'DISC-11', code: 'SCALE2500', name: 'Annual commitment', type: 'Fixed', value: '₹2,500', validity: '01 Oct – 31 Mar 2027', usage: '4 / 25', status: 'Active' },
    { id: 'DISC-08', code: 'FESTIVE', name: 'Festival offer', type: 'Percentage', value: '15%', validity: 'Expired', usage: '50 / 50', status: 'Expired' },
  ],
  customers: [
    { id: 'CUS-208', name: 'Ananya Stores', email: 'billing@ananyastores.in', city: 'Chennai', subscriptions: 1, balance: 0, status: 'Active' },
    { id: 'CUS-207', name: 'Kaveri Logistics', email: 'accounts@kaverilogistics.in', city: 'Mumbai', subscriptions: 1, balance: 28308, status: 'Attention' },
    { id: 'CUS-206', name: 'Tamil Tech Works', email: 'finance@tamiltech.in', city: 'Coimbatore', subscriptions: 2, balance: 2949, status: 'Active' },
  ],
};

export const DASHBOARD_DEMO = {
  admin: {
    revenue: 286400,
    mrr: 78200,
    arr: 938400,
    active: 60,
    pending: 4,
    cancelled: 2,
    customers: 64,
    overdue: 3,
  },
  staff: {
    assigned: 18,
    active: 15,
    quotations: 6,
    overdue: 2,
  },
  customer: {
    plan: 'Growth Monthly',
    renewal: '01 Nov 2026',
    due: 0,
    invoices: 3,
  },
};
