import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(req: Request) {
  try {
    const resumeData = await req.json()
    const dataDir = path.join(process.cwd(), 'data')
    const dataFilePath = path.join(dataDir, 'resumes.json')

    if (!resumeData.resume_style || !resumeData.user_data || !resumeData.latex_code) {
      return NextResponse.json({ message: 'Invalid resume data structure' }, { status: 400 })
    }

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    let existingData = []
    if (fs.existsSync(dataFilePath)) {
      const fileContent = fs.readFileSync(dataFilePath, 'utf-8')
      existingData = JSON.parse(fileContent)
    }

    existingData.push(resumeData)

    fs.writeFileSync(dataFilePath, JSON.stringify(existingData, null, 2))

    return NextResponse.json({ message: 'Resume data saved successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error saving resume data:', error)
    return NextResponse.json({ message: 'Failed to save resume data', error: String(error) }, { status: 500 })
  }
}

