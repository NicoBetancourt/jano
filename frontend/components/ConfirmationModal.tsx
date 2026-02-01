import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 transition-colors"
                role="dialog"
                aria-modal="true"
            >
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0 transition-colors">
                            <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">{title}</h3>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed transition-colors">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/30 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-700 transition-colors">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white shadow-sm border-transparent focus:ring-red-500"
                    >
                        Delete Chat
                    </Button>
                </div>
            </div>
        </div>
    );
};
