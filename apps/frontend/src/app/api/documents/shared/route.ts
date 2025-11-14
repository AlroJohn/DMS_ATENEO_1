import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Extract search params
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';

    // Forward the request to the backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const backendResponse = await fetch(`${backendUrl}/api/shared?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Copy cookies from the incoming request to maintain session
        ...(request.headers.get('cookie') ? { 'Cookie': request.headers.get('cookie')! } : {}),
      },
      credentials: 'include',  // Include cookies in the request
    });

    const result = await backendResponse.json();

    if (!backendResponse.ok) {
      return Response.json(
        { 
          error: { 
            message: result.error || 'Failed to fetch shared documents',
            details: result.error 
          } 
        },
        { status: backendResponse.status }
      );
    }

    return Response.json({
      success: true,
      data: result.data || [],
      meta: result.meta || null
    });
  } catch (error) {
    console.error('Error fetching shared documents:', error);
    
    return Response.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}