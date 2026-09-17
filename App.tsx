import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Fraunces_500Medium,
  Fraunces_600SemiBold,
} from '@expo-google-fonts/fraunces';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
  IBMPlexMono_600SemiBold,
} from '@expo-google-fonts/ibm-plex-mono';

import { useAppStore } from './src/store/useAppStore';
import { Colors } from './src/theme/colors';

// First-run screens
import { SplashScreen } from './src/screens/FirstRun/SplashScreen';
import { LanguageSelectScreen } from './src/screens/FirstRun/LanguageSelectScreen';
import { OnboardingScreen } from './src/screens/FirstRun/OnboardingScreen';

// Main tab screens
import { HomeScreen } from './src/screens/Home/HomeScreen';
import { ExpenseHistoryScreen } from './src/screens/Expenses/ExpenseHistoryScreen';
import { LedgerListScreen } from './src/screens/Ledger/LedgerListScreen';
import { InsightsScreen } from './src/screens/Insights/InsightsScreen';
import { SettingsScreen } from './src/screens/Settings/SettingsScreen';

// Nav & Modals
import { FloatingNavBar } from './src/components/FloatingNavBar';
import { AddExpenseModal } from './src/screens/Expenses/AddExpenseModal';
import { EditExpenseModal } from './src/screens/Expenses/EditExpenseModal';
import { AddLedgerEntryModal } from './src/screens/Ledger/AddLedgerEntryModal';
import { PersonDetailModal } from './src/screens/Ledger/PersonDetailModal';
import { AutomationModal } from './src/screens/Automation/AutomationModal';
import { ManageCategoriesModal } from './src/screens/Settings/ManageCategoriesModal';
import { AutoCaptureNudge } from './src/components/AutoCaptureNudge';
import { notificationListener } from './src/services/notificationListener';

export default function App() {
  const [fontsLoaded] = useFonts({
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
  });

  const firstRunStep = useAppStore((state) => state.firstRunStep);
  const activeTab = useAppStore((state) => state.activeTab);
  const activeModal = useAppStore((state) => state.activeModal);
  const loadInitialData = useAppStore((state) => state.loadInitialData);

  React.useEffect(() => {
    loadInitialData();
    notificationListener.init();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.moss} />
      </View>
    );
  }

  // 1. First-Run flow (Splash -> Language selection -> Onboarding)
  if (firstRunStep === 'splash') {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <SplashScreen />
      </SafeAreaProvider>
    );
  }

  if (firstRunStep === 'language') {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <LanguageSelectScreen />
      </SafeAreaProvider>
    );
  }

  if (firstRunStep === 'onboarding') {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <OnboardingScreen />
      </SafeAreaProvider>
    );
  }

  // 2. Main Dashboard & Tab Switcher
  const renderCurrentTab = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'expenses':
        return <ExpenseHistoryScreen />;
      case 'ledger':
        return <LedgerListScreen />;
      case 'insights':
        return <InsightsScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <View style={styles.appContainer}>
        {renderCurrentTab()}
        <FloatingNavBar />

        {/* Global Modals & Nudges */}
        <AddExpenseModal />
        <EditExpenseModal />
        <AddLedgerEntryModal />
        <PersonDetailModal />
        <AutomationModal />
        <ManageCategoriesModal />
        <AutoCaptureNudge />

        {/* Modal-mode Language selector if opened from Settings */}
        {activeModal === 'language_select' && <LanguageSelectScreen />}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appContainer: {
    flex: 1,
    backgroundColor: Colors.mist,
  },
});
