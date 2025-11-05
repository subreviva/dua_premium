import { NextRequest, NextResponse } from "next/server"
import { uploadFileUrl, UrlUploadParams } from "@/lib/suno-api"

export const runtime = "edge"

/**
 * URL File Upload API Endpoint
 * 
 * POST /api/file-upload/url
 * 
 * Download files from URLs and upload to temporary storage.
 * Files are automatically deleted after 3 days.
 * Useful for transferring files from external sources.
 * 
 * Request Body:
 * {
 *   fileUrl: string        // Required: File download URL (HTTP or HTTPS)
 *   uploadPath: string     // Required: File upload path without leading/trailing slashes
 *   fileName?: string      // Optional: Filename with extension (random if not provided)
 * }
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
 * Use Cases:
 * - Import files from external APIs
 * - Copy files from public URLs
 * - Transfer files between services
 * - Download and re-host content
 * - Backup external resources
 * 
 * URL Requirements:
 * - Must be valid HTTP or HTTPS URL
 * - Must be publicly accessible (no authentication)
 * - Must return binary content
 * - Source server must allow downloads
 * 
 * Supported Formats:
 * - Images: jpg, png, gif, webp, svg, bmp, ico
 * - Audio: mp3, wav, ogg, m4a, flac, aac
 * - Video: mp4, webm, mov, avi, mkv
 * - Documents: pdf, doc, docx, txt, csv, json
 * - Archives: zip, rar, tar, gz
 * 
 * File Size Limits:
 * - Maximum: 50 MB per file
 * - Download timeout: 60 seconds
 * - Follows redirects automatically
 * 
 * Error Response:
 * {
 *   success: false,
 *   code: number,           // Error code (400, 401, 500)
 *   msg: string             // Error description
 * }
 * 
 * Common Errors:
 * - 400: Missing required parameter (fileUrl, uploadPath)
 * - 400: Invalid URL format
 * - 400: File download failed (404, timeout, etc.)
 * - 400: File size exceeds limit
 * - 401: Invalid or missing API key
 * - 500: Server error during upload
 * 
 * Usage Examples:
 * 
 * 1. Download image from URL:
 * {
 *   "fileUrl": "https://example.com/images/sample.jpg",
 *   "uploadPath": "images/downloaded",
 *   "fileName": "my-image.jpg"
 * }
 * 
 * 2. Download document:
 * {
 *   "fileUrl": "https://example.com/docs/manual.pdf",
 *   "uploadPath": "documents/manuals"
 * }
 * 
 * 3. Transfer from API:
 * {
 *   "fileUrl": "https://api.example.com/files/export/12345",
 *   "uploadPath": "exports/data",
 *   "fileName": "export-12345.csv"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required parameters
    if (!body.fileUrl || typeof body.fileUrl !== "string") {
      return NextResponse.json(
        {
          success: false,
          code: 400,
          msg: "Missing required parameter: fileUrl",
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

    // Validate URL format
    const fileUrl = body.fileUrl.trim()
    try {
      const url = new URL(fileUrl)
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return NextResponse.json(
          {
            success: false,
            code: 400,
            msg: "fileUrl must be a valid HTTP or HTTPS URL",
          },
          { status: 400 },
        )
      }
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          code: 400,
          msg: "Invalid URL format",
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

    const params: UrlUploadParams = {
      fileUrl,
      uploadPath,
      fileName: body.fileName,
    }

    const result = await uploadFileUrl(params)

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
    // console.error("Error uploading URL file:", error)
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
 * GET /api/file-upload/url
 * 
 * Returns API documentation for the URL File Upload endpoint.
 */
export async function GET() {
  return NextResponse.json({
    endpoint: "POST /api/file-upload/url",
    description:
      "Download files from URLs and upload to temporary storage (auto-deleted after 3 days)",
    parameters: {
      fileUrl: {
        type: "string",
        required: true,
        format: "uri",
        description: "File download URL (must be valid HTTP or HTTPS address)",
      },
      uploadPath: {
        type: "string",
        required: true,
        description: "File upload path without leading/trailing slashes (e.g., 'images/downloads')",
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
    useCases: {
      import: "Import files from external APIs",
      copy: "Copy files from public URLs",
      transfer: "Transfer files between services",
      rehost: "Download and re-host content",
      backup: "Backup external resources",
    },
    urlRequirements: {
      protocol: "Must be valid HTTP or HTTPS URL",
      access: "Must be publicly accessible (no authentication)",
      content: "Must return binary content",
      permission: "Source server must allow downloads",
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
      maxSize: "50 MB per file",
      timeout: "60 seconds download timeout",
      redirects: "Follows redirects automatically",
    },
    examples: {
      image: {
        fileUrl: "https://example.com/images/sample.jpg",
        uploadPath: "images/downloaded",
        fileName: "my-image.jpg",
      },
      document: {
        fileUrl: "https://example.com/docs/manual.pdf",
        uploadPath: "documents/manuals",
      },
      api_export: {
        fileUrl: "https://api.example.com/files/export/12345",
        uploadPath: "exports/data",
        fileName: "export-12345.csv",
      },
    },
  })
}
