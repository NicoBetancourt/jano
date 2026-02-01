import React, { useRef, useEffect, useState } from 'react';
import { Sun, Moon, Globe, ChevronRight, Check } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { useTranslation } from 'react-i18next';

interface SettingsMenuProps {
    isOpen: boolean;
    onClose: () => void;
    anchorRef: React.RefObject<HTMLButtonElement>;
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({ isOpen, onClose, anchorRef }) => {
    const { theme, setTheme } = useTheme();
    const { t, i18n } = useTranslation();
    const menuRef = useRef<HTMLDivElement>(null);
    const [activeSubmenu, setActiveSubmenu] = useState<'theme' | 'language' | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                anchorRef.current &&
                !anchorRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose, anchorRef]);

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            ref={menuRef}
            className="absolute bottom-16 left-4 z-50 min-w-[200px] bg-white dark:bg-gray-900 rounded-xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-gray-800 py-2 animate-in slide-in-from-bottom-2 fade-in duration-200 origin-bottom-left"
        >
            <div className="flex flex-col">
                {/* Theme Option */}
                <div
                    className="relative group"
                    onMouseEnter={() => setActiveSubmenu('theme')}
                    onMouseLeave={() => setActiveSubmenu(null)}
                >
                    <button className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-center gap-3">
                            {theme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            <span>{t('settings.theme')}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>

                    {/* Submenu */}
                    {activeSubmenu === 'theme' && (
                        <div className="absolute left-full bottom-0 pl-2 min-w-[160px]">
                            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-gray-800 py-2">
                                <button
                                    onClick={() => {
                                        setTheme('light');
                                        onClose();
                                    }}
                                    className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Sun className="w-4 h-4" />
                                        <span>{t('settings.light')}</span>
                                    </div>
                                    {theme === 'light' && <Check className="w-4 h-4 text-teal-600" />}
                                </button>
                                <button
                                    onClick={() => {
                                        setTheme('dark');
                                        onClose();
                                    }}
                                    className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Moon className="w-4 h-4" />
                                        <span>{t('settings.dark')}</span>
                                    </div>
                                    {theme === 'dark' && <Check className="w-4 h-4 text-teal-600" />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Language Option */}
                <div
                    className="relative group"
                    onMouseEnter={() => setActiveSubmenu('language')}
                    onMouseLeave={() => setActiveSubmenu(null)}
                >
                    <button className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-center gap-3">
                            <Globe className="w-4 h-4" />
                            <span>{t('settings.language')}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>

                    {/* Language Submenu */}
                    {activeSubmenu === 'language' && (
                        <div className="absolute left-full bottom-0 pl-2 min-w-[160px]">
                            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-gray-800 py-2">
                                <button
                                    onClick={() => changeLanguage('es')}
                                    className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <span>🇪🇸 Español</span>
                                    </div>
                                    {i18n.language === 'es' && <Check className="w-4 h-4 text-teal-600" />}
                                </button>
                                <button
                                    onClick={() => changeLanguage('en')}
                                    className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <span>🇬🇧 English</span>
                                    </div>
                                    {i18n.language === 'en' && <Check className="w-4 h-4 text-teal-600" />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
            <div className="mt-2 border-t border-gray-100 dark:border-gray-800 pt-2 px-3 pb-2 text-[10px] text-gray-400 dark:text-gray-600 text-center">
                Jano v0.1.0
            </div>
        </div>
    );
};
