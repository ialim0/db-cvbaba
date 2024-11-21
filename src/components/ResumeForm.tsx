// File: components/ResumeForm.tsx

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
  style?: 'Minimalist' | 'Modern' | 'Creative' | '';
  user_info: string; 
  output: string;
}

const initialFormData: FormData = {
  style: 'Minimalist',
  user_info: `{
    "task": "Generate a professional resume LaTeX template",
    "page_limit": 1,
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
    "user_prompt": "",
    "photo_url": "",
    "job_description": ""
  }`,
  output: `\\documentclass{article}
\\usepackage{graphicx}
\\usepackage[margin=1in]{geometry}
\\usepackage{hyperref}
\\begin{document}

\\begin{center}
    \\textbf{John Doe}
\\end{center}

\\section*{Contact}
Email: john@example.com \\\\
Phone: 123-456-7890 \\\\
LinkedIn: \\href{https://linkedin.com/in/johndoe}{linkedin.com/in/johndoe}

\\section*{Summary}
Senior Software Engineer with 7+ years of experience in full-stack development.

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      let parsedUserInfo: UserInfo = {};
      if (formData.user_info.trim()) {
        try {
          parsedUserInfo = JSON.parse(formData.user_info);
        } catch {
          throw new Error('Invalid JSON format in User Information. Please check your input.');
        }
      }

      if (!parsedUserInfo.task || typeof parsedUserInfo.task !== 'string') {
        parsedUserInfo.task = 'Generate a professional resume LaTeX template';
      }

      if (
        parsedUserInfo.page_limit === undefined ||
        typeof parsedUserInfo.page_limit !== 'number' ||
        parsedUserInfo.page_limit < 1
      ) {
        parsedUserInfo.page_limit = 1;
      }

      if (!formData.style) {
        throw new Error('Please select a resume style.');
      }

      if (parsedUserInfo.photo_url && typeof parsedUserInfo.photo_url !== 'string') {
        throw new Error('photo_url must be a string.');
      }

      if (parsedUserInfo.job_description && typeof parsedUserInfo.job_description !== 'string') {
        throw new Error('job_description must be a string.');
      }

      if (parsedUserInfo.user_prompt && typeof parsedUserInfo.user_prompt !== 'string') {
        throw new Error('user_prompt must be a string.');
      }

      if (!formData.output.trim()) {
        throw new Error('Output field cannot be empty.');
      }

      const payload = {
        style: formData.style,
        user_info: parsedUserInfo,
        output: formData.output.trim(),
      };

      const response = await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess('Resume data saved successfully!');

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

      <div>
        <Label htmlFor="user_info">User Information (JSON format)</Label>
        <Textarea
          id="user_info"
          value={formData.user_info}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, user_info: e.target.value }))
          }
          rows={30}
          placeholder={`{
  "task": "Generate a professional resume LaTeX template",
  "page_limit": 1,
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
  "user_prompt": "",
  "photo_url": "",
  "job_description": ""
}`}
          aria-describedby="user-info-format"
        />
        <p id="user-info-format" className="text-sm text-muted-foreground mt-2">
          Provide a comprehensive JSON profile. Fields like "user_prompt", "photo_url", and "job_description" are optional.
          Additionally, include "task" and "page_limit" within the JSON. If omitted, default values will be used.
        </p>
      </div>

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
    \\textbf{John Doe}
\\end{center}

\\section*{Contact}
Email: john@example.com \\\\
Phone: 123-456-7890 \\\\
LinkedIn: \\href{https://linkedin.com/in/johndoe}{linkedin.com/in/johndoe}

\\section*{Summary}
Senior Software Engineer with 7+ years of experience in full-stack development.

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
          aria-describedby="output-format"
        />
        <p id="output-format" className="text-sm text-muted-foreground mt-2">
          Input or review the generated LaTeX code for your resume.
        </p>
      </div>

 
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Button type="submit">Save Fine-Tuning Data</Button>
    </form>
  );
}
