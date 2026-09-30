import React from 'react';
import { View, StyleSheet, ActivityIndicator, BackHandler, AppState as RNAppState } from 'react-native';
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

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAppStore } from './src/store/useAppStore';
import { Colors } from './src/theme/colors';

// First-run screens
import { SplashScreen } from './src/screens/FirstRun/SplashScreen';
import { LanguageSelectScreen } from './src/screens/FirstRun/LanguageSelectScreen';
import { OnboardingScreen } from './src/screens/FirstRun/OnboardingScreen';
import { AuthScreen } from './src/screens/Auth/AuthScreen';
import { BiometricLockScreen } from './src/screens/Auth/BiometricLockScreen';

// Main tab screens
import { HomeScreen } from './src/screens/Home/HomeScreen';
import { ExpenseHistoryScreen } from './src/screens/Expenses/ExpenseHistoryScreen';
import { SplitListScreen } from './src/screens/Split/SplitListScreen';
import { LedgerListScreen } from './src/screens/Ledger/LedgerListScreen';
import { InsightsScreen } from './src/screens/Insights/InsightsScreen';
import { SettingsScreen } from './src/screens/Settings/SettingsScreen';

// Nav & Modals
import { FloatingNavBar } from './src/components/FloatingNavBar';
import { AddExpenseModal } from './src/screens/Expenses/AddExpenseModal';
import { EditExpenseModal } from './src/screens/Expenses/EditExpenseModal';
import { AddLedgerEntryModal } from './src/screens/Ledger/AddLedgerEntryModal';
import { EditLedgerEntryModal } from './src/screens/Ledger/EditLedgerEntryModal';
import { PersonDetailModal } from './src/screens/Ledger/PersonDetailModal';
import { AddProjectModal } from './src/screens/Ledger/components/AddProjectModal';
import { ProjectDetailModal } from './src/screens/Ledger/components/ProjectDetailModal';
import { AddSplitModal } from './src/screens/Split/AddSplitModal';
import { SplitDetailModal } from './src/screens/Split/SplitDetailModal';
import { UPIQRModal } from './src/screens/Split/UPIQRModal';
import { CreateGroupModal } from './src/screens/Split/CreateGroupModal';
import { GroupDetailModal } from './src/screens/Split/GroupDetailModal';
import { JoinGroupModal } from './src/screens/Split/JoinGroupModal';
import { RewardsModal } from './src/screens/Split/RewardsModal';
import { AutomationModal } from './src/screens/Automation/AutomationModal';
import { ManageCategoriesModal } from './src/screens/Settings/ManageCategoriesModal';
import { ProfileDetailsModal } from './src/screens/Home/components/ProfileDetailsModal';
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
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const isBiometricEnabled = useAppStore((state) => state.isBiometricEnabled);
  const isAppLocked = useAppStore((state) => state.isAppLocked);
  const activeTab = useAppStore((state) => state.activeTab);
  const activeModal = useAppStore((state) => state.activeModal);
  const loadInitialData = useAppStore((state) => state.loadInitialData);

  React.useEffect(() => {
    loadInitialData();
    notificationListener.init();
  }, []);

  // Hardware Back button handling on Android:
  // If a modal is open, close the modal.
  // If on another tab (Settings/Ledger/Insights/Expenses), return to Home instead of exiting!
  React.useEffect(() => {
    const onBackPress = () => {
      const state = useAppStore.getState();
      if (state.isBiometricEnabled && state.isAppLocked) {
        return false; // Let Android handle exit from lock screen
      }
      if (state.activeModal) {
        state.closeModal();
        return true;
      }
      if (state.activeTab !== 'home') {
        state.setActiveTab('home');
        return true;
      }
      return false; // Exit app from Home
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, []);

  // AppState monitoring: if the app is put in background and reopened,
  // require biometric unlock if enabled, and return to Home if away >3 minutes.
  const lastBackgroundTime = React.useRef<number | null>(null);
  React.useEffect(() => {
    const sub = RNAppState.addEventListener('change', (nextState) => {
      if (nextState === 'background') {
        lastBackgroundTime.current = Date.now();
      } else if (nextState === 'active') {
        const state = useAppStore.getState();
        if (state.isBiometricEnabled) {
          state.setAppLocked(true);
        }
        if (lastBackgroundTime.current && Date.now() - lastBackgroundTime.current > 3 * 60 * 1000) {
          state.setActiveTab('home');
        }
        lastBackgroundTime.current = null;
      }
    });
    return () => sub.remove();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.moss} />
      </View>
    );
  }

  // 1. First-Run Splash
  if (firstRunStep === 'splash') {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <SplashScreen />
      </SafeAreaProvider>
    );
  }

  // 1b. Language Select Gate: First-time language selection before onboarding
  if (!isAuthenticated && firstRunStep === 'language') {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <LanguageSelectScreen />
      </SafeAreaProvider>
    );
  }

  // 2. Onboarding Gate: If unauthenticated and on onboarding step
  if (!isAuthenticated && firstRunStep === 'onboarding') {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <OnboardingScreen />
      </SafeAreaProvider>
    );
  }

  // 3. Authentication Gate: If unauthenticated or in auth step, show AuthScreen
  if (!isAuthenticated || firstRunStep === 'auth') {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <AuthScreen />
      </SafeAreaProvider>
    );
  }

  // 3b. Biometric Lock Gate: If authenticated and biometric lock is active
  if (isBiometricEnabled && isAppLocked) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <BiometricLockScreen />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  // 2. Main Dashboard & Tab Switcher
  const renderCurrentTab = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'expenses':
        return <ExpenseHistoryScreen />;
      case 'split':
        return <SplitListScreen />;
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <View style={styles.appContainer}>
          {renderCurrentTab()}
          <FloatingNavBar />

          {/* Global Modals & Nudges */}
          <AddExpenseModal />
          <EditExpenseModal />
          <AddLedgerEntryModal />
          <EditLedgerEntryModal />
          <PersonDetailModal />
          <AddProjectModal />
          <ProjectDetailModal />
          <AddSplitModal />
          <SplitDetailModal />
          <UPIQRModal />
          <CreateGroupModal />
          <GroupDetailModal />
          <JoinGroupModal />
          <RewardsModal />
          <AutomationModal />
          <ManageCategoriesModal />
          <ProfileDetailsModal />
          <AutoCaptureNudge />

          {/* Modal-mode Language selector if opened from Settings */}
          {activeModal === 'language_select' && <LanguageSelectScreen />}
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
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
