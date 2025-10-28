import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/landing-page-components/Header"
import { Footer } from "@/components/landing-page-components/Footer"
import {
  Brain,
  ImageIcon,
  Calendar,
  BarChart3,
  Zap,
  Shield,
  Clock,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react"

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-16 pb-8 md:pt-24 md:pb-12 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full sm:mt-2 mt-6 px-3 py-1.5 md:px-4 md:py-2 mb-4 md:mb-6">
              <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
              <span className="text-xs md:text-sm font-medium text-primary">Powerful Features</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 px-2 sm:px-0 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Everything You Need to Dominate YouTube
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto px-2 sm:px-0">
              Discover the comprehensive suite of AI-powered tools designed to automate, optimize, and accelerate your
              YouTube growth.
            </p>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 md:mb-4">Core Features</h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">The essential tools every creator needs</p>
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
            <Card className="p-4 sm:p-6 border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="p-0 mb-3 md:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                  <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">AI Title Generation</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-sm sm:text-base text-muted-foreground mb-3 md:mb-4">
                  Generate compelling, SEO-optimized titles that grab attention and improve click-through rates using
                  advanced AI algorithms.
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <Badge variant="secondary" className="text-xs sm:text-sm">SEO Optimized</Badge>
                  <Badge variant="secondary" className="text-xs sm:text-sm">Click-worthy</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="p-4 sm:p-6 border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="p-0 mb-3 md:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                  <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Smart Thumbnails</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-sm sm:text-base text-muted-foreground mb-3 md:mb-4">
                  Create eye-catching thumbnails automatically from your video content with AI-powered design and
                  optimization.
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <Badge variant="secondary" className="text-xs sm:text-sm">Auto-Generated</Badge>
                  <Badge variant="secondary" className="text-xs sm:text-sm">High CTR</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="p-4 sm:p-6 border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="p-0 mb-3 md:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Smart Scheduling</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-sm sm:text-base text-muted-foreground mb-3 md:mb-4">
                  Schedule your videos for optimal posting times based on your audience analytics and engagement
                  patterns.
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <Badge variant="secondary" className="text-xs sm:text-sm">Optimal Timing</Badge>
                  <Badge variant="secondary" className="text-xs sm:text-sm">Automated</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="p-4 sm:p-6 border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="p-0 mb-3 md:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                  <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-sm sm:text-base text-muted-foreground mb-3 md:mb-4">
                  Track your video performance with detailed analytics and insights to optimize your content strategy.
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <Badge variant="secondary" className="text-xs sm:text-sm">Real-time</Badge>
                  <Badge variant="secondary" className="text-xs sm:text-sm">Actionable</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="p-4 sm:p-6 border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="p-0 mb-3 md:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Bulk Operations</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-sm sm:text-base text-muted-foreground mb-3 md:mb-4">
                  Process multiple videos at once with batch upload, editing, and scheduling capabilities for maximum
                  efficiency.
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <Badge variant="secondary" className="text-xs sm:text-sm">Time-saving</Badge>
                  <Badge variant="secondary" className="text-xs sm:text-sm">Efficient</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="p-4 sm:p-6 border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="p-0 mb-3 md:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Content Protection</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-sm sm:text-base text-muted-foreground mb-3 md:mb-4">
                  Secure your content with advanced privacy controls and copyright protection features.
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <Badge variant="secondary" className="text-xs sm:text-sm">Secure</Badge>
                  <Badge variant="secondary" className="text-xs sm:text-sm">Protected</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="py-8 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 md:mb-4">Advanced Capabilities</h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">Take your channel to the next level</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:space-x-4 md:space-x-6 p-4 sm:p-5 md:p-6 bg-background rounded-lg border">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mb-3 sm:mb-0">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-semibold mb-2">AI-Powered SEO Optimization</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-3">
                  Our advanced AI analyzes trending keywords, competitor content, and YouTube algorithm preferences to
                  optimize your videos for maximum discoverability.
                </p>
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-primary">
                  <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>Keyword research automation</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:space-x-4 md:space-x-6 p-4 sm:p-5 md:p-6 bg-background rounded-lg border">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mb-3 sm:mb-0">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Trend Analysis & Predictions</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-3">
                  Stay ahead of the curve with real-time trend analysis and content suggestions based on emerging topics
                  in your niche.
                </p>
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-primary">
                  <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>Real-time trend monitoring</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:space-x-4 md:space-x-6 p-4 sm:p-5 md:p-6 bg-background rounded-lg border">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mb-3 sm:mb-0">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Automated Workflow Management</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-3">
                  Create custom workflows that automatically handle your entire video publishing process from upload to
                  promotion.
                </p>
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-primary">
                  <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>Custom automation rules</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 md:mb-4">Why Choose Postsiva?</h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">See how we compare to traditional methods</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              <Card className="p-4 sm:p-5 md:p-6 border-2 border-red-200">
                <CardHeader className="p-0 mb-3 md:mb-4">
                  <CardTitle className="text-lg sm:text-xl text-red-600">Manual Process</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ul className="space-y-2 sm:space-y-3">
                    <li className="flex items-center space-x-2 text-sm sm:text-base text-muted-foreground">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                      <span>Hours spent on title research</span>
                    </li>
                    <li className="flex items-center space-x-2 text-sm sm:text-base text-muted-foreground">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                      <span>Manual thumbnail creation</span>
                    </li>
                    <li className="flex items-center space-x-2 text-sm sm:text-base text-muted-foreground">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                      <span>Guesswork for posting times</span>
                    </li>
                    <li className="flex items-center space-x-2 text-sm sm:text-base text-muted-foreground">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                      <span>Limited analytics insights</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="p-4 sm:p-5 md:p-6 border-2 border-primary/20 bg-primary/5">
                <CardHeader className="p-0 mb-3 md:mb-4">
                  <CardTitle className="text-lg sm:text-xl text-primary">With Postsiva</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ul className="space-y-2 sm:space-y-3">
                    <li className="flex items-center space-x-2 text-sm sm:text-base">
                      <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                      <span>AI-generated titles in seconds</span>
                    </li>
                    <li className="flex items-center space-x-2 text-sm sm:text-base">
                      <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                      <span>Automated thumbnail creation</span>
                    </li>
                    <li className="flex items-center space-x-2 text-sm sm:text-base">
                      <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                      <span>Data-driven scheduling</span>
                    </li>
                    <li className="flex items-center space-x-2 text-sm sm:text-base">
                      <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                      <span>Comprehensive performance tracking</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 md:py-16 bg-primary/5">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 px-2 sm:px-0">
              Ready to Experience These Features?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 px-2 sm:px-0">
              Join thousands of creators who are already using TubeAI to grow their channels faster and more
              efficiently.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href="/auth/signup" className="flex items-center justify-center">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/about-page">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
