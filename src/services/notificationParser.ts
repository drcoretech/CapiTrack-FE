export interface ParsedPayment {
  isPayment: boolean;
  amount: number;
  sourceApp: 'PhonePe' | 'Google Pay' | 'Paytm' | 'CRED' | 'BHIM' | 'Bank SMS' | 'UPI';
  merchant: string;
  suggestedCategory: 'Food' | 'Travel' | 'Grocery' | 'Fun' | 'Health' | 'Shopping' | 'Bills' | 'Custom';
  rawText: string;
}

// App package identifier mapping
export const PACKAGE_NAMES = {
  PHONEPE: 'com.phonepe.app',
  GPAY: 'com.google.android.apps.nbu.paisa.user',
  PAYTM: 'net.one97.paytm',
  CRED: 'com.dreamplug.androidapp',
  BHIM: 'in.org.npci.upiapp',
};

// Keyword mapping for smart merchant category prediction
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Food: [
    'swiggy',
    'zomato',
    'chai',
    'tea',
    'coffee',
    'cafe',
    'restaurant',
    'dhaba',
    'kitchen',
    'hotel',
    'canteen',
    'baker',
    'bakery',
    'pizza',
    'burger',
    'mcdonald',
    'kfc',
    'domino',
    'subway',
    'starbucks',
    'snack',
    'tiffin',
    'dosa',
    'biryani',
    'mithai',
    'sweets',
  ],
  Travel: [
    'uber',
    'ola',
    'rapido',
    'auto',
    'metro',
    'petrol',
    'fuel',
    'toll',
    'fastag',
    'railway',
    'irctc',
    'redbus',
    'flight',
    'indigo',
    'cab',
    'driver',
    'parking',
  ],
  Grocery: [
    'zepto',
    'blinkit',
    'instamart',
    'supermarket',
    'grocery',
    'mart',
    'kirana',
    'vegetable',
    'fruits',
    'dairy',
    'milk',
    'bigbasket',
    'dmart',
    'reliance fresh',
  ],
  Fun: [
    'pvr',
    'inox',
    'bookmyshow',
    'cinema',
    'movie',
    'netflix',
    'prime',
    'spotify',
    'youtube',
    'gaming',
    'playstation',
    'steam',
    'arcade',
  ],
  Health: [
    'apollo',
    'pharmacy',
    'medplus',
    '1mg',
    'pharmeasy',
    'medical',
    'chemist',
    'hospital',
    'clinic',
    'doctor',
    'dental',
    'pathology',
    'lab',
  ],
  Shopping: [
    'amazon',
    'flipkart',
    'myntra',
    'ajio',
    'zara',
    'h&m',
    'nykaa',
    'cloth',
    'shoes',
    'footwear',
    'lifestyle',
    'westside',
    'trends',
  ],
  Bills: [
    'bescom',
    'electricity',
    'power',
    'water',
    'gas',
    'broadband',
    'wifi',
    'airtel',
    'jio',
    'vi',
    'tatasky',
    'recharge',
    'postpaid',
    'maintenance',
    'rent',
  ],
};

// Predict category based on merchant or notification title/body
export function inferCategory(
  merchantOrText: string
): 'Food' | 'Travel' | 'Grocery' | 'Fun' | 'Health' | 'Shopping' | 'Bills' | 'Custom' {
  const normalized = merchantOrText.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => normalized.includes(kw))) {
      return category as any;
    }
  }

  return 'Food'; // Default everyday category for UPI payments
}

// Regex patterns to extract amounts from notification text
// Matches: "Paid ₹50", "Paid ₹1 to Self", "debited by Rs 150.00", "sent INR 250", "Payment of ₹1,400 to..."
const AMOUNT_REGEX = /(?:₹|rs\.?|inr)\s*([0-9]+(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?)/i;
const DEBIT_REGEX = /(?:paid|debited|sent|transferred|spent|payment of|transfer of)\s+(?:to\s+|by\s+|with\s+|for\s+)?(?:₹|rs\.?|inr)?\s*([0-9]+(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?)/i;

// Regex patterns to extract merchant/payee name
const MERCHANT_REGEX = /(?:to|at|towards)\s+([A-Za-z0-9\s&'.]+?)(?:\s+successful|\s+using|\s+from|\s+on|\s+ref|\s+upi|\.|$)/i;

export function parseNotification(
  title: string,
  body: string,
  packageName = ''
): ParsedPayment | null {
  const combined = `${title} ${body}`.trim();
  if (!combined) return null;

  // Determine source app
  let sourceApp: ParsedPayment['sourceApp'] = 'UPI';
  if (packageName.includes('phonepe') || /phonepe/i.test(combined)) {
    sourceApp = 'PhonePe';
  } else if (packageName.includes('nbu.paisa') || /google pay|gpay/i.test(combined)) {
    sourceApp = 'Google Pay';
  } else if (packageName.includes('paytm') || /paytm/i.test(combined)) {
    sourceApp = 'Paytm';
  } else if (packageName.includes('dreamplug') || /cred/i.test(combined)) {
    sourceApp = 'CRED';
  } else if (packageName.includes('npci.upiapp') || /bhim/i.test(combined)) {
    sourceApp = 'BHIM';
  } else if (/bank|debited|a\/c|acct|sms|vpa/i.test(combined)) {
    sourceApp = 'Bank SMS';
  }

  // Filter out credit/refund/received payments: we strictly want outgoing expenses
  const isStrictCredit = /(?:credited to your|received from|added to (?:your )?wallet|refund received|cashback received|money received)/i.test(combined);
  const isDebit = /(?:paid|debited|sent|transferred|payment of|spent)/i.test(combined);

  if (isStrictCredit && !isDebit) {
    return null; // Received money, not an expense
  }

  // Extract amount
  let amount = 0;
  const debitMatch = combined.match(DEBIT_REGEX);
  if (debitMatch && debitMatch[1]) {
    amount = parseFloat(debitMatch[1].replace(/,/g, ''));
  } else {
    const amountMatch = combined.match(AMOUNT_REGEX);
    if (amountMatch && amountMatch[1]) {
      amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    }
  }

  if (!amount || isNaN(amount) || amount <= 0) {
    return null;
  }

  // Extract merchant name
  let merchant = '';
  const merchantMatch = combined.match(MERCHANT_REGEX);
  if (merchantMatch && merchantMatch[1]) {
    merchant = merchantMatch[1].trim();
    // Filter out common false positives
    if (merchant.length < 2 || /^(upi|bank|account|your|ref|payment)$/i.test(merchant)) {
      merchant = '';
    }
  }

  if (!merchant) {
    merchant = title && !title.toLowerCase().includes('paid') ? title.trim() : `${sourceApp} Payment`;
  }

  const suggestedCategory = inferCategory(`${merchant} ${combined}`);

  return {
    isPayment: true,
    amount,
    sourceApp,
    merchant,
    suggestedCategory,
    rawText: combined,
  };
}
