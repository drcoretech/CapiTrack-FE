import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../i18n/translations';
import { HomeHeader } from './components/HomeHeader';
import { SpentTodayCard } from './components/SpentTodayCard';
import { AiInsightCard } from './components/AiInsightCard';
import { LedgerSummaryCards } from './components/LedgerSummaryCards';
import { TodaysActivityList } from './components/TodaysActivityList';
import { EditNameModal } from './components/EditNameModal';
import { HomeSkeleton } from './components/HomeSkeleton';

export const HomeScreen: React.FC = () => {
  const userName = useAppStore((state) => state.userName);
  const setUserName = useAppStore((state) => state.setUserName);
  const expenses = useAppStore((state) => state.expenses);
  const contacts = useAppStore((state) => state.contacts);
  const dashboardData = useAppStore((state) => state.dashboardData);
  const isSyncing = useAppStore((state) => state.isSyncing);
  const refreshDashboard = useAppStore((state) => state.refreshDashboard);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const openModal = useAppStore((state) => state.openModal);
  const setEditingExpense = useAppStore((state) => state.setEditingExpense);
  const { t, getCategoryName, lang } = useTranslation();

  const [isEditingName, setIsEditingName] = useState(false);

  // Staggered entrance animators (initialized to 1 so content is never invisible)
  const headerFade = useRef(new Animated.Value(1)).current;
  const headerSlide = useRef(new Animated.Value(0)).current;
  const bigStatScale = useRef(new Animated.Value(1)).current;
  const bigStatFade = useRef(new Animated.Value(1)).current;
  const cardsSlide = useRef(new Animated.Value(0)).current;
  const cardsFade = useRef(new Animated.Value(1)).current;

  // Dynamic calculations directly from real expenses array
  const todayExpenses = expenses.filter((e) => e.dayGroup === 'Today');
  const spentToday = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const deltaText = dashboardData?.delta ?? (spentToday > 0 ? `↑ 100% ${t('vsYesterday')}` : `0% ${t('vsYesterday')}`);

  const isInitialLoading = isSyncing && !dashboardData && expenses.length === 0;

  useEffect(() => {
    if (!isInitialLoading) {
      headerFade.setValue(0);
      headerSlide.setValue(-10);
      bigStatFade.setValue(0);
      bigStatScale.setValue(0.94);
      cardsFade.setValue(0);
      cardsSlide.setValue(16);

      Animated.stagger(80, [
        Animated.parallel([
          Animated.timing(headerFade, { toValue: 1, duration: 250, useNativeDriver: true }),
          Animated.spring(headerSlide, { toValue: 0, friction: 6, tension: 80, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(bigStatFade, { toValue: 1, duration: 280, useNativeDriver: true }),
          Animated.spring(bigStatScale, { toValue: 1, friction: 6, tension: 70, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(cardsFade, { toValue: 1, duration: 280, useNativeDriver: true }),
          Animated.spring(cardsSlide, { toValue: 0, friction: 7, tension: 80, useNativeDriver: true }),
        ]),
      ]).start();
    }
  }, [isInitialLoading]);

  // Dynamic AI Insight computation based on real entries and timestamps
  const dynamicInsight = useMemo(() => {
    if (todayExpenses.length === 0) {
      if (expenses.length === 0) {
        if (lang === 'hi') return 'अभी तक कोई खर्च दर्ज नहीं हुआ। अपना पहला खर्च जोड़ने के लिए नीचे + दबाएं।';
        if (lang === 'mr') return 'अद्याप कोणताही खर्च नोंदवला नाही. पहिला खर्च जोडण्यासाठी खालील + दाबा.';
        return 'No expenses logged yet. Tap + below to record your first spend.';
      }
      const catMap: Record<string, number> = {};
      expenses.forEach((e) => {
        catMap[e.category] = (catMap[e.category] || 0) + e.amount;
      });
      const topCat = Object.keys(catMap).sort((a, b) => catMap[b] - catMap[a])[0];
      const translatedCat = getCategoryName(topCat);
      if (lang === 'hi') return `आज कोई खर्च नहीं हुआ। आपका सबसे ज्यादा खर्च ${translatedCat} पर होता है।`;
      if (lang === 'mr') return `आज कोणताही खर्च झालेला नाही. तुमचा सर्वाधिक खर्च ${translatedCat} वर होतो.`;
      return `No spending recorded today yet. Your highest spend category is ${topCat}.`;
    }

    if (todayExpenses.length === 1) {
      const exp = todayExpenses[0];
      const translatedCat = getCategoryName(exp.category);
      const itemDesc = exp.note ? ` ("${exp.note}")` : '';
      if (lang === 'hi') return `आज आपने ${translatedCat}${itemDesc} पर ₹${exp.amount.toLocaleString()} खर्च किए।`;
      if (lang === 'mr') return `आज तुम्ही ${translatedCat}${itemDesc} वर ₹${exp.amount.toLocaleString()} खर्च केले.`;
      return `You spent ₹${exp.amount.toLocaleString()} on ${exp.category}${itemDesc} today.`;
    }

    const catMap: Record<string, number> = {};
    todayExpenses.forEach((e) => {
      catMap[e.category] = (catMap[e.category] || 0) + e.amount;
    });
    const topCat = Object.keys(catMap).sort((a, b) => catMap[b] - catMap[a])[0];
    const topCatTotal = catMap[topCat];
    const pct = spentToday > 0 ? Math.round((topCatTotal / spentToday) * 100) : 100;
    const translatedCat = getCategoryName(topCat);

    if (lang === 'hi') return `आज आपका अधिकांश खर्च ${translatedCat} (${pct}%) पर हुआ है।`;
    if (lang === 'mr') return `आज तुमचा सर्वाधिक खर्च ${translatedCat} (${pct}%) वर झाला आहे.`;
    return `Most of your spend today is on ${topCat} (${pct}% of daily spend).`;
  }, [todayExpenses, expenses, spentToday, lang, getCategoryName]);

  const insightText = dynamicInsight || dashboardData?.insight || t('defaultInsight');

  const calculatedOwedToYou = contacts.reduce((sum, c) => (c.netBalance > 0 ? sum + c.netBalance : sum), 0);
  const calculatedYouOwe = contacts.reduce((sum, c) => (c.netBalance < 0 ? sum + Math.abs(c.netBalance) : sum), 0);

  const owedToYou = dashboardData?.owedToYou ?? calculatedOwedToYou;
  const youOwe = dashboardData?.youOwe ?? calculatedYouOwe;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isSyncing}
            onRefresh={refreshDashboard}
            tintColor={Colors.moss}
          />
        }
      >
        {isInitialLoading ? (
          <HomeSkeleton />
        ) : (
          <>
            {/* Header with animated entrance */}
            <Animated.View
              style={{
                opacity: headerFade,
                transform: [{ translateY: headerSlide }],
              }}
            >
              <HomeHeader
                userName={userName}
                onPressProfile={() => openModal('profile_details')}
              />
            </Animated.View>

            {/* Big Stat (Spent Today) with scale-in animation */}
            <Animated.View
              style={{
                opacity: bigStatFade,
                transform: [{ scale: bigStatScale }],
              }}
            >
              <SpentTodayCard
                spentToday={spentToday}
                deltaText={deltaText}
              />
            </Animated.View>

            {/* Cards Section with slide-up animation */}
            <Animated.View
              style={{
                gap: 16,
                opacity: cardsFade,
                transform: [{ translateY: cardsSlide }],
              }}
            >
              {/* AI Insight Card */}
              <AiInsightCard
                insightText={insightText}
                onSeeBreakdown={() => setActiveTab('insights')}
              />

              {/* Ledger Summary Cards */}
              <LedgerSummaryCards
                owedToYou={owedToYou}
                youOwe={youOwe}
                onPressCard={() => setActiveTab('ledger')}
              />

              {/* Quick Recent Activity preview */}
              <TodaysActivityList
                expenses={todayExpenses}
                onPressExpense={(exp) => setEditingExpense(exp)}
                onPressEmptyCard={() => openModal('add_expense')}
                onPressViewAll={() => setActiveTab('expenses')}
              />
            </Animated.View>
          </>
        )}
      </ScrollView>

      {/* Edit Name Modal */}
      <EditNameModal
        visible={isEditingName}
        currentName={userName}
        onClose={() => setIsEditingName(false)}
        onSave={(newName) => setUserName(newName)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.mist,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120, // Space for floating bottom nav
    gap: 16,
  },
});
