import { revalidatePath } from 'next/cache';

export async function POST(request) {
  try {
    const { path } = await request.json();
    
    if (!path) {
      return Response.json({ message: 'Path is required' }, { status: 400 });
    }

    revalidatePath(path);
    
    return Response.json({ 
      message: 'Path revalidated successfully',
      path: path 
    });
  } catch (error) {
    console.error('Error revalidating path:', error);
    return Response.json({ 
      message: 'Error revalidating path' 
    }, { status: 500 });
  }
}