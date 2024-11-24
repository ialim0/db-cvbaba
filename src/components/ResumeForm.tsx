// components/ResumeForm.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Tabs,
  TabsContent,
  TabsTrigger,
  TabsList,
} from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';

// Optional: If you want syntax highlighting, uncomment the following lines and install react-syntax-highlighter
// import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
// import latex from 'react-syntax-highlighter/dist/cjs/languages/hljs/latex';
// import { docco } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
// SyntaxHighlighter.registerLanguage('latex', latex);

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface FormData {
  messages: Message[];
  style: 'Minimalist' | 'Modern' | 'Creative';
}

// Function to generate system message based on style
const getSystemMessageForStyle = (style: FormData['style']) => {
  const baseMessage = `
You are a LaTeX resume template generator. Your task is to generate a complete LaTeX resume template. The output must:
1. Be ATS-compliant:
   - Avoid graphical elements like tables or images that hinder parsing.
   - Ensure clear text-based formatting.
2. Be directly compilable without errors.
3. Exclude explanations, comments, or markdown formatting.`;

  const styleDetails: Record<FormData['style'], string> = {
    Minimalist: `
Generate a minimalist resume template with clean layouts, essential sections, and efficient use of white space. Avoid decorative elements.`,
    Modern: `
Create a modern resume template with professional typography, subtle design elements, and balanced white space while maintaining readability.`,
    Creative: `
Design a creative resume template with unique layouts and thoughtful typography, balancing originality with ATS compliance.`,
  };

  return `${baseMessage}${styleDetails[style]}`;
};

// Function to generate user message content based on style
const generateUserMessageContent = (style: FormData['style']) => `
Task: Generate a LaTeX resume template
Style: ${style}
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
Python, TypeScript, React, Node.js, Docker, Kubernetes
`;

// Function to generate assistant message based on style
const getAssistantMessageForStyle = (style: FormData['style']) => {
  switch (style) {
    case 'Minimalist':
      return `\\documentclass[11pt,a4paper]{moderncv}
\\moderncvstyle{classic}
\\moderncvcolor{blue}
\\usepackage[utf8]{inputenc}
\\usepackage[scale=0.75]{geometry}
\\usepackage{hyperref}
\\name{John}{Doe}
\\email{john@example.com}
\\phone[mobile]{123-456-7890}
\\social[linkedin]{johndoe}
\\begin{document}
\\makecvtitle
\\section{Summary}
Senior Software Engineer with 7+ years of experience in full-stack development.
\\section{Experience}
\\cventry{2020--Present}{Senior Software Engineer}{Tech Innovations Inc.}{}{}{
  \\begin{itemize}
    \\item Led development of scalable microservices architecture
    \\item Reduced system latency by 40\\% through optimized algorithms
  \\end{itemize}
}
\\section{Education}
\\cventry{2019}{M.S. Computer Science}{Stanford University}{}{}
\\section{Skills}
\\cvitem{}{Python, TypeScript, React, Node.js, Docker, Kubernetes}
\\end{document}`;
    case 'Modern':
      return `\\documentclass[11pt,a4paper]{moderncv}
\\moderncvstyle{banking}
\\moderncvcolor{green}
\\usepackage[utf8]{inputenc}
\\usepackage[scale=0.85]{geometry}
\\usepackage{hyperref}
\\name{John}{Doe}
\\email{john@example.com}
\\phone[mobile]{123-456-7890}
\\social[linkedin]{johndoe}
\\begin{document}
\\makecvtitle
\\section{Summary}
Senior Software Engineer with 7+ years of experience in full-stack development.
\\section{Experience}
\\cventry{2020--Present}{Senior Software Engineer}{Tech Innovations Inc.}{}{}{
  \\begin{itemize}
    \\item Led development of scalable microservices architecture
    \\item Reduced system latency by 40\\% through optimized algorithms
  \\end{itemize}
}
\\section{Education}
\\cventry{2019}{M.S. Computer Science}{Stanford University}{}{}
\\section{Skills}
\\cvitem{}{Python, TypeScript, React, Node.js, Docker, Kubernetes}
\\end{document}`;
    case 'Creative':
      return `\\documentclass[11pt,a4paper]{moderncv}
\\moderncvstyle{casual}
\\moderncvcolor{orange}
\\usepackage[utf8]{inputenc}
\\usepackage[scale=0.8]{geometry}
\\usepackage{hyperref}
\\name{John}{Doe}
\\email{john@example.com}
\\phone[mobile]{123-456-7890}
\\social[linkedin]{johndoe}
\\begin{document}
\\makecvtitle
\\section{Summary}
Senior Software Engineer with 7+ years of experience in full-stack development.
\\section{Experience}
\\cventry{2020--Present}{Senior Software Engineer}{Tech Innovations Inc.}{}{}{
  \\begin{itemize}
    \\item Led development of scalable microservices architecture
    \\item Reduced system latency by 40\\% through optimized algorithms
  \\end{itemize}
}
\\section{Education}
\\cventry{2019}{M.S. Computer Science}{Stanford University}{}{}
\\section{Skills}
\\cvitem{}{Python, TypeScript, React, Node.js, Docker, Kubernetes}
\\end{document}`;
    default:
      return '';
  }
};

// Initial style
const initialStyle: FormData['style'] = 'Minimalist';

// Initial form data with system, user, and assistant messages
const initialFormData: FormData = {
  style: initialStyle,
  messages: [
    {
      role: 'system',
      content: getSystemMessageForStyle(initialStyle),
    },
    {
      role: 'user',
      content: generateUserMessageContent(initialStyle),
    },
    {
      role: 'assistant',
      content: getAssistantMessageForStyle(initialStyle),
    },
  ],
};

