import { NextRequest, NextResponse } from "next/server"
import { uploadFileStream, StreamUploadParams } from "@/lib/suno-api"

export const runtime = "edge"

/**
 * File Stream Upload API Endpoint
 * 
 * POST /api/file-upload/stream
 * 
 * Upload files via multipart/form-data stream to temporary storage.
 * Files are automatically deleted after 3 days.
 * Recommended for files > 5 MB.
 * 
 * Content-Type: multipart/form-data
 * 
 * Form Fields:
 * - file: File (required) - Binary file data
 * - uploadPath: string (required) - File upload path without leading/trailing slashes
 * - fileName: string (optional) - Filename with extension (original filename if not provided)
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
 * - Original filename used if not specified
 * - Path sanitization: no leading/trailing slashes
 * 
 * Advantages of Stream Upload:
 * - More efficient for large files (> 5 MB)
 * - No Base64 encoding overhead
 * - Browser native file upload support
 * - Direct binary transfer
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
 * - Recommended for files > 5 MB
 * - No encoding overhead (vs Base64 +33%)
 * 
 * Error Response:
 * {
 *   success: false,
 *   code: number,           // Error code (400, 401, 500)
 *   msg: string             // Error description
 * }
 * 
 * Common Errors:
 * - 400: Missing required field (file, uploadPath)
 * - 400: Invalid file format
 * - 400: File size exceeds limit
 * - 401: Invalid or missing API key
 * - 500: Server error during upload
 * 
 * Usage Example (JavaScript):
 * ```javascript
 * const formData = new FormData()
 * formData.append('file', fileInput.files[0])
 * formData.append('uploadPath', 'images/user-uploads')
 * formData.append('fileName', 'custom-name.jpg')
 * 
 * const response = await fetch('/api/file-upload/stream', {
 *   method: 'POST',
 *   body: formData
 * })
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Get file from form data
    const file = formData.get("file")
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          code: 400,
          msg: "Missing required field: file",
        },
        { status: 400 },
      )
    }

    // Get uploadPath from form data
    const uploadPath = formData.get("uploadPath")
    if (!uploadPath || typeof uploadPath !== "string") {
      return NextResponse.json(
        {
          success: false,
          code: 400,
          msg: "Missing required field: uploadPath",
        },
        { status: 400 },
      )
    }

    // Validate uploadPath format
    const uploadPathStr = uploadPath.trim()
    if (uploadPathStr.startsWith("/") || uploadPathStr.endsWith("/")) {
      return NextResponse.json(
        {
          success: false,
          code: 400,
          msg: "uploadPath must not have leading or trailing slashes",
        },
        { status: 400 },
      )
    }

    // Get optional fileName
    const fileName = formData.get("fileName")
    const fileNameStr = fileName && typeof fileName === "string" ? fileName : undefined

    const params: StreamUploadParams = {
      file,
      uploadPath: uploadPathStr,
      fileName: fileNameStr,
    }

    const result = await uploadFileStream(params)

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
    // console.error("Error uploading stream file:", error)
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
 * GET /api/file-upload/stream
 * 
 * Returns API documentation for the File Stream Upload endpoint.
 */
export async function GET() {
  return NextResponse.json({
    endpoint: "POST /api/file-upload/stream",
    description:
      "Upload files via multipart/form-data stream to temporary storage (auto-deleted after 3 days)",
    contentType: "multipart/form-data",
    formFields: {
      file: {
        type: "File",
        required: true,
        description: "Binary file data",
      },
      uploadPath: {
        type: "string",
        required: true,
        description: "File upload path without leading/trailing slashes (e.g., 'images/uploads')",
      },
      fileName: {
        type: "string",
        required: false,
        description: "Filename with extension (original filename if not provided, overwrites if exists)",
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
    advantages: {
      efficiency: "More efficient for large files (> 5 MB)",
      overhead: "No Base64 encoding overhead",
      native: "Browser native file upload support",
      transfer: "Direct binary transfer",
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
      recommendation: "Use stream upload for files > 5 MB",
      note: "No encoding overhead (vs Base64 +33%)",
    },
    example: {
      javascript: `const formData = new FormData()
formData.append('file', fileInput.files[0])
formData.append('uploadPath', 'images/user-uploads')
formData.append('fileName', 'custom-name.jpg')

const response = await fetch('/api/file-upload/stream', {
  method: 'POST',
  body: formData
})`,
    },
  })
}
