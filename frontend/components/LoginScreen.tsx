import React, { useState } from 'react';
import { JanusLogo } from './JanusLogo';
import { Button } from './Button';
import { authService } from '../services/auth';
import { useTheme } from './ThemeContext';
import { useTranslation } from 'react-i18next';

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await authService.login(email, password);
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col relative overflow-hidden transition-colors duration-200">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-100/30 dark:bg-teal-900/10 rounded-full blur-[100px] transition-colors"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/30 dark:bg-blue-900/10 rounded-full blur-[100px] transition-colors"></div>

      {/* Header */}
      <header className="flex justify-between items-center px-8 py-6 z-10">
        <div className="flex items-center gap-2">
          <JanusLogo className="w-6 h-6 text-teal-600 dark:text-teal-400" size={24} />
          <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight transition-colors">{t('sidebar.appName')}</span>
        </div>
        <Button className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 font-medium shadow-sm transition-all">
          {t('common.help')}
        </Button>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-md">

          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight transition-colors">{t('auth.welcomeBack')}</h1>
            <p className="text-teal-700/80 dark:text-teal-400 font-medium transition-colors">{t('auth.signInWorkspace')}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none p-8 md:p-10 border border-gray-100 dark:border-gray-700 transition-colors">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900 dark:text-gray-200 ml-1 transition-colors">{t('auth.emailAddress')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-900"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-semibold text-gray-900 dark:text-gray-200 transition-colors">{t('auth.password')}</label>
                  <a href="#" className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors">{t('auth.forgotPassword')}</a>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-900"
                  required
                />
              </div>

              <div className="flex items-center ml-1">
                <input id="remember" type="checkbox" className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 dark:bg-gray-700 dark:border-gray-600" />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-600 dark:text-gray-400 transition-colors">{t('auth.rememberMe')}</label>
              </div>

              <Button
                type="submit"
                fullWidth
                disabled={isLoading}
                className="bg-teal-700 hover:bg-teal-800 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-teal-700/20 transform active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? t('auth.signingIn') : t('auth.signIn')}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <span className="text-gray-400 text-sm">{t('auth.noAccount')} </span>
              <a href="#" className="text-teal-700 dark:text-teal-400 font-semibold text-sm hover:underline transition-colors">{t('auth.createAccount')}</a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center z-10">
        <div className="text-xs text-gray-500 mb-4">
          {t('auth.byContinuing')} <a href="#" className="text-teal-700 hover:underline">{t('auth.termsOfService')}</a> {t('auth.and')} <br />
          <a href="#" className="text-teal-700 hover:underline">{t('auth.privacyPolicy')}</a>.
        </div>
        <div className="flex justify-center gap-6 text-xs font-medium text-teal-700/80 dark:text-teal-500/80 transition-colors">
          <span
            className="flex items-center gap-1 cursor-pointer hover:text-teal-900 dark:hover:text-teal-400 transition-colors"
            onClick={toggleTheme}
          >
            <span className="text-lg">{theme === 'dark' ? '☀️' : '🌙'}</span>
            {theme === 'dark' ? t('settings.lightMode') : t('settings.darkMode')}
          </span>
        </div>
      </footer>
    </div>
  );
};