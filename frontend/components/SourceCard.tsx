import React from 'react';
import { SourceDocument } from '../types';
import { FileText, Link as LinkIcon, File } from 'lucide-react';

interface SourceCardProps {
  source: SourceDocument;
}

export const SourceCard: React.FC<SourceCardProps> = ({ source }) => {
  const getIcon = () => {
    switch (source.type) {
      case 'pdf': return <FileText className="w-5 h-5 text-white" />;
      case 'link': return <LinkIcon className="w-4 h-4 text-gray-500" />;
      default: return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const isPdf = source.type === 'pdf';

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-teal-50 transition-colors mb-2 ${isPdf ? 'bg-teal-50/50' : 'bg-transparent'}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isPdf ? 'bg-teal-600' : 'bg-gray-100'}`}>
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 truncate">{source.name}</h4>
        <p className="text-xs text-gray-500 truncate">{source.status} {source.timeInfo}</p>
      </div>
    </div>
  );
};