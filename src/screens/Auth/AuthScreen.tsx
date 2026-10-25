import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { styles } from './AuthScreen.styles';
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

    if (trimmedName.length > 20) {
      setErrorMessage('Name must be 20 characters or fewer');
      return;
    }

    if (!password || password.length < 4) {
      setErrorMessage('Password must be at least 4 characters');
      return;
    }

    setIsLoading(true);
    const startTime = Date.now();

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
      // Ensure the button loader shows for at least 1000ms for tactile feedback
      const elapsed = Date.now() - startTime;
      if (elapsed < 1000) {
        await new Promise((resolve) => setTimeout(resolve, 1000 - elapsed));
      }
      setIsLoading(false);
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
              <Text style={styles.brandTagline}>Your Personal Capital & Credit Ledger Workspace</Text>
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
                  maxLength={20}
                  onChangeText={(val) => {
                    setName(val);
                    if (errorMessage) setErrorMessage('');
                  }}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!isLoading}
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
                  editable={!isLoading}
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
                      Daily personal spends, categories & credit ledger
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
              disabled={isLoading}
              style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
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
