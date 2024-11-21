// File: components/ResumeForm.tsx

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Define interfaces for form data
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
  style: 'Minimalist' | 'Modern' | 'Creative' | '';
  user_info: string; // JSON string
  output: string;
}

const initialFormData: FormData = {
  style: '',
  user_info: `{
  "name": "John Doe",
  "contact": {
    "email": "john@example.com",
    "phone": "123-456-7890",
    "linkedin": "linkedin.com/in/johndoe"
  },
  "summary": "Senior Software Engineer with 7+ years of experience in full-stack development",
  "experience": [
    {
      "title": "Senior Software Engineer",
      "company": "Tech Innovations Inc.",
      "start_date": "2020-01",
      "end_date": "Present",
      "achievements": [
        "Led development of scalable microservices architecture",
        "Reduced system latency by 40% through optimized algorithms"
      ]
    }
  ],
  "education": [
    {
      "degree": "M.S. Computer Science",
      "institution": "Stanford University",
      "graduation_date": "2019-06"
    }
  ],
  "skills": ["Python", "TypeScript", "React", "Node.js", "Docker", "Kubernetes"],
  "user_prompt": "", // Optional: Your prompt to the employer
  "photo_url": "", // Optional: Provide a URL to your photo
  "job_description": "" // Optional: Describe the job you're applying for
}`,
  output: `\\documentclass{article}
\\usepackage{graphicx}
\\usepackage[margin=1in]{geometry}
\\usepackage{hyperref}
\\begin{document}

\\begin{center}
    % If photo_url is provided, include the photo
    % Uncomment the following line and provide the correct path to the photo
    % \\includegraphics[width=2cm]{path/to/photo.jpg} \\\\
    \\textbf{John Doe}
\\end{center}

% If user_prompt is provided, include the User Prompt section
% Uncomment the following lines to include User Prompt
% \\section*{User Prompt}
% I am looking to apply for a senior software engineering position.

\\section*{Contact}
Email: john@example.com \\\\
Phone: 123-456-7890 \\\\
LinkedIn: \\href{https://linkedin.com/in/johndoe}{linkedin.com/in/johndoe}

\\section*{Summary}
Senior Software Engineer with 7+ years of experience in full-stack development.

% If job_description is provided, include the Job Description section
% Uncomment the following lines to include Job Description
% \\section*{Job Description}
% Responsible for developing scalable web applications and leading the engineering team.

\\section*{Experience}
\\textbf{Senior Software Engineer} \\\\
Tech Innovations Inc., 2020-01 -- Present
\\begin{itemize}
    \\item Led development of scalable microservices architecture
    \\item Reduced system latency by 40% through optimized algorithms
\\end{itemize}

\\section*{Education}
\\textbf{M.S. Computer Science} \\\\
Stanford University, 2019-06

\\section*{Skills}
Python, TypeScript, React, Node.js, Docker, Kubernetes

\\end{document}`
};

