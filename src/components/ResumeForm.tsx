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

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface FormData {
  messages: Message[];
  style?: 'Minimalist' | 'Modern' | 'Creative' | '';
}

const initialSystemMessage = 'You are a professional resume writer specializing in LaTeX templates.';

const initialFormData: FormData = {
  style: 'Minimalist',
  messages: [
    {
      role: 'system',
      content: initialSystemMessage
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
  const [activeTab, setActiveTab] = useState('chat');
  const [newMessage, setNewMessage] = useState('');
  const [isUserMessage, setIsUserMessage] = useState(true);

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

      const response = await fetch('/api/dg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess('Resume data saved successfully!');
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

  const handleAddMessage = () => {
    if (!newMessage.trim()) return;

    setFormData(prev => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          role: isUserMessage ? 'user' : 'assistant',
          content: newMessage.trim()
        }
      ]
    }));

    setNewMessage('');
  };

  const handleNewChat = () => {
    setFormData({
      style: 'Minimalist',
      messages: [
        {
          role: 'system',
          content: initialSystemMessage
        }
      ]
    });
    setActiveTab('chat');
  };

  const handleEditMessage = (index: number, content: string) => {
    setFormData(prev => ({
      ...prev,
      messages: prev.messages.map((msg, i) => 
        i === index ? { ...msg, content } : msg
      )
    }));
  };

  const handleDeleteMessage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      messages: prev.messages.filter((_, i) => i !== index)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex-1 mr-4">
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
        <Button type="button" onClick={handleNewChat} variant="outline">
          New Chat
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="edit">Edit Messages</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat">
          <Card>
            <CardContent className="p-4">
              <ScrollArea className="h-[400px] mb-4">
                {formData.messages.map((message, index) => (
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
                ))}
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