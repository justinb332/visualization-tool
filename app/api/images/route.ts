import { NextResponse } from 'next/server'
import { readdir, stat } from 'fs/promises'
import { join } from 'path'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const exercise = searchParams.get('exercise') || 'basic-object'
    
    const imagesDirectory = join(process.cwd(), 'public', 'images', exercise)
    const filenames = await readdir(imagesDirectory)
    
    // Filter for image files only
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg']
    const imageFiles = filenames.filter(name => 
      imageExtensions.some(ext => name.toLowerCase().endsWith(ext))
    )
    
    // Create image objects with src paths
    const images = imageFiles.map(filename => ({
      src: `/images/${exercise}/${filename}`,
      name: filename.replace(/\.[^/.]+$/, ""), // Remove extension for display name
      filename,
      exercise
    }))
    
    return NextResponse.json(images)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read images' }, { status: 500 })
  }
}
