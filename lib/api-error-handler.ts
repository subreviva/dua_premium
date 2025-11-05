import { NextResponse } from 'next/server'
import { SunoAPIError } from './suno-api'

/**
 * Centralized error handler for API routes
 * Returns consistent error responses based on error type
 */
export function handleApiError(error: unknown, context: string = 'API'): NextResponse {
  // PRODUCTION: Removed console.error(`❌ [${context}] Error:`, error)
  
  // Handle SunoAPIError (validation errors, API errors)
  if (error instanceof SunoAPIError) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      code: error.code
    }, { status: error.code })
  }
  
  // Handle standard errors
  if (error instanceof Error) {
    // Timeout errors
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      return NextResponse.json({ 
        success: false, 
        error: 'Request timeout - please try again' 
      }, { status: 408 })
    }
    
    // Network errors
    if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unable to connect to API service' 
      }, { status: 503 })
    }
    
    // API request failures
    if (error.message.includes('API request failed')) {
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 502 })
    }
    
    // Generic error
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
  
  // Unknown error type
  return NextResponse.json({ 
    success: false, 
    error: 'An unexpected error occurred' 
  }, { status: 500 })
}
