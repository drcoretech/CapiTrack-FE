import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Receipt, Users, BarChart2, Plus } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';
import { TabScreen } from '../types';
import { AnimatedPressable } from './AnimatedPressable';

interface NavItemConfig {
  key: TabScreen;
  label: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
}

const NAV_ITEMS: NavItemConfig[] = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'expenses', label: 'Expenses', icon: Receipt },
  { key: 'ledger', label: 'Ledger', icon: Users },
  { key: 'insights', label: 'Insights', icon: BarChart2 },
];

export const FloatingNavBar: React.FC = () => {
  const insets = useSafeAreaInsets();
  const activeTab = useAppStore((state) => state.activeTab);
  const ledgerSubTab = useAppStore((state) => state.ledgerSubTab);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const openModal = useAppStore((state) => state.openModal);

  // Floating bar entrance
  const barEntrance = useRef(new Animated.Value(40)).current;
  const barOpacity = useRef(new Animated.Value(0)).current;

  // Individual scale animators for tabs
  const tabScales = useRef<{ [key: string]: Animated.Value }>({
    home: new Animated.Value(1),
    expenses: new Animated.Value(1),
    ledger: new Animated.Value(1),
    insights: new Animated.Value(1),
  }).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(barEntrance, {
        toValue: 0,
        useNativeDriver: true,
        friction: 7,
        tension: 80,
      }),
      Animated.timing(barOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleTabPress = (key: TabScreen) => {
    setActiveTab(key);

    const anim = tabScales[key];
    if (anim) {
      anim.setValue(0.78);
      Animated.spring(anim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 4,
        tension: 180,
      }).start();
    }
  };

  return (
    <>
      {/* Floating Action Button (FAB) with tactile bounce & subtle pop - hidden on Insights */}
      {activeTab !== 'insights' && (
        <AnimatedPressable
          scaleTo={0.9}
          onPress={() => {
            if (activeTab === 'ledger') {
              if (ledgerSubTab === 'projects') {
                openModal('add_project');
              } else {
                openModal('add_ledger');
              }
            } else {
              openModal('add_expense');
            }
          }}
          style={[styles.fab, { bottom: Math.max(insets.bottom, 16) + 72 }]}
        >
          <Plus size={26} color="#FFFFFF" strokeWidth={2.6} />
        </AnimatedPressable>
      )}

      {/* Floating Frosted Bottom Bar with Entrance & Spring Transitions */}
      <Animated.View
        style={[
          styles.barContainer,
          {
            bottom: Math.max(insets.bottom, 14),
            opacity: barOpacity,
            transform: [{ translateY: barEntrance }],
          },
        ]}
      >
        <View style={styles.bar}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.key;
            const IconComponent = item.icon;
            const animScale = tabScales[item.key] || new Animated.Value(1);

            return (
              <AnimatedPressable
                key={item.key}
                scaleTo={0.88}
                onPress={() => handleTabPress(item.key)}
                style={[styles.navItem, isActive && styles.activeNavItem]}
              >
                <Animated.View style={{ transform: [{ scale: animScale }] }}>
                  <IconComponent
                    size={23}
                    color={isActive ? '#FFFFFF' : Colors.inkSoft}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </Animated.View>
              </AnimatedPressable>
            );
          })}
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  barContainer: {
    position: 'absolute',
    left: 14,
    right: 14,
    alignItems: 'center',
    zIndex: 50,
  },
  bar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(251, 250, 246, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 100,
    paddingVertical: 7,
    paddingHorizontal: 8,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 12,
  },
  navItem: {
    width: 48,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeNavItem: {
    backgroundColor: Colors.moss,
    shadowColor: Colors.moss,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.moss,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.moss,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
    zIndex: 55,
  },
});
