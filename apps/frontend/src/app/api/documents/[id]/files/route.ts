import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/documents/:id/files
 * Proxies document file listings to the backend, preserving auth cookies
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const cookies = request.headers.get("cookie");

    const response = await fetch(`${backendUrl}/api/documents/${params.id}/files`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(cookies && { Cookie: cookies }),
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: { message: "Failed to fetch document files" },
      }));

      return NextResponse.json(
        {
          success: false,
          error: errorData.error || { message: "Failed to fetch document files" },
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: data.success ?? true,
      data: data.data ?? data,
    });
  } catch (error: any) {
    console.error("Error proxying document file list:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message || "Internal server error" },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/documents/:id/files
 * Proxies document file uploads to the backend, preserving auth cookies
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const cookies = request.headers.get("cookie");
    const formData = await request.formData();
    const files = formData.getAll("files");

    if (!files || files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "At least one file is required" },
        },
        { status: 400 }
      );
    }

    const forwardFormData = new FormData();

    formData.forEach((value, key) => {
      if (typeof value === "string") {
        forwardFormData.append(key, value);
      } else if (value instanceof File) {
        forwardFormData.append(key, value, value.name);
      }
    });

    const response = await fetch(`${backendUrl}/api/documents/${params.id}/files`, {
      method: "POST",
      headers: {
        ...(cookies && { Cookie: cookies }),
      },
      credentials: "include",
      body: forwardFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: { message: "Failed to upload files" },
      }));

      return NextResponse.json(
        {
          success: false,
          error: errorData.error || { message: "Failed to upload files" },
        },
        { status: response.status }
      );
    }

    const data = await response.json().catch(() => ({ success: true }));

    return NextResponse.json({
      success: data.success ?? true,
      data: data.data ?? data,
    });
  } catch (error: any) {
    console.error("Error proxying document file upload:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message || "Internal server error" },
      },
      { status: 500 }
    );
  }
}
