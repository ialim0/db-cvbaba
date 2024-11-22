// File: app/api/dg/route.ts

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface FormData {
  messages: Message[];
  style?: 'Minimalist' | 'Modern' | 'Creative';
}

export async function POST(request: Request) {
  try {
    const data = await request.json() as FormData;
    const { style, messages } = data;

    // Basic validation
    if (!style || !['Minimalist', 'Modern', 'Creative'].includes(style)) {
      return NextResponse.json(
        { message: 'Invalid data structure: Missing or invalid style field.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(messages) || messages.length < 2) {
      return NextResponse.json(
        { message: 'Invalid data structure: Messages array must contain at least system and user messages.' },
        { status: 400 }
      );
    }

    // Find user and assistant messages
    const userMessage = messages.find(m => m.role === 'user')?.content;
    const assistantMessage = messages.find(m => m.role === 'assistant')?.content;
    

    if (!userMessage || !assistantMessage) {
      return NextResponse.json(
        { message: 'Invalid data structure: Missing user or assistant message.' },
        { status: 400 }
      );
    }

    const jsonlData = {
      messages: messages.map(({ role, content }) => ({
        role,
        content: content.trim()
      }))
    };

    const dataDir = path.join(process.cwd(), 'data');
    const dataFilePath = path.join(dataDir, 'fine-tuning-data.jsonl');

    // Create the data directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Append new data to the JSONL file
    const jsonlString = JSON.stringify(jsonlData) + '\n';
    fs.appendFileSync(dataFilePath, jsonlString);

    return NextResponse.json({ 
      success: true,
      message: 'Resume data saved successfully.' 
    });

  } catch (error) {
    console.error('Error saving resume data:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to save resume data.', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}