import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../config/supabase';

// ─── State tampilan setelah daftar ───────────────────────────
const VerificationSentScreen = ({ email, onBackToLogin }) => (
  <View style={styles.container}>
    <Text style={{ fontSize: 72, marginBottom: 16 }}>📧</Text>
    <Text style={[styles.title, { marginBottom: 8 }]}>Cek Email Kamu!</Text>
    <Text style={[styles.subtitle, { textAlign: 'center', lineHeight: 22 }]}>
      Kami kirim link verifikasi ke:{'\n'}
      <Text style={{ fontWeight: 'bold' }}>{email}</Text>
    </Text>

    <View style={[styles.card, { marginTop: 32 }]}>
      <Text style={styles.verifyInfo}>
        ✅ Buka email dari <Text style={{ fontWeight: 'bold' }}>FoodsStreets</Text>{'\n'}
        ✅ Klik tombol <Text style={{ fontWeight: 'bold' }}>"Verifikasi Sekarang"</Text>{'\n'}
        ✅ Kembali ke sini dan login
      </Text>

      <TouchableOpacity
        style={[styles.button, { marginTop: 20 }]}
        onPress={onBackToLogin}
      >
        <Text style={styles.buttonText}>Sudah Verifikasi? Login</Text>
      </TouchableOpacity>

      <Text style={styles.resendNote}>
        Tidak dapat email? Cek folder Spam atau coba daftar ulang.
      </Text>
    </View>
  </View>
);

