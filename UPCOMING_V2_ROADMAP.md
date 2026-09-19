# CapiTrack v2: Product & Architectural Roadmap

> **Target Horizon:** Phase 2 (v2.0)  
> **Core Focus:** Advanced Financial Automation, Zero-Cost Push Engines, OLED Dark Theme & Pro-Tier Utility.

---

## 1. Free EMI & Credit Card Reminders Engine (Zero SMS / Zero SaaS Cost)

### Technical Architecture
- **Engine**: Local Scheduled Notifications via `expo-notifications`.
- **Zero Cost Model**: 100% on-device scheduling with the phone's native Alarm/WorkManager subsystems. No Twilio, no Fast2SMS, and no recurring cloud notification costs.
- **Works Offline**: Fires reliably even with airplane mode or no internet connection.

### User Flow & Capabilities
1. **Dedicated Bill & EMI Hub**:
   - Easily accessible from Profile or Expenses tab.
   - Supports **Loan EMIs** (Home, Car, Personal, Education) and **Credit Cards** (HDFC, SBI, ICICI, Axis, Amex).
2. **Smart Due Date Alerts**:
   - Configurable alert timings:
     - **3 days before**: Early heads-up for bank balance arrangement.
     - **1 day before at 10:00 AM**: Urgent reminder.
     - **On the Due Date at 9:00 AM**: Final settlement prompt.
3. **Interactive Actions**:
   - Directly tap **"Mark as Paid"** from the push notification or in-app to automatically log it as an expense under the **Bills / EMI** category.
4. **Native Calendar Sync** *(Optional)*:
   - Export reminders directly into Google Calendar or Apple Calendar using `expo-calendar`.

---

## 2. Deep Obsidian Dark Mode (OLED Optimized)

### Visual Design System
- **Palette**:
  - Background: Deep Obsidian `#0E1110` (true black for battery saving on OLED screens).
  - Surface/Cards: Matte Pine `#161D18` with subtle emerald line borders `#243328`.
  - Primary Accent: Neon Moss `#34D399` / `#10B981`.
  - Danger/Deficit: Soft Coral `#F87171`.
- **Theme Modes**:
  - **Light Mode** (Clean Swiss editorial paper aesthetic).
  - **Dark Mode** (Sleek dark financial terminal).
  - **System Default** (Automatically adapts to Android/iOS system settings).

---

## 3. "Link with Google" & Cloud Account Recovery (Zero-Friction Auth)

### Problem it Solves in v2
- In v1, CapiTrack uses seamless **Device ID Isolation** (`deviceId`), which requires zero sign-up friction, zero passwords, and zero OTPs.
- However, if a user uninstalls the app, gets a new phone, or wants to sync between a phone and tablet, they need a safe way to preserve and restore their finances.

### Technical Architecture & Capabilities
1. **1-Tap "Link with Google Account"**:
   - Uses native Google Identity Services (`@react-native-google-signin/google-signin` / Expo AuthSession).
   - Seamlessly associates the user's existing device data to their verified Google profile (`email`, `googleId`, `avatarUrl`) without creating duplicates.
   - Preserves all previous expenses, contacts, and client projects intact.
2. **Instant Cross-Device Restore & Sync**:
   - Fresh install on a new phone $\rightarrow$ Tap **"Continue with Google"** $\rightarrow$ Instantly restores the complete khata history and expense logs from the cloud.
3. **Private Google Drive Auto-Backups**:
   - Optional periodic automated backup (daily/weekly) to the user's private Google Drive (`appDataFolder`).
   - Zero SaaS hosting cost for the developer; 100% end-to-end data privacy for the user.
4. **Google Calendar Auto-Sync for EMIs**:
   - One-tap sync of loan EMI and credit card bill due dates into Google Calendar with native reminder notifications.

---

## 4. Multi-Bank SMS Auto-Capture Expansion

- **Current State**: Tested with standard UPI debit alerts.
- **v2 Expansion**:
  - **Credit Card Swipes**: Detects transactions like *"Spent Rs 3,499 on HDFC Card xx4120 at CROMA"*.
  - **Bank Inflow Recognition**: Distinguishes between credit alerts (salary, client payments) and debit alerts (UPI, card, ATM withdrawal).
  - **Supported Banks**: SBI, HDFC, ICICI, Axis, Kotak, Bank of Baroda, PNB, IndusInd, and wallets (Paytm, PhonePe, Google Pay).

---

## 5. One-Tap CA Reports & Tax Statement Export (PDF / Excel)

- **Freelance Invoices & Receipts**:
  - Generate professional PDF receipts for client milestone payments with custom branding.
- **Tax & Expense Statements**:
  - Filter by Financial Year (e.g., April 1 to March 31).
  - Export structured CSV / Excel files with category tags for Chartered Accountants (CA) and tax filing.

---

## 6. Split Expense / Group Khata Engine

- When adding an expense (e.g. ₹2,400 at a restaurant):
  - Tap **"Split with Friends"**.
  - Select 2 or 3 contacts from your Ledger.
  - Automatically splits the bill and updates everyone's "Owed to You" balance in one tap!

---

## 7. Biometric App Lock (Fingerprint & Face ID)

- Secure private khata records and financial details.
- Implemented using `expo-local-authentication`.
- Instant unlock via Android Fingerprint / Face Unlock with PIN fallback.

---

## 8. Encrypted Cross-Device Pairing (No Password Required)

- In addition to Google Sign-In:
  - Generate a secure, short-lived **Pairing QR Code** on Phone A.
  - Scan with Phone B to instantly link both devices to the same financial workspace.
