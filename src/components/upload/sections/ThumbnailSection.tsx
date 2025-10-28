"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageIcon, RefreshCw, CheckCircle, Loader2 } from "lucide-react"
import { UploadState, UploadHandlers } from "@/types/upload"
import { useEffect, useState, useCallback, useRef } from "react"
import { loadUploadDraft, saveUploadDraft } from "@/lib/storage/uploadDraft"
// Single-thumbnail flow – no progress bar needed

interface ThumbnailSectionProps {
  state: UploadState
  updateState: (updates: Partial<UploadState>) => void
  handlers: UploadHandlers
  generatedThumbnails: string[]
  thumbnailsLoading: boolean
  saveThumbnail: (videoId: string, thumbnailUrl: string) => Promise<any>
  getCurrentVideoId: () => string | null
}

// Optimized thumbnail component
const OptimizedThumbnail = ({ 
  src, 
  alt, 
  index, 
  isSelected, 
  onSelect, 
  onLoad 
}: {
  src: string
  alt: string
  index: number
  isSelected: boolean
  onSelect: () => void
  onLoad: () => void
}) => {
  const [imageError, setImageError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  if (imageError) {
    return (
      <div className="relative aspect-video border-2 rounded-lg border-red-300 bg-red-50 flex items-center justify-center">
        <span className="text-red-500 text-xs sm:text-sm">Failed to load</span>
      </div>
    )
  }

  return (
    <div
      className={`relative aspect-video border-2 rounded-lg cursor-pointer transition-all hover:scale-105 crypto-glow ${
        isSelected
          ? "border-brand-primary ring-2 ring-brand-primary/20"
          : "border-primary hover:border-brand-primary/50"
      }`}
      onClick={onSelect}
    >
      <img
        ref={imgRef}
        src={src}
        referrerPolicy="no-referrer"
        onLoad={() => onLoad()}
        onError={() => {
          setImageError(true)
          onLoad()
        }}
        alt={alt}
        className="w-full h-full object-cover rounded-lg"
        loading="eager"
      />
      {isSelected && (
        <div className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 bg-brand-primary rounded-full p-0.5 sm:p-1 crypto-glow">
          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 crypto-profit bg-white rounded-full" />
        </div>
      )}
    </div>
  )
}

export function ThumbnailSection({
  state,
  updateState,
  handlers,
  generatedThumbnails,
  thumbnailsLoading,
  saveThumbnail,
  getCurrentVideoId
}: ThumbnailSectionProps) {
  const [isSaving, setIsSaving] = useState(false)

  // Hydrate previously saved thumbnail selection for this video
  useEffect(() => {
    const id = getCurrentVideoId()
    if (!id) return
    const draft = loadUploadDraft(id)
    if (draft?.thumbnailUrl && draft.thumbnailUrl !== state.content.selectedThumbnail) {
      updateState({
        content: {
          ...state.content,
          selectedThumbnail: draft.thumbnailUrl,
        }
      })
    }
  }, [getCurrentVideoId])

  const handleThumbnailSelect = useCallback((thumbnail: string) => {
    console.log('[ThumbnailSection] Thumbnail selected:', {
      thumbnail: thumbnail.substring(0, 100) + '...',
      currentSelected: state.content.selectedThumbnail,
      thumbnailsCount: state.content.thumbnails.length,
      generatedThumbnailsCount: generatedThumbnails.length
    })
    
    // Update the selected thumbnail in state first
    updateState({
      content: {
        ...state.content,
        selectedThumbnail: thumbnail
      }
    })
  }, [state.content, updateState, generatedThumbnails.length])

  const handleCustomThumbnailUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      updateState({
        content: {
          ...state.content,
          selectedThumbnail: url
        }
      })
    }
  }, [updateState, state.content])

  const handleSaveAndNext = useCallback(async () => {
    const videoId = getCurrentVideoId()
    const thumbnail = state.content.selectedThumbnail
    if (!videoId || !thumbnail) {
      console.warn('[ThumbnailSection] Cannot save: missing videoId or selectedThumbnail', { videoId, thumbnail })
      return
    }
    setIsSaving(true)
    try {
      console.log('[ThumbnailSection] Saving thumbnail on Save & Next:', { videoId, thumbnail })
      const result = await saveThumbnail(videoId, thumbnail)
      console.log('[ThumbnailSection] Save & Next result:', result)
      // Persist to localStorage draft so it restores when navigating back
      try {
        saveUploadDraft(videoId, { thumbnailUrl: thumbnail, step: 'preview' })
      } catch {}
      updateState({ currentStep: "preview" })
    } catch (error) {
      console.error('[ThumbnailSection] Save & Next failed:', error)
    } finally {
      setIsSaving(false)
    }
  }, [getCurrentVideoId, saveThumbnail, state.content.selectedThumbnail, updateState])

  // Debug logging
  console.log('[ThumbnailSection] Component state:', {
    stateThumbnailsCount: state.content.thumbnails.length,
    generatedThumbnailsCount: generatedThumbnails.length,
    selectedThumbnail: state.content.selectedThumbnail,
    isProcessing: state.isProcessing,
    thumbnailsLoading,
    isSaving,
    thumbnailsToShow: state.content.thumbnails.length > 0 ? state.content.thumbnails : generatedThumbnails,
    stateThumbnails: state.content.thumbnails,
    generatedThumbnailsArray: generatedThumbnails
  })

  return (
    <Card className="crypto-card crypto-hover-glow">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl crypto-text-primary">
          <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 crypto-profit" />
          Generate Thumbnail
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-5 md:space-y-6 p-4 sm:p-6">
        <Button 
          onClick={() => {
            console.log('[ThumbnailSection] Generate button clicked!')
            console.log('[ThumbnailSection] Current state before generation:', {
              stateThumbnails: state.content.thumbnails,
              generatedThumbnails: generatedThumbnails,
              isProcessing: state.isProcessing,
              thumbnailsLoading
            })
            handlers.generateThumbnails()
          }} 
          disabled={state.isProcessing || thumbnailsLoading} 
          className="w-full crypto-button-primary"
        >
          {thumbnailsLoading ? (
            <>
              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
              <span className="text-xs sm:text-sm">Generating...</span>
            </>
          ) : (
            <>
              <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              <span className="text-xs sm:text-sm">Generate Thumbnail with AI</span>
            </>
          )}
        </Button>

        {(state.content.thumbnails.length > 0 || generatedThumbnails.length > 0) && (
          <div className="space-y-3 sm:space-y-4">
            <Label className="crypto-text-primary flex items-center gap-2 text-sm sm:text-base">Thumbnail:</Label>

            <div className="grid grid-cols-1 gap-2 sm:gap-3">
              {(state.content.thumbnails[0] || generatedThumbnails[0]) && (
                <OptimizedThumbnail
                  key={`thumb-0-${state.content.thumbnails[0] || generatedThumbnails[0]}`}
                  src={state.content.thumbnails[0] || generatedThumbnails[0]}
                  alt={`Thumbnail`}
                  index={0}
                  isSelected={state.content.selectedThumbnail === (state.content.thumbnails[0] || generatedThumbnails[0])}
                  onSelect={() => handleThumbnailSelect(state.content.thumbnails[0] || generatedThumbnails[0])}
                  onLoad={() => {}} // No-op since we removed imgLoading state
                />
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
              <Button
                variant="outline"
                onClick={handlers.generateThumbnails}
                disabled={state.isProcessing || thumbnailsLoading}
                className="w-full sm:w-auto crypto-button-secondary text-sm sm:text-base"
              >
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span className="text-xs sm:text-sm sm:inline">Regenerate</span>
              </Button>
              {generatedThumbnails.length > 0 && !thumbnailsLoading && (
                <div className="text-xs sm:text-sm text-green-600 flex items-center gap-1 justify-center sm:justify-start">
                  <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>1/1 ready</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="custom-thumbnail" className="crypto-text-primary text-sm sm:text-base">Or upload custom thumbnail:</Label>
          <Input
            id="custom-thumbnail"
            type="file"
            accept="image/*"
            onChange={handleCustomThumbnailUpload}
            className="crypto-input text-xs sm:text-sm"
          />
        </div>

        {state.content.selectedThumbnail && (
          <Button 
            onClick={handleSaveAndNext}
            disabled={isSaving}
            className="w-full crypto-button-primary text-sm sm:text-base"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                <span className="text-xs sm:text-sm sm:inline">Saving...</span>
              </>
            ) : (
              <span className="text-xs sm:text-sm sm:inline">Save & Next: Preview</span>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