// ─── Main AuthScreen ──────────────────────────────────────────
const AuthScreen = () => {
  const [mode, setMode]                   = useState('login');
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [name, setName]                   = useState('');
  const [loading, setLoading]             = useState(false);
  const [showPassword, setShowPassword]   = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [sentToEmail, setSentToEmail]     = useState('');

  // ── Login ──
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Email dan password harus diisi');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setLoading(false);

    if (error) {
      // Pesan error yang lebih ramah
      if (error.message.includes('Email not confirmed')) {
        Alert.alert(
          'Email Belum Diverifikasi',
          'Silakan cek email kamu dan klik link verifikasi sebelum login.',
          [{ text: 'OK' }]
        );
      } else if (error.message.includes('Invalid login credentials')) {
        Alert.alert('Login Gagal', 'Email atau password salah. Coba lagi.');
      } else {
        Alert.alert('Login Gagal', error.message);
      }
    }
  };

  // ── Register ──
  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !name.trim()) {
      Alert.alert('Error', 'Semua field harus diisi');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password minimal 6 karakter');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('Error', 'Format email tidak valid');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { name: name.trim() },
        // URL yang dibuka setelah klik link verifikasi
        emailRedirectTo: 'aplikasipemesananmakanan://auth/callback',
      },
    });
    setLoading(false);

    if (error) {
      if (error.message.includes('already registered')) {
        Alert.alert('Email Sudah Terdaftar', 'Gunakan email lain atau langsung login.');
      } else {
        Alert.alert('Register Gagal', error.message);
      }
      return;
    }

    // Cek apakah Supabase minta konfirmasi email
    if (data?.user && !data.session) {
      // Email konfirmasi dikirim
      setSentToEmail(email.trim().toLowerCase());
      setVerificationSent(true);
    } else if (data?.session) {
      // Jika Supabase config tidak minta konfirmasi, langsung masuk
      // (otomatis ditangani AppContext)
    }
  };

  // ── Forgot Password ──
  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Info', 'Masukkan email kamu dulu, lalu klik "Lupa Password".');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: 'aplikasipemesananmakanan://auth/reset-password' }
    );
    setLoading(false);
    if (error) {
      Alert.alert('Gagal', error.message);
    } else {
      Alert.alert('Email Terkirim', 'Cek email kamu untuk reset password.');
    }
  };

  // ── Tampilkan halaman verifikasi terkirim ──
  if (verificationSent) {
    return (
      <VerificationSentScreen
        email={sentToEmail}
        onBackToLogin={() => {
          setVerificationSent(false);
          setMode('login');
          setPassword('');
        }}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* Hero */}
          <Text style={{ fontSize: 64, marginBottom: 8 }}>🍔</Text>
          <Text style={styles.title}>FoodsStreets</Text>
          <Text style={styles.subtitle}>
            {mode === 'login' ? 'Selamat datang kembali!' : 'Buat akun baru'}
          </Text>

          {/* Card */}
          <View style={styles.card}>

            {/* Nama — hanya saat register */}
            {mode === 'register' && (
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>Nama Lengkap</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Fhazwan Athar Raamadhan"
                  placeholderTextColor="#bbb"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            )}

            {/* Email */}
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="email@contoh.com"
                placeholderTextColor="#bbb"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password */}
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="Min. 6 karakter"
                  placeholderTextColor="#bbb"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(s => !s)}
                  style={styles.eyeBtn}
                >
                  <Text style={{ fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Lupa password — hanya saat login */}
            {mode === 'login' && (
              <TouchableOpacity onPress={handleForgotPassword} style={{ alignSelf: 'flex-end', marginBottom: 16, marginTop: -4 }}>
                <Text style={styles.forgotTxt}>Lupa password?</Text>
              </TouchableOpacity>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={mode === 'login' ? handleLogin : handleRegister}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.buttonText}>
                    {mode === 'login' ? '🚀 Masuk' : '✨ Daftar Sekarang'}
                  </Text>
              }
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerTxt}>atau</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Switch mode */}
            <TouchableOpacity
              onPress={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setPassword('');
                setName('');
              }}
              style={styles.switchBtn}
            >
              <Text style={styles.switchText}>
                {mode === 'login'
                  ? 'Belum punya akun? Daftar di sini'
                  : 'Sudah punya akun? Masuk'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Info verifikasi email — tampil saat register */}
          {mode === 'register' && (
            <View style={styles.infoBox}>
              <Text style={styles.infoTxt}>
                📧 Setelah daftar, kamu akan menerima email verifikasi dari FoodsStreets.
                Klik link di email sebelum login.
              </Text>
            </View>
          )}

          <Text style={styles.version}>FoodsStreets v1.0.0</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6347',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title:       { fontSize: 34, fontWeight: '900', color: '#fff', marginBottom: 4, letterSpacing: 0.5 },
  subtitle:    { fontSize: 15, color: 'rgba(255,255,255,0.85)', marginBottom: 28 },
  card:        { backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '100%', maxWidth: 420, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 8 },

  inputWrap:   { marginBottom: 14 },
  inputLabel:  { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 6 },
  input:       { backgroundColor: '#f7f7f7', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, borderWidth: 1, borderColor: '#e8e8e8', color: '#1a1a1a' },

  passwordRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn:      { paddingHorizontal: 10, paddingVertical: 10 },

  forgotTxt:   { fontSize: 13, color: '#FF6347', fontWeight: '600' },

  button:      { backgroundColor: '#FF6347', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 4, marginBottom: 16, shadowColor: '#FF6347', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 4 },
  buttonText:  { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  dividerRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 8 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#eee' },
  dividerTxt:  { fontSize: 12, color: '#bbb' },

  switchBtn:   { alignItems: 'center', paddingVertical: 4 },
  switchText:  { textAlign: 'center', color: '#FF6347', fontSize: 14, fontWeight: '700' },

  // Info box
  infoBox:     { marginTop: 20, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 14, width: '100%', maxWidth: 420 },
  infoTxt:     { color: '#fff', fontSize: 12, lineHeight: 18, textAlign: 'center' },

  // Verification screen
  verifyInfo:  { fontSize: 14, lineHeight: 26, color: '#444', textAlign: 'center' },
  resendNote:  { fontSize: 12, color: '#aaa', textAlign: 'center', marginTop: 12 },

  version:     { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 24 },
});

export default AuthScreen;