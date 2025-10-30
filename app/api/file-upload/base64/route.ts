import { NextRequest, NextResponse } from "next/server"
import { uploadFileBase64, Base64UploadParams } from "@/lib/suno-api"

export const runtime = "edge"

/**
 * Base64 File Upload API Endpoint
 * 
 * POST /api/file-upload/base64
 * 
 * Upload files via Base64 encoded data to temporary storage.
 * Files are automatically deleted after 3 days.
 * 
 * Request Body:
 * {
 *   base64Data: string      // Required: Base64 encoded file data or data URL format
 *   uploadPath: string      // Required: File upload path without leading/trailing slashes
 *   fileName?: string       // Optional: Filename with extension (random if not provided)
 * }
 * 
 * Base64 Data Formats:
 * 1. Data URL format: "data:image/png;base64,iVBORw0KGgo..."
 * 2. Pure Base64 string: "iVBORw0KGgo..."
 * 
 * Response (Success):
 * {
 *   success: true,
 *   code: 200,
 *   msg: "File uploaded successfully",
 *   data: {
 *     fileName: string,         // Final filename
 *     filePath: string,         // Complete storage path
 *     downloadUrl: string,      // Direct download URL
 *     fileSize: number,         // Size in bytes
 *     mimeType: string,         // File MIME type
 *     uploadedAt: string        // ISO timestamp
 *   }
 * }
 * 
 * File Management:
 * - Temporary storage with 3-day auto-deletion
 * - Base URL: https://tempfile.redpandaai.co
 * - Same filename overwrites existing file (cache may delay visibility)
 * - Random filename generated if not specified
 * - Path sanitization: no leading/trailing slashes
 * 
 * Supported Formats:
 * - Images: jpg, png, gif, webp, svg, bmp, ico
 * - Audio: mp3, wav, ogg, m4a, flac, aac
 * - Video: mp4, webm, mov, avi, mkv
 * - Documents: pdf, doc, docx, txt, csv, json
 * - Archives: zip, rar, tar, gz
 * 
 * File Size Limits:
 * - Maximum: 10 MB per file
 * - Recommendation: Use stream upload for files > 5 MB
 * - Base64 encoding increases size by ~33%
 * 
 * Error Response:
 * {
 *   success: false,
 *   code: number,           // Error code (400, 401, 500)
 *   msg: string             // Error description
 * }
 * 
 * Common Errors:
 * - 400: Missing required parameter (base64Data, uploadPath)
 * - 400: Invalid Base64 format or decoding failed
 * - 400: File size exceeds limit
 * - 401: Invalid or missing API key
 * - 500: Server error during upload
 * 
 * Usage Examples:
 * 
 * 1. With Data URL:
 * {
 *   "base64Data": "data:image/png;base64,iVBORw0KGgo...",
 *   "uploadPath": "images/user-uploads",
 *   "fileName": "profile.png"
 * }
 * 
 * 2. With Pure Base64:
 * {
 *   "base64Data": "iVBORw0KGgo...",
 *   "uploadPath": "documents/files"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required parameters
    if (!body.base64Data || typeof body.base64Data !== "string") {
      return NextResponse.json(
        {
          success: false,
          code: 400,
          msg: "Missing required parameter: base64Data",
        },
        { status: 400 },
      )
    }

    if (!body.uploadPath || typeof body.uploadPath !== "string") {
      return NextResponse.json(
        {
          success: false,
          code: 400,
          msg: "Missing required parameter: uploadPath",
        },
        { status: 400 },
      )
    }

    // Validate Base64 data is not empty
    const base64Data = body.base64Data.trim()
    if (base64Data.length === 0) {
      return NextResponse.json(
        {
          success: false,
          code: 400,
          msg: "base64Data cannot be empty",
        },
        { status: 400 },
      )
    }

    // Validate uploadPath format
    const uploadPath = body.uploadPath.trim()
    if (uploadPath.startsWith("/") || uploadPath.endsWith("/")) {
      return NextResponse.json(
        {
          success: false,
          code: 400,
          msg: "uploadPath must not have leading or trailing slashes",
        },
        { status: 400 },
      )
    }

    const params: Base64UploadParams = {
      base64Data,
      uploadPath,
      fileName: body.fileName,
    }

    const result = await uploadFileBase64(params)

    // Handle API response
    if (result.code !== 200) {
      return NextResponse.json(
        {
          success: false,
          code: result.code,
          msg: result.msg || "File upload failed",
        },
        { status: result.code === 401 ? 401 : 400 },
      )
    }

    return NextResponse.json({
      success: true,
      code: result.code,
      msg: result.msg,
      data: result.data,
    })
  } catch (error) {
    console.error("Error uploading Base64 file:", error)
    return NextResponse.json(
      {
        success: false,
        code: 500,
        msg: error instanceof Error ? error.message : "Failed to upload file",
      },
      { status: 500 },
    )
  }
}

/**
 * GET /api/file-upload/base64
 * 
 * Returns API documentation for the Base64 File Upload endpoint.
 */
export async function GET() {
  return NextResponse.json({
    endpoint: "POST /api/file-upload/base64",
    description: "Upload files via Base64 encoded data to temporary storage (auto-deleted after 3 days)",
    parameters: {
      base64Data: {
        type: "string",
        required: true,
        description: "Base64 encoded file data or data URL format (data:image/png;base64,...)",
      },
      uploadPath: {
        type: "string",
        required: true,
        description: "File upload path without leading/trailing slashes (e.g., 'images/uploads')",
      },
      fileName: {
        type: "string",
        required: false,
        description: "Filename with extension (random if not provided, overwrites if exists)",
      },
    },
    response: {
      success: {
        success: true,
        code: 200,
        msg: "File uploaded successfully",
        data: {
          fileName: "string - Final filename",
          filePath: "string - Complete storage path",
          downloadUrl: "string - Direct download URL",
          fileSize: "number - Size in bytes",
          mimeType: "string - File MIME type",
          uploadedAt: "string - ISO timestamp",
        },
      },
      error: {
        success: false,
        code: "number - Error code",
        msg: "string - Error description",
      },
    },
    fileManagement: {
      storage: "Temporary (3-day auto-deletion)",
      baseUrl: "https://tempfile.redpandaai.co",
      overwrite: "Same filename overwrites existing file",
      caching: "Changes may not be immediately visible due to caching",
    },
    supportedFormats: {
      images: ["jpg", "png", "gif", "webp", "svg", "bmp", "ico"],
      audio: ["mp3", "wav", "ogg", "m4a", "flac", "aac"],
      video: ["mp4", "webm", "mov", "avi", "mkv"],
      documents: ["pdf", "doc", "docx", "txt", "csv", "json"],
      archives: ["zip", "rar", "tar", "gz"],
    },
    limits: {
      maxSize: "10 MB per file",
      recommendation: "Use stream upload for files > 5 MB",
      note: "Base64 encoding increases size by ~33%",
    },
    examples: {
      dataUrl: {
        base64Data: "data:image/png;base64,iVBORw0KGgo...",
        uploadPath: "images/user-uploads",
        fileName: "profile.png",
      },
      pureBase64: {
        base64Data: "iVBORw0KGgo...",
        uploadPath: "documents/files",
      },
    },
  })
}
