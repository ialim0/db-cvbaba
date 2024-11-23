// components/ResumeForm.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsTrigger, TabsList } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'; 

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface FormData {
  messages: Message[];
  style?: 'Minimalist' | 'Modern' | 'Creative' | '';
}

const getSystemMessageForStyle = (style: FormData['style']) => {
  const baseMessage = 'You are a LaTeX resume template generator. Provide only the complete LaTeX code without any explanations, comments, or markdown formatting. The output should be pure LaTeX that can be directly compiled.';
  
  switch (style) {
    case 'Minimalist':
      return `${baseMessage} Generate a minimalist template with clean layouts, essential information, and efficient use of white space. Avoid decorative elements and keep the design straightforward.`;
    case 'Modern':
      return `${baseMessage} Generate a modern template with subtle design elements, professional typography, and balanced white space. Include contemporary formatting while maintaining readability.`;
    case 'Creative':
      return `${baseMessage} Generate a creative template with unique layouts that stand out while maintaining professionalism. Use innovative formatting, thoughtful typography, and creative section arrangements.`;
    default:
      return baseMessage;
  }
};

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

const initialFormData: FormData = {
  style: 'Minimalist',
  messages: [
    {
      role: 'system',
      content: getSystemMessageForStyle('Minimalist'),
    },
    {
      role: 'user',
      content: generateUserMessageContent('Minimalist'),
    },
    {
      role: 'assistant',
      content: `\\documentclass[11pt,a4paper]{moderncv}
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
\\end{document}`,
    },
  ],
};

export default function ResumeForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [newMessage, setNewMessage] = useState('');
  const [isUserMessage, setIsUserMessage] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const updateSystemMessage = (style: FormData['style']) => {
    const newSystemMessage = getSystemMessageForStyle(style);
    setFormData((prev) => ({
      ...prev,
      messages: prev.messages.map((msg) =>
        msg.role === 'system' ? { ...msg, content: newSystemMessage } : msg
      ),
    }));
  };

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
        return msg;
      });

      return {
        ...prev,
        style: newStyle,
        messages: updatedMessages,
      };
    });
  };

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
      ],
    });
    setActiveTab('chat');
  };

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

  const handleEditMessage = (index: number, content: string) => {
    setFormData((prev) => ({
      ...prev,
      messages: prev.messages.map((msg, i) => (i === index ? { ...msg, content } : msg)),
    }));
  };

  const handleDeleteMessage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      messages: prev.messages.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      if (!formData.style) {
        throw new Error('Please select a resume style.');
      }

      if (!formData.messages || formData.messages.length < 2) {
        throw new Error('At least one user message and one assistant response are required.');
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
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex-1 mr-4">
            <Label htmlFor="style">Resume Style</Label>
            <Select onValueChange={handleStyleChange} required value={formData.style}>
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

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="edit">Edit Messages</TabsTrigger>
          </TabsList>

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
                            message.role === 'user' ? 'bg-muted ml-12' : 'bg-primary/10 mr-12'
                          }`}
                        >
                          <div className="font-semibold mb-2">
                            {message.role === 'user' ? 'User' : 'Assistant'}
                          </div>
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        </div>
                      )
                  )}
                </ScrollArea>

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
                      onValueChange={(value) => setIsUserMessage(value === 'user')}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select message type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User Message</SelectItem>
                        <SelectItem value="assistant">Assistant Message</SelectItem>
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

          <TabsContent value="edit">
            <ScrollArea className="h-[600px]">
              {formData.messages.map((message, index) => (
                <div key={index} className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <Label>
                      {message.role.charAt(0).toUpperCase() + message.role.slice(1)} Message
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

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Fine-Tuning Data'}
        </Button>
      </form>

      <Modal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)}>
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