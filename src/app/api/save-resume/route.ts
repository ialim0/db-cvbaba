// File: /pages/api/save-resume.ts

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define interfaces matching the frontend
interface ContactInfo {
  email: string;
  phone?: string;
  linkedin?: string;
}

interface Experience {
  title: string;
  company: string;
  start_date: string;
  end_date: string;
  achievements: string[];
}

interface Education {
  degree: string;
  institution: string;
  graduation_date: string;
}

interface UserInfo {
  name: string;
  contact: ContactInfo;
  summary: string;
  experience?: Experience[];
  education?: Education[];
  skills?: string[];
  user_prompt?: string;
  photo_url?: string;
  job_description?: string;
}

interface FormData {
  style: 'Minimalist' | 'Modern' | 'Creative';
  user_info: UserInfo;
  output: string;
}

export async function POST(req: Request) {
  try {
    const { style, user_info, output } = (await req.json()) as FormData;

    // Basic validation
    if (!style || !user_info || !output) {
      return NextResponse.json(
        { message: 'Invalid data structure: Missing style, user_info, or output fields.' },
        { status: 400 }
      );
    }

    // Validate required fields in user_info
    const { name, contact, summary } = user_info;

    if (!name || !contact?.email || !summary) {
      return NextResponse.json(
        { message: 'Missing required fields: name, contact.email, or summary.' },
        { status: 400 }
      );
    }

    // Optional field type validations
    if (user_info.photo_url && typeof user_info.photo_url !== 'string') {
      return NextResponse.json(
        { message: 'Invalid type for photo_url. It must be a string.' },
        { status: 400 }
      );
    }

    if (user_info.job_description && typeof user_info.job_description !== 'string') {
      return NextResponse.json(
        { message: 'Invalid type for job_description. It must be a string.' },
        { status: 400 }
      );
    }

    if (user_info.user_prompt && typeof user_info.user_prompt !== 'string') {
      return NextResponse.json(
        { message: 'Invalid type for user_prompt. It must be a string.' },
        { status: 400 }
      );
    }

    // Define the system prompt
    const systemPrompt = `You are an AI assistant specialized in generating professional resumes in LaTeX format. Your task is to create a well-structured, aesthetically pleasing, and comprehensive resume based on the provided user information. Ensure that the resume adheres to the specified style and includes only the relevant sections as per the user's input.`;

    // Construct textual prompt for fine-tuning
    let textualPrompt = `${systemPrompt}

Task: Generate a professional resume LaTeX template
Constraints:
- Style: ${style}
- Page Limit: 1
- Sections: header, summary, experience, education, skills`;

    // Add optional sections if provided
    if (user_info.job_description) {
      textualPrompt += `, job_description`;
    }

    textualPrompt += `

User Profile:
Name: ${name}
Email: ${contact.email}
Phone: ${contact.phone || 'N/A'}
LinkedIn: ${contact.linkedin ? `https://${contact.linkedin}` : 'N/A'}
Summary: ${summary}`;

    if (user_info.user_prompt) {
      textualPrompt += `
User Prompt: ${user_info.user_prompt}`;
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
                `${exp.title} at ${exp.company} (${exp.start_date} - ${exp.end_date})
- ${exp.achievements.join('\n- ')}`
            )
            .join('\n\n')
        : 'N/A'
    }

Education:
${
      user_info.education && user_info.education.length > 0
        ? user_info.education
            .map((edu: Education) => `${edu.degree}, ${edu.institution}, ${edu.graduation_date}`)
            .join('\n')
        : 'N/A'
    }

Skills:
${
      user_info.skills && user_info.skills.length > 0
        ? user_info.skills.join(', ')
        : 'N/A'
    }

Generate the LaTeX code for the resume based on the above information.`;

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
