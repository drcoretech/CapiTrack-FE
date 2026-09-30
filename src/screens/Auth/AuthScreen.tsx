import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Check,
  Briefcase,
  Wallet,
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  Zap,
  ShieldCheck,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { useAppStore } from '../../store/useAppStore';
import { useKeyboard } from '../../hooks/useKeyboard';
import { AnimatedPressable } from '../../components/AnimatedPressable';

export const AuthScreen: React.FC = () => {
  const authInitialMode = useAppStore((state) => state.authInitialMode);
  const [mode, setMode] = useState<'signin' | 'signup'>(authInitialMode || 'signup');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [workflowMode, setWorkflowMode] = useState<'personal' | 'both'>('personal');
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [focusedField, setFocusedField] = useState<'name' | 'password' | null>(null);
  const { isKeyboardVisible, keyboardHeight } = useKeyboard();

  const login = useAppStore((state) => state.login);
  const signup = useAppStore((state) => state.signup);
  const setFirstRunStep = useAppStore((state) => state.setFirstRunStep);

  React.useEffect(() => {
    if (authInitialMode) {
      setMode(authInitialMode);
    }
  }, [authInitialMode]);

  const handleSubmit = async () => {
    setErrorMessage('');
    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage('Please enter your name');
      return;
    }

    if (!password || password.length < 4) {
      setErrorMessage('Password must be at least 4 characters');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'signin') {
        const res = await login(trimmedName, password);
        if (!res.success) {
          setErrorMessage(res.message || 'Incorrect name or password. Please try again.');
        }
      } else {
        const isBusinessActive = workflowMode === 'both';
        const res = await signup(trimmedName, password, isBusinessActive);
        if (!res.success) {
          setErrorMessage(res.message || 'Could not create account. Please try again.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstantGuestAccess = async () => {
    setErrorMessage('');
    setIsGuestLoading(true);
    try {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const guestName = `User ${randomSuffix}`;
      const guestPass = `pass_${randomSuffix}_ct`;
      const res = await signup(guestName, guestPass, false);
      if (!res.success) {
        // Fallback local entrance
        useAppStore.setState({
          userName: guestName,
          isAuthenticated: true,
          firstRunStep: 'main',
          hasCompletedOnboarding: true,
        });
      }
    } catch {
      useAppStore.setState({
        userName: 'Guest',
        isAuthenticated: true,
        firstRunStep: 'main',
        hasCompletedOnboarding: true,
      });
    } finally {
      setIsGuestLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Top Navigation Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setFirstRunStep('onboarding')}
            style={styles.backTourBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ChevronLeft size={16} color={Colors.inkSoft} />
            <Text style={styles.backTourText}>App Tour</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: isKeyboardVisible
                ? (Platform.OS === 'android' ? keyboardHeight + 40 : 40)
                : 60,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Header Brand Badge */}
          <View style={[styles.header, isKeyboardVisible && styles.headerCompact]}>
            {!isKeyboardVisible && (
              <View style={styles.logoBadge}>
                <Image
                  source={require('../../../assets/icon.png')}
                  style={styles.logoImage}
                  resizeMode="cover"
                />
              </View>
            )}
            <Text style={[styles.brandTitle, isKeyboardVisible && styles.brandTitleCompact]}>
              CapiTrack
            </Text>
            {!isKeyboardVisible && (
              <Text style={styles.brandTagline}>Your Personal Capital & Khata Workspace</Text>
            )}
          </View>

          {/* Segmented Switcher */}
          <View style={styles.switcherContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setMode('signin');
                setErrorMessage('');
              }}
              style={[styles.switcherTab, mode === 'signin' && styles.switcherTabActive]}
            >
              <Text style={[styles.switcherText, mode === 'signin' && styles.switcherTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setMode('signup');
                setErrorMessage('');
              }}
              style={[styles.switcherTab, mode === 'signup' && styles.switcherTabActive]}
            >
              <Text style={[styles.switcherText, mode === 'signup' && styles.switcherTextActive]}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.formTitle}>
              {mode === 'signin' ? 'Welcome Back' : 'Create Your Account'}
            </Text>
            <Text style={styles.formSubtitle}>
              {mode === 'signin'
                ? 'Enter your name and password to access your financial records'
                : 'Start tracking daily spends & freelance contracts in seconds'}
            </Text>

            {/* Error Message Banner */}
            {!!errorMessage && (
              <View style={styles.errorBanner}>
                <AlertCircle size={16} color="#DC2626" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* Name Input with Active Focus Highlighting */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Your Name</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedField === 'name' && styles.inputWrapperFocused,
                ]}
              >
                <User
                  size={18}
                  color={focusedField === 'name' ? Colors.moss : Colors.inkSoft}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Digvijay"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={(val) => {
                    setName(val);
                    if (errorMessage) setErrorMessage('');
                  }}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!isLoading && !isGuestLoading}
                />
              </View>
            </View>

            {/* Password Input with Active Focus Highlighting */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedField === 'password' && styles.inputWrapperFocused,
                ]}
              >
                <Lock
                  size={18}
                  color={focusedField === 'password' ? Colors.moss : Colors.inkSoft}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="At least 4 characters"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (errorMessage) setErrorMessage('');
                  }}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading && !isGuestLoading}
                />
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={Colors.inkSoft} />
                  ) : (
                    <Eye size={18} color={Colors.inkSoft} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Workflow Mode Selection for Sign Up */}
            {mode === 'signup' && (
              <View style={styles.workflowSection}>
                <Text style={styles.inputLabel}>Choose Your Workspace Mode</Text>

                <AnimatedPressable
                  scaleTo={0.98}
                  onPress={() => setWorkflowMode('personal')}
                  style={[
                    styles.workflowCard,
                    workflowMode === 'personal' && styles.workflowCardSelected,
                  ]}
                >
                  <View style={styles.workflowIconBox}>
                    <Wallet size={18} color={workflowMode === 'personal' ? Colors.moss : Colors.inkSoft} />
                  </View>
                  <View style={styles.workflowTextBox}>
                    <Text style={styles.workflowTitle}>Personal Expenses Only</Text>
                    <Text style={styles.workflowDesc}>
                      Daily personal spends, categories & friends khata
                    </Text>
                  </View>
                  {workflowMode === 'personal' && (
                    <View style={styles.checkCircle}>
                      <Check size={12} color="#FFF" strokeWidth={2.8} />
                    </View>
                  )}
                </AnimatedPressable>

                <AnimatedPressable
                  scaleTo={0.98}
                  onPress={() => setWorkflowMode('both')}
                  style={[
                    styles.workflowCard,
                    workflowMode === 'both' && styles.workflowCardSelected,
                  ]}
                >
                  <View style={styles.workflowIconBox}>
                    <Briefcase size={18} color={workflowMode === 'both' ? Colors.moss : Colors.inkSoft} />
                  </View>
                  <View style={styles.workflowTextBox}>
                    <Text style={styles.workflowTitle}>Personal + Client Projects</Text>
                    <Text style={styles.workflowDesc}>
                      Includes freelance deals, milestone payments & invoices
                    </Text>
                  </View>
                  {workflowMode === 'both' && (
                    <View style={styles.checkCircle}>
                      <Check size={12} color="#FFF" strokeWidth={2.8} />
                    </View>
                  )}
                </AnimatedPressable>
              </View>
            )}

            {/* Submit Action Button */}
            <AnimatedPressable
              scaleTo={0.97}
              onPress={handleSubmit}
              disabled={isLoading || isGuestLoading}
              style={[styles.submitBtn, (isLoading || isGuestLoading) && styles.submitBtnDisabled]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <View style={styles.submitRow}>
                  <Text style={styles.submitBtnText}>
                    {mode === 'signin' ? 'Sign In to Workspace' : 'Create Account & Start'}
                  </Text>
                  <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.4} style={{ marginLeft: 6 }} />
                </View>
              )}
            </AnimatedPressable>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR QUICK ACCESS</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* 1-Tap Instant Guest Access */}
            <AnimatedPressable
              scaleTo={0.98}
              onPress={handleInstantGuestAccess}
              disabled={isLoading || isGuestLoading}
              style={styles.guestBtn}
            >
              {isGuestLoading ? (
                <ActivityIndicator size="small" color={Colors.moss} />
              ) : (
                <View style={styles.guestRow}>
                  <Zap size={15} color={Colors.moss} />
                  <Text style={styles.guestBtnText}>Continue with Instant Device ID</Text>
                </View>
              )}
            </AnimatedPressable>

            {/* Toggle Helper Copy */}
            <View style={styles.toggleFooter}>
              <Text style={styles.toggleFooterText}>
                {mode === 'signin' ? "Don't have an account yet?" : 'Already have an account?'}
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setErrorMessage('');
                }}
                hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              >
                <Text style={styles.toggleFooterLink}>
                  {mode === 'signin' ? ' Sign Up' : ' Sign In'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Privacy Trust Footer */}
          <View style={styles.trustFooter}>
            <ShieldCheck size={14} color={Colors.moss} style={{ marginRight: 6 }} />
            <Text style={styles.trustFooterText}>
              100% On-Device Privacy · Zero Ads · Zero Trackers
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.mist,
  },
  keyboardView: {
    flex: 1,
  },
  topBar: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backTourBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 14,
  },
  backTourText: {
    fontFamily: Fonts.monoRegular,
    fontSize: 11.5,
    color: Colors.inkSoft,
    marginLeft: 3,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 4,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  headerCompact: {
    marginBottom: 8,
  },
  brandTitleCompact: {
    fontSize: 20,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: Colors.moss,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  logoImage: {
    width: 48,
    height: 48,
    borderRadius: 14,
  },
  brandTitle: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 26,
    color: Colors.ink,
    letterSpacing: -0.02,
  },
  brandTagline: {
    fontFamily: Fonts.sansRegular,
    fontSize: 12.5,
    color: Colors.inkSoft,
    marginTop: 2,
  },
  switcherContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(220, 224, 217, 0.6)',
    borderRadius: 14,
    padding: 3,
    width: '100%',
    marginBottom: 14,
  },
  switcherTab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  switcherTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  switcherText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13.5,
    color: Colors.inkSoft,
  },
  switcherTextActive: {
    fontFamily: Fonts.sansSemiBold,
    color: Colors.moss,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1.5,
    borderColor: Colors.line,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  formTitle: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 20,
    color: Colors.ink,
    marginBottom: 4,
    letterSpacing: -0.01,
  },
  formSubtitle: {
    fontFamily: Fonts.sansRegular,
    fontSize: 12.5,
    color: Colors.inkSoft,
    marginBottom: 16,
    lineHeight: 18,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 14,
  },
  errorText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12.5,
    color: '#DC2626',
    marginLeft: 8,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 12.5,
    color: Colors.ink,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Colors.line,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
  },
  inputWrapperFocused: {
    borderColor: Colors.moss,
    backgroundColor: '#F7FAF8',
    shadowColor: Colors.moss,
    shadowOpacity: 0.15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.sansRegular,
    fontSize: 14.5,
    color: Colors.ink,
  },
  eyeBtn: {
    padding: 6,
  },
  workflowSection: {
    marginBottom: 14,
    marginTop: 2,
  },
  workflowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 11,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.line,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  workflowCardSelected: {
    borderColor: Colors.moss,
    backgroundColor: Colors.mossLight,
  },
  workflowIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(62, 107, 92, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  workflowTextBox: {
    flex: 1,
  },
  workflowTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 12.5,
    color: Colors.ink,
  },
  workflowDesc: {
    fontFamily: Fonts.sansRegular,
    fontSize: 10.5,
    color: Colors.inkSoft,
    marginTop: 1,
    lineHeight: 14,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.moss,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  submitBtn: {
    backgroundColor: Colors.moss,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: Colors.moss,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14.5,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.line,
  },
  dividerText: {
    fontFamily: Fonts.monoRegular,
    fontSize: 9,
    color: Colors.inkSoft,
    letterSpacing: 0.8,
  },
  guestBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Colors.line,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  guestBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: Colors.ink,
  },
  toggleFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  toggleFooterText: {
    fontFamily: Fonts.sansRegular,
    fontSize: 12.5,
    color: Colors.inkSoft,
  },
  toggleFooterLink: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 12.5,
    color: Colors.moss,
  },
  trustFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  trustFooterText: {
    fontFamily: Fonts.monoRegular,
    fontSize: 10,
    color: Colors.inkSoft,
    letterSpacing: 0.3,
  },
});
