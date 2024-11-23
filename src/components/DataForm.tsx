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
import { Tabs, TabsContent, TabsTrigger, TabsList } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';

// Define types for message and form data
type MessageRole = 'system' | 'user' | 'assistant';

interface Message {
  role: MessageRole;
  content: string;
}

type ResumeStyle = 'Minimalist' | 'Modern' | 'Creative' | '';

interface FormData {
  messages: Message[];
  style: ResumeStyle;
}

const getSystemMessageForStyle = (style: ResumeStyle): string => {
  const styles: Record<Exclude<ResumeStyle, ''>, string> = {
    Minimalist: `You are a LaTeX resume template generator. Provide only the complete LaTeX code without any explanations, comments, or markdown formatting. The output should be pure LaTeX that can be directly compiled. Generate a minimalist template with clean layouts, essential information, and efficient use of white space. Avoid decorative elements and keep the design straightforward.`,
    Modern: `You are a LaTeX resume template generator. Provide only the complete LaTeX code without any explanations, comments, or markdown formatting. The output should be pure LaTeX that can be directly compiled. Generate a modern template with subtle design elements, professional typography, and balanced white space. Include contemporary formatting while maintaining readability.`,
    Creative: `You are a LaTeX resume template generator. Provide only the complete LaTeX code without any explanations, comments, or markdown formatting. The output should be pure LaTeX that can be directly compiled. Generate a creative template with unique layouts that stand out while maintaining professionalism. Use innovative formatting, thoughtful typography, and creative section arrangements.`,
  };

  return styles[style as keyof typeof styles] || `You are a LaTeX resume template generator. Provide only the complete LaTeX code without any explanations, comments, or markdown formatting. The output should be pure LaTeX that can be directly compiled.`;
};

const generateUserMessageContent = (style: ResumeStyle): string => `
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
    { role: 'system', content: getSystemMessageForStyle('Minimalist') },
    { role: 'user', content: generateUserMessageContent('Minimalist') },
  ],
};

const DataForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'edit'>('chat');
  const [newMessage, setNewMessage] = useState('');
  const [isUserMessage, setIsUserMessage] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleStyleChange = (value: string) => {
    const style = value as ResumeStyle;
    setFormData((prev) => ({
      style,
      messages: prev.messages.map((msg) =>
        msg.role === 'system'
          ? { ...msg, content: getSystemMessageForStyle(style) }
          : msg.role === 'user'
          ? { ...msg, content: generateUserMessageContent(style) }
          : msg
      ),
    }));
  };

  const handleAddMessage = () => {
    if (!newMessage.trim()) return;
    const newMessageObj: Message = {
      role: isUserMessage ? 'user' : 'assistant',
      content: newMessage.trim(),
    };
    setFormData((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessageObj],
    }));
    setNewMessage('');
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      if (!formData.style) throw new Error('Please select a resume style.');

      const response = await fetch('/api/dg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save resume data');
      }

      setSuccess('Resume data saved successfully!');
      setIsSuccessModalOpen(true);
    } catch (err) {
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
            <Select onValueChange={handleStyleChange} value={formData.style}>
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
          <Button type="button" variant="outline" onClick={() => setFormData(initialFormData)}>
            Reset
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'chat' | 'edit')}>
          <TabsList>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="edit">Edit Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <Card>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {formData.messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`mb-4 p-4 rounded-lg ${
                        msg.role === 'user' ? 'bg-muted' : 'bg-primary/10'
                      }`}
                    >
                      <div className="font-semibold">{msg.role.toUpperCase()}</div>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  ))}
                </ScrollArea>
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  rows={3}
                />
                <div className="flex justify-between mt-2">
                  <Select
                    value={isUserMessage ? 'user' : 'assistant'}
                    onValueChange={(value) => setIsUserMessage(value === 'user')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Message Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="assistant">Assistant</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddMessage}>Add Message</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="edit">
            <ScrollArea className="h-[600px]">
              {formData.messages.map((msg, idx) => (
                <div key={idx} className="mb-6">
                  <Label>{msg.role.charAt(0).toUpperCase() + msg.role.slice(1)} Message</Label>
                  <Textarea
                    value={msg.content}
                    readOnly={msg.role === 'system'}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        messages: prev.messages.map((m, i) =>
                          i === idx ? { ...m, content: e.target.value } : m
                        ),
                      }))
                    }
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
          {isSubmitting ? 'Saving...' : 'Save Data'}
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
};

export default DataForm;
