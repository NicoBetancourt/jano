import { SourceDocument } from '../types';
import { API_BASE_URL, getAuthHeaders, handleResponse } from './api';

interface DocumentResponse {
    id: number;
    filename: string;
    size: number;
    content_type: string | null;
    created_at: string;
}

const mapDocument = (doc: DocumentResponse): SourceDocument => {
    let type: 'pdf' | 'txt' | 'link' = 'txt';
    if (doc.filename.toLowerCase().endsWith('.pdf')) type = 'pdf';
    // Check for link type if content_type suggests or other logic (not present in current backend)

    return {
        id: String(doc.id),
        name: doc.filename,
        type,
        status: 'synced', // Default to synced as backend stores it
        timeInfo: new Date(doc.created_at).toLocaleDateString(),
    };
};

export const documentService = {
    getDocuments: async (): Promise<SourceDocument[]> => {
        const response = await fetch(`${API_BASE_URL}/documents/`, {
            method: 'GET',
            headers: {
                ...getAuthHeaders(),
            },
        });
        const docs: DocumentResponse[] = await handleResponse(response);
        return docs.map(mapDocument);
    },

    uploadDocument: async (file: File): Promise<SourceDocument> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/documents/upload`, {
            method: 'POST',
            headers: {
                ...getAuthHeaders(),
            },
            body: formData,
        });
        const doc: DocumentResponse = await handleResponse(response);
        return mapDocument(doc);
    }
};
