// File: /pages/api/save-resume.ts

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define interfaces matching the frontend
interface ContactInfo {
  email?: string;
  phone?: string;
  linkedin?: string;
}

interface Experience {
  title?: string;
  company?: string;
  start_date?: string;
  end_date?: string;
  achievements?: string[];
}

interface Education {
  degree?: string;
  institution?: string;
  graduation_date?: string;
}

interface UserInfo {
  task?: string;
  page_limit?: number;
  name?: string;
  contact?: ContactInfo;
  summary?: string;
  experience?: Experience[];
  education?: Education[];
  skills?: string[];
  user_prompt?: string;
  photo_url?: string;
  job_description?: string;
}

interface FormData {
  style?: 'Minimalist' | 'Modern' | 'Creative';
  user_info?: UserInfo;
  output?: string;
}

// Utility function to safely access nested properties
const getNestedProperty = (obj: any, path: string[], defaultValue: any = 'N/A') => {
  return path.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : defaultValue), obj);
};

export async function POST(req: Request) {
  try {
    const { style, user_info, output } = (await req.json()) as FormData;

    // Basic validation for style and output
    if (!style || !['Minimalist', 'Modern', 'Creative'].includes(style)) {
      return NextResponse.json(
        { message: 'Invalid data structure: Missing or invalid style field.' },
        { status: 400 }
      );
    }

    if (!output || typeof output !== 'string') {
      return NextResponse.json(
        { message: 'Invalid data structure: Missing or invalid output field.' },
        { status: 400 }
      );
    }

    // Validate that user_info exists
    if (!user_info) {
      return NextResponse.json(
        { message: 'Invalid data structure: Missing user_info field.' },
        { status: 400 }
      );
    }

    // Assign default values if task or page_limit are missing
    if (!user_info.task || typeof user_info.task !== 'string') {
      user_info.task = 'Generate a professional resume LaTeX template';
    }

    if (
      user_info.page_limit === undefined ||
      typeof user_info.page_limit !== 'number' ||
      user_info.page_limit < 1
    ) {
      user_info.page_limit = 1;
    }

    // Optionally validate other fields
    if (user_info.photo_url && typeof user_info.photo_url !== 'string') {
      return NextResponse.json(
        { message: 'Invalid data structure: photo_url must be a string.' },
        { status: 400 }
      );
    }

    if (user_info.job_description && typeof user_info.job_description !== 'string') {
      return NextResponse.json(
        { message: 'Invalid data structure: job_description must be a string.' },
        { status: 400 }
      );
    }

    if (user_info.user_prompt && typeof user_info.user_prompt !== 'string') {
      return NextResponse.json(
        { message: 'Invalid data structure: user_prompt must be a string.' },
        { status: 400 }
      );
    }

    // Start constructing the textual prompt using user-provided task and page_limit
    let textualPrompt = `Task: ${user_info.task}
Constraints:
- Style: ${style}
- Page Limit: ${user_info.page_limit}`;

    textualPrompt += `

User Profile:`;

    if (user_info.name) {
      textualPrompt += `
Name: ${user_info.name}`;
    }
    if (user_info.contact) {
      const email = getNestedProperty(user_info, ['contact', 'email']);
      const phone = getNestedProperty(user_info, ['contact', 'phone']);
      const linkedin = getNestedProperty(user_info, ['contact', 'linkedin']);
      textualPrompt += `
Email: ${email}
Phone: ${phone}
LinkedIn: ${linkedin !== 'N/A' ? `https://${linkedin}` : 'N/A'}`;
    }
    if (user_info.summary) {
      textualPrompt += `
Summary: ${user_info.summary}`;
    }
    if (user_info.user_prompt) {
      textualPrompt += `

User Prompt:
${user_info.user_prompt}`;
    }
    if (user_info.photo_url) {
      textualPrompt += `
Photo URL: ${user_info.photo_url}`;
    }
    if (user_info.job_description) {
      textualPrompt += `
Job Description: ${user_info.job_description}`;
    }

    textualPrompt += `

Experience:
${
      user_info.experience && user_info.experience.length > 0
        ? user_info.experience
            .map(
              (exp: Experience) =>
                `${exp.title || 'N/A'} at ${exp.company || 'N/A'} (${exp.start_date || 'N/A'} - ${
                  exp.end_date || 'N/A'
                })
- ${exp.achievements && exp.achievements.length > 0 ? exp.achievements.join('\n- ') : 'N/A'}`
            )
            .join('\n\n')
        : 'N/A'
}

Education:
${
      user_info.education && user_info.education.length > 0
        ? user_info.education
            .map(
              (edu: Education) =>
                `${edu.degree || 'N/A'}, ${edu.institution || 'N/A'}, ${edu.graduation_date || 'N/A'}`
            )
            .join('\n')
        : 'N/A'
}

Skills:
${
      user_info.skills && user_info.skills.length > 0
        ? user_info.skills.join(', ')
        : 'N/A'
}
`;

    const jsonlData = {
      prompt: textualPrompt.trim(),
      completion: output.trim(),
    };

    const dataDir = path.join(process.cwd(), 'data');
    const dataFilePath = path.join(dataDir, 'resumes.jsonl');

    // Ensure both prompt and completion are present
    if (!jsonlData.prompt || !jsonlData.completion) {
      return NextResponse.json(
        { message: 'Invalid data structure: Missing prompt or completion fields after processing.' },
        { status: 400 }
      );
    }

    // Create the data directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Append new data to the JSONL file
    const jsonlString = JSON.stringify(jsonlData) + '\n';
    fs.appendFileSync(dataFilePath, jsonlString);

    return NextResponse.json({ message: 'Resume data saved successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Error saving resume data:', error);
    return NextResponse.json(
      { message: 'Failed to save resume data.', error: String(error) },
      { status: 500 }
    );
  }
}
