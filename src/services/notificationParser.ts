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
const REVERSE_AMOUNT_REGEX = /([0-9]+(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?)\s*(?:₹|rs\.?|inr)\b/i;
const DEBIT_REGEX = /(?:paid|debited|sent|transferred|spent|payment of|transfer of|withdrawn|dr)\s*(?::|-)?\s*(?:to\s+|by\s+|with\s+|for\s+)?(?:₹|rs\.?|inr)?\s*([0-9]+(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?)/i;

// Regex patterns to extract merchant/payee name
const MERCHANT_REGEX = /(?:to|at|towards|vpa\s+)\s*([A-Za-z0-9\s&'.@_-]+?)(?:\s+successful|\s+using|\s+from|\s+on|\s+ref|\s+upi|\.|\,|$)/i;

// In-memory cache of recent transactions to prevent duplicates from notification updates
const processedTransactions = new Map<string, number>();

export function isDuplicateTransaction(amount: number, merchant: string, packageName: string): boolean {
  const cleanMerchant = (merchant || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const key = `${packageName}_${amount}_${cleanMerchant}`;
  const now = Date.now();
  const lastSeen = processedTransactions.get(key);

  // Ignore exact same transaction event if received within 30 seconds
  if (lastSeen && now - lastSeen < 30000) {
    return true;
  }

  processedTransactions.set(key, now);

  // Clean old entries
  if (processedTransactions.size > 100) {
    for (const [k, time] of processedTransactions.entries()) {
      if (now - time > 60000) {
        processedTransactions.delete(k);
      }
    }
  }

  return false;
}

export function isAllowedPaymentApp(packageName: string, text: string): boolean {
  const pkg = (packageName || '').toLowerCase();
  const lowerText = text.toLowerCase();

  // STRICT BLOCKLIST: Ignore CapiTrack itself
  if (
    pkg.includes('com.capitrack') ||
    pkg.includes('capitrack') ||
    pkg.includes('capitech')
  ) {
    return false;
  }

  // Known UPI apps
  const isUpi =
    pkg.includes('phonepe') ||
    pkg.includes('nbu.paisa') || // Google Pay
    pkg.includes('paytm') ||
    pkg.includes('dreamplug') || // CRED
    pkg.includes('npci.upiapp') || // BHIM
    pkg.includes('amazon') ||
    pkg.includes('freecharge') ||
    pkg.includes('mobikwik') ||
    pkg.includes('navi') ||
    pkg.includes('whatsapp') ||
    pkg.includes('cred');

  // Known SMS and Messaging apps
  const isSms =
    pkg.includes('messaging') ||
    pkg.includes('mms') ||
    pkg.includes('sms') ||
    pkg.includes('com.google.android.apps.messaging') ||
    pkg.includes('com.samsung.android.messaging') ||
    pkg.includes('com.android.mms') ||
    pkg.includes('com.oneplus.mms') ||
    pkg.includes('com.coloros.mms') ||
    pkg.includes('com.vivo.mms');

  // Known Banking apps
  const isBank =
    pkg.includes('bank') ||
    pkg.includes('baroda') ||
    pkg.includes('sbi') ||
    pkg.includes('hdfc') ||
    pkg.includes('icici') ||
    pkg.includes('axis') ||
    pkg.includes('kotak') ||
    pkg.includes('pnb');

  if (isUpi || isSms || isBank) return true;

  // Fallback: If text contains strong banking keywords and package is an SMS or payment tool
  if (/bank|debited|a\/c|acct|vpa/i.test(lowerText) && /msg|sms|mms|pay/i.test(pkg)) {
    return true;
  }

  return false;
}

export function parseNotification(
  title: string,
  body: string,
  packageName = ''
): ParsedPayment | null {
  const combined = `${title} ${body}`.trim();
  if (!combined) return null;

  const pkg = (packageName || '').toLowerCase();

  // 1. HARD STOP: Never process notifications from CapiTrack itself!
  if (
    pkg.includes('com.capitrack') ||
    pkg.includes('capitrack') ||
    pkg.includes('capitech')
  ) {
    return null;
  }

  // 2. HARD STOP: Never process notifications containing CapiTrack's alert signature!
  if (
    combined.includes('in CapiTrack') ||
    combined.includes('Tap to categorize') ||
    title.includes('💸') ||
    combined.includes('Paid to Bank SMS Payment') ||
    combined.includes('Paid to UPI Payment')
  ) {
    return null;
  }

  // 3. ALLOWED APPS ONLY: Only process notifications from UPI, SMS, or Bank apps
  if (packageName && !isAllowedPaymentApp(packageName, combined)) {
    return null;
  }

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
  } else if (/bank|debited|a\/c|acct|sms|vpa|baroda|sbi|hdfc|icici/i.test(combined)) {
    sourceApp = 'Bank SMS';
  }

  // Filter out credit/refund/received payments: we strictly want outgoing expenses
  const isStrictCredit = /(?:credited to your|received from|added to (?:your )?wallet|refund received|cashback received|money received)/i.test(combined);
  const isDebit = /(?:paid|debited|sent|transferred|payment of|spent|dr\b|withdrawn)/i.test(combined);

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
    } else {
      const reverseMatch = combined.match(REVERSE_AMOUNT_REGEX);
      if (reverseMatch && reverseMatch[1]) {
        amount = parseFloat(reverseMatch[1].replace(/,/g, ''));
      }
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
    // Clean UPI handles (e.g. rohan@okaxis -> Rohan)
    if (merchant.includes('@')) {
      merchant = merchant.split('@')[0].replace(/[._0-9]/g, ' ').trim();
    }
    // Filter out common false positives
    if (merchant.length < 2 || /^(upi|bank|account|your|ref|payment)$/i.test(merchant)) {
      merchant = '';
    } else if (/^self$/i.test(merchant)) {
      merchant = 'Self Transfer';
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
