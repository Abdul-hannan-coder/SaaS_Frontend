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

// Optimized thumbnail component with preloading and loading states
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
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  if (imageError) {
    return (
      <div className="relative aspect-video border-2 rounded-lg border-red-300 bg-red-50 flex items-center justify-center">
        <span className="text-red-500 text-sm">Failed to load</span>
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
        onLoad={() => {
          setImageLoaded(true)
          onLoad()
        }}
        onError={() => {
          setImageError(true)
          onLoad()
        }}
        alt={alt}
        className={`w-full h-full object-cover rounded-lg ${imageLoaded ? '' : ''}`}
        loading="eager" // Prioritize thumbnail loading
      />
      {isSelected && (
        <div className="absolute top-1 right-1 bg-brand-primary rounded-full p-1 crypto-glow">
          <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 crypto-profit bg-white rounded-full" />
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
  const [imgLoading, setImgLoading] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setImgLoading(thumbnailsLoading)
  }, [thumbnailsLoading])

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

  const handleImgLoad = useCallback(() => setImgLoading(false), [])

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
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg lg:text-xl crypto-text-primary">
          <ImageIcon className="h-5 w-5 crypto-profit" />
          Generate Thumbnail
          {isSaving && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
          <>
            <ImageIcon className="w-4 h-4 mr-2" />
            {thumbnailsLoading ? 'Generating Thumbnail...' : 'Generate Thumbnail with AI'}
          </>
        </Button>

        {(state.content.thumbnails.length > 0 || generatedThumbnails.length > 0 || thumbnailsLoading) && (
          <div className="space-y-4">
            <Label className="crypto-text-primary flex items-center gap-2">Thumbnail:</Label>

            <div className="grid grid-cols-1 gap-2">
              {(thumbnailsLoading || imgLoading) && (
                <div className="relative aspect-video border-2 rounded-lg border-primary/30 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}

              {!(thumbnailsLoading || imgLoading) && (state.content.thumbnails[0] || generatedThumbnails[0]) && (
                <OptimizedThumbnail
                  key={`thumb-0-${state.content.thumbnails[0] || generatedThumbnails[0]}`}
                  src={state.content.thumbnails[0] || generatedThumbnails[0]}
                  alt={`Thumbnail`}
                  index={0}
                  isSelected={state.content.selectedThumbnail === (state.content.thumbnails[0] || generatedThumbnails[0])}
                  onSelect={() => handleThumbnailSelect(state.content.thumbnails[0] || generatedThumbnails[0])}
                  onLoad={handleImgLoad}
                />
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlers.generateThumbnails}
                disabled={state.isProcessing || thumbnailsLoading}
                className="flex-1 sm:flex-none crypto-button-secondary"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate Thumbnail
              </Button>
              {generatedThumbnails.length > 0 && (
                <div className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  1/1 ready
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="custom-thumbnail" className="crypto-text-primary">Or upload custom thumbnail:</Label>
          <Input
            id="custom-thumbnail"
            type="file"
            accept="image/*"
            onChange={handleCustomThumbnailUpload}
            className="crypto-input"
          />
        </div>

        {state.content.selectedThumbnail && (
          <div className="space-y-2">
            {isSaving && (
              <div className="text-sm text-blue-600 flex items-center gap-1">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving thumbnail...
              </div>
            )}
            <Button 
              onClick={handleSaveAndNext}
              disabled={isSaving}
              className="w-full crypto-button-primary"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save & Next: Preview"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
