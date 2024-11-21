'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ResumeForm() {
  const [formData, setFormData] = useState({
    resume_style: '',
    user_data: '',
    latex_code: ''
  })
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      // Validate JSON
      let parsedUserData
      try {
        parsedUserData = JSON.parse(formData.user_data)
      } catch (jsonError) {
        throw new Error('Invalid JSON format in user data. Please check your input.')
      }

      // Additional validation for required fields
      if (!parsedUserData.name || !parsedUserData.contact_information || !parsedUserData.summary) {
        throw new Error('Missing required fields in user data. Please include name, contact_information, and summary.')
      }

      const response = await fetch('/api/save-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume_style: formData.resume_style,
          user_data: parsedUserData,
          latex_code: formData.latex_code
        }),
      })

      if (response.ok) {
        alert('Resume data saved successfully!')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save resume data')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="resume_style">Resume Style</Label>
        <Select onValueChange={(value) => setFormData(prev => ({ ...prev, resume_style: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select a style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Modern">Modern</SelectItem>
            <SelectItem value="Classic">Classic</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="user_data">User Data (JSON format)</Label>
        <Textarea 
          id="user_data" 
          value={formData.user_data}
          onChange={(e) => setFormData(prev => ({ ...prev, user_data: e.target.value }))}
          rows={10}
          placeholder={`{
  "name": "John Doe",
  "contact_information": {
    "email": "john@example.com",
    "phone": "123-456-7890",
    "linkedin": "linkedin.com/in/johndoe",
    "github": "github.com/johndoe"
  },
  "summary": "Experienced software developer with 5 years of experience in web technologies.",
  "education": [
    {
      "degree": "B.S. in Computer Science",
      "institution": "University of Technology",
      "graduation_date": "May 2018"
    }
  ],
  "experience": [
    {
      "job_title": "Senior Developer",
      "company": "Tech Solutions Inc.",
      "start_date": "June 2020",
      "end_date": "Present",
      "responsibilities": [
        "Led development of company's main product",
        "Mentored junior developers"
      ]
    }
  ],
  "skills": ["JavaScript", "React", "Node.js", "Python"],
  "projects": [
    {
      "title": "E-commerce Platform",
      "description": "Developed a full-stack e-commerce solution"
    }
  ]
}`}
          required 
          aria-describedby="user-data-format"
        />
        <p id="user-data-format" className="text-sm text-muted-foreground mt-2">
          Please ensure your JSON is properly formatted and includes at least the name, contact_information, and summary fields.
        </p>
      </div>
      <div>
        <Label htmlFor="latex_code">LaTeX Code</Label>
        <Textarea 
          id="latex_code" 
          value={formData.latex_code}
          onChange={(e) => setFormData(prev => ({ ...prev, latex_code: e.target.value }))}
          rows={5}
          placeholder="\documentclass{article}
\begin{document}
% Your LaTeX code here
\end{document}"
          required 
        />
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button type="submit">Save Resume Data</Button>
    </form>
  )
}

