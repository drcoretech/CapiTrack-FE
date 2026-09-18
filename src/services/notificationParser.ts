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
    if (
      keywords.some((kw) => {
        if (kw.length <= 3) {
          // Strict word boundary check for short words (e.g. \bvi\b, \bgas\b, \btea\b)
          // Prevents 'Digvijay' from matching 'vi' (Vodafone Idea under Bills)
          const regex = new RegExp(`\\b${kw}\\b`, 'i');
          return regex.test(merchantOrText);
        }
        return normalized.includes(kw);
      })
    ) {
      return category as any;
    }
  }

  return 'Food'; // Default everyday category for UPI payments
}

// Regex patterns to extract amounts from notification text
const AMOUNT_REGEX = /(?:₹|rs\.?|inr)\s*([0-9]+(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?)/i;
const REVERSE_AMOUNT_REGEX = /([0-9]+(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?)\s*(?:₹|rs\.?|inr)\b/i;
const DEBIT_REGEX = /(?:paid|debited|sent|transferred|spent|payment of|transfer of|withdrawn|dr)\s*(?::|-)?\s*(?:to\s+|by\s+|with\s+|for\s+)?(?:₹|rs\.?|inr)?\s*([0-9]+(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?)/i;

// Regex to extract merchant/payee name
const MERCHANT_REGEX = /(?:to|at|towards|vpa\s+)\s*([A-Za-z0-9\s&'.@_-]+?)(?:\s+successful|\s+using|\s+from|\s+on|\s+ref|\s+upi|\.|\,|$)/i;

// Strictly block promotional, marketing, investment, loan, and spam notifications from banks
const PROMOTIONAL_OR_SPAM_REGEX = /(?:invest|investing|mutual funds?|sip\b|pre-approved|apply for|loan\b|quick loan|instant loan|start with just|starting at|terms and conditions|\bt&c\b|t&c apply|scratch card|cashback of up to|win up to|save up to|congratulations|reward points?|voucher|coupon|gift card|hurry\b|limited period|due date|bill generated|statement for|statement generated|otp\b|one time password|verification code|credit limit)/i;

// Strictly block UPI mandate requests, IPO block requests, collect requests, and conditional/future debits
const MANDATE_OR_REQUEST_REGEX = /(?:approve\b|mandate request|block request|collect request|payment request|has requested|requested by|requested from|on approval|will be debited|to be debited|would be debited|scheduled to be debited|to be deducted|will be deducted)/i;

// Detect explicit debit actions - a notification MUST confirm an actual payment/debit to be recorded as an expense
const DEBIT_ACTION_REGEX = /(?:paid|debited|sent|transferred|spent|payment of|transfer of|withdrawn|\bdr\.?\b)/i;

// Detect incoming credit/deposit/income notifications
const INCOMING_CREDIT_REGEX = /(?:credited|credit\b|deposited|received|refund|cashback|added to (?:wallet|a\/c|account))/i;
const EXPLICIT_DEBIT_CONFIRMATION = /(?:debited|paid|spent|withdrawn|\bdr\.?\b)/i;

// Indian Telecom Regulatory Authority (TRAI) SMS sender pattern (e.g. JK-BOBSMS-S, AX-KOTAKB-S, VK-HDFCBK)
const TELECOM_HEADER_REGEX = /^[A-Z]{2}-?[A-Z0-9]{4,10}(?:-[A-Z])?$/i;

const BANK_SENDER_NAMES: Record<string, string> = {
  BOB: 'Bank of Baroda',
  BARODA: 'Bank of Baroda',
  KOTAK: 'Kotak Bank',
  HDFC: 'HDFC Bank',
  SBI: 'State Bank of India',
  ICICI: 'ICICI Bank',
  AXIS: 'Axis Bank',
  PNB: 'Punjab National Bank',
  CANARA: 'Canara Bank',
  CANBNK: 'Canara Bank',
  UNION: 'Union Bank',
  IDFC: 'IDFC FIRST Bank',
  PAYTM: 'Paytm Payments Bank',
  AIRTEL: 'Airtel Payments Bank',
  JIO: 'Jio Payments Bank',
  YES: 'Yes Bank',
  INDUS: 'IndusInd Bank',
};

export function cleanTelecomSender(header: string): string {
  if (!header) return '';
  const trimmed = header.trim();
  if (TELECOM_HEADER_REGEX.test(trimmed)) {
    const upper = trimmed.toUpperCase();
    for (const [key, bankName] of Object.entries(BANK_SENDER_NAMES)) {
      if (upper.includes(key)) {
        return bankName;
      }
    }
    return 'Bank SMS';
  }
  return trimmed;
}

// In-memory cache of recent transactions across all packages for 15-second cross-app deduplication
interface RecentTx {
  amount: number;
  merchant: string;
  packageName: string;
  timestamp: number;
}
const recentTransactions: RecentTx[] = [];

export function isDuplicateTransaction(amount: number, merchant: string, packageName: string): boolean {
  const now = Date.now();

  // 1. Prune records older than 30 seconds
  for (let i = recentTransactions.length - 1; i >= 0; i--) {
    if (now - recentTransactions[i].timestamp > 30000) {
      recentTransactions.splice(i, 1);
    }
  }

  // 2. Cross-app 15-second deduplication:
  // When a user pays via UPI, PhonePe/GPay sends a notification and the bank sends an SMS within 1-5 seconds.
  // Both contain the exact same amount. A user cannot make two separate valid payments for the exact same amount in < 15 seconds.
  const duplicate = recentTransactions.find((tx) => {
    const isSameAmount = Math.abs(tx.amount - amount) < 0.01;
    const isRecent = now - tx.timestamp < 15000;
    return isSameAmount && isRecent;
  });

  if (duplicate) {
    return true; // Duplicate suppressed!
  }

  recentTransactions.push({
    amount,
    merchant,
    packageName,
    timestamp: now,
  });

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

  // 3. HARD STOP: Strictly ignore promotional ads, mutual fund marketing, loans, offers, and T&C alerts
  if (PROMOTIONAL_OR_SPAM_REGEX.test(combined)) {
    return null;
  }

  // 4. HARD STOP: Strictly ignore UPI mandate requests, IPO block requests, collect requests, and future debit notifications
  // E.g. "Approve your IPO mandate", "UPI mandate request of ₹14973", "will be debited upon approval" -> ignore!
  if (MANDATE_OR_REQUEST_REGEX.test(combined)) {
    return null;
  }

  // 5. HARD STOP: Ignore incoming credit/deposit/refund/cashback notifications (income is not an expense)
  // E.g. "A/c credited with INR 2.00 by transfer from DIGVIJAY" -> ignore!
  if (INCOMING_CREDIT_REGEX.test(combined) && !EXPLICIT_DEBIT_CONFIRMATION.test(combined)) {
    return null;
  }

  // 6. HARD STOP: Must contain a genuine debit/payment confirmation action
  if (!DEBIT_ACTION_REGEX.test(combined)) {
    return null;
  }

  // 6. ALLOWED APPS ONLY: Only process notifications from UPI, SMS, or Bank apps
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
  } else if (packageName.includes('dreamplug') || /\bcred\b/i.test(combined)) {
    // Strict word boundary ensures 'credited' is not treated as 'CRED' app
    sourceApp = 'CRED';
  } else if (packageName.includes('npci.upiapp') || /bhim/i.test(combined)) {
    sourceApp = 'BHIM';
  } else if (/bank|debited|a\/c|acct|sms|vpa|baroda|sbi|hdfc|icici|kotak|axis/i.test(combined)) {
    sourceApp = 'Bank SMS';
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

  // Clean and sanitize telecom sender IDs (e.g. JK-BOBSMS-S -> Bank of Baroda, AX-KOTAKB-S -> Kotak Bank)
  if (merchant && TELECOM_HEADER_REGEX.test(merchant)) {
    merchant = cleanTelecomSender(merchant);
  }

  if (!merchant) {
    const cleanTitle = cleanTelecomSender(title);
    merchant = cleanTitle && !cleanTitle.toLowerCase().includes('paid') ? cleanTitle : `${sourceApp} Payment`;
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