export default function ResumeForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handler for form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      // Validate Resume Style
      if (!formData.style) {
        throw new Error('Please select a resume style.');
      }

      // Parse and validate User Info JSON
      let parsedUserInfo: UserInfo;
      try {
        parsedUserInfo = JSON.parse(formData.user_info);
      } catch {
        throw new Error('Invalid JSON format in User Information. Please check your input.');
      }

      // Validate required fields in User Info
      if (
        !parsedUserInfo.name ||
        !parsedUserInfo.contact?.email ||
        !parsedUserInfo.summary
      ) {
        throw new Error(
          'Missing required fields in User Information. Please include name, contact.email, and summary.'
        );
      }

      // Optionally validate new fields if provided
      if (parsedUserInfo.photo_url && typeof parsedUserInfo.photo_url !== 'string') {
        throw new Error('photo_url must be a string.');
      }

      if (parsedUserInfo.job_description && typeof parsedUserInfo.job_description !== 'string') {
        throw new Error('job_description must be a string.');
      }

      if (parsedUserInfo.user_prompt && typeof parsedUserInfo.user_prompt !== 'string') {
        throw new Error('user_prompt must be a string.');
      }

      // Validate Output
      if (!formData.output.trim()) {
        throw new Error('Output field cannot be empty.');
      }

      // Assemble the payload
      const payload = {
        style: formData.style,
        user_info: parsedUserInfo,
        output: formData.output.trim(),
      };

      // Send data to backend
      const response = await fetch('/api/save-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess('Resume data saved successfully!');
        // Reset the form to initial state
        setFormData(initialFormData);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save resume data');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Resume Style Selection */}
      <div>
        <Label htmlFor="style">Resume Style</Label>
        <Select
          onValueChange={(value: string) =>
            setFormData((prev) => ({
              ...prev,
              style: value as FormData['style'],
            }))
          }
          required
          value={formData.style}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Minimalist">Minimalist</SelectItem>
            <SelectItem value="Modern">Modern</SelectItem>
            <SelectItem value="Creative">Creative</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* User Information Input */}
      <div>
        <Label htmlFor="user_info">User Information (JSON format)</Label>
        <Textarea
          id="user_info"
          value={formData.user_info}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, user_info: e.target.value }))
          }
          rows={25}
          placeholder={`{
  "name": "John Doe",
  "contact": {
    "email": "john@example.com",
    "phone": "123-456-7890",
    "linkedin": "linkedin.com/in/johndoe"
  },
  "summary": "Senior Software Engineer with 7+ years of experience in full-stack development",
  "experience": [
    {
      "title": "Senior Software Engineer",
      "company": "Tech Innovations Inc.",
      "start_date": "2020-01",
      "end_date": "Present",
      "achievements": [
        "Led development of scalable microservices architecture",
        "Reduced system latency by 40% through optimized algorithms"
      ]
    }
  ],
  "education": [
    {
      "degree": "M.S. Computer Science",
      "institution": "Stanford University",
      "graduation_date": "2019-06"
    }
  ],
  "skills": ["Python", "TypeScript", "React", "Node.js", "Docker", "Kubernetes"],
  "user_prompt": "", // Optional: Your prompt to the employer
  "photo_url": "", // Optional: Provide a URL to your photo
  "job_description": "" // Optional: Describe the job you're applying for
}`}
          required
          aria-describedby="user-info-format"
        />
        <p id="user-info-format" className="text-sm text-muted-foreground mt-2">
          Provide a comprehensive JSON profile. Fields like "user_prompt", "photo_url", and "job_description" are optional.
        </p>
      </div>

      {/* Output Input */}
      <div>
        <Label htmlFor="output">Generated LaTeX Code</Label>
        <Textarea
          id="output"
          value={formData.output}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, output: e.target.value }))
          }
          rows={20}
          placeholder={`\\documentclass{article}
\\usepackage{graphicx}
\\usepackage[margin=1in]{geometry}
\\usepackage{hyperref}
\\begin{document}

\\begin{center}
    % If photo_url is provided, include the photo
    % Uncomment the following line and provide the correct path to the photo
    % \\includegraphics[width=2cm]{path/to/photo.jpg} \\\\
    \\textbf{John Doe}
\\end{center}

% If user_prompt is provided, include the User Prompt section
% Uncomment the following lines to include User Prompt
% \\section*{User Prompt}
% I am looking to apply for a senior software engineering position.

\\section*{Contact}
Email: john@example.com \\\\
Phone: 123-456-7890 \\\\
LinkedIn: \\href{https://linkedin.com/in/johndoe}{linkedin.com/in/johndoe}

\\section*{Summary}
Senior Software Engineer with 7+ years of experience in full-stack development.

% If job_description is provided, include the Job Description section
% Uncomment the following lines to include Job Description
% \\section*{Job Description}
% Responsible for developing scalable web applications and leading the engineering team.

\\section*{Experience}
\\textbf{Senior Software Engineer} \\\\
Tech Innovations Inc., 2020-01 -- Present
\\begin{itemize}
    \\item Led development of scalable microservices architecture
    \\item Reduced system latency by 40% through optimized algorithms
\\end{itemize}

\\section*{Education}
\\textbf{M.S. Computer Science} \\\\
Stanford University, 2019-06

\\section*{Skills}
Python, TypeScript, React, Node.js, Docker, Kubernetes

\\end{document}`}
          required
          aria-describedby="output-format"
        />
        <p id="output-format" className="text-sm text-muted-foreground mt-2">
          Input or review the generated LaTeX code for your resume.
        </p>
      </div>

      {/* Error and Success Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert >
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <Button type="submit">Save Fine-Tuning Data</Button>
    </form>
  );
}
