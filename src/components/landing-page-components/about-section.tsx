import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, Sparkles, Calendar, BarChart3, Youtube } from "lucide-react"

export function AboutSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">About Postsiva</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              <strong>PostSiva is an AI-powered YouTube automation platform</strong> designed to help
              content creators, businesses, and marketing professionals streamline their YouTube workflow.
            </p>
          </div>

          {/* Application Purpose Section */}
          <div className="mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">Our Application Purpose</h3>
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {/* Video Upload & Management */}
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Upload className="h-7 w-7 text-primary" />
                    </div>
                  </div>
                  <h4 className="font-semibold text-lg mb-2">Video Upload & Management</h4>
                  <p className="text-muted-foreground">
                    Upload videos and manage your YouTube content library with ease
                  </p>
                </CardContent>
              </Card>
              {/* AI Content Generation */}
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Sparkles className="h-7 w-7 text-primary" />
                    </div>
                  </div>
                  <h4 className="font-semibold text-lg mb-2">AI Content Generation</h4>
                  <p className="text-muted-foreground">
                    Automatically generate optimized titles, descriptions, and thumbnails using artificial intelligence
                  </p>
                </CardContent>
              </Card>
              {/* Smart Scheduling */}
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Calendar className="h-7 w-7 text-primary" />
                    </div>
                  </div>
                  <h4 className="font-semibold text-lg mb-2">Smart Scheduling</h4>
                  <p className="text-muted-foreground">
                    Schedule videos for optimal publishing times based on audience analytics
                  </p>
                </CardContent>
              </Card>
              {/* YouTube Integration */}
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Youtube className="h-7 w-7 text-primary" />
                    </div>
                  </div>
                  <h4 className="font-semibold text-lg mb-2">YouTube Integration</h4>
                  <p className="text-muted-foreground">
                    Direct integration with YouTube API for seamless content publishing
                  </p>
                </CardContent>
              </Card>
              {/* Analytics & Insights */}
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <BarChart3 className="h-7 w-7 text-primary" />
                    </div>
                  </div>
                  <h4 className="font-semibold text-lg mb-2">Analytics & Insights</h4>
                  <p className="text-muted-foreground">
                    Track performance metrics and get actionable insights for content optimization
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Why PostSiva Exists */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Why PostSiva Exists</h3>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  We help YouTube creators save time by automating repetitive tasks while maintaining 
                  high-quality, optimized content that performs better on the platform.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
