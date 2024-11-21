import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(req: Request) {
  try {
    const jsonlData = await req.json()
    const dataDir = path.join(process.cwd(), 'data')
    const dataFilePath = path.join(dataDir, 'resumes.jsonl')

    // Validate the structure of the jsonlData
    if (!jsonlData.prompt || !jsonlData.completion) {
      return NextResponse.json({ message: 'Invalid data structure' }, { status: 400 })
    }

    // Create the data directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    // Append new data to the file
    const jsonlString = JSON.stringify(jsonlData) + '\n'
    fs.appendFileSync(dataFilePath, jsonlString)

    return NextResponse.json({ message: 'Resume data saved successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error saving resume data:', error)
    return NextResponse.json({ message: 'Failed to save resume data', error: String(error) }, { status: 500 })
  }
}

