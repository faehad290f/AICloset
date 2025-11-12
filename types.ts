
export interface ImageFile {
  file: File;
  previewUrl: string;
}

export interface ImagePart {
  inlineData: {
    data: string; // base64
    mimeType: string;
  };
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  sources?: GroundingSource[];
}

export interface GroundingSource {
  web: {
    uri: string;
    title: string;
  };
}

export type Tab = 'try-on' | 'advisor';
