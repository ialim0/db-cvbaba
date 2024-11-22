'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsTrigger, TabsList } from '@/components/ui/tabs';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface FormData {
  messages: Message[];
  style?: 'Minimalist' | 'Modern' | 'Creative' | '';
}

const initialFormData: FormData = {
  style: 'Minimalist',
  messages: [
    {
      role: 'system',
      content: 'You are a professional resume writer specializing in LaTeX templates.'
    },
    {
      role: 'user',
      content: `Task: Generate a professional resume LaTeX template
Style: Minimalist
Page Limit: 1

User Profile:
Name: John Doe
Email: john@example.com
Phone: 123-456-7890
LinkedIn: linkedin.com/in/johndoe
Summary: Senior Software Engineer with 7+ years of experience in full-stack development

Experience:
Senior Software Engineer at Tech Innovations Inc. (2020-01 - Present)
- Led development of scalable microservices architecture
- Reduced system latency by 40% through optimized algorithms

Education:
M.S. Computer Science, Stanford University, 2019-06

Skills:
Python, TypeScript, React, Node.js, Docker, Kubernetes`
    },
    {
      role: 'assistant',
      content: `\\documentclass{article}
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
    }
  ]
};

export default function ResumeForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('user');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (!formData.style) {
        throw new Error('Please select a resume style.');
      }

      if (!formData.messages || formData.messages.length < 2) {
        throw new Error('Both user message and assistant response are required.');
      }

      const response = await fetch('/api/save-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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

  const handleMessageChange = (role: 'system' | 'user' | 'assistant', content: string) => {
    setFormData(prev => ({
      ...prev,
      messages: prev.messages.map(msg => 
        msg.role === role ? { ...msg, content } : msg
      )
    }));
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="user">User</TabsTrigger>
          <TabsTrigger value="assistant">Assistant</TabsTrigger>
        </TabsList>
        
        <TabsContent value="system">
          <div>
            <Label htmlFor="system-message">System Message</Label>
            <Textarea
              id="system-message"
              value={formData.messages.find(m => m.role === 'system')?.content || ''}
              onChange={(e) => handleMessageChange('system', e.target.value)}
              rows={5}
              placeholder="Enter system message..."
            />
          </div>
        </TabsContent>

        <TabsContent value="user">
          <div>
            <Label htmlFor="user-message">User Message</Label>
            <Textarea
              id="user-message"
              value={formData.messages.find(m => m.role === 'user')?.content || ''}
              onChange={(e) => handleMessageChange('user', e.target.value)}
              rows={20}
              placeholder="Enter user message..."
            />
          </div>
        </TabsContent>

        <TabsContent value="assistant">
          <div>
            <Label htmlFor="assistant-message">Assistant Response (LaTeX)</Label>
            <Textarea
              id="assistant-message"
              value={formData.messages.find(m => m.role === 'assistant')?.content || ''}
              onChange={(e) => handleMessageChange('assistant', e.target.value)}
              rows={20}
              placeholder="Enter LaTeX response..."
            />
          </div>
        </TabsContent>
      </Tabs>

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