import { useAppStore } from '../store/useAppStore';

export type LanguageCode = 'en' | 'hi' | 'mr';

export const TRANSLATIONS = {
  en: {
    // Navigation
    navHome: 'Home',
    navExpenses: 'Expenses',
    navLedger: 'Ledger',
    navInsights: 'Insights',
    navSettings: 'Settings',

    // Greetings
    greetingMorning: 'Good morning',
    greetingAfternoon: 'Good afternoon',
    greetingEvening: 'Good evening',

    // Home Dashboard
    spentToday: 'SPENT TODAY',
    vsYesterday: 'vs yesterday',
    insightEyebrow: 'INSIGHT',
    defaultInsight: 'Track your daily expenses and udhaar to see smart spending insights here.',
    seeBreakdown: 'See breakdown',
    owedToYou: 'Owed to you',
    youOwe: 'You owe',
    todaysActivity: "TODAY'S ACTIVITY",
    viewAll: 'View all ›',
    noExpensesToday: 'No expenses logged today yet. Tap here or + to add one!',
    editYourName: 'Edit Your Name',
    yourName: 'Your name',
    save: 'Save',
    cancel: 'Cancel',

    // Expenses
    thisMonth: 'THIS MONTH',
    expensesTitle: 'Expenses',
    dayToday: 'Today',
    dayYesterday: 'Yesterday',
    dayEarlier: 'Earlier',
    newEntry: 'NEW ENTRY',
    addExpense: 'Add expense',
    amountLabel: '₹ amount',
    noteExpensePlaceholder: 'e.g. Lunch with team, Chai, Groceries',
    saveExpense: 'Save expense',

    // Ledger
    udhaarKhata: 'UDHAAR KHATA',
    ledgerTitle: 'Ledger',
    youWillReceive: "You'll receive",
    youOweKhata: 'You owe',
    lastPrefix: 'Last:',
    statusPending: 'pending',
    statusSettled: 'settled',
    addToLedger: 'Add to ledger',
    personLabel: 'PERSON',
    personPlaceholder: 'e.g. Akssh, Anurag, Sahil',
    iLent: 'I lent',
    iBorrowed: 'I borrowed',
    noteOptional: 'NOTE (OPTIONAL)',
    noteLedgerPlaceholder: 'e.g. Rent split, dinner bill, cab fare',
    saveEntry: 'Save entry',
    owesYouText: 'owes you',
    allSettledUp: 'All settled up',
    youOweText: 'you owe',
    transactionHistory: 'TRANSACTION HISTORY',
    noEntriesYet: 'No entries yet',
    addTxn: 'Add txn',
    markSettled: 'Mark settled',
    settledFullBalance: 'Settled full balance',

    // Insights & Monthly Tracker
    spendBreakdown: 'SPEND BREAKDOWN',
    insightsTitle: 'Insights',
    monthlyTracker: 'Monthly Tracker',
    totalMonthlySpend: 'TOTAL SPENT',
    dailyAvg: 'Daily average',
    topCategoryLabel: 'Top category',
    vsPrevMonth: 'vs last month',
    trend6Months: '6-Month Trend',
    weeklyFlow: 'Weekly Flow',
    weekPrefix: 'Week',
    monthTransactions: 'transactions',
    monthActivity: 'MONTH ACTIVITY',
    noExpensesThisMonth: 'No expenses recorded for this month.',
    logFirstExpense: '+ Add expense for this month',
    currentMonthBadge: 'Current',
    perDay: '/ day',
    baselineLabel: 'Baseline',
    selectMonthPrompt: 'Select Month',
    insightsTabPersonal: '📊 Personal Spends',
    insightsTabRevenue: '💼 Freelance Revenue',
    revenueCollected: 'REVENUE COLLECTED',
    netCashflowTitle: 'Net Monthly Cashflow',
    netSurplus: 'Net Surplus',
    netDeficit: 'Net Deficit',
    freelanceIncome: 'Freelance Inflow',
    personalOutflow: 'Personal Spends',
    savingsRatePct: 'savings rate',
    clientShareTitle: 'Client Revenue Share',
    pipelineTitle: 'Outstanding Receivables',
    milestonesReceived: 'Milestone Receipts',
    noMilestonesThisMonth: 'No milestone payments received in this month.',
    revenueTrend6Months: '6-Month Revenue Trend',

    // Categories
    catFood: 'Food',
    catTravel: 'Travel',
    catGrocery: 'Grocery',
    catFun: 'Fun',
    catHealth: 'Health',
    catShopping: 'Shopping',
    catBills: 'Bills',
    catCustom: 'Other',

    // Settings
    settingsTitle: 'Settings',
    autoCaptureTitle: 'Auto-capture',
    autoCaptureSub: 'Notification listener',
    autoCaptureActive: 'Active, listening for UPI',
    autoCaptureOff: 'Disabled, notifications ignored',
    testPhonePe: 'Simulate PhonePe Payment (₹50)',
    testGPay: 'Simulate Google Pay (₹240)',
    permissionGuide: 'Notification Permission Guide',
    autoCaptureDisabledAlert: 'Auto-capture is disabled. Turn it on above to test nudges.',
    darkModeTitle: 'Dark mode',
    darkModeSub: 'Coming soon',
    manageCategoriesTitle: 'Manage categories',
    activeCategoriesCount: '{count} active categories',
    exportDataTitle: 'Export data (CSV)',
    exportDataSub: 'Download your history',
    appLanguageTitle: 'App language',
    changeGhost: 'Change ›',
    editGhost: 'Edit ›',
    exportGhost: 'Export ›',
    previewTesting: 'PREVIEW & TESTING',
    replayFirstRun: 'Replay First-Run / Splash & Onboarding',
    exportAlertTitle: 'Export CSV',
    exportAlertMsg: 'Expenses & Ledger entries successfully prepared for export.',

    // Manage Categories Modal
    manageCatTitle: 'Manage Categories',
    manageCatDesc: 'Enable or disable categories, or add your own custom ones for tracking.',
    addNewCategory: 'Add New Category',
    catNamePlaceholder: 'e.g. Gym, Fuel, Books, Coffee',
    addBtn: 'Add',
    doneBtn: 'Done',
    activeTag: 'Active',
    inactiveTag: 'Hidden',

    // Language Select Screen
    languageHeaderEyebrow: 'Language / भाषा',
    chooseLanguageTitle: 'Choose language',
    chooseLanguageSub: 'Select your preferred language. You can change this anytime in Settings.',
    continueBtn: 'Continue',

    // Onboarding
    onboarding1Title: 'Log expenses the way you already think in',
    onboarding1Desc: '"Day 1: ₹20, Day 2: ₹40." No friction, just tap a category and your spend is saved.',
    onboarding2Title: 'Never forget who owes who',
    onboarding2Desc: 'Keep an active khata for every friend. Settle balances anytime, partial or full.',
    onboardingCombinedTitle: 'Track Expenses & Settle Khata',
    onboardingCombinedDesc: 'Log daily spends with zero friction and keep an active Khata for every friend to settle balances anytime.',
    onboardingModeTitle: 'How will you use CapiTrack?',
    onboardingModeDesc: 'Choose your workflow. You can change this anytime later in Settings.',
    modeBothTitle: 'Personal + Freelance Projects',
    modeBothBadge: 'RECOMMENDED',
    modeBothDesc: 'Track daily expenses & split bills + website client deals, milestone payments & dues.',
    modePersonalTitle: 'Personal Expenses Only',
    modePersonalDesc: 'Focus purely on daily personal spends, monthly budgets & simple expense sharing with friends.',
    onboarding3Title: "Insights that actually matter",
    onboarding3Desc: 'See monthly trends, weekly flow, and spending patterns clearly at a glance.',
    onboardingAutoCaptureTitle: 'Smart Auto-Capture',
    onboardingAutoCaptureDesc: 'Detect UPI payment notifications (Google Pay, PhonePe, Paytm) automatically with zero manual typing.',
    autoCaptureOffNotice: 'Off by default. You can enable it now or turn it on anytime in Settings.',
    enableAutoCaptureLabel: 'Enable Auto-Capture',
    autoCaptureStatusOff: 'Disabled (Default)',
    autoCaptureStatusOn: 'Enabled',
    privateOnDeviceNote: '🔒 100% on-device & private. Nothing is uploaded.',
    whatShouldWeCallYou: 'What should we call you?',
    nameSubDesc: 'Your name is used to personalize your dashboard and Khata notes.',
    enterNamePlaceholder: 'e.g. Digvijay, Rahul',
    getStartedBtn: 'Get started',
    nextBtn: 'Next',
    skipBtn: 'Skip',
  },

  hi: {
    // Navigation
    navHome: 'होम',
    navExpenses: 'खर्च',
    navLedger: 'खाता',
    navInsights: 'विश्लेषण',
    navSettings: 'सेटिंग्स',

    // Greetings
    greetingMorning: 'सुप्रभात',
    greetingAfternoon: 'शुभ दोपहर',
    greetingEvening: 'शुभ संध्या',

    // Home Dashboard
    spentToday: 'आज का खर्च',
    vsYesterday: 'कल की तुलना में',
    insightEyebrow: 'सुझाव',
    defaultInsight: 'स्मार्ट खर्च विश्लेषण देखने के लिए अपने दैनिक खर्च और उधार ट्रैक करें।',
    seeBreakdown: 'विस्तार देखें',
    owedToYou: 'आपको मिलेंगे',
    youOwe: 'आपको देने हैं',
    todaysActivity: 'आज की गतिविधि',
    viewAll: 'सभी देखें ›',
    noExpensesToday: 'आज कोई खर्च दर्ज नहीं हुआ। जोड़ने के लिए यहां या + दबाएं!',
    editYourName: 'अपना नाम बदलें',
    yourName: 'आपका नाम',
    save: 'सुरक्षित करें',
    cancel: 'रद्द करें',

    // Expenses
    thisMonth: 'इस महीने',
    expensesTitle: 'खर्च',
    dayToday: 'आज',
    dayYesterday: 'कल',
    dayEarlier: 'पहले',
    newEntry: 'नई प्रविष्टि',
    addExpense: 'खर्च जोड़ें',
    amountLabel: '₹ राशि',
    noteExpensePlaceholder: 'उदा. टीम के साथ लंच, चाय, राशन',
    saveExpense: 'खर्च सुरक्षित करें',

    // Ledger
    udhaarKhata: 'उधार खाता',
    ledgerTitle: 'खाता',
    youWillReceive: 'आपको मिलेंगे',
    youOweKhata: 'आपको देने हैं',
    lastPrefix: 'अंतिम:',
    statusPending: 'बाकी',
    statusSettled: 'चुकता',
    addToLedger: 'खाते में जोड़ें',
    personLabel: 'व्यक्ति',
    personPlaceholder: 'उदा. अक्ष, अनुराग, साहिल',
    iLent: 'मैंने दिए',
    iBorrowed: 'मैंने लिए',
    noteOptional: 'विवरण (वैकल्पिक)',
    noteLedgerPlaceholder: 'उदा. किराए का हिस्सा, डिनर बिल, कैब',
    saveEntry: 'प्रविष्टि जोड़ें',
    owesYouText: 'बाकी हैं',
    allSettledUp: 'हिसाब चुकता',
    youOweText: 'देने हैं',
    transactionHistory: 'लेनदेन का इतिहास',
    noEntriesYet: 'अभी कोई प्रविष्टि नहीं',
    addTxn: 'लेनदेन जोड़ें',
    markSettled: 'हिसाब चुकता करें',
    settledFullBalance: 'पूरा हिसाब चुकता किया',

    // Insights & Monthly Tracker
    spendBreakdown: 'खर्च का विवरण',
    insightsTitle: 'विश्लेषण',
    monthlyTracker: 'मासिक ट्रैकर',
    totalMonthlySpend: 'कुल खर्च',
    dailyAvg: 'दैनिक औसत',
    topCategoryLabel: 'शीर्ष श्रेणी',
    vsPrevMonth: 'पिछले महीने की तुलना में',
    trend6Months: '6 महीने का ट्रेंड',
    weeklyFlow: 'साप्ताहिक प्रवाह',
    weekPrefix: 'सप्ताह',
    monthTransactions: 'लेनदेन',
    monthActivity: 'महीने की गतिविधि',
    noExpensesThisMonth: 'इस महीने के लिए कोई खर्च दर्ज नहीं है।',
    logFirstExpense: '+ इस महीने का खर्च जोड़ें',
    currentMonthBadge: 'वर्तमान',
    perDay: '/ दिन',
    baselineLabel: 'प्रारंभिक',
    selectMonthPrompt: 'महीना चुनें',
    insightsTabPersonal: '📊 व्यक्तिगत खर्च',
    insightsTabRevenue: '💼 फ्रीलांस आय',
    revenueCollected: 'कुल प्राप्त आय',
    netCashflowTitle: 'मासिक शुद्ध कैशफ्लो',
    netSurplus: 'शुद्ध बचत',
    netDeficit: 'घाटा',
    freelanceIncome: 'फ्रीलांस आय',
    personalOutflow: 'व्यक्तिगत खर्च',
    savingsRatePct: 'बचत दर',
    clientShareTitle: 'क्लाइंट अनुसार आय हिस्सा',
    pipelineTitle: 'बकाया राशि पाइपलाइन',
    milestonesReceived: 'प्राप्त माइलस्टोन रसीदें',
    noMilestonesThisMonth: 'इस महीने कोई माइलस्टोन भुगतान प्राप्त नहीं हुआ।',
    revenueTrend6Months: '6 महीने का आय ट्रेंड',

    // Categories
    catFood: 'खाना',
    catTravel: 'सफ़र',
    catGrocery: 'राशन',
    catFun: 'मनोरंजन',
    catHealth: 'स्वास्थ्य',
    catShopping: 'खरीदारी',
    catBills: 'बिल',
    catCustom: 'अन्य',

    // Settings
    settingsTitle: 'सेटिंग्स',
    autoCaptureTitle: 'ऑटो-कैप्चर',
    autoCaptureSub: 'नोटिफिकेशन लिसनर',
    autoCaptureActive: 'सक्रिय, UPI भुगतान के लिए तैयार',
    autoCaptureOff: 'बंद, नोटिफिकेशन अनदेखा',
    testPhonePe: 'PhonePe भुगतान टेस्ट करें (₹50)',
    testGPay: 'Google Pay टेस्ट करें (₹240)',
    permissionGuide: 'नोटिफिकेशन अनुमति गाइड',
    autoCaptureDisabledAlert: 'ऑटो-कैप्चर बंद है। टेस्ट करने के लिए इसे ऊपर चालू करें।',
    darkModeTitle: 'डार्क मोड',
    darkModeSub: 'जल्द आ रहा है',
    manageCategoriesTitle: 'श्रेणियां प्रबंधित करें',
    activeCategoriesCount: '{count} श्रेणियां सक्रिय',
    exportDataTitle: 'डेटा निर्यात करें (CSV)',
    exportDataSub: 'अपना इतिहास डाउनलोड करें',
    appLanguageTitle: 'ऐप की भाषा',
    changeGhost: 'बदलें ›',
    editGhost: 'बदलें ›',
    exportGhost: 'निर्यात ›',
    previewTesting: 'पूर्वावलोकन व परीक्षण',
    replayFirstRun: 'स्प्लैश व ऑनबोर्डिंग पुनः देखें',
    exportAlertTitle: 'CSV निर्यात',
    exportAlertMsg: 'खर्च और खाता प्रविष्टियां निर्यात के लिए तैयार हैं।',

    // Manage Categories Modal
    manageCatTitle: 'श्रेणियां प्रबंधित करें',
    manageCatDesc: 'श्रेणियों को चालू या बंद करें, या अपनी नई श्रेणी जोड़ें।',
    addNewCategory: 'नई श्रेणी जोड़ें',
    catNamePlaceholder: 'उदा. जिम, पेट्रोल, कॉफी',
    addBtn: 'जोड़ें',
    doneBtn: 'पूर्ण',
    activeTag: 'सक्रिय',
    inactiveTag: 'छिपा हुआ',

    // Language Select Screen
    languageHeaderEyebrow: 'भाषा / LANGUAGE',
    chooseLanguageTitle: 'भाषा चुनें',
    chooseLanguageSub: 'अपनी पसंदीदा भाषा चुनें। आप इसे सेटिंग्स में कभी भी बदल सकते हैं।',
    continueBtn: 'आगे बढ़ें',

    // Onboarding
    onboarding1Title: 'अपने सहज अंदाज़ में खर्च दर्ज करें',
    onboarding1Desc: '"दिन 1: ₹20, दिन 2: ₹40।" कोई झंझट नहीं, बस श्रेणी चुनें और खर्च दर्ज करें।',
    onboarding2Title: 'उधार-लेनदेन का हिसाब कभी न भूलें',
    onboarding2Desc: 'हर दोस्त का खाता रखें और कभी भी आंशिक या पूरा हिसाब चुकता करें।',
    onboardingCombinedTitle: 'दैनिक खर्च और उधार खाता',
    onboardingCombinedDesc: 'बिना किसी झंझट के दैनिक खर्च दर्ज करें और दोस्तों के साथ उधार-लेनदेन का पूरा हिसाब रखें।',
    onboardingModeTitle: 'आप CapiTrack का उपयोग कैसे करेंगे?',
    onboardingModeDesc: 'अपनी कार्यप्रणाली चुनें। इसे आप बाद में सेटिंग्स में कभी भी बदल सकते हैं।',
    modeBothTitle: 'व्यक्तिगत + फ्रीलांस प्रोजेक्ट्स',
    modeBothBadge: 'अनुशंसित',
    modeBothDesc: 'दैनिक खर्च और दोस्तों का उधार + वेबसाइट क्लाइंट डील्स, माइलस्टोन पेमेंट्स और बकाया राशि।',
    modePersonalTitle: 'केवल व्यक्तिगत खर्च',
    modePersonalDesc: 'केवल दैनिक व्यक्तिगत खर्च, मासिक बजट और दोस्तों के साथ सामान्य खर्च शेयरिंग पर ध्यान दें।',
    onboarding3Title: 'सटीक और स्पष्ट विश्लेषण',
    onboarding3Desc: 'मासिक ट्रेंड, साप्ताहिक खर्च और अपनी बचत को एक नज़र में स्पष्ट देखें।',
    onboardingAutoCaptureTitle: 'स्मार्ट ऑटो-कैप्चर',
    onboardingAutoCaptureDesc: 'यूपीआई भुगतान (गूगल पे, फोनपे, पेटीएम) को स्वचालित रूप से पहचानें, बिना किसी मैन्युअल टाइपिंग के।',
    autoCaptureOffNotice: 'डिफ़ॉल्ट रूप से बंद है। आप इसे अभी या बाद में सेटिंग्स में कभी भी चालू कर सकते हैं।',
    enableAutoCaptureLabel: 'ऑटो-कैप्चर चालू करें',
    autoCaptureStatusOff: 'बंद है (डिफ़ॉल्ट)',
    autoCaptureStatusOn: 'सक्रिय',
    privateOnDeviceNote: '🔒 100% डिवाइस पर सुरक्षित। कुछ भी अपलोड नहीं होता।',
    whatShouldWeCallYou: 'हम आपको क्या बुलाएं?',
    nameSubDesc: 'आपका नाम डैशबोर्ड और खाता नोट्स को आपके अनुरूप बनाने में काम आता है।',
    enterNamePlaceholder: 'उदा. दिग्विजय, राहुल',
    getStartedBtn: 'शुरू करें',
    nextBtn: 'अगला',
    skipBtn: 'छोड़ें',
  },

  mr: {
    // Navigation
    navHome: 'मुख्यपृष्ठ',
    navExpenses: 'खर्च',
    navLedger: 'खाते',
    navInsights: 'विश्लेषण',
    navSettings: 'सेटिंग्ज',

    // Greetings
    greetingMorning: 'शुभ प्रभात',
    greetingAfternoon: 'शुभ दुपार',
    greetingEvening: 'शुभ संध्याकाळ',

    // Home Dashboard
    spentToday: 'आजचा खर्च',
    vsYesterday: 'कालच्या तुलनेत',
    insightEyebrow: 'महत्त्वाची नोंद',
    defaultInsight: 'स्मार्ट खर्च विश्लेषण पाहण्यासाठी तुमचे दैनंदिन खर्च आणि उधार ट्रॅक करा.',
    seeBreakdown: 'तपशील पहा',
    owedToYou: 'तुम्हाला मिळतील',
    youOwe: 'तुम्हाला द्यायचे आहेत',
    todaysActivity: 'आजची नोंद',
    viewAll: 'सर्व पहा ›',
    noExpensesToday: 'आज कोणताही खर्च नोंदवला नाही. जोडण्यासाठी येथे किंवा + टॅप करा!',
    editYourName: 'आपले नाव बदला',
    yourName: 'तुमचे नाव',
    save: 'सेव्ह करा',
    cancel: 'रद्द करा',

    // Expenses
    thisMonth: 'या महिन्यात',
    expensesTitle: 'खर्च',
    dayToday: 'आज',
    dayYesterday: 'काल',
    dayEarlier: 'पूर्वी',
    newEntry: 'नवीन नोंद',
    addExpense: 'खर्च जोडा',
    amountLabel: '₹ रक्कम',
    noteExpensePlaceholder: 'उदा. मित्रांसोबत जेवण, किराणा, प्रवास',
    saveExpense: 'खर्च सेव्ह करा',

    // Ledger
    udhaarKhata: 'उधार खाते',
    ledgerTitle: 'खाते',
    youWillReceive: 'तुम्हाला मिळतील',
    youOweKhata: 'तुम्हाला द्यायचे आहेत',
    lastPrefix: 'शेवटचे:',
    statusPending: 'बाकी',
    statusSettled: 'पूर्ण',
    addToLedger: 'खात्यात जोडा',
    personLabel: 'व्यक्ती',
    personPlaceholder: 'उदा. अक्ष, अनुराग, साहिल',
    iLent: 'मी दिले',
    iBorrowed: 'मी घेतले',
    noteOptional: 'नोंद (ऐच्छिक)',
    noteLedgerPlaceholder: 'उदा. घराचे भाडे, जेवणाचे बिल, प्रवास',
    saveEntry: 'नोंद जोडा',
    owesYouText: 'बाकी आहेत',
    allSettledUp: 'हिशोब पूर्ण',
    youOweText: 'द्यायचे आहेत',
    transactionHistory: 'व्यवहारांचा इतिहास',
    noEntriesYet: 'अद्याप कोणतीही नोंद नाही',
    addTxn: 'व्यवहार जोडा',
    markSettled: 'हिशोब पूर्ण करा',
    settledFullBalance: 'सर्व हिशोब पूर्ण केला',

    // Insights & Monthly Tracker
    spendBreakdown: 'खर्चाचा तपशील',
    insightsTitle: 'विश्लेषण',
    monthlyTracker: 'मासिक ट्रॅकर',
    totalMonthlySpend: 'एकूण खर्च',
    dailyAvg: 'दैनंदिन सरासरी',
    topCategoryLabel: 'प्रमुख कॅटेगरी',
    vsPrevMonth: 'मागील महिन्याच्या तुलनेत',
    trend6Months: '६ महिन्यांचा ट्रेंड',
    weeklyFlow: 'साप्ताहिक प्रवाह',
    weekPrefix: 'आठवडा',
    monthTransactions: 'व्यवहार',
    monthActivity: 'महिन्याची नोंद',
    noExpensesThisMonth: 'या महिन्यासाठी कोणताही खर्च नोंदवलेला नाही.',
    logFirstExpense: '+ या महिन्याचा खर्च जोडा',
    currentMonthBadge: 'चालू',
    perDay: '/ दिवस',
    baselineLabel: 'प्रारंभिक',
    selectMonthPrompt: 'महिना निवडा',
    insightsTabPersonal: '📊 वैयक्तिक खर्च',
    insightsTabRevenue: '💼 फ्रीलांस उत्पन्न',
    revenueCollected: 'एकूण जमा महसूल',
    netCashflowTitle: 'मासिक निव्वळ कॅशफ्लो',
    netSurplus: 'निव्वळ बचत',
    netDeficit: 'तूट',
    freelanceIncome: 'फ्रीलांस उत्पन्न',
    personalOutflow: 'वैयक्तिक खर्च',
    savingsRatePct: 'बचत दर',
    clientShareTitle: 'क्लायंटनुसार उत्पन्नाचा वाटा',
    pipelineTitle: 'बाकी रक्कम पाइपलाइन',
    milestonesReceived: 'मिळालेल्या टप्प्यांच्या पावत्या',
    noMilestonesThisMonth: 'या महिन्यात कोणतीही पेमेंट मिळालेली नाही.',
    revenueTrend6Months: '६ महिन्यांचा उत्पन्न ट्रेंड',

    // Categories
    catFood: 'जेवण',
    catTravel: 'प्रवास',
    catGrocery: 'किराणा',
    catFun: 'मनोरंजन',
    catHealth: 'आरोग्य',
    catShopping: 'खरेदी',
    catBills: 'बिल',
    catCustom: 'इतर',

    // Settings
    settingsTitle: 'सेटिंग्ज',
    autoCaptureTitle: 'ऑटो-कॅप्चर',
    autoCaptureSub: 'नोटिफिकेशन लिसनर',
    autoCaptureActive: 'सक्रिय, UPI पेमेंटसाठी तयार',
    autoCaptureOff: 'बंद, नोटिफिकेशन दुर्लक्षित',
    testPhonePe: 'PhonePe पेमेंट टेस्ट करा (₹50)',
    testGPay: 'Google Pay टेस्ट करा (₹240)',
    permissionGuide: 'नोटिफिकेशन परवानगी मार्गदर्शक',
    autoCaptureDisabledAlert: 'ऑटो-कॅप्चर बंद आहे. टेस्ट करण्यासाठी वर सुरू करा.',
    darkModeTitle: 'डार्क मोड',
    darkModeSub: 'लवकरच येत आहे',
    manageCategoriesTitle: 'कॅटेगरी व्यवस्थापित करा',
    activeCategoriesCount: '{count} सक्रिय कॅटेगरीज',
    exportDataTitle: 'डेटा एक्सपोर्ट करा (CSV)',
    exportDataSub: 'आपला इतिहास डाउनलोड करा',
    appLanguageTitle: 'ॲपची भाषा',
    changeGhost: 'बदला ›',
    editGhost: 'बदला ›',
    exportGhost: 'एक्सपोर्ट ›',
    previewTesting: 'प्रिव्ह्यू आणि टेस्टिंग',
    replayFirstRun: 'ऑनबोर्डिंग पुन्हा पहा',
    exportAlertTitle: 'CSV एक्सपोर्ट',
    exportAlertMsg: 'खर्च आणि खात्याचा इतिहास एक्सपोर्टसाठी तयार आहे.',

    // Manage Categories Modal
    manageCatTitle: 'कॅटेगरी व्यवस्थापित करा',
    manageCatDesc: 'कॅटेगरीज सुरू किंवा बंद करा, किंवा नवीन सानुकूल कॅटेगरी जोडा.',
    addNewCategory: 'नवीन कॅटेगरी जोडा',
    catNamePlaceholder: 'उदा. जिम, पेट्रोल, कॉफी',
    addBtn: 'जोडा',
    doneBtn: 'पूर्ण',
    activeTag: 'सक्रिय',
    inactiveTag: 'लपवले',

    // Language Select Screen
    languageHeaderEyebrow: 'भाषा / LANGUAGE',
    chooseLanguageTitle: 'भाषा निवडा',
    chooseLanguageSub: 'आपली पसंतीची भाषा निवडा. तुम्ही ही सेटिंग्जमध्ये कधीही बदलू शकता.',
    continueBtn: 'पुढे जा',

    // Onboarding
    onboarding1Title: 'तुमच्या नेहमीच्या सवयीप्रमाणे खर्च नोंदवा',
    onboarding1Desc: '"दिवस १: ₹२०, दिवस २: ₹४०." त्रास नाही, फक्त कॅटेगरी निवडा आणि खर्च नोंदवा.',
    onboarding2Title: 'कोणाचे किती देणे-घेणे आहे ते विसरू नका',
    onboarding2Desc: 'प्रत्येक मित्राचे खाते ठेवा आणि कधीही अर्धवट किंवा पूर्ण हिशोब चुकता करा.',
    onboardingCombinedTitle: 'दैनिक खर्च आणि उधार खाते',
    onboardingCombinedDesc: 'सहजपणे दैनंदिन खर्च नोंदवा आणि मित्रांसोबतच्या देणे-घेण्याचा संपूर्ण हिशोब अचूक ठेवा.',
    onboardingModeTitle: 'तुम्ही CapiTrack चा वापर कसा कराल?',
    onboardingModeDesc: 'तुमचा वर्कफ्लो निवडा. तुम्ही हे नंतर कधीही सेटिंग्जमध्ये बदलू शकता.',
    modeBothTitle: 'वैयक्तिक + फ्रीलांस प्रोजेक्ट्स',
    modeBothBadge: 'शिफारस केलेले',
    modeBothDesc: 'दैनंदिन खर्च आणि मित्रांचे देणे-घेणे + वेबसाइट क्लायंट डील्स, टप्प्याटप्प्याने मिळणारे पेमेंट्स आणि बाकी रक्कम.',
    modePersonalTitle: 'फक्त वैयक्तिक खर्च',
    modePersonalDesc: 'फक्त वैयक्तिक दैनंदिन खर्च, मासिक बजेट आणि मित्रांसोबतच्या साध्या खर्च वाटणीवर लक्ष केंद्रित करा.',
    onboarding3Title: 'स्पष्ट आणि सखोल विश्लेषण',
    onboarding3Desc: 'मासिक ट्रेंड, साप्ताहिक प्रवाह आणि तुमचा खर्च एका दृष्टिक्षेपात सहजपणे समजून घ्या.',
    onboardingAutoCaptureTitle: 'स्मार्ट ऑटो-कॅप्चर',
    onboardingAutoCaptureDesc: 'कोणत्याही मॅन्युअल टायपिंगशिवाय यूपीआय पेमेंट्स (Google Pay, PhonePe, Paytm) आपोआप ओळखा.',
    autoCaptureOffNotice: 'डीफॉल्टनुसार बंद आहे. आपण हे आता किंवा नंतर सेटिंग्जमध्ये कधीही सुरू करू शकता.',
    enableAutoCaptureLabel: 'ऑटो-कॅप्चर सुरू करा',
    autoCaptureStatusOff: 'बंद आहे (डीफॉल्ट)',
    autoCaptureStatusOn: 'सक्रिय',
    privateOnDeviceNote: '🔒 100% डिव्हाइसवर सुरक्षित. काहीही अपलोड केले जात नाही.',
    whatShouldWeCallYou: 'आम्ही तुम्हाला काय म्हणावे?',
    nameSubDesc: 'तुमचे नाव डॅशबोर्ड आणि खात्याची नोंद व्यक्तिगत करण्यासाठी वापरले जाईल.',
    enterNamePlaceholder: 'उदा. दिग्विजय, राहुल',
    getStartedBtn: 'सुरू करा',
    nextBtn: 'पुढील',
    skipBtn: 'वगळा',
  },
};

