declare module '@google/genai' {
  export class GoogleGenAI {
    constructor(options: { apiKey: string });
    readonly models: Models;
  }

  export interface Models {
    generateContent(options: {
      model: string;
      contents: string;
    }): Promise<GenerateContentResponse>;
  }

  export interface GenerateContentResponse {
    text?: string;
  }
}