export default function ResumeForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'edit'>('chat');
  const [newMessage, setNewMessage] = useState('');
  const [isUserMessage, setIsUserMessage] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Wrapper handler for tab changes to ensure type safety
  const handleTabChange = (value: string) => {
    if (value === 'chat' || value === 'edit') {
      setActiveTab(value);
    } else {
      console.warn(`Unhandled tab value: ${value}`);
    }
  };

  // Update system, user, and assistant messages based on style
  const handleStyleChange = (value: string) => {
    const newStyle = value as FormData['style'];
    setFormData((prev) => {
      const updatedMessages = prev.messages.map((msg) => {
        if (msg.role === 'system') {
          return { ...msg, content: getSystemMessageForStyle(newStyle) };
        }
        if (msg.role === 'user') {
          return { ...msg, content: generateUserMessageContent(newStyle) };
        }
        if (msg.role === 'assistant') {
          return { ...msg, content: getAssistantMessageForStyle(newStyle) };
        }
        return msg;
      });

      return {
        ...prev,
        style: newStyle,
        messages: updatedMessages,
      };
    });
  };

  // Handle initiating a new chat with default style
  const handleNewChat = () => {
    const style = 'Minimalist';
    setFormData({
      style,
      messages: [
        {
          role: 'system',
          content: getSystemMessageForStyle(style),
        },
        {
          role: 'user',
          content: generateUserMessageContent(style),
        },
        {
          role: 'assistant',
          content: getAssistantMessageForStyle(style),
        },
      ],
    });
    setActiveTab('chat');
  };

  // Handle adding a new message
  const handleAddMessage = () => {
    if (!newMessage.trim()) return;

    setFormData((prev) => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          role: isUserMessage ? 'user' : 'assistant',
          content: newMessage.trim(),
        },
      ],
    }));

    setNewMessage('');
  };

  // Handle editing an existing message
  const handleEditMessage = (index: number, content: string) => {
    setFormData((prev) => ({
      ...prev,
      messages: prev.messages.map((msg, i) =>
        i === index ? { ...msg, content } : msg
      ),
    }));
  };

  // Handle deleting a message
  const handleDeleteMessage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      messages: prev.messages.filter((_, i) => i !== index),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      if (!formData.style) {
        throw new Error('Please select a resume style.');
      }

      // Ensure there's at least one user message and one assistant message
      const hasUserMessage = formData.messages.some(
        (msg) => msg.role === 'user'
      );
      const hasAssistantMessage = formData.messages.some(
        (msg) => msg.role === 'assistant'
      );

      if (!hasUserMessage || !hasAssistantMessage) {
        throw new Error(
          'At least one user message and one assistant response are required.'
        );
      }

      const response = await fetch('/api/dg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess('Resume data saved successfully!');
        setIsSuccessModalOpen(true);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save resume data');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Style Selection and New Chat Button */}
        <div className="flex justify-between items-center">
          <div className="flex-1 mr-4">
            <Label htmlFor="style">Resume Style</Label>
            <Select
              onValueChange={handleStyleChange}
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
          <Button type="button" onClick={handleNewChat} variant="outline">
            New Chat
          </Button>
        </div>

        {/* Tabs for Chat and Edit Messages */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="edit">Edit Messages</TabsTrigger>
          </TabsList>

          {/* Chat Tab Content */}
          <TabsContent value="chat">
            <Card>
              <CardContent className="p-4">
                <ScrollArea className="h-[400px] mb-4">
                  {formData.messages.map(
                    (message, index) =>
                      message.role !== 'system' && (
                        <div
                          key={index}
                          className={`mb-4 p-4 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-muted ml-12'
                              : 'bg-primary/10 mr-12'
                          }`}
                        >
                          <div className="font-semibold mb-2">
                            {message.role === 'user' ? 'User' : 'Assistant'}
                          </div>
                          {message.role === 'assistant' ? (
                       
                            <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
                              <code className="font-mono whitespace-pre-wrap">
                                {message.content}
                              </code>
                            </pre>
                          ) : (
                            <div className="whitespace-pre-wrap">
                              {message.content}
                            </div>
                          )}
                        </div>
                      )
                  )}
                </ScrollArea>

                {/* Add New Message Section */}
                <div className="flex flex-col space-y-4">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows={4}
                  />
                  <div className="flex justify-between items-center">
                    <Select
                      value={isUserMessage ? 'user' : 'assistant'}
                      onValueChange={(value) =>
                        setIsUserMessage(value === 'user')
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select message type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User Message</SelectItem>
                        <SelectItem value="assistant">
                          Assistant Message
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="button" onClick={handleAddMessage}>
                      Add Message
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Edit Messages Tab Content */}
          <TabsContent value="edit">
            <ScrollArea className="h-[600px]">
              {formData.messages.map((message, index) => (
                <div key={index} className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <Label>
                      {message.role.charAt(0).toUpperCase() +
                        message.role.slice(1)}{' '}
                      Message
                    </Label>
                    {message.role !== 'system' && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteMessage(index)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                  <Textarea
                    value={message.content}
                    onChange={(e) => handleEditMessage(index, e.target.value)}
                    rows={8}
                    className={message.role === 'system' ? 'bg-muted' : ''}
                    readOnly={message.role === 'system'}
                  />
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Fine-Tuning Data'}
        </Button>
      </form>

      {/* Success Modal */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      >
        <ModalHeader>Success</ModalHeader>
        <ModalBody>
          <p>{success}</p>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setIsSuccessModalOpen(false)}>Close</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