export type TranslationKey = keyof typeof TRANSLATIONS['en'];

export function getGreetingKey(): 'greetingMorning' | 'greetingAfternoon' | 'greetingEvening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'greetingMorning';
  if (hour < 17) return 'greetingAfternoon';
  return 'greetingEvening';
}

export function translateCategory(categoryKey: string, lang: LanguageCode): string {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  switch (categoryKey.toLowerCase()) {
    case 'food':
      return dict.catFood;
    case 'travel':
      return dict.catTravel;
    case 'grocery':
      return dict.catGrocery;
    case 'fun':
      return dict.catFun;
    case 'health':
      return dict.catHealth;
    case 'shopping':
      return dict.catShopping;
    case 'bills':
      return dict.catBills;
    case 'custom':
    case 'other':
      return dict.catCustom;
    default:
      return categoryKey;
  }
}

export const MONTH_NAMES: Record<LanguageCode, { long: string[]; short: string[] }> = {
  en: {
    long: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },
  hi: {
    long: ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'],
    short: ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुला', 'अग', 'सित', 'अक्तू', 'नव', 'दिस'],
  },
  mr: {
    long: ['जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'],
    short: ['जाने', 'फेब्रु', 'मार्च', 'एप्रि', 'मे', 'जून', 'जुलै', 'ऑग', 'सप्टें', 'ऑक्टो', 'नोव्हें', 'डिसें'],
  },
};

export function getMonthName(month: number, lang: LanguageCode, format: 'short' | 'long' = 'long'): string {
  const idx = Math.max(0, Math.min(11, month - 1));
  const dict = MONTH_NAMES[lang] || MONTH_NAMES.en;
  return dict[format][idx] || MONTH_NAMES.en[format][idx];
}

export function useTranslation() {
  const selectedLanguage = useAppStore((state) => state.selectedLanguage) as LanguageCode;
  const lang: LanguageCode = (selectedLanguage === 'hi' || selectedLanguage === 'mr') ? selectedLanguage : 'en';

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    let str = dict[key] || TRANSLATIONS.en[key] || key;
    if (params) {
      Object.entries(params).forEach(([pKey, pVal]) => {
        str = str.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
      });
    }
    return str;
  };

  const getCategoryName = (categoryKey: string) => translateCategory(categoryKey, lang);
  const getMonth = (month: number, format: 'short' | 'long' = 'long') => getMonthName(month, lang, format);

  return { t, lang, getCategoryName, getMonth };
}
