"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe, Lock, Users, ImageIcon, FileText, Clock, Play, Save, X } from "lucide-react"
import { UploadState } from "@/types/upload"
import { UpdateVideoRequest } from "@/lib/hooks/upload/useUpdateVideo"

interface EditModalProps {
  isOpen: boolean
  onClose: () => void
  state: UploadState
  onSave: (updates: UpdateVideoRequest) => Promise<void>
  isSaving: boolean
}

const privacyOptions = [
  { value: 'public', label: 'Public', description: 'Anyone can search for and view', icon: Globe },
  { value: 'unlisted', label: 'Unlisted', description: 'Anyone with the link can view', icon: Users },
  { value: 'private', label: 'Private', description: 'Only you can view', icon: Lock },
]

export function EditModal({ isOpen, onClose, state, onSave, isSaving }: EditModalProps) {
  const [formData, setFormData] = useState<UpdateVideoRequest>({
    title: '',
    description: '',
    timestamps: '',
    privacy_status: 'public',
    playlist_name: '',
  })

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: state.content.selectedTitle || state.customTitle || '',
        description: state.content.description || state.customDescription || '',
        timestamps: state.content.timestamps || state.customTimestamps || '',
        privacy_status: state.selectedPrivacy || 'public',
        playlist_name: state.selectedPlaylist?.name || '',
      })
    }
  }, [isOpen, state])

  const handleInputChange = (field: keyof UpdateVideoRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      // Error handling is done in the onSave function
      console.error('Failed to save changes:', error)
    }
  }

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      title: state.content.selectedTitle || state.customTitle || '',
      description: state.content.description || state.customDescription || '',
      timestamps: state.content.timestamps || state.customTimestamps || '',
      privacy_status: state.selectedPrivacy || 'public',
      playlist_name: state.selectedPlaylist?.name || '',
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6 w-[95vw] sm:w-full">
        <DialogHeader className="px-0 sm:px-0">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
            <Save className="w-4 h-4 sm:w-5 sm:h-5 crypto-profit" />
            Edit Video Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 md:space-y-6 overflow-x-hidden">
          {/* Title Section */}
          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="title" className="text-xs sm:text-sm font-medium flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 crypto-profit flex-shrink-0" />
              Video Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter video title"
              className="text-sm sm:text-base md:text-lg w-full"
            />
          </div>

          {/* Description Section */}
          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="description" className="text-xs sm:text-sm font-medium flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 crypto-profit flex-shrink-0" />
              Video Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter video description"
              rows={6}
              className="resize-none text-sm sm:text-base w-full"
            />
          </div>

          {/* Timestamps Section */}
          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="timestamps" className="text-xs sm:text-sm font-medium flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 crypto-profit flex-shrink-0" />
              Video Timestamps
            </Label>
            <Textarea
              id="timestamps"
              value={formData.timestamps}
              onChange={(e) => handleInputChange('timestamps', e.target.value)}
              placeholder="Enter video timestamps (e.g., 00:00 - Introduction, 01:30 - Main Content)"
              rows={4}
              className="resize-none font-mono text-xs sm:text-sm w-full"
            />
          </div>

          {/* Privacy Settings */}
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-xs sm:text-sm font-medium flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 crypto-profit flex-shrink-0" />
              Privacy Setting
            </Label>
            <Select
              value={formData.privacy_status}
              onValueChange={(value) => handleInputChange('privacy_status', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select privacy setting" />
              </SelectTrigger>
              <SelectContent>
                {privacyOptions.map((option) => {
                  const IconComponent = option.icon
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm">{option.label}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            
            {/* Privacy description */}
            {formData.privacy_status && (
              <div className="text-xs sm:text-sm text-muted-foreground">
                {privacyOptions.find(opt => opt.value === formData.privacy_status)?.description}
              </div>
            )}
          </div>

          {/* Playlist Section */}
          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="playlist" className="text-xs sm:text-sm font-medium flex items-center gap-2">
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 crypto-profit flex-shrink-0" />
              Playlist (Optional)
            </Label>
            <Input
              id="playlist"
              value={formData.playlist_name}
              onChange={(e) => handleInputChange('playlist_name', e.target.value)}
              placeholder="Enter playlist name"
              className="text-sm sm:text-base w-full"
            />
          </div>

          {/* Current Thumbnail Preview */}
          {state.content.selectedThumbnail && (
            <div className="space-y-2 sm:space-y-3 overflow-x-hidden">
              <Label className="text-xs sm:text-sm font-medium flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 crypto-profit flex-shrink-0" />
                Current Thumbnail
              </Label>
              <div className="p-2 sm:p-3 md:p-4 border rounded-lg bg-muted/20 overflow-x-hidden">
                <div className="w-full max-w-sm mx-auto overflow-x-hidden">
                  <img
                    src={state.content.selectedThumbnail}
                    alt="Current thumbnail"
                    className="w-full h-auto rounded-lg border max-w-full"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Thumbnail cannot be edited here. Use the thumbnail section to change it.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t overflow-x-hidden">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
              className="w-full sm:w-auto text-xs sm:text-sm flex-shrink-0"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="crypto-button-primary w-full sm:w-auto text-xs sm:text-sm flex-shrink-0"
            >
              <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
