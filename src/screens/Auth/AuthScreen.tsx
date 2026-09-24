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
  TouchableWithoutFeedback,
  Keyboard,
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
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { useAppStore } from '../../store/useAppStore';
import { useKeyboard } from '../../hooks/useKeyboard';

export const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [workflowMode, setWorkflowMode] = useState<'personal' | 'both'>('personal');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { isKeyboardVisible, keyboardHeight } = useKeyboard();

  const login = useAppStore((state) => state.login);
  const signup = useAppStore((state) => state.signup);
  const setFirstRunStep = useAppStore((state) => state.setFirstRunStep);

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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Subtle Back to Tour button */}
        <View style={styles.topBar}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setFirstRunStep('onboarding')}
            style={styles.backTourBtn}
          >
            <ChevronLeft size={18} color={Colors.inkSoft} />
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
                <Wallet size={26} color={Colors.moss} />
              </View>
            )}
            <Text style={[styles.brandTitle, isKeyboardVisible && styles.brandTitleCompact]}>
              CapiTrack
            </Text>
            {!isKeyboardVisible && (
              <Text style={styles.brandTagline}>Your Personal Capital & Khata Ledger</Text>
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
                ? 'Enter your name and password to access your ledgers'
                : 'Start tracking daily spends & freelance contracts'}
            </Text>

            {/* Error Message Banner */}
            {!!errorMessage && (
              <View style={styles.errorBanner}>
                <AlertCircle size={18} color="#DC2626" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Your Name</Text>
              <View style={styles.inputWrapper}>
                <User size={18} color={Colors.inkSoft} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Digvijay or Rohit"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={(val) => {
                    setName(val);
                    if (errorMessage) setErrorMessage('');
                  }}
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={18} color={Colors.inkSoft} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (errorMessage) setErrorMessage('');
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
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
                <Text style={styles.inputLabel}>Select Your Workflow</Text>
                
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setWorkflowMode('personal')}
                  style={[
                    styles.workflowCard,
                    workflowMode === 'personal' && styles.workflowCardSelected,
                  ]}
                >
                  <View style={styles.workflowIconBox}>
                    <Wallet size={20} color={workflowMode === 'personal' ? Colors.moss : Colors.inkSoft} />
                  </View>
                  <View style={styles.workflowTextBox}>
                    <Text style={styles.workflowTitle}>Personal Expenses Only</Text>
                    <Text style={styles.workflowDesc}>
                      Track daily personal spends, categories & friend loans
                    </Text>
                  </View>
                  {workflowMode === 'personal' && (
                    <View style={styles.checkCircle}>
                      <Check size={14} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setWorkflowMode('both')}
                  style={[
                    styles.workflowCard,
                    workflowMode === 'both' && styles.workflowCardSelected,
                  ]}
                >
                  <View style={styles.workflowIconBox}>
                    <Briefcase size={20} color={workflowMode === 'both' ? Colors.moss : Colors.inkSoft} />
                  </View>
                  <View style={styles.workflowTextBox}>
                    <Text style={styles.workflowTitle}>Personal + Client Projects</Text>
                    <Text style={styles.workflowDesc}>
                      Includes freelance contracts, milestones & receivables
                    </Text>
                  </View>
                  {workflowMode === 'both' && (
                    <View style={styles.checkCircle}>
                      <Check size={14} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Submit Action Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSubmit}
              disabled={isLoading}
              style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <View style={styles.submitRow}>
                  <Text style={styles.submitBtnText}>
                    {mode === 'signin' ? 'Sign In to CapiTrack' : 'Create Account & Start'}
                  </Text>
                  <ArrowRight size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
                </View>
              )}
            </TouchableOpacity>

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
              >
                <Text style={styles.toggleFooterLink}>
                  {mode === 'signin' ? ' Sign Up' : ' Sign In'}
                </Text>
              </TouchableOpacity>
            </View>
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
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backTourBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#EAEFE9',
    borderRadius: 16,
  },
  backTourText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12.5,
    color: Colors.inkSoft,
    marginLeft: 2,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 14,
  },
  headerCompact: {
    marginBottom: 8,
  },
  brandTitleCompact: {
    fontSize: 20,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#EAF3EC',
    borderWidth: 1.5,
    borderColor: '#CBE2CF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  brandTitle: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 24,
    color: Colors.ink,
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontFamily: Fonts.sansRegular,
    fontSize: 13,
    color: Colors.inkSoft,
    marginTop: 2,
  },
  switcherContainer: {
    flexDirection: 'row',
    backgroundColor: '#E9EFE8',
    borderRadius: 14,
    padding: 4,
    width: '100%',
    marginBottom: 14,
  },
  switcherTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  switcherTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  switcherText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.inkSoft,
  },
  switcherTextActive: {
    fontFamily: Fonts.sansSemiBold,
    color: Colors.moss,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: Colors.line,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  formTitle: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 20,
    color: Colors.ink,
    marginBottom: 4,
  },
  formSubtitle: {
    fontFamily: Fonts.sansRegular,
    fontSize: 13,
    color: Colors.inkSoft,
    marginBottom: 18,
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
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: '#DC2626',
    marginLeft: 8,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: Colors.ink,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAF7',
    borderWidth: 1.5,
    borderColor: '#E2E8DF',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.sansRegular,
    fontSize: 15,
    color: Colors.ink,
  },
  eyeBtn: {
    padding: 6,
  },
  workflowSection: {
    marginBottom: 16,
    marginTop: 4,
  },
  workflowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8DF',
    backgroundColor: '#F8FAF7',
    marginBottom: 8,
  },
  workflowCardSelected: {
    borderColor: Colors.moss,
    backgroundColor: '#F3F8F4',
  },
  workflowIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  workflowTextBox: {
    flex: 1,
  },
  workflowTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: Colors.ink,
  },
  workflowDesc: {
    fontFamily: Fonts.sansRegular,
    fontSize: 11,
    color: Colors.inkSoft,
    marginTop: 2,
    lineHeight: 15,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.moss,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  submitBtn: {
    backgroundColor: Colors.moss,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: Colors.moss,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
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
    fontSize: 15,
    color: '#FFFFFF',
  },
  toggleFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  toggleFooterText: {
    fontFamily: Fonts.sansRegular,
    fontSize: 13,
    color: Colors.inkSoft,
  },
  toggleFooterLink: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: Colors.moss,
  },
});
